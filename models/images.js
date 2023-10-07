const mongoose = require("mongoose");

const ImagesSchema = new mongoose.Schema(
  {
    image_name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const ImagesModel = mongoose.model("image", ImagesSchema);

module.exports = ImagesModel;
