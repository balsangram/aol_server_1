// import mongoose from "mongoose";

// const groupSchema = new mongoose.Schema(
//   {
//     groupName: {
//       type: String,
//       required: true,
//       trim: true,
//       unique: true, // Optional: ensures no duplicate group names
//     },
//     deviceTokens: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "DeviceToken",
//       },
//     ],
//   },
//   {
//     timestamps: true, // Automatically adds createdAt and updatedAt
//     versionKey: false, // Hides the __v field
//   }
// );

// const Group = mongoose.model("Group", groupSchema);

// export default Group;

import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    NotificationTime: {
      type: Date,
      required: true, // Required for scheduling
    },
    sent: {
      type: Boolean,
      default: false, // Track if notification has been sent
    },
    groupName: {
      type: String, // For group-specific notifications
      required: false,
    },
    deviceTokens: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DeviceToken",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Group = mongoose.model("Group", groupSchema);
export default Group;

// import mongoose from "mongoose";

// const groupSchema = new mongoose.Schema(
//   {
//     groupName: {
//       type: String,
//       required: true,
//       trim: true,
//       unique: true, // Optional: ensures no duplicate group names
//     },
//     deviceTokens: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "DeviceToken",
//       },
//     ],
//   },
//   {
//     timestamps: true, // Automatically adds createdAt and updatedAt
//     versionKey: false, // Hides the __v field
//   }
// );

// const Group = mongoose.model("Group", groupSchema);

// export default Group;
