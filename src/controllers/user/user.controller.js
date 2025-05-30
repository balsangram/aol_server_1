// import DeviceToken from "../../models/notification/deviceToken.model.js"; // Update with actual path

// export const loginUser = async (req, res) => {
//   try {
//     const { email, phone } = req.body;
//     console.log("🚀 ~ loginUser ~ req.body:", req.body);

//     if (!email || !phone) {
//       return res.status(400).json({ message: "All fields are required." });
//     }

//     const emailMatch = await DeviceToken.findOne({ email });
//     const phoneMatch = await DeviceToken.findOne({ phone });

//     if (!emailMatch && !phoneMatch) {
//       // 🚪 Allow login if both don't exist in DB
//       return res.status(201).json({ message: "Login allowed (new user)" });
//     }

//     if (emailMatch && phoneMatch) {
//       if (emailMatch._id.toString() === phoneMatch._id.toString()) {
//         // ✅ Email and phone match same user
//         return res
//           .status(200)
//           .json({ message: "Login successful", user: emailMatch });
//       } else {
//         // ❌ Both exist but not in the same user
//         return res.status(400).json({
//           message: "Email and phone belong to different users.",
//         });
//       }
//     }

//     // ❌ Only one exists (partial match)
//     return res.status(400).json({
//       message: "Email or phone already exists. Please check your credentials.",
//     });
//   } catch (error) {
//     console.error("❌ Login error:", error);
//     res.status(500).json({ message: "Login failed", error: error.message });
//   }
// };

import DeviceToken from "../../models/notification/deviceToken.model.js"; // Update with actual path

export const loginUser = async (req, res) => {
  try {
    const { email, phone, country_code, token } = req.body;
    console.log("🚀 ~ loginUser ~ req.body:", req.body);

    // Must provide either email or phone
    if (!email && !phone) {
      return res
        .status(400)
        .json({ message: "Email or phone number is required." });
    }

    let user;

    // If email is provided
    if (email) {
      user = await DeviceToken.findOne({ email });
    }
    // If phone is provided
    else if (phone) {
      if (!country_code) {
        return res.status(400).json({
          message: "Country code is required when using phone number.",
        });
      }

      user = await DeviceToken.findOne({ phone, country_code });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Add token if provided and not already in the array
    if (token && (!Array.isArray(user.token) || !user.token.includes(token))) {
      if (!Array.isArray(user.token)) {
        user.token = [];
      }
      user.token.push(token);
      await user.save();
    }

    return res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    console.error("❌ Login error:", error);
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

export const OTPConnection = async (req, res) => {
  try {
  } catch (error) {}
};
