const express = require("express");
const router = express.Router();
const aws = require("aws-sdk");
process.env.AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE = "1";
const multer = require("multer");
const multerS3 = require("multer-s3");
require("dotenv").config();

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
});

const s3 = new aws.S3();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: "public-read",
    contentType: function (req, file, cb) {
      cb(null, file.mimetype);
    },
    metadata: function (req, file, cb) {
      cb(null, { fieldName: "TESTING_METADATA" });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + "-" + file.originalname);

      // to save image in the images folder on the droplet
      cb(null, "images/" + Date.now().toString());
    },
  }),
});

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    res.send(req.file?.location);
    // res
    //   .status(200)
    //   .json({ message: "image save successfully", data: saveToDb });
  } catch (error) {
    console.error("error", error?.message);
  }
});

router.get("/download", (req, res) => {
  try {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: "1696573220791",
    };
    s3.getObject(params, (err, data) => {
      if (err) {
        console.error("err", err);
        res.status(500).send(err);
      }
      res.send(data);
    });
  } catch (error) {
    console.error("error", error?.message);
  }
});

router.post("/pre-signed-url", (req, res) => {
  try {
    const { name, type } = req.body;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: name,
      ContentType: type,
      Expires: 60 * 5,
    };

    s3.getSignedUrl("putObject", params, (err, url) => {
      if (err) {
        res.status(500).json({ error: "Error creating presigned URL" });
      } else {
        res.status(200).json({ url });
      }
    });
  } catch (error) {
    console.error("error", error?.message);
  }
});

router.delete("/delete", (req, res) => {
  try {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: "1696670701470-2016-10-04 17.18.03.png",
    };
    s3.deleteObject(params, (err, data) => {
      if (err) {
        console.error("err", err);
        res.status(500).send(err);
      }
      console.log("data", data);
      res.send(data?.DeleteMarker);
    });
  } catch (error) {
    console.error("error", error?.message);
  }
});

module.exports = router;
