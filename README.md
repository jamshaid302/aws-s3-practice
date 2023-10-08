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

Project Features

  - In this AWS S3 practice project, you can perform the following actions:
  
    - Upload Files:

      - Easily upload files and images to your AWS S3 bucket.

    - Get Files:

      - Retrieve files from your S3 bucket when needed.

    - Delete Files: 
    
      - Remove files from the S3 bucket when they are no longer required.

    - Generate Signed URLs: 

      - Create signed URLs using s3.getSignedUrl to provide temporary access to files. This is particularly useful for securely displaying private bucket contents on the front-end.
