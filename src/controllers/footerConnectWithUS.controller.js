import ContactWithUs from "../models/footerConnectWithUS.model.js";
import { uploadToCloudinary } from "../utils/cloudnary.js";

export const displayAllContactWithUS = async (req, res) => {
  try {
    const allContactWithUs = await ContactWithUs.find();
    res.status(200).json({
      message: "All contact entries retrieved successfully.",
      allContactWithUs,
    });
  } catch (error) {
    console.error("Display error:", error);
    res.status(500).json({ error: "Failed to fetch contact entries." });
  }
};

export const addContactWithUS = async (req, res) => {
  try {
    console.log(req.file, "file");
    const { contactName, contactLink } = req.body;
    const contactImage = req.file;

    if (!contactImage) {
      return res.status(400).json({ message: "Image file is required." });
    }

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

    res.status(201).json({
      message: "Contact entry added successfully.",
      data: newContact,
    });
  } catch (error) {
    console.error("Add error:", error);
    res.status(500).json({ error: "Failed to add contact entry." });
  }
};

export const updateContactWithUS = async (req, res) => {
  try {
    const { id } = req.params;
    const { contactName, contactLink } = req.body;
    const contactImage = req.file;

    const existing = await ContactWithUs.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Contact entry not found." });
    }

    if (contactName) existing.contactName = contactName;
    if (contactLink) existing.contactLink = contactLink;

    if (contactImage) {
      const uploadResult = await uploadToCloudinary(
        contactImage.buffer,
        contactImage.originalname
      );
      existing.contactImage = uploadResult.secure_url;
    }

    await existing.save();

    res.status(200).json({
      message: "Contact entry updated successfully.",
      data: existing,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Failed to update contact entry." });
  }
};

export const deleteContactWithUS = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedEntry = await ContactWithUs.findByIdAndDelete(id);

    if (!deletedEntry) {
      return res.status(404).json({ error: "ContactWithUs entry not found" });
    }

    res
      .status(200)
      .json({ message: "ContactWithUs entry deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to delete ContactWithUs" });
  }
};
