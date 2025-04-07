import { v2 as cloudinary } from "cloudinary";
// import { response } from "express";
import fs from "fs";
// import { loadEnvFile } from "process";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// export const uploadCloudinary = async (localFilePath) => {
//   try {
//     if (!localFilePath) return null;
//     console.log(localFilePath, "localFilePath");

//     // upload the file on cloudinary
//     const responsefile = await cloudinary.uploader.upload(localFilePath, {
//       resource_type: "auto",
//     });
//     fs.unlinkSync(localFilePath);
//     console.log("file is uploded on cloudinary ", responsefile);
//     return responsefile;
//     //file has been uploded sucessfull
//   } catch (error) {
//     fs.unlinkSync(localFilePath);
//     console.log(error);

//     return error;
//   }
// };

export const uploadToCloudinary = async (fileBuffer, fileName) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        public_id: `uploads/${fileName}`,
        overwrite: true,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

export const uploadCloudinary = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "your-folder-name", // optional
        public_id: filename.split(".")[0], // optional
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(stream);
  });
};
