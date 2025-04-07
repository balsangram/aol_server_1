import mongoose from "mongoose";

const headSchema = new mongoose.Schema(
  {
    headline: {
      type: String,
      require: true,
    },
  },
  {
    timeseries: true,
  }
);

const Head = mongoose.model("Head", headSchema);
export default Head;
