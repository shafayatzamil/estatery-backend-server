//install require environment
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
let colors = require("colors");
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// function to verifyJWT
function verifyJWT(req, res, next) {
  const authHeader = req.header.authorization;

  if (!authHeader) {
    res.status(401).send({ message: "Unauthorized User" });
  }

  const token = authHeader.split(" ")[1];
  // Verify JWT Token came from front end
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send("Invalid or expired token");
    }
    req.decoded = decoded;
    next();
  });
}

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

// jwt route token generation
app.post("/jwt", (req, res) => {
  const user = req.body;
  // console.log(user);
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });
  res.send({ token });
});

// set route and implemented

// default route set
app.get("/", (req, res) => {
  try {
    res.status(200).send({
      success: true,
      message: "Welcome to Estatery API on default route",
    });
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
    res.status(400).send({
      success: false,
      error: error.message,
    });
  }
});

// user came from front end

app.post("/users", async (req, res) => {
  try {
    const users = req.body;
    const result = await usersCollection.insertOne(users);
    if (result.insertedId) {
      res.send({
        success: true,
        message: `Successfully created  the users with id ${result.insertedId}`,
      });
    } else {
      res.send({
        success: false,
        error: "Couldn't create the users",
      });
    }
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
    res.status(400).send({
      success: false,
      error: error.message,
    });
  }
});

// all users

app.get("/users", async (req, res) => {
  // const cursor = usersCollection.find({});
  // const allUsers = await cursor.toArray();
  // res.send(allUsers);
  try {
    const cursor = usersCollection.find({});
    const allUsers = await cursor.toArray();
    res.send({
      success: true,
      message: "successfully got the all users data",
      data: allUsers,
    });
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
    res.status(400).send({
      success: false,
      error: error.message,
    });
  }
});

// server is running in this route
app.listen(port, () => {
  console.log(`Server is Running on this ${port} port`.green);
});
