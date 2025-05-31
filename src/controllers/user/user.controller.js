import DeviceToken from "../../models/notification/deviceToken.model.js"; // Update with actual path
import mongoose from "mongoose";

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

import OtpModel from "../../models/OTP/OTP.model.js"; // Adjust path as needed

export const loginUser = async (req, res) => {
  try {
    const { email, phone, country_code, token } = req.body;
    console.log("🚀 ~ loginUser ~ req.body:", req.body);

    if (!email && !phone) {
      return res
        .status(400)
        .json({ message: "Email or phone number is required." });
    }

    let query;
    if (email) {
      query = { email };
    } else {
      if (!country_code) {
        return res.status(400).json({
          message: "Country code is required when using phone number.",
        });
      }
      query = { phone, country_code };
    }

    let user = await DeviceToken.findOne(query);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update token if provided
    if (token) {
      await DeviceToken.updateOne(
        { _id: user._id },
        { $set: { token: token } }
      );
      user = await DeviceToken.findById(user._id);
    }

    // Generate OTP
    const otpValue = email ? "112233" : "445566"; // Use random generator in production
    const type = email ? "email" : "phone";
    const identifier = email || `${country_code}${phone}`;
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Check if OTP already exists for this user
    const existingOtp = await OtpModel.findOne({ userid: user._id });

    if (existingOtp) {
      // Update existing OTP
      existingOtp.type = type;
      existingOtp.identifier = identifier;
      existingOtp.otp = otpValue;
      existingOtp.expiresAt = expiresAt;
      await existingOtp.save();
    } else {
      // Create new OTP
      await OtpModel.create({
        userid: user._id,
        type,
        identifier,
        otp: otpValue,
        expiresAt,
      });
    }

    return res.status(200).json({
      message: "Login successful. OTP has been generated or updated.",
      user,
      // ⚠️ Show only in development
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Token, email, or phone already exists." });
    }
    res.status(500).json({ message: "Login failed", error: error.message });
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
    const { id } = req.params; // user id as string
    const { otp, type } = req.body;

    // Validate inputs
    if (!otp) {
      return res.status(400).json({ message: "OTP is required." });
    }

    if (!type) {
      return res
        .status(400)
        .json({ message: "Type (email or phone) is required." });
    }

    // Find OTP record for this user and type
    const otpRecord = await OtpModel.findOne({ userid: id, type });

    console.log("🚀 ~ OTPCheck ~ otpRecord:", otpRecord);
    if (!otpRecord) {
      return res
        .status(404)
        .json({ message: "No OTP found for this user and type." });
    }

    const now = new Date();

    // Check if OTP matches and not expired
    if (otpRecord.otp === otp && otpRecord.expiresAt > now) {
      // OTP valid - delete so it can’t be reused
      await OtpModel.deleteOne({ _id: otpRecord._id });

      // Respond with login success
      return res.status(200).json({
        message: "OTP verified successfully. Login successful.",
        userId: id,
      });
    } else {
      // OTP invalid or expired
      return res.status(401).json({ message: "Invalid or expired OTP." });
    }
  } catch (error) {
    console.error("❌ OTP Check error:", error);
    return res
      .status(500)
      .json({ message: "Failed to verify OTP.", error: error.message });
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
