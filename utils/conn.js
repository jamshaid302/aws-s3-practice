const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.DATABASE_URL);
const { connection } = mongoose;
connection.once("connected", () => console.log("Database Connected ~"));
connection.on("error", (error) => console.log("Database Error: ", error));
