import DeviceToken from "../../models/notification/deviceToken.model.js"; // Update with actual path

export const loginUser = async (req, res) => {
  try {
    const { email, phone } = req.body;
    console.log("🚀 ~ loginUser ~ req.body:", req.body);

    if (!email || !phone) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const emailMatch = await DeviceToken.findOne({ email });
    const phoneMatch = await DeviceToken.findOne({ phone });

    if (!emailMatch && !phoneMatch) {
      // 🚪 Allow login if both don't exist in DB
      return res.status(200).json({ message: "Login allowed (new user)" });
    }

    if (emailMatch && phoneMatch) {
      if (emailMatch._id.toString() === phoneMatch._id.toString()) {
        // ✅ Email and phone match same user
        return res
          .status(200)
          .json({ message: "Login successful", user: emailMatch });
      } else {
        // ❌ Both exist but not in the same user
        return res.status(400).json({
          message: "Email and phone belong to different users.",
        });
      }
    }

    // ❌ Only one exists (partial match)
    return res.status(400).json({
      message: "Email or phone already exists. Please check your credentials.",
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};
