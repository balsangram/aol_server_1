import multer from "multer";
// import { uploadCloudinary } from "../utils/cloudnary.js";
// import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(req.body, "multer req body");

    cb(null, "uploads/");
    file.path = `uploads/${file.originalname}`;
    req.file = file;
    console.log(file, "file");
    // uploadCloudinary(path.join(__dirname__,"../../uploads",file.originalname));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({
  storage,
});
