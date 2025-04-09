import Admin from "../models/Admin.model.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// ✅ Load env first
dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET;
// console.log("🚀 ~ SECRET_KEY:", SECRET_KEY);
if (!SECRET_KEY) throw new Error("JWT_SECRET is not defined in .env");

// ✅ Admin Registration
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("Admin register body:", req.body);

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin with hashed password
    const newAdmin = new Admin({ name, email, password: hashedPassword });
    await newAdmin.save();

    res.status(201).json({
      message: "Admin registered successfully",
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
      },
    });
  } catch (error) {
    console.error("Error registering admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Admin Login
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", email);

    // Validate
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (!existingAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // ✅ Compare password
    const isMatch = await bcrypt.compare(password, existingAdmin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // ✅ Generate token
    const token = jwt.sign(
      { id: existingAdmin._id, email: existingAdmin.email },
      SECRET_KEY,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Admin login successful!",
      token,
      admin: {
        id: existingAdmin._id,
        email: existingAdmin.email,
        name: existingAdmin.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
