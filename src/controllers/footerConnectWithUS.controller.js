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
      typeName: contactName,
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

export const displayFooterEmail = async (req, res) => {
  try {
    const emailEntry = await ContactWithUs.findOne({ typeName: "email" });

    if (!emailEntry) {
      return res.status(404).json({ message: "Email entry not found" });
    }

    res.status(200).json({
      message: "Email entry retrieved successfully.",
      data: emailEntry,
    });
  } catch (error) {
    console.error("Display error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const displayFooterCall = async (req, res) => {
  try {
    const contactEntry = await ContactWithUs.findOne({ typeName: "contact" });

    if (!contactEntry) {
      return res.status(404).json({ message: "Contact entry not found" });
    }

    res.status(200).json({
      message: "Contact entry retrieved successfully.",
      data: contactEntry,
    });
  } catch (error) {
    console.error("Display error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const displayFooterMessage = async (req, res) => {
  try {
    const messageEntry = await ContactWithUs.findOne({ typeName: "chat" });

    if (!messageEntry) {
      return res.status(404).json({ message: "Chat entry not found" });
    }

    res.status(200).json({
      message: "Chat entry retrieved successfully.",
      data: messageEntry,
    });
  } catch (error) {
    console.error("Display error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const displayFooterDrop = async (req, res) => {
  try {
    const dropEntry = await ContactWithUs.findOne({ typeName: "drop" });

    if (!dropEntry) {
      return res.status(404).json({ message: "Drop entry not found" });
    }

    res.status(200).json({
      message: "Drop entry retrieved successfully.",
      data: dropEntry,
    });
  } catch (error) {
    console.error("Display error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
