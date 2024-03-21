// Required dependencies
const express = require("express"); // Importing Express.js framework
const mongoose = require("mongoose"); // Importing Mongoose ORM for MongoDB
const bodyParser = require("body-parser"); // Middleware for parsing JSON body
const app = express(); // Initializing Express app
const port = 3000; // Port number for server
const multer = require("multer"); // Import Multer for handling file uploads
const cloudinary = require("cloudinary").v2; // Import Cloudinary for image upload (optional)
const fs = require("fs"); // Node.js file system module

// Middleware setup
app.use(bodyParser.json()); // Using body-parser to parse JSON requests
app.use(express.json()); // Parsing JSON requests with Express

// Connecting to MongoDB database named 'like_comment'
mongoose.connect("mongodb://localhost:27017/like_comment");

// Defining schema for a post in MongoDB
const postSchema = new mongoose.Schema({
  content: String, 
  imgUrl:String,// Content of the post
  likes: { type: Number, default: 0 }, // Number of likes for the post, defaults to 0
  comments: [ // Array of comments for the post
    {
      content: String, // Content of each comment
    },
  ],

});

// Creating a model 'Post' based on the defined schema
const Post = mongoose.model("Post", postSchema);

// Endpoint for creating a new post
app.post("/posts", async (req, res) => {
  try {
    const { content } = req.body; // Extracting content from request body
    // Creating a new post with the extracted content
    const post = await Post.create({ content });
    res.status(201).json(post); // Responding with created post
  } catch (error) {
    res.status(500).json({ error: error.message }); // Handling errors
  }
});

// Endpoint for fetching all posts
app.get("/posts", async (req, res) => {
  try {
    // Finding all posts in the database
    const posts = await Post.find({});
    res.status(200).json(posts); // Responding with fetched posts
  } catch (error) {
    res.status(500).json({ error: error.message }); // Handling errors
  }
});

// Endpoint for updating a post
app.patch("/posts/:postId", async (req, res) => {
  try {
    const { content } = req.body; // Extracting updated content from request body
    // Finding and updating the post by its ID
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      { content },
      { new: true } // Returning the updated post
    );
    res.status(200).json(updatedPost); // Responding with updated post
  } catch (error) {
    res.status(500).json({ error: error.message }); // Handling errors
  }
});

// Endpoint for deleting a post
app.delete("/posts/:postId", async (req, res) => {
  try {
    // Finding and deleting the post by its ID
    const deletedPost = await Post.findByIdAndDelete(req.params.postId);
    res.status(200).json(deletedPost); // Responding with deleted post
  } catch (error) {
    res.status(500).json({ error: error.message }); // Handling errors
  }
});

// Endpoint for liking a post
app.post("/posts/:postId/like", async (req, res) => {
  try {
    // Finding the post by its ID
    const post = await Post.findById(req.params.postId);
    post.likes += 1; // Incrementing the likes count
    await post.save(); // Saving the updated post
    res.status(201).json(post); // Responding with updated post
  } catch (error) {
    res.status(500).json({ error: error.message }); // Handling errors
  }
});

// Endpoint for adding a comment to a post
app.post("/posts/:postId/comment", async (req, res) => {
  try {
    const { content } = req.body; // Extracting comment content from request body
    // Finding the post by its ID and adding the comment
    const post = await Post.findById(req.params.postId);
    post.comments.push({ content }); // Pushing the new comment to the post's comments array
    await post.save(); // Saving the updated post
    res.status(201).json(post); // Responding with updated post
  } catch (error) {
    res.status(500).json({ error: error.message }); // Handling errors
  }
});



// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "/uploads"); // Specify the destination folder for uploads
//   },
//   filename: (req, file, cb) => {
//     cb(null, file.WIN_20230210_18_05_32_Pro); // Use the original filename for the uploaded file
//   },
// });

// const upload = multer({ storage: storage });

// // Cloudinary configuration (optional)
// cloudinary.config({
//   cloud_name: "dntqobc30",
//   api_key: "546869859179559",
//   api_secret: "cNGPtiNIzFYedXa8nnpKZrWIK2M",
// });

// // Endpoint for uploading an image and creating a new post
// app.post("/posts", upload.single("image"), async (req, res) => {
//   console.log(req.file)
//   try {
//     const { content } = req.body;
//     let imageUrl;

//     // If using Cloudinary (optional), upload the image to Cloudinary and get the URL
//     if (req.file && req.file.path) {
//       const result = await cloudinary.uploader.upload(req.file.path);
//       imageUrl = result.secure_url;
      
//       // Delete the uploaded file from the server
//       fs.unlinkSync(req.file.path);
//     }

//     // Create a new post with image URL if available
//     const post = await Post.create({ content, imageUrl });
//     res.status(201).json(post);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });


// Starting the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
