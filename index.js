const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const path = require("path");
const CryptoJS = require("crypto-js");

const app = express();
const port = 3000;

mongoose.connect("mongodb://localhost:27017/intern", {});
const { Schema, model } = mongoose;

const userSchema = new Schema({
  firstname: String,
  lastname: String,
  username: String,
  email: String,
  password: String,
encryptedData: String,
});
const User = model("User", userSchema);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "view"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const secretKey = "mukul@12345";

const generateToken = (user) => {
  const payload = {
    username: user.username,
    email: user.email,
  };
  return jwt.sign(payload, secretKey, { expiresIn: "1h" });
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

const encryptData = (data, key) => {
  return CryptoJS.AES.encrypt(data, key).toString();
};

const decryptData = (encryptedData, key) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

app.post("/encrypt", (req, res) => {
  const { data, key } = req.body;
  const encryptedData = encryptData(data, key);
  const newUser = new User({ encryptedData });
  newUser
    .save()
    .then(() => {
      res.json({ encryptedData });
      console.log(encryptedData);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error  data");
    });
});

app.post("/decrypt", (req, res) => {
  const { encryptedData,key } = req.body;
  const dencryptedData = decryptData(encryptedData,key);
  res.json({ dencryptedData });
});

app.get("/", (req, res) => {
  res.send("form ");
});
app.get("/login", (req, res) => {
  res.render("login.ejs");
});
app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  const { firstname, lastname, username, email, password } = req.body;

  // Encrypt password using crypto-js before saving to the database
  const encryptedPassword = encryptData(password, secretKey);

  const newUser = new User({
    firstname,
    lastname,
    username,
    email,
    password: encryptedPassword, // Save encrypted password
  });

  newUser
    .save()
    .then(() => {
      const token = generateToken(newUser);
      res.json({ token });
      console.log(token);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error registering user");
    });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  User.findOne({ username, password })
    .then((user) => {
      if (user) {
        const token = generateToken(user);
        res.json({ token });
        console.log(token);
      } else {
        res.status(401).send("Invalid credentials");
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error logging in");
    });
});

app.get("/protected-route", authenticateToken, (req, res) => {
  res.send("This is a protected route");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
