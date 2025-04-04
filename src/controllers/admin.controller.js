import Admin from "../models/Admin.model.js";
import dotenv from "dotenv";

dotenv.config();

export const registerAdmin = async (req, res) => {
  try {
    console.log(req.body, "admin register body");

    const { name, email, password } = req.body;

    console.log("in registerAdmin inside body", req.body);
    // Check if the admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Create a new admin
    const newAdmin = new Admin({ name, email, password });
    console.log(newAdmin, "newAdmin");

    // Save to database
    await newAdmin.save();

    res.status(201).json({
      message: "Admin registered successfully",
      admin: { id: newAdmin._id, name: newAdmin.name, email: newAdmin.email },
    });
  } catch (error) {
    console.error("Error registering admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin.password !== password) {
      return res.status(201).json({ message: "password invalid" });
    }

    res.status(201).json({
      message: "Admin Login successfully!",
      // token
    });
  } catch (error) {
    console.log("server problem");

    res.status(500).json({ message: error.message });
  }
};
