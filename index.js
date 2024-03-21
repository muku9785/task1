// Import required modules
const express = require("express"); // Express for creating server
const mongoose = require("mongoose"); // Mongoose for MongoDB interactions
const bodyParser = require("body-parser"); // Body parser for parsing request bodies
const jwt = require("jsonwebtoken"); // JWT for authentication
const path = require("path"); // Path for working with file paths
const CryptoJS = require("crypto-js"); // CryptoJS for encryption

// Create Express app
const app = express();
const port = 3000; // Define server port

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/intern", {}); // Connect to MongoDB database
const { Schema, model } = mongoose; // Destructure mongoose objects

// Define user schema and model
const userSchema = new Schema({
  firstname: String,
  lastname: String,
  username: String,
  email: String,
  password: String,
  encryptedData: String,
});
const User = model("User", userSchema);

// Configure Express app
app.set("view engine", "ejs"); // Set EJS as view engine
app.set("views", path.join(__dirname, "view")); // Set views directory
app.use(bodyParser.urlencoded({ extended: true })); // Use body parser for URL encoded bodies
app.use(bodyParser.json()); // Use body parser for JSON bodies

// Secret key for JWT and encryption
const secretKey = "mukul@12345";

// Function to generate JWT token
const generateToken = (user) => {
  const payload = {
    username: user.username,
    email: user.email,
  };
  return jwt.sign(payload, secretKey, { expiresIn: "1h" });
};

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.sendStatus(401); // Unauthorized if no token provided
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Forbidden if token is invalid
    }
    req.user = user; // Set user in request object
    next(); // Proceed to next middleware
  });
};

// Function to encrypt data using CryptoJS
const encryptData = (data, key) => {
  return CryptoJS.AES.encrypt(data, key).toString();
};

// Function to decrypt data using CryptoJS
const decryptData = (encryptedData, key) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Route to encrypt data
app.post("/encrypt", (req, res) => {
  const { data, key } = req.body;
  const encryptedData = encryptData(data, key);
  const newUser = new User({ encryptedData });
  newUser
    .save()
    .then(() => {
      res.json({ encryptedData }); // Send encrypted data as response
      console.log(encryptedData); // Log encrypted data
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error  data"); // Send error response
    });
});

// Route to decrypt data
app.post("/decrypt", (req, res) => {
  const { encryptedData, key } = req.body;
  const decryptedData = decryptData(encryptedData, key);
  res.json({ decryptedData }); // Send decrypted data as response
});

// Default route
app.get("/", (req, res) => {
  res.send("form "); // Send a simple response
});

// Login and register routes (HTML form rendering is assumed in login.ejs and register.ejs)
app.get("/login", (req, res) => {
  res.render("login.ejs"); // Render login form
});
app.get("/register", (req, res) => {
  res.render("register.ejs"); // Render register form
});

// Route to register a new user
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
      res.json({ token }); // Send JWT token as response
      console.log(token); // Log JWT token
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error registering user"); // Send error response
    });
});

// Route to authenticate user and generate JWT token
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  User.findOne({ username, password })
    .then((user) => {
      if (user) {
        const token = generateToken(user);
        res.json({ token }); // Send JWT token as response
        console.log(token); // Log JWT token
      } else {
        res.status(401).send("Invalid credentials"); // Send unauthorized response
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error logging in"); // Send error response
    });
});

// Protected route that requires authentication
app.get("/protected-route", authenticateToken, (req, res) => {
  res.send("This is a protected route"); // Send protected route response
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`); // Log server start message
});
