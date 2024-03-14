const express = require("express");

const router = express.Router();
const app = express();
const crypto = require("crypto");
const mongoose = require("mongoose");
const path = require("path");
const nodemailer = require("nodemailer");
const port = 3000;
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "view"));
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect("mongodb://localhost:27017/intern");
const { Schema, model } = mongoose;

const userSchema = new Schema({
  firstname: String,
  lastname: String,
  username: String,
  email: String,
  password: String,
});

const User = model("User", userSchema);
// const newUser = new User({ name: 'JohnDoe', email: 'john@example.com', age: 30 });
// newUser.save().then(() => console.log('User created'));
// User.find().then(users=>{
//   console.log(users)
// })

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/home", (req, res) => {
  res.render("home.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", (req, res) => {
  const { firstname, lastname, username, email, password } = req.body;
  const newUser = new User({
    firstname,
    lastname,
    username,
    email,
    password,
  });

  newUser.save().then(() => console.log("User created"));
  User.find().then((users) => {
    console.log(users);
  });
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/new", (req, res) => {
  res.render("new.ejs");
});

app.post("/login", (req, res) => {
  const { username1, password1 } = req.body; // Corrected variable names
  User.findOne({ username: username1, password: password1 }) // Using findOne to find a single user
    .then((user) => {
      if (user) {
        res.redirect("/home");
      } else {
        res.send("User not found in database");
      }
    })
    .catch((error) => {
      console.error(error);
      res.send("Error logging in");
    });

  // if(username1==User.findOne("username") && password1==User.findOne("password")["password"]){
  //   res.redirect("/home");
  // }else{
  //   res.send("User not found in database");
  // }
});

app.get("/forgot-password", (req, res) => {
  res.render("forgot-password.ejs");
});

// Middleware to parse JSON bodies
app.use(express.json());

// Route for adding new data
app.post("/addData", async (req, res) => {
  // Destructuring data from request body
  const { firstname, lastname, username, email, password } = req.body;

  // Creating a new instance of User model with request body
  const addData = new User(req.body);
  console.log(req.body);
  const newsave = await addData.save();
  res.send(newsave);
});

// Route for fetching all data
app.get("/addData", async (req, res) => {
  // Finding all data in the database
  const getData = await User.find({});
  res.status(201).send(getData);
  console.log(getData);
});

// Route for fetching data by ID
app.get("/addData/:id", async (req, res) => {
  // Extracting the ID from request parameters
  const _id = req.params.id;

  // Finding data in the database by ID
  const getDataId = await User.findById(_id);
  res.status(201).send(getDataId);
  console.log(getDataId);
});

// Route for updating data by ID
app.patch("/addData/:id", async (req, res) => {
  // Extracting the ID from request parameters
  const _id = req.params.id;

  // Updating data in the database by ID
  const updateData = await User.findByIdAndUpdate(_id, req.body);
  res.status(201).send(updateData);
  console.log("the updated data is ", updateData);
});

// Route for deleting data by ID
app.delete("/addData/:id", async (req, res) => {
  // Extracting the ID from request parameters
  const _id = req.params.id;

  // Deleting data from the database by ID
  const deleteData = await User.findByIdAndDelete(_id);
  res.status(201).send(deleteData);
  console.log("the deleted data is ", deleteData);
});



// app.post("/forgot-password", (req, res) => {
//   const { email } = req.body;

//   User.findOne({ email: email })
//     .then((user) => {
//       if (user) {
//         res.redirect("/new");
//       } else {
//         res.send("incorrect email");
//       }
//     })
//     .catch((error) => {
//       console.error(error);
//       res.send("Error logging in");
//     });

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: false, // Use `true` for port 465, `false` for all other ports
//   auth: {
//     user:"mukuldhaked9413@gmail.com",
//     pass: "DHAKEDmukul@123",
//   },
//   debug:true,
// });

// async function main() {
//   // send mail with defined transport object
//   const info = await transporter.sendMail({
//     from: '"Maddison Foo Koch 👻" <mukuldhaked9413@gmail.com>', // sender address
//     to: "mukuldhaked9413@gmail.com",
//     text: "Hello world?",
//     html: "<b>Hello world?</b>",
//   });

//       console.log("Message sent: %s", info.messageId);

//     }
//     main();
//     main().catch(console.error);

// });

app.listen(3000, () => {
  console.log("listening on port 3000");
});
