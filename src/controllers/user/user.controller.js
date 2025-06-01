import DeviceToken from "../../models/notification/deviceToken.model.js"; // Update with actual path
import mongoose from "mongoose";

import OtpModel from "../../models/OTP/OTP.model.js"; // Adjust path as needed
import { sendmail } from "../../utils/otpPhone/otp.js";

// export const loginUser = async (req, res) => {
//   try {
//     const { email, phone, country_code, token } = req.body;
//     console.log("🚀 ~ loginUser ~ req.body:", req.body);

//     if (!email && !phone) {
//       return res
//         .status(400)
//         .json({ message: "Email or phone number is required." });
//     }

//     let query;
//     if (email) {
//       query = { email };
//     } else {
//       if (!country_code) {
//         return res.status(400).json({
//           message: "Country code is required when using phone number.",
//         });
//       }
//       query = { phone, country_code };
//     }

//     let user = await DeviceToken.findOne(query);

//     if (!user) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     if (token) {
//       await DeviceToken.updateOne(
//         { _id: user._id },
//         { $set: { token: token } }
//       );
//       user = await DeviceToken.findById(user._id);
//     }

//     return res.status(200).json({ message: "Login successful", user });
//   } catch (error) {
//     console.error("❌ Login error:", error);
//     if (error.code === 11000) {
//       return res
//         .status(400)
//         .json({ message: "Token, email, or phone already exists." });
//     }
//     res.status(500).json({ message: "Login failed", error: error.message });
//   }
// };

export const userDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await DeviceToken.findById(id)
      .populate("userTypes") // populates referenced UserType documents
      .populate("CardTypes"); // populates referenced Card documents

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Optional: Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Perform the update
    const updatedUser = await DeviceToken.findByIdAndUpdate(id, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Apply schema validations
    })
      .populate("userTypes")
      .populate("CardTypes");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("Error updating user details:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, phone, country_code, token } = req.body;
    console.log("🚀 ~ loginUser ~ req.body:", req.body);

    // Validate required fields
    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: "Email or phone number is required.",
      });
    }

    if (phone && !country_code) {
      return res.status(400).json({
        success: false,
        message: "Country code is required when using phone number.",
      });
    }

    // Build query based on login method
    const query = email ? { email } : { phone, country_code };

    // Find user
    let user = await DeviceToken.findOne(query);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Update device token if provided
    if (token) {
      user = await DeviceToken.findOneAndUpdate(
        { _id: user._id },
        { $set: { token } },
        { new: true } // Return the updated document
      );
    }

    // Generate OTP
    const otpValue = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry
    const type = email ? "email" : "phone";
    const identifier = email ? email : `${country_code}${phone}`; // Fixed: Properly define identifier

    // Upsert OTP (update if exists, create if not)
    await OtpModel.findOneAndUpdate(
      { userid: user._id },
      {
        type,
        identifier,
        otp: otpValue,
        expiresAt,
      },
      { upsert: true, new: true }
    );

    // Send OTP via appropriate channel
    if (email) {
      try {
        await sendmail(email, otpValue);
        console.log(`OTP sent to ${email}`);
      } catch (emailError) {
        console.error("❌ Email sending failed:", emailError);
        // Consider alternative notification method here
      }
    } else if (phone) {
      // TODO: Implement SMS OTP sending
      console.log(`SMS OTP would be sent to ${country_code}${phone}`);
    }

    return res.status(200).json({
      success: true,
      message: "OTP has been sent successfully",
      user: {
        _id: user._id,
        email: user.email,
        phone: user.phone,
        country_code: user.country_code,
      },
      // Only include OTP in development for testing
      ...(process.env.NODE_ENV === "development" && { otp: otpValue }),
    });
  } catch (error) {
    console.error("❌ Login error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate entry detected.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Login failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { first_name, last_name, email, country_code, phone } = req.body;
    console.log("🚀 ~ registerUser ~ req.body:", req.body);

    // Check required fields
    if (!first_name || !last_name || !country_code || !email || !phone) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided ." });
    }

    // Check if email or phone already exists
    const existingUser = await DeviceToken.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email or phone number already exists." });
    }

    // Create new user
    const newUser = new DeviceToken({
      first_name,
      last_name,
      email,
      country_code,
      phone,
      token: null,
    });

    await newUser.save();

    return res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const OTPCheck = async (req, res) => {
  try {
    const { id } = req.params;
    // console.log("🚀 ~ OTPCheck ~ id:", id);
    const { otp, type } = req.body;
    // console.log("🚀 ~ OTPCheck ~  otp, type:", otp, type);

    if (!otp || !type) {
      return res.status(400).json({ message: "OTP and type are required." });
    }

    const otpRecord = await OtpModel.findOne({ userid: id });

    // console.log("🚀 ~ OTPCheck ~ otpRecord:", otpRecord);
    if (!otpRecord) {
      return res
        .status(404)
        .json({ message: "No OTP found or it has expired." });
    }

    const now = new Date();

    console.log(
      "🚀 ~ OTPCheck ~ otpRecord.expiresAt:",
      otpRecord.expiresAt > now
    );
    console.log("🚀 ~ OTPCheck ~ otp:", otpRecord.otp === otp);
    console.log("🚀 ~ OTPCheck ~ otpRecord.otp:", otpRecord.otp);

    // Validate OTP
    if (otpRecord.otp === otp && otpRecord.expiresAt > now) {
      await OtpModel.deleteOne({ _id: otpRecord._id }); // prevent reuse
      return res.status(200).json({
        message: "OTP verified successfully. Login successful.",
        userId: id,
      });
    }

    // If OTP expired or doesn't match
    const reason = otpRecord.expiresAt <= now ? "expired" : "invalid";
    console.log(reason, "reason");

    return res.status(401).json({ message: `OTP is ${reason}.` });
  } catch (error) {
    console.error("❌ OTP Check error:", error);
    return res.status(500).json({
      message: "Failed to verify OTP.",
      error: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if ID is provided
    if (!id) {
      return res.status(400).json({ message: "User ID is required." });
    }

    // Check if the user exists
    const user = await DeviceToken.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Delete the user
    await DeviceToken.findByIdAndDelete(id);

    return res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("❌ Delete error:", error);
    return res
      .status(500)
      .json({ message: "Failed to delete user.", error: error.message });
  }
};

export const logoutuser = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const updatedUser = await DeviceToken.findByIdAndUpdate(
      userId,
      { $set: { token: null } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res
      .status(200)
      .json({ message: "Logout successful", user: updatedUser });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
