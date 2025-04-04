import express from "express";
import {
  addUserType,
  userType,
  addAction,
  action,
} from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { addAdv, displayYoutubeLink } from "../controllers/adv.controller.js";

const router = express.Router();

router.get("/type", userType);
router.post("/add-type", upload.single("img"), addUserType);

router.get("/action/:usertype", action);
router.post("/add-action", upload.any(), addAction);

router.post("/add-adv", upload.any(), addAdv);

router.get("/youtube-link", displayYoutubeLink);

export default router;
