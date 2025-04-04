import SOS from "../models/Sos.model.js";

// Add SOS number
export const addSOSNumber = async (req, res) => {
  const { phoneNumber, countryCode } = req.body;

  if (!phoneNumber || !countryCode) {
    return res
      .status(400)
      .json({ message: "phoneNumber and countryCode are required" });
  }

  try {
    const newSOS = await SOS.create({ phoneNumber, countryCode });
    res.status(201).json({
      message: "SOS number added successfully.",
      data: newSOS,
    });
  } catch (error) {
    console.error("Error adding SOS number:", error);
    res
      .status(500)
      .json({ message: "Failed to add SOS number", error: error.message });
  }
};

// Get last added SOS number
export const getLastSOSNumber = async (req, res) => {
  try {
    const latestSOS = await SOS.findOne().sort({ createdAt: -1 });

    if (!latestSOS) {
      return res.status(404).json({ message: "No SOS numbers found." });
    }

    const fullNumber = `${latestSOS.countryCode}${latestSOS.phoneNumber}`;

    res.status(200).json({
      message: "Last SOS number retrieved.",
      phoneNumber: fullNumber,
      raw: latestSOS,
    });
  } catch (error) {
    console.error("Error retrieving SOS number:", error);
    res
      .status(500)
      .json({ message: "Failed to get SOS number", error: error.message });
  }
};
