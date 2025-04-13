# AWS-S3-PRACTICE

In this project i am working on the AWS S3 service to store the files/images on the aws.
Requirements:

- Before getting started, make sure you have completed the following steps:

  - Create an AWS Account:

         https://signin.aws.amazon.com

  - Create an s3 bucket on the AWS:

        https://s3.console.aws.amazon.com

- Install packages:

      npm install aws-sdk

      npm install multer-s3

      npm install multer

I actually used two methods to uploade file/image to AWS S3

- Method 1: Using Multer-S3

  To upload files using Multer-S3, you can utilize the following code snippet:

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

            // cb(null, "images/" + Date.now().toString());

          },
        }),

      });

- Method 2: Without Using Multer-S3

  To upload files directly to S3 without Multer-S3, you can use the following code snippet:

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

  In this case you just need the multer storage to get the image as a file

      const storage = multer.memoryStorage();

      const upload = multer({ storage: storage });

- Method 3: Without making s3 bucket publically accessible

  The upload file process will be the same as the other once but the getting file process will change. You can use the CloudFront signed URLs to access the private files without making the S3 bucket public.

  🔐 Using CloudFront for Private File Access (No Public ACL Required)
  Instead of making your bucket public, you can use Amazon CloudFront to securely serve your private content.

  - 🎯 Steps to Set Up CloudFront for Private Access

    - Create a CloudFront Distribution:

      - Go to AWS Console → CloudFront → Create Distribution

      - Select Web as delivery method

      - Set your Origin Domain to your S3 bucket

      - Under Origin access, choose Origin access control (OAC) and enable signing

      - Leave caching defaults as-is (you can optimize later)

      - Disable public access on the S3 bucket

    - Generate a CloudFront Key Pair:

      - Go to AWS Console > CloudFront > Key Pairs

      - Click Create Key Pair

      - Download and store the Private Key file securely on your machine

      - Copy the Key Pair ID to use in your environment variables

    - Environment Variables

      - CLOUD_FRONT_KEY_ID=YourKeyPairID
      - CLOUDFRONT_PRIVATE_KEY_PATH=/full/path/to/private-key.pem
      - CLOUD_FRONT_DISTRIBUTION_DOMIAN_NAME=https://your-cloudfront-distribution.cloudfront.net

    - Get Signed URL Using CloudFront

          const crypto = require("crypto");
          const fs = require("fs");
          const path = require("path");

          const privateKeyPath = path.resolve(process.env.CLOUDFRONT_PRIVATE_KEY_PATH);
          const privateKey = fs.readFileSync(privateKeyPath, "utf8");
          const cloudFrontKeyPairId = process.env.CLOUD_FRONT_KEY_ID;
          const cloudFrontDomain = process.env.CLOUD_FRONT_DISTRIBUTION_DOMIAN_NAME;

          const expires = Math.floor(Date.now() / 1000) + 3600 _ 24 _ 7; // 7 days
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

          const signedUrl = `${cloudFrontDomain}/${req.query.image_name}?Expires=${expires}&Signature=${signature}&Key-Pair-Id=${cloudFrontKeyPairId}`;

- In this AWS S3 practice project, you can perform the following actions:

  - Upload Files:

    - Easily upload files and images to your AWS S3 bucket.

  - Get Files:

    - Retrieve files from your S3 bucket when needed.

  - Delete Files:

    - Remove files from the S3 bucket when they are no longer required.

  - Generate Signed URLs:

    - Create signed URLs using s3.getSignedUrl to provide temporary access to files. This is particularly useful for securely displaying private bucket contents on the front-end.
