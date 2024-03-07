const express = require("express");
const crypto = require("crypto");
const mongoose = require("mongoose");
const path = require("path");
const nodemailer = require("nodemailer");

const app = express();
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
  token: String // Added missing token field
});

const User = model("User", userSchema);

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
    token: "" // Added missing token assignment
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
  const { username1, password1 } = req.body;
  User.findOne({ username: username1, password: password1 })
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
});

app.get("/forgot-password", (req, res) => {
  res.render("forgot-password.ejs");
});

app.post("/forgot-password", async (req, res) => { // Added async keyword
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }); // Added await keyword and updated variable name

    if (!user) {
      return res.send("User not found");
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.token = resetToken;
    await user.save();

    console.log(user);

    const sendPasswordResetEmail = async (email, resetToken) => {
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "mukuldhaked9413@gmail.com", // Your Gmail email address
          pass: "DHAKEDmukul@123", // Your Gmail password or application-specific password
        },
      });

      const mailOptions = {
        from: "mukuldhaked9413@gmail.com",
        to: email,
        subject: "Password Reset",
        text: `Click the link to reset your password: http://localhost:3000/forgot-password?token=${resetToken}`,
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Password reset email sent:", info.response);
      } catch (error) {
        console.error("Error sending password reset email:", error);
        throw error;
      }
    };

    console.log("email", email, "reset Token ", resetToken);
    await sendPasswordResetEmail(email, resetToken); // Added await keyword
    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
