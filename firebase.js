import admin from "firebase-admin";
import { serviceAccount } from "./art-of-living-1b75a-firebase-adminsdk-fbsvc-a08df784cc.js";

// const serviceAccount = require("./art-of-living-1b75a-firebase-adminsdk-fbsvc-a08df784cc");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
