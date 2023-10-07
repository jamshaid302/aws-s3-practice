const express = require("express");
const app = express();
const s3_controller = require("./controller/aws-s3");
const s3_controller_without_multerS3 = require("./controller/without-multerS3");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api", s3_controller);
app.use("/api", s3_controller_without_multerS3);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
