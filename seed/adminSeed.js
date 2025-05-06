// seeds/adminSeed.js

import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Admin from "../src/models/Admin.model.js"; // adjust if your path is different

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    const exists = await Admin.findOne({ email: "admin@example.com" });
    if (exists) {
      console.log("Admin already exists.");
    } else {
      const hashedPassword = await bcrypt.hash("Admin@123", 10);
      const admin = new Admin({
        name: "Super Admin",
        email: "admin@example.com",
        password: hashedPassword,
      });

      await admin.save();
      console.log("Admin created!");
    }

    mongoose.disconnect();
  } catch (err) {
    console.error("Seeding error:", err);
    mongoose.disconnect();
  }
};

seedAdmin();
