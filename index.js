//install require environment
const express = require("express");
const cors = require("cors");
const ootenv = require("dotenv").config();
const app = express();
var colors = require("colors");
const port = process.env.PORT || 5000;

console.log(process.env.PORT);
console.log(process.env.NAME);

// middleware
app.use(cors());
app.use(express.json());

// set route and implemented
app.get("/", (req, res) => {
  res.send("Server is running  On default route");
});

app.listen(port, () => {
  console.log(`Server is Running on this ${port} port`.green);
});
