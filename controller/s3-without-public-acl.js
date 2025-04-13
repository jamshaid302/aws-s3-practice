const express = require("express");
const router = express.Router();
const AWS = require("aws-sdk");
process.env.AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE = "1";
const multer = require("multer");
const ImagesModal = require("../models/images");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

AWS.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

router.post(
  "/upload-wihtout-public-acl",
  upload.single("image"),
  (req, res) => {
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
  }
);

router.get("/get-image", async (req, res) => {
  try {
    // get the image using clound front url
    // const params = {

    // }

    const cloudFrontKeyPairId = process.env.CLOUD_FRONT_KEY_ID;
    const privateKeyPath = path.resolve(
      process.env.CLOUDFRONT_PRIVATE_KEY_PATH
    );
    const privateKey = fs.readFileSync(privateKeyPath, "utf8");
    const cloudFrontDomain = process.env.CLOUD_FRONT_DISTRIBUTION_DOMIAN_NAME;

    const expires = Math.floor(Date.now() / 1000) + 3600 * 24 * 7; // 7 days

    const policy = JSON.stringify({
      Statement: [
        {
          Resource: `${cloudFrontDomain}/${req.query.image_name}`,
          Condition: { DateLessThan: { "AWS:EpochTime": expires } },
        },
      ],
    });

    const policyBase64 = Buffer.from(policy).toString("base64");
    const signature = crypto
      .sign("sha256", Buffer.from(policyBase64), privateKey)
      .toString("base64");
    const url = `${cloudFrontDomain}/${req.query.image_name}?Expires=${expires}&Signature=${signature}&Key-Pair-Id=${cloudFrontKeyPairId}`;

    return res.status(200).json({
      message: "Image feteched successfully",
      url,
    });
  } catch (error) {
    console.log("error", error?.message);
    res.status(500).json({ error: "Error in fetching file" });
  }
});

module.exports = router;
