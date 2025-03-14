const mongoose = require("mongoose");
require("dotenv").config();

console.log("Database URL: ", process.env.DATABASE_URL);

mongoose.connect(process.env.DATABASE_URL);

const { connection } = mongoose;
connection.once("connected", () => console.log("Database Connected ✅"));
connection.on("error", (error) =>
  console.log("Database Connection Error ❌", error)
);
