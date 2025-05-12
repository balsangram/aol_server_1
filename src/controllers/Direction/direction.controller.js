import Direction from "../../models/direction/Direction.model.js";
import { uploadToCloudinary } from "../../utils/cloudnary.js"; // Ensure this exists and works

export const add_direction = async (req, res) => {
  //   console.log(req.body, "Body");
  console.log(req.file, "File");
  console.log("1");

  try {
    const { directionName, directionDescription, longitude, latitude } =
      req.body;
    console.log(
      "1.5",
      directionName,
      directionDescription,
      longitude,
      latitude
    );

    // Validate fields
    if (
      !directionName ||
      !directionDescription ||
      !longitude ||
      !latitude ||
      !req.file
    ) {
      console.log("2");

      console.log("🚀 ~ constadd_direction= ~ directionImg:", directionImg);
      return res
        .status(400)
        .json({ message: "All fields are required including image" });
    }
    // console.log("file", req.file.path);

    // Upload image
    const uploadedImage = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname
    );
    console.log("🚀 ~ constadd_direction= ~ uploadedImage:", uploadedImage);

    const directionImg = uploadedImage.url;

    const newDirection = new Direction({
      directionName,
      directionImg,
      directionDescription,
      longitude,
      latitude,
    });
    console.log("🚀 ~ constadd_direction= ~ newDirection:", newDirection);

    await newDirection.save();
    res
      .status(201)
      .json({ message: "Direction added successfully", data: newDirection });
  } catch (error) {
    console.log("error", error);

    res.status(500).json({ message: "Failed to add direction", error });
  }
};

// Get all directions
export const get_direction = async (req, res) => {
  try {
    const directions = await Direction.find();
    res.status(200).json(directions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch directions", error });
  }
};

export const update_direction = async (req, res) => {
  try {
    const { id } = req.params;
    const { directionName, directionDescription, longitude, latitude } =
      req.body;

    let updatedFields = {
      directionName,
      directionDescription,
      longitude,
      latitude,
    };

    // If a new image is provided, upload to Cloudinary
    if (req.file) {
      const uploadedImage = await uploadToCloudinary(
        req.file.buffer,
        req.file.originalname
      );
      updatedFields.directionImg = uploadedImage.url;
    }

    const updatedDirection = await Direction.findByIdAndUpdate(
      id,
      updatedFields,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedDirection) {
      return res.status(404).json({ message: "Direction not found" });
    }

    res
      .status(200)
      .json({
        message: "Direction updated successfully",
        data: updatedDirection,
      });
  } catch (error) {
    res.status(500).json({ message: "Failed to update direction", error });
  }
};

export const delete_direction = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedDirection = await Direction.findByIdAndDelete(id);

    if (!deletedDirection) {
      return res.status(404).json({ message: "Direction not found" });
    }

    res
      .status(200)
      .json({ message: "Direction deleted successfully", deletedDirection });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete direction", error });
  }
};
