import UserType from "../models/UserType.model.js";
import Action from "../models/Action.model.js";
import { uploadCloudinary } from "../utils/cloudnary.js";
// import { parse } from "dotenv";
// Show All Cards
export const userType = async (req, res) => {
  try {
    const userType = await UserType.find();
    res.status(200).json(userType);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addUserType = async (req, res) => {
  try {
    console.log(req.file, "file uplode");
    console.log(req.body, "body");

    const { usertype } = req.body;
    const imageUplode = await uploadCloudinary(req.file.path);
    console.log("imageUplode", imageUplode);

    console.log(req.body);
    // Check if the user type already exists
    const existingUserType = await UserType.findOne({ usertype });
    if (existingUserType) {
      return res.status(400).json({ message: "Type name already exists" });
    }

    // Create new user type
    const newUserType = new UserType({ usertype, img: imageUplode.url });
    await newUserType.save();

    console.log(newUserType, "newUserType");

    res.status(201).json(newUserType); // ✅ Return the saved user type
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserType = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id, "id");

    const { usertype } = req.body;
    console.log(usertype, "userType");

    const isUserType = await UserType.findByIdAndUpdate(
      id,
      { usertype },
      { new: true }
    );
    if (!isUserType) {
      console.log(isUserType, "isUserType");

      return res.status(404).json({ message: "file not found" });
    }
    res.status(200).json({ message: "updated sucessafully", isUserType });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUserType = async (req, res) => {
  try {
    console.log(req.params, "kkk");

    const { id } = req.params;
    console.log(`Attempting to delete UserType with ID: ${id}`);
    const deletedUserType = await UserType.findByIdAndDelete(id);
    if (!deletedUserType) {
      return res.status(404).json({ message: "UserType not found" });
    }
    res.status(200).json({ message: "ID deleted successfully" });
  } catch (error) {
    console.error("Error deleting UserType:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
