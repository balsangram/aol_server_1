import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    groupName: {
      type: String,
      required: true,
      trim: true,
      unique: true, // Optional: ensures no duplicate group names
    },
    deviceTokens: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DeviceToken",
      },
    ],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    versionKey: false, // Hides the __v field
  }
);

const Group = mongoose.model("Group", groupSchema);

export default Group;
