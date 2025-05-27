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
  // addHeadlines,
  // deleteHeading,
  displayHeadlines,
  // multiAddHeadlines,
  // updateHeading,
} from "../controllers/head.controller.js";
import {
  addHomeCard,
  cardSearch,
  createCard,
  displayHomeCard,
  removeCard,
  removeHomeCard,
  searchCard,
  showAllCards,
  updateCard,
  updateHomeCard,
} from "../controllers/card.controller.js";
import {
  addUserType,
  changeLikeOrDislike,
  deleteUserType,
  singleuserType,
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
  displayHistoryOfAdvertisement,
  getAdvertisements,
} from "../controllers/adv.controller.js";
// import UserType from "../models/UserType.model.js";
import {
  action,
  addAction,
  deleteAction,
  updateAction,
} from "../controllers/action.contoller.controller.js";

import {
  addPopUp,
  displayAllPopUp,
  displayPopUp,
} from "../controllers/popUp.controller.js";

import multer from "multer";
import {
  addSOSNumber,
  getLastSOSNumber,
} from "../controllers/sosController.controller.js";
import {
  addLiveLink,
  addLiveNewUpdate,
  clearnewLive,
  // addLiveDateTime,
  // addLiveLink,
  displayHistoryOfLive,
  // displayLiveDateTime,
  displayLiveLink,
  displayLiveNewUpdates,
  stopLiveLink,
} from "../controllers/liveLink.controller.js";
// import {
//   // addAllSocialMedia,
//   // displayAllSocialMedia,
//   // updateAllSocialMedia,
// } from "../controllers/socialMedia.controller.js";
import {
  addContactWithUS,
  deleteContactWithUS,
  displayAllContactWithUS,
  displayFooterCall,
  displayFooterDrop,
  displayFooterEmail,
  displayFooterMessage,
  updateContactWithUS,
} from "../controllers/footerConnectWithUS.controller.js";
import {
  addSocialMedia,
  deleteSocialMedia,
  displayAllSocialMedia,
  updateSocialMedia,
} from "../controllers/socialMedia.controller.js";
import {
  addOnBoarding,
  displayOnBoarding,
} from "../controllers/flutter/onBoading.controller.js";
import {
  // get__Cards,
  get_action,
  get_Cards,
  get_LiveNewUpdates,
  get_searchCard,
  get_userType,
  // get_ExperienceCenterDigitally,
  // get_FacilitiesServicesatCenter,
  // get_StayUpdated,
  // get_userType,
} from "../controllers/translation/allTranslated.controller.js";
import {
  add_direction,
  delete_direction,
  get_direction,
  getNames,
  getSingelCard,
  update_direction,
} from "../controllers/Direction/direction.controller.js";
import {
  countDeviceTokens,
  // createGroup,
  // deleteGroup,
  displayAllNotification,
  // displayGroup,
  displayUser,
  getUserNotifications,
  logoutAndUnsubscribeToken,
  saveAndSubscribeToken,
  searchUser,
  sendGroupNotification,
  sendNotificationToAll,
  sendSingleNotification,
  // updateGroupUser,
} from "../controllers/notification/sendNotificationToAll.controller.js";
import {
  createGroupWithUser,
  deleteGroup,
  // displayGroup,
  getAllGroupsWithDeviceTokens,
  updateGroupUser,
} from "../controllers/notification/group.controller.js";
import { loginUser } from "../controllers/user/user.controller.js";
import {
  addLinkLog,
  displayLinkLog,
} from "../controllers/linkLogs/linkLog.controller.js";
// import { verifyToken } from "../middleware/verifyToken.js";

// import verifyToken from "../middleware/verifyToken.js";

// Store files in memory instead of disk
// const storage = multer.memoryStorage();

// export const upload_V2 = multer({ storage });
const storage = multer.memoryStorage();
export const upload_V2 = multer({ storage });

// console.log(upload_V2, "upload_V2");

const router = express.Router();

// admin functionality
router.post("/adminRegister", registerAdmin);
router.post("/adminLogin", loginAdmin);
// router.patch("/adminUpdayte");
// router.delete("/adminDelete");

// user
router.post("/userLogin", loginUser);

// customer functionality
// router.post("/userRegister", registerCustomer);
// router.post("/userLogin", loginCustomer);
// router.patch("/userUpdate/:id", updateCustomer);
// router.delete("/userDelete/:id", deleteCustomer);

// Headings
router.get("/displayHeading", displayHeadlines);
// router.post("/addHeading", addHeadlines);
// router.post("/addHeading", multiAddHeadlines);
// router.patch("/updateHeading/:id", updateHeading);
// router.delete("/deleteHeading/:id", deleteHeading);

//containers
router.get("/showAllCards/:headline", showAllCards);
// router.post("/createCard", upload_V2.single("img"), createCard);
router.post("/createCard", upload_V2.single("img"), createCard);
router.patch("/updateCard/:id", upload_V2.single("img"), updateCard);
router.delete("/removeCard/:id", removeCard);
router.get("/card_search", cardSearch);

router.get("/displayHomeCard", displayHomeCard);
router.post("/createHomeCard", upload_V2.single("img"), addHomeCard);
router.patch("/updateHomeCCard/:id", upload_V2.single("img"), updateHomeCard);
router.delete("/removeHomeCard/:id", removeHomeCard);

//user Types
router.get("/userType", userType);
router.get("/userType/:id", singleuserType);
router.post("/addUserType", upload_V2.single("img"), addUserType);
router.patch("/updateUSerType/:id", upload_V2.single("img"), updateUserType);
router.delete("/deleteUSerType/:id", deleteUserType);

// favorite
router.post("/userType_importance/:id", changeLikeOrDislike);

//actions
router.get("/displayAction/:usertype", action);
router.post("/addAction", upload_V2.any(), addAction);
router.patch("/updateAction/:id", upload_V2.single("img"), updateAction);
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
router.get("/advertisement_history", displayHistoryOfAdvertisement);
// router.post(
//   "/addAdv",
//   upload_V2.array("images", 3), // 👈 Accepts 3 files under the "images" field
//   addAdvertisement
// );

// router.post("/addAdv", upload_V2.any(), addAdvertisement);
router.get("/displayAdvertisement", getAdvertisements);

// sos
router.post("/sos", addSOSNumber);
router.get("/sos/latest", getLastSOSNumber);

//pop-up
router.post("/addPopUp", upload_V2.single("img"), addPopUp);
router.get("/displayPopUp", displayPopUp);
router.get("/displayAllPopUp", displayAllPopUp);

// notification
router.post("/sendNotificationToAll", sendNotificationToAll);
router.post("/sendSingleNotification", sendSingleNotification);
router.post("/deviceToken", saveAndSubscribeToken);
router.get("/display_notification", displayAllNotification);
router.get("/countDeviceTokens", countDeviceTokens);
router.get("/displayAllUSer", displayUser);
router.patch("/logout", logoutAndUnsubscribeToken);

router.get("/searchUser", searchUser);

router.get("/notifications/:deviceId", getUserNotifications);

// group
router.get("/displayAllGroup", getAllGroupsWithDeviceTokens);
router.post("/createGroup", createGroupWithUser);
router.delete("/deleteGroup/:id", deleteGroup);
router.patch("/updateGroup/:id", updateGroupUser);

router.post("/sendGroupNotification", sendGroupNotification);

// search
router.get("/searchCard", searchCard);

// live videos
router.get("/display_live_link", displayLiveLink);
router.post("/add_live_link", addLiveLink);
router.delete("/clear_live_link", stopLiveLink);

router.post("/add_live_date_time", addLiveNewUpdate);
router.get("/display_live_date_time", displayLiveNewUpdates);
router.delete("/clear_live_link_date_time", clearnewLive);

router.get("/displayHistoryOfLive", displayHistoryOfLive);

// footer  =====
// social media handel
router.get("/social_media", displayAllSocialMedia);
router.post("/social_media", upload_V2.single("mediaImage"), addSocialMedia);
router.patch(
  "/social_media/:id",
  upload_V2.single("mediaImage"),
  updateSocialMedia
);
router.delete("/social_media/:id", deleteSocialMedia);
// contact with us

router.get("/footer_email", displayFooterEmail);
router.get("/footer_Call", displayFooterCall);
router.get("/footer_Message", displayFooterMessage);
router.get("/footer_Drop", displayFooterDrop);

router.get("/contact_with_us", displayAllContactWithUS);
router.post(
  "/contact_with_us",
  upload_V2.single("contactImage"),
  addContactWithUS
);
router.patch(
  "/contact_with_us/:id",
  upload_V2.single("contactImage"),
  updateContactWithUS
);
router.delete("/contact_with_us/:id", deleteContactWithUS);

// OnBoarding images
router.get("/display_On_Boarding", displayOnBoarding);
router.post("/add_On_Boarding", upload_V2.single("img"), addOnBoarding);

// translate

// card
router.get("/Card_language/:headline/:language", get_Cards);
// action
router.get("/action_language/:usertype/:language", get_action);

// userType
router.get("/userType_language/:language", get_userType);

// search
router.get("/searchCard_language/:language", get_searchCard);

// live new update
router.get("/display_live_date_time_language/:language", get_LiveNewUpdates);

// direction
router.get("/display_direction", get_direction);
router.post("/add_direction", upload_V2.single("directionImg"), add_direction);
router.patch(
  "/update_direction/:id",
  upload_V2.single("directionImg"),
  update_direction
);
router.delete("/delete_direction/:id", delete_direction);

router.get("/get_direction_names/:directionusertype", getNames);
router.get("/get_perticular_card/:cardName", getSingelCard);

// linkLog

router.post("/addClick", addLinkLog);
router.get("/displayClick", displayLinkLog);

export default router;
