const express = require("express");
const router = express.Router();
const AWS = require("aws-sdk");
process.env.AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE = "1";
const multer = require("multer");
const conn = require("../utils/conn");
const ImagesModal = require("../models/images");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
require("dotenv").config();

AWS.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: "us-east-1",
});

const s3 = new AWS.S3();

router.post("/upload-without-multer-s3", upload.single("image"), (req, res) => {
  try {
    const { originalname, buffer, mimetype } = req?.file;
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: originalname,
      Body: buffer,
      ContentType: mimetype,
    };

    s3.upload(params, async (err, data) => {
      err && res.status(500).json({ error: "Error in uploading file" });
      data &&
        (await ImagesModal.create({
          image_name: originalname,
        }));
      console.log(data);
      res.status(201).json({ message: "File uploaded successfully" });
    });
  } catch (error) {
    console.error("error", error?.message);
  }
});

const generateSignedUrl = (imageName) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: imageName,
    Expires: 3600,
  };

  return new Promise((resolve, reject) => {
    s3.getSignedUrl("getObject", params, (err, signedUrl) => {
      if (err) {
        reject(err);
      } else {
        resolve(signedUrl);
      }
    });
  });
};

router.get("/get-images", async (req, res) => {
  try {
    const images = await ImagesModal.find({});
    const imagesWithSignedUrls = [];

    for (const img of images) {
      const signedUrl = await generateSignedUrl(img?.image_name); // Assuming you have the generateSignedUrl function defined

      imagesWithSignedUrls.push({
        image_name: img.image_name,
        signedUrl,
      });
    }
    res.status(200).json({ images: imagesWithSignedUrls });
  } catch (error) {
    console.error("error", error?.message);
  }
});

module.exports = router;
