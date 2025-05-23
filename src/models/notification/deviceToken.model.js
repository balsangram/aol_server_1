import mongoose from "mongoose";

const deviceTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },

    userTypes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserType",
      },
    ],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

export default mongoose.model("DeviceToken", deviceTokenSchema);

// models/DeviceToken.js

// import mongoose from "mongoose";

// const deviceTokenSchema = new mongoose.Schema(
//   {
//     token: { type: String, required: true, unique: true },
//     username: { type: String, required: true },
//     email: { type: String, required: true },
//     phone: { type: String, required: true },

//     userTypes: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "UserType",
//       },
//     ],
//   },
//   {
//     timestamps: true, // Automatically adds createdAt and updatedAt
//   }
// );

// export default mongoose.model("DeviceToken", deviceTokenSchema);

// import mongoose from "mongoose";

// const deviceTokenSchema = new mongoose.Schema(
//   {
//     token: { type: String, required: true, unique: true },
//     username: { type: String, required: true },
//     email: { type: String, required: true },
//     phone: { type: String, required: true },
//   },
//   {
//     timestamps: true, // Automatically adds createdAt and updatedAt
//   }
// );

// export default mongoose.model("DeviceToken", deviceTokenSchema);

// import mongoose from "mongoose";

// const deviceTokenSchema = new mongoose.Schema({
//   token: { type: String, required: true, unique: true },
//   createdAt: { type: Date, default: Date.now },
// });

// export default mongoose.model("DeviceToken", deviceTokenSchema);
