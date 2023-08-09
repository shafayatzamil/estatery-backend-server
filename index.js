//install require environment
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const SSLCommerzPayment = require("sslcommerz-lts");
const multer = require("multer");
const app = express();
let colors = require("colors");
const path = require("path");
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
// app.use(express.json());
// app.use(express.static("./public"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// multer image storage
//! Use of Multer
var storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, "./public/property-image/");
  },
  filename: (req, file, callBack) => {
    callBack(null, file.originalname);
  },
});

var upload = multer({
  storage: storage,
});

// ssl commerce
const store_id = `${process.env.SSL_COMERCEID}`;
// dvdsv64c1245d789b8
const store_passwd = `${process.env.SLL_COMMERCE_PASSWORD}`;
// dvdsv64c1245d789b8@ssl
const is_live = false;

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
const propertyCollection = client.db("estatery").collection("propertys");
const orderCollection = client.db("estatery").collection("orders");

// jwt route token generation
app.post("/jwt", (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
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

// user created
app.post("/users", async (req, res) => {
  try {
    const users = req.body;
    const result = await usersCollection.insertOne(users);
    if (result.insertedId) {
      res.status(200).send({
        success: true,
        message: `Successfully created  the users with id ${result.insertedId}`,
      });
    } else {
      res.status(400).send({
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
  try {
    const cursor = usersCollection.find({});
    const allUsers = await cursor.toArray();
    res.status(200).send({
      success: true,
      message: "successfully got the all users data",
      data: allUsers,
    });
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
    res.status(404).send({
      success: false,
      error: error.message,
    });
  }
});

// create add property
app.post("/addproperty", upload.array("selectedImages"), async (req, res) => {
  try {
    const addProperties = req.body;
    let uploadedImages = req.files;
    const originalname = await uploadedImages.map(
      (file) =>
        // "https://estatery-backend-server.vercel.app/property-image/" +
        "https://estatery-backend-server.vercel.app/property-image/" +
        file.originalname
    );
    addProperties.imageURL = originalname;
    // console.log(addProperties);

    const result = await propertyCollection.insertOne(addProperties);
    if (result.insertedId) {
      res.status(200).send({
        success: true,
        message: `Successfully created  the Property with id ${result.insertedId}`,
      });
    } else {
      res.status(400).send({
        success: false,
        error: "Couldn't create the Property",
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

//get the all property
app.get("/property", async (req, res) => {
  try {
    const cursor = propertyCollection.find({});
    const allUsers = await cursor.toArray();
    res.status(200).send({
      success: true,
      message: "successfully got the all Property data",
      data: allUsers,
    });
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
    res.status(404).send({
      success: false,
      error: error.message,
    });
  }
});

//Rent property type
app.get("/rent", async (req, res) => {
  try {
    const query = { propertyType: "rent" };
    const cursor = propertyCollection.find(query);
    const allRent = await cursor.toArray();
    res.status(200).send({
      success: true,
      message: "successfully got the all Rent data",
      data: allRent,
    });
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
    res.status(404).send({
      success: false,
      error: error.message,
    });
  }
});

// single rent property
app.get("/rent/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const singleRentProperty = await propertyCollection.findOne({
      _id: new ObjectId(id),
    });
    res.status(200).send({
      success: true,
      message: "successfully got the single  Rent data",
      data: singleRentProperty,
    });
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
    res.status(404).send({
      success: false,
      error: error.message,
    });
  }
});

// sell property type
app.get("/sell", async (req, res) => {
  try {
    const query = { propertyType: "sell" };
    const cursor = propertyCollection.find(query);
    const allSell = await cursor.toArray();
    res.status(200).send({
      success: true,
      message: "successfully got the all Sell data",
      data: allSell,
    });
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
    res.status(404).send({
      success: false,
      error: error.message,
    });
  }
});

// single sell property by id
app.get("/sell/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const singleSellProperty = await propertyCollection.findOne({
      _id: new ObjectId(id),
    });
    res.status(200).send({
      success: true,
      message: "successfully got the single  Sell data",
      data: singleSellProperty,
    });
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
    res.status(404).send({
      success: false,
      error: error.message,
    });
  }
});

// delete property
app.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  console.log("deleted item id", id);
  const singleSellProperty = await propertyCollection.findOne({
    _id: new ObjectId(id),
  });

  const result = await propertyCollection.deleteOne({ _id: new ObjectId(id) });

  res.send({
    success: true,
    message: `Successfully deleted the item`,
  });

  // res.send({
  //   message: "product is found",
  // });
});

// order the property
app.post("/order", async (req, res) => {
  const orderItem = req.body;
  const propertyPrice = orderItem.PropertyPrice;
  const id = orderItem.tenancyProductId;
  const property = await propertyCollection.findOne({ _id: new ObjectId(id) });
  const tran_id = new ObjectId().toString();
  const data = {
    total_amount: propertyPrice,
    currency: "BDT",
    tran_id: tran_id,
    success_url: `http://localhost:5000/payment/success/${tran_id}`,
    fail_url: "http://localhost:5000/payment/failed",
    cancel_url: "http://localhost:3030/cancel",
    ipn_url: "http://localhost:3030/ipn",
    shipping_method: "Courier",
    product_name: `orderItem.propertyName`,
    product_category: "Electronic",
    product_profile: "general",
    cus_name: "Customer Name",
    cus_email: "customer@example.com",
    cus_add1: "Dhaka",
    cus_add2: "Dhaka",
    cus_city: "Dhaka",
    cus_state: "Dhaka",
    cus_postcode: "1000",
    cus_country: "Bangladesh",
    cus_phone: "01711111111",
    cus_fax: "01711111111",
    ship_name: "Customer Name",
    ship_add1: "Dhaka",
    ship_add2: "Dhaka",
    ship_city: "Dhaka",
    ship_state: "Dhaka",
    ship_postcode: 1000,
    ship_country: "Bangladesh",
  };
  console.log(data.success_url);
  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
  sslcz.init(data).then((apiResponse) => {
    // Redirect the user to payment gateway
    let GatewayPageURL = apiResponse.GatewayPageURL;
    res.send({ url: GatewayPageURL });

    const finalOrder = {
      property,
      paidStatus: false,
      transsectionId: tran_id,
    };

    const result = orderCollection.insertOne({ finalOrder });
  });
});

// // Define the success route outside the /order route handler
app.post("/payment/success/:trainId", async (req, res) => {
  // const result = await orderCollection.updateOne(
  //   {
  //     transsectionId: req.params.trainId,
  //   },
  //   {
  //     $set: {
  //       paidStatus: true,
  //     },
  //   }
  // );
  // console.log(result);
  const result = await orderCollection.updateOne(
    { "finalOrder.property.transsectionId": req.params.trainId },
    {
      $set: {
        "finalOrder.property.paidStatus": true,
      },
    }
  );

  if (result.acknowledged == true) {
    res.redirect(`http://localhost:3000/payment/success/${req.params.trainId}`);
  }
});

app.post("/payment/failed", (req, res) => {
  res.redirect(`http://localhost:3000/payment/failed`);
});

// app.get("/users/useseller/:email", async (req, res) => {
//   const email = req.params.email;
//   const cursor = { email };
//   const useSeller = await usersCollection.findOne(cursor);
//   res.send(useSeller);
// });

// server is running in this route
app.listen(port, () => {
  console.log(`Server is Running on this ${port} port`.green);
});
