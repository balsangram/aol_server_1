import Action from "../models/Action.model.js";
import { uploadCloudinary } from "../utils/cloudnary.js";

export const action = async (req, res) => {
  console.log(req.params, "usertype query"); // Logging query params correctly

  try {
    const { usertype } = req.params; // Extract usertype from query params

    if (!usertype) {
      return res.status(400).json({ message: "Usertype is required" });
    }

    const actions = await Action.find({ usertype }); // Filter actions by usertype

    if (actions.length === 0) {
      return res
        .status(404)
        .json({ message: "No actions found for this usertype" });
    }

    res.status(200).json(actions);
  } catch (error) {
    console.error("Error fetching actions:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const addAction = async (req, res) => {
  try {
    console.log("Received request file:", req.file); // Debugging file

    let imageUrl = null;
    if (req.file) {
      const imageUpload = await uploadCloudinary(req.file.path); // Upload image
      imageUrl = imageUpload.secure_url; // Extract URL from Cloudinary response
    }

    let data = req.body;
    if (!Array.isArray(data)) {
      data = [data]; // Convert single object to array
    }

    data = data.map((item) => ({
      usertype: item.usertype,
      action: item.action,
      link: item.link,
      img: imageUrl, // Store image URL in DB
    }));

    // Validate data
    if (!data.every((item) => item.usertype && item.action && item.link)) {
      return res
        .status(400)
        .json({ message: "Missing required fields (usertype, action, link)." });
    }

    // Insert into DB
    const newActions = await Action.insertMany(data);
    console.log("Inserted Actions:", newActions);

    res
      .status(201)
      .json({ message: "Actions added successfully", actions: newActions });
  } catch (error) {
    console.error("Error adding action:", error);
    res.status(500).json({ message: error.message });
  }
};

import mongoose from "mongoose";

export const updateAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { usertype, language, action, link } = req.body;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid action ID" });
    }

    // Find existing action
    const existingAction = await Action.findById(id);
    if (!existingAction) {
      return res.status(404).json({ message: "Action not found" });
    }

    let imageUrl = existingAction.img; // Retain old image by default

    // If a new image is uploaded, process it
    if (req.file?.path) {
      try {
        console.log("Received Image:", req.file);

        // Upload to Cloudinary
        const imageUpload = await uploadCloudinary(req.file.path);
        imageUrl = imageUpload.secure_url;

        // Optional: If you want to delete the old image from Cloudinary
        // if (existingAction.img) await deleteCloudinaryImage(existingAction.img);
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);
        return res.status(500).json({ message: "Image upload failed" });
      }
    }

    // Update fields (only if they exist in req.body)
    existingAction.usertype = usertype?.trim() || existingAction.usertype;
    existingAction.language = language?.trim() || existingAction.language;
    existingAction.action = action?.trim() || existingAction.action;
    existingAction.link = link?.trim() || existingAction.link;
    existingAction.img = imageUrl; // Update image only if changed

    // Save updated document
    await existingAction.save();

    res
      .status(200)
      .json({ message: "Updated successfully", action: existingAction });
  } catch (error) {
    console.error("Error updating action:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

export const deleteAction = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id, "id");

    const isAction = await Action.findByIdAndDelete(id);
    if (!isAction) {
      return res.status(404).json({ message: "file not found" });
    }

    console.log(isAction, "isAction");

    res.status(200).json({ message: "action deleted sucessafully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
