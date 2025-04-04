import Head from "../models/Head.model.js";
export const displayHeadlines = async (req, res) => {
  try {
    const allHead = await Head.find();
    // console.log(allHead, "all headlines");
    if (allHead.length === 0) {
      return res.status(404).json({ message: "no headline available" });
    }
    res.status(200).json({ headlines: allHead });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const addHeadlines = async (req, res) => {
  try {
    console.log(req.body, "headline body details");
    const { headline } = req.body;
    console.log(headline, " : which headline i add that show");
    const isHeading = await Head.findOne({ headline });
    console.log(isHeading, "avelable or not");
    if (isHeading) {
      return res.status(400).json({ message: "this headline already here" });
    }
    const newHead = new Head({ headline });
    await newHead.save();
    res.status(200).json({ message: "headline added sucessafully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const updateHeading = async (req, res) => {
  try {
    const { id } = req.params;
    const { headline } = req.body;
    if (!headline) {
      return res.status(400).json({ message: "first fill the form" });
    }
    const updateHeading = await Head.findByIdAndUpdate(
      id,
      { headline },
      { new: true }
    );
    res
      .status(200)
      .json({ message: "Headline updated sucessafully", updateHeading });
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
  }
};

export const deleteHeading = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const headlineDeleted = await Head.findByIdAndDelete(id);
    if (!headlineDeleted) {
      return res.status(400).json({ message: "headline is not deleted" });
    }
    res.status(200).json({ message: "headline is deleted sucessafully" });
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
  }
};
