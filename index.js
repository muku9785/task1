const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(express.json());
mongoose.connect("mongodb://localhost:27017/like_comment");

const postSchema = new mongoose.Schema({
  content: String,
  likes: { type: Number, default: 0 },
  comments: [
    {
      content: String,
    },
  ],
});

const Post = mongoose.model("Post", postSchema);

app.post("/posts", async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.create({ content });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find({});
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/posts/:postId", async (req, res) => {
  try {
    const { content } = req.body;
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      { content },
      { new: true }
    );
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/posts/:postId", async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.postId);
    res.status(200).json(deletedPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route for liking a post
app.post("/posts/:postId/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    post.likes += 1;
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route for adding a comment to a post
app.post("/posts/:postId/comment", async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.postId);
    post.comments.push({ content });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
