import mongoose from "mongoose";

const customerSchema = mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, require: true },
    phoneNo: { type: String },
    aadhaarNo: { type: String },
    // password: { type: String },
  },
  {
    timestamps: true,
  }
);

const Customer = mongoose.model("Customer", customerSchema);
export default Customer;
