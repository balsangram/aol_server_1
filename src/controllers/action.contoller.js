import Action from "../models/Action.model.js";
// import Action from "../models/translate/Action.model.js";
// import Action from "../models/translate/Action.model.js";
import { uploadCloudinary, uploadToCloudinary } from "../utils/cloudnary.js";
import translateText from "../utils/translation.js";

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

// export const addAction = async (req, res) => {
//   try {
//     console.log("Received request file:", req.file);
//     console.log("req body", req.body);

//     let imageUrl = null;
//     if (req.file) {
//       const imageUpload = await uploadCloudinary(req.file.path);
//       imageUrl = imageUpload.secure_url;
//     }

//     let data = req.body;
//     if (!Array.isArray(data)) {
//       data = [data];
//     }

//     const translatedData = await Promise.all(
//       data.map(async (item) => {
//         const actionText = item.action;

//         // Validate individual fields
//         if (!item.usertype || !item.action || !item.link) {
//           throw new Error("Missing required fields (usertype, action, link).");
//         }

//         const translations = {
//           en: actionText,
//           hi: await translateText(actionText, "hi"),
//           kn: await translateText(actionText, "kn"),
//           ta: await translateText(actionText, "ta"),
//           te: await translateText(actionText, "te"),
//           gu: await translateText(actionText, "gu"),
//           mr: await translateText(actionText, "mr"),
//           ml: await translateText(actionText, "ml"),
//           pa: await translateText(actionText, "pa"),
//           bn: await translateText(actionText, "bn"),
//           ru: await translateText(actionText, "ru"),
//           es: await translateText(actionText, "es"),
//           zh: await translateText(actionText, "zh"),
//           mn: await translateText(actionText, "mn"),
//           pl: await translateText(actionText, "pl"),
//           bg: await translateText(actionText, "bg"),
//           fr: await translateText(actionText, "fr"),
//           de: await translateText(actionText, "de"),
//           nl: await translateText(actionText, "nl"),
//           it: await translateText(actionText, "it"),
//           pt: await translateText(actionText, "pt"),
//           ja: await translateText(actionText, "ja"),
//           vi: await translateText(actionText, "vi"),
//         };

//         return {
//           usertype: item.usertype,
//           action: translations, // Save the whole translation object
//           link: item.link,
//           img: imageUrl,
//         };
//       })
//     );

//     const newActions = await Action.insertMany(translatedData);
//     console.log("Inserted Actions:", newActions);

//     res.status(201).json({
//       message: "Actions added successfully",
//       actions: newActions,
//     });
//   } catch (error) {
//     console.error("Error adding action:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

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

export const updateAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { usertype, language, action, link } = req.body;

    // Find existing action
    const existingAction = await Action.findById(id);
    if (!existingAction) {
      return res.status(404).json({ message: "Action not found" });
    }

    let imageUrl = existingAction.img; // Retain old image by default

    // ✅ Handle new image upload (once)
    if (req.file) {
      try {
        console.log("Received Image:", {
          name: req.file.originalname,
          type: req.file.mimetype,
          size: req.file.size,
        });

        const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
        imageUrl = result.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);
        return res.status(500).json({ message: "Image upload failed" });
      }
    }

    // ✅ Update fields only if present
    existingAction.usertype = usertype?.trim() || existingAction.usertype;
    existingAction.language = language?.trim() || existingAction.language;
    existingAction.action = action?.trim() || existingAction.action;
    existingAction.link = link?.trim() || existingAction.link;
    existingAction.img = imageUrl;

    await existingAction.save();

    res.status(200).json({
      message: "Updated successfully",
      action: existingAction,
    });
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
