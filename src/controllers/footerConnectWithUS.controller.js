import ContactWithUs from "../models/footerConnectWithUS.model.js";
import { uploadToCloudinary } from "../utils/cloudnary.js"; // Adjust the path
export const displayAllContactWithUS = async (req, res) => {
  try {
    const allContactWithUs = await ContactWithUs.find();
    res
      .status(200)
      .json({ message: "all display connect with us ", allContactWithUs });
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const addContactWithUS = async (req, res) => {
    try {
      console.log("Request Body:", req.body); // Should show contactName and contactLink
      console.log("Uploaded File:", req.file); // Should show contactImage file
  
      const { contactName, contactLink } = req.body;
      const contactImage = req.file;
      
      if (!contactImage) {
        return res.status(400).json({ message: "Image file is required." });
      }
  
      // Upload to Cloudinary
      const uploadResult = await uploadToCloudinary(
        contactImage.buffer,
        contactImage.originalname
      );
  
      const newContact = new ContactWithUs({
        contactName,
        contactLink,
        contactImage: uploadResult.secure_url,
      });
  
      await newContact.save();
  
      res.status(200).json({
        message: "Contact added successfully",
        data: newContact,
      });
    } catch (error) {
      console.error("Error uploading contact:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  

// import SocialMedia from "../models/socialMediaModel.js";
// import { uploadToCloudinary } from "../utils/cloudinary.js";

export const updateContactWithUS = async (req, res) => {
  try {
    const { id } = req.params;
    const { contactName, contactLink } = req.body;
    const contactImageFile = req.file;

    // Find the existing social media entry
    const existing = await ContactWithUs.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Social media entry not found" });
    }

    // Update name/link if provided
    if (contactName) existing.contactName = contactName;
    if (contactLink) existing.contactLink = contactLink;

    // If a new image was uploaded, upload it to Cloudinary
    if (contactImageFile) {
      const uploadResult = await uploadToCloudinary(
        contactImageFile.buffer,
        contactImageFile.originalname
      );
      existing.contactImage = uploadResult.secure_url;
    }

    // Save changes
    await existing.save();

    res.status(200).json({ message: "Social media updated", data: existing });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Failed to update social media" });
  }
};
