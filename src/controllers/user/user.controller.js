import DeviceToken from "../../models/notification/deviceToken.model.js"; // Update with actual path

export const loginUser = async (req, res) => {
  try {
    const { email, phone, country_code, token } = req.body;
    console.log("🚀 ~ loginUser ~ req.body:", req.body);

    if (!email && !phone) {
      return res.status(400).json({ message: "Email or phone number is required." });
    }

    let query;
    if (email) {
      query = { email };
    } else {
      if (!country_code) {
        return res.status(400).json({ message: "Country code is required when using phone number." });
      }
      query = { phone, country_code };
    }

    let user = await DeviceToken.findOne(query);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (token) {
      await DeviceToken.updateOne(
        { _id: user._id },
        { $set: { token: token } }
      );
      user = await DeviceToken.findById(user._id);
    }

    return res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    console.error("❌ Login error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Token, email, or phone already exists." });
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

export const OTPConnection = async (req, res) => {
  try {
  } catch (error) {}
};
export const OTPCheck = async (req, res) => {
  try {
  } catch (error) {}
};
