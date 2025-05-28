import mongoose from "mongoose";

const userTypeSchema = new mongoose.Schema(
  {
    img: {
      type: String,
    },
    name: {
      type: String,
      // required: true,
    },
    usertype: {
      type: String,
      required: true,
    },
    favourite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ⏩ Auto-set `name = usertype` before saving
userTypeSchema.pre("save", function (next) {
  this.name = this.usertype;
  next();
}); 

const UserType = mongoose.model("UserType", userTypeSchema);
export default UserType;
