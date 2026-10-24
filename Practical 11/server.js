import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
});
const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);
const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Login required" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}
function adminOnly(req, res, next) {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Admin access required" });
  next();
}
app.get("/", (req, res) => {
  res.json({
    message: "Blog API",
  });
});
app.post("/api/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password || password.length < 6)
      return res
        .status(400)
        .json({
          message:
            "Name, email and password of at least 6 characters are required",
        });
    if (await User.findOne({ email }))
      return res.status(409).json({ message: "Email already registered" });
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: await bcrypt.hash(password, 10),
      role: "user",
    });
    res
      .status(201)
      .json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
  } catch (e) {
    next(e);
  }
});
app.post("/api/login", async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email?.toLowerCase() });
    if (
      !user ||
      !(await bcrypt.compare(req.body.password || "", user.password))
    )
      return res.status(401).json({ message: "Invalid email or password" });
    const token = jwt.sign(
      { id: user._id.toString(), role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "2h" },
    );
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    next(e);
  }
});
app.get("/api/posts", async (req, res, next) => {
  try {
    res.json(
      await Post.find().populate("author", "name").sort({ createdAt: -1 }),
    );
  } catch (e) {
    next(e);
  }
});
app.post("/api/posts", authenticate, async (req, res, next) => {
  try {
    if (!req.body.title?.trim() || !req.body.body?.trim())
      return res.status(400).json({ message: "Title and body are required" });
    res
      .status(201)
      .json(
        await Post.create({
          title: req.body.title.trim(),
          body: req.body.body.trim(),
          author: req.user.id,
        }),
      );
  } catch (e) {
    next(e);
  }
});
app.put("/api/posts/:id", authenticate, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.author.toString() !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ message: "You cannot edit this post" });
    post.title = req.body.title?.trim() || post.title;
    post.body = req.body.body?.trim() || post.body;
    await post.save();
    res.json(post);
  } catch (e) {
    next(e);
  }
});
app.delete("/api/posts/:id", authenticate, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.author.toString() !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ message: "You cannot delete this post" });
    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (e) {
    next(e);
  }
});
app.get("/api/admin/users", authenticate, adminOnly, async (req, res, next) => {
  try {
    res.json(await User.find().select("name email role"));
  } catch (e) {
    next(e);
  }
});
app.use((err, req, res, next) =>
  res.status(err.code === 11000 ? 409 : 400).json({ message: err.message }),
);
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() =>
    app.listen(process.env.PORT || 3000, () => console.log("Blog API running on Port 3000")),
  )
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
