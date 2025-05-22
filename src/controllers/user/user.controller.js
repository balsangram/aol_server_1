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
    const { email, phone, token } = req.body;
    console.log("🚀 ~ loginUser ~ req.body:", req.body);

    if (!email || !phone) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const emailMatch = await DeviceToken.findOne({ email });
    const phoneMatch = await DeviceToken.findOne({ phone });

    if (!emailMatch && !phoneMatch) {
      // New user: allow login (or signup flow)
      return res.status(201).json({ message: "Login allowed (new user)" });
    }

    if (emailMatch && phoneMatch) {
      if (emailMatch._id.toString() === phoneMatch._id.toString()) {
        // Email and phone belong to the same user
        // If token provided and different, update it
        if (token && emailMatch.token !== token) {
          emailMatch.token = token;
          await emailMatch.save();
          return res.status(200).json({
            message: "Login successful, token updated",
            user: emailMatch,
          });
        }
        return res
          .status(200)
          .json({ message: "Login successful", user: emailMatch });
      } else {
        // Email and phone belong to different users — conflict
        return res.status(400).json({
          message: "Email and phone belong to different users.",
        });
      }
    }

    // Partial match cases:
    // If email exists only:
    if (emailMatch && !phoneMatch) {
      return res.status(400).json({
        message: "Email already exists but phone doesn't match.",
      });
    }
    // If phone exists only:
    if (!emailMatch && phoneMatch) {
      return res.status(400).json({
        message: "Phone already exists but email doesn't match.",
      });
    }

    // Default fallback error
    return res.status(400).json({
      message: "Email or phone already exists. Please check your credentials.",
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};
