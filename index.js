//install require environment
const express = require("express");
const cors = require("cors");
const ootenv = require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
let colors = require("colors");
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// Database url
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.cruea6x.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// database connection
async function dbConnect() {
  try {
    await client.connect();
    console.log(colors.rainbow("Database is connected"));
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
  }
}

dbConnect();

// database set of collection

const usersCollection = client.db("estatery").collection("users");
// set route and implemented
app.get("/", (req, res) => {
  res.send("Server is running  On default route");
});

app.listen(port, () => {
  console.log(`Server is Running on this ${port} port`.green);
});
