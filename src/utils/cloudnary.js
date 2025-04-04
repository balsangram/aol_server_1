import { v2 as cloudinary } from "cloudinary";
// import { response } from "express";
import fs from "fs";
// import { loadEnvFile } from "process";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    console.log(localFilePath, "localFilePath");

    // upload the file on cloudinary
    const responsefile = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    fs.unlinkSync(localFilePath);
    console.log("file is uploded on cloudinary ", responsefile);
    return responsefile;
    //file has been uploded sucessfull
  } catch (error) {
    fs.unlinkSync(localFilePath);
    console.log(error);

    return error;
  }
};
