import express from "express";
import { upload } from "../middleware/multer.middleware.js";
import { loginAdmin, registerAdmin } from "../controllers/admin.controller.js";
import {
  deleteCustomer,
  loginCustomer,
  registerCustomer,
  updateCustomer,
} from "../controllers/customer.controller.js";
import {
  addHeadlines,
  deleteHeading,
  displayHeadlines,
  updateHeading,
} from "../controllers/head.controller.js";
import {
  addHomeCard,
  createCard,
  displayHomeCard,
  removeCard,
  removeHomeCard,
  showAllCards,
  updateCard,
  updateHomeCard,
} from "../controllers/card.controller.js";
import {
  addUserType,
  deleteUserType,
  updateUserType,
  userType,
} from "../controllers/userType.controller.js";
import {
  addYoutubeLinks,
  deleteYoutubeLink,
  showMobileYoutubeLinks,
  showWebYoutubeLinks,
  updateYoutubeLink,
} from "../controllers/youTube.controller.js";
import {
  addAdvertisement,
  getAdvertisements,
} from "../controllers/adv.controller.js";
import UserType from "../models/UserType.model.js";
import {
  action,
  addAction,
  deleteAction,
  updateAction,
} from "../controllers/action.contoller.js";

import { addPopUp, displayPopUp } from "../controllers/popUp.controller.js";
import {
  saveAndSubscribeToken,
  sendNotificationToAll,
} from "../controllers/sendNotificationToAll.contoller.js";

import multer from "multer";

// Store files in memory instead of disk
const storage = multer.memoryStorage();

export const upload_V2 = multer({ storage });

const router = express.Router();

// admin functionality
router.post("/adminRegister", registerAdmin);
router.post("/adminLogin", loginAdmin);
// router.patch("/adminUpdayte");
// router.delete("/adminDelete");

// customer functionality
router.post("/userRegister", registerCustomer);
router.post("/userLogin", loginCustomer);
router.patch("/userUpdate/:id", updateCustomer);
router.delete("/userDelete/:id", deleteCustomer);

// Headings
router.get("/displayHeading", displayHeadlines);
router.post("/addHeading", addHeadlines);
// router.patch("/updateHeading/:id", updateHeading);
router.delete("/deleteHeading/:id", deleteHeading);

//containers
router.get("/showAllCards/:headline", showAllCards);
// router.post("/createCard", upload_V2.single("img"), createCard);
router.post("/createCard", upload_V2.single("img"), createCard);
router.patch("/updateCard/:id", upload_V2.single("img"), updateCard);
router.delete("/removeCard/:id", removeCard);

router.get("/displayHomeCard", displayHomeCard);
router.post("/createHomeCard", upload_V2.single("img"), addHomeCard);
router.patch("/updateHomeCCard/:id", upload_V2.single("img"), updateHomeCard);
router.delete("/removeHomeCard/:id", removeHomeCard);

//user Types
router.get("/userType", userType);
router.post("/addUserType", upload_V2.single("img"), addUserType);
router.patch("/updateUSerType/:id", updateUserType);
router.delete("/deleteUSerType/:id", deleteUserType);

//actions
router.get("/displayAction/:usertype", action);
router.post("/addAction", upload_V2.any(), addAction);
router.patch("/updateAction/:id", upload_V2.any(), updateAction);
router.delete("/deleteAction/:id", deleteAction);

// YouTube Link
router.post("/addYoutubeLinks", upload_V2.single("thumbnail"), addYoutubeLinks);
router.get("/displayMobYoutubeLinks", showMobileYoutubeLinks);
router.get("/displayWebYoutubeLinks", showWebYoutubeLinks);
router.patch(
  "/updateYoutubeLink/:id",
  upload_V2.single("thumbnail"),
  updateYoutubeLink
);
router.delete("/deleteYoutubeLink/:id", deleteYoutubeLink);

// Advertising
router.post(
  "/addAdv",
  upload_V2.fields([
    { name: "img1", maxCount: 1 },
    { name: "img2", maxCount: 1 },
    { name: "img3", maxCount: 1 },
  ]),
  addAdvertisement
);

// router.post("/addAdv", upload_V2.any(), addAdvertisement);
router.get("/displayAdvertisement", getAdvertisements);

//pop-up
router.post("/addPopUp", upload_V2.single("img"), addPopUp);
router.get("/displayPopUp", displayPopUp);

// notification
router.post("/sendNotificationToAll", sendNotificationToAll);
router.post("/deviceToken", saveAndSubscribeToken);

export default router;
