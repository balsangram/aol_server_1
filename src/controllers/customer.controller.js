import Customer from "../models/Customer.model.js";

export const registerCustomer = async (req, res) => {
  try {
    console.log(req.body, "admin register body");

    const { name, email, phoneNo, aadhaarNo } = req.body;

    console.log("in registerAdmin inside body", req.body);
    // Check if the admin already exists
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Create a new admin
    const newCustomer = new Customer({
      name,
      email,
      phoneNo,
      aadhaarNo,
    });
    console.log(newCustomer, "newCustomer");

    // Save to database
    await newCustomer.save();

    res.status(201).json({
      message: "Admin registered successfully",
      admin: {
        id: newCustomer._id,
        name: newCustomer.name,
        phoneNo: newCustomer.phoneNo,
        aadhaarNo: newCustomer.aadhaarNo,
        email: newCustomer.email,
      },
    });
  } catch (error) {
    console.error("Error registering customer:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const loginCustomer = async (req, res) => {
  try {
    console.log(req.body, "customer body");
    const { email } = req.body;
    const isCustomer = await Customer.findOne({ email });
    if (!isCustomer.email)
      return res.status(400).json({ message: "email is required" });
    console.log(isCustomer, "customer all details");

    res.status(200).json({ message: "customer login sucessafully " });
  } catch (error) {
    console.error("Error login customer:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id, "id", req.body);

    const { name, phoneNo, aadhaarNo, email } = req.body;
    const updatedCard = await Customer.findByIdAndUpdate(
      id,
      { name, phoneNo, aadhaarNo, email },
      { new: true }
    );
    if (!updatedCard)
      return res.status(404).json({ message: "Card not found" });
    res.status(200).json({ message: "Card updated successfully", updatedCard });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id, "user ID");
    const idCustomer = await Customer.findById(id);
    if (!idCustomer) {
      return res.status(404).json({ message: "customer is not available" });
    }
    const deleteCustomer = await Customer.findByIdAndDelete(id);
    if (!deleteCustomer) {
      return res.status(400).json({ message: "customer id not avelable" });
    }
    res.status(200).json({ message: "customer deleted Sucessafully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
