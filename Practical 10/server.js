import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    course: { type: String, required: true },
  },
  { timestamps: true },
);
const Student = mongoose.model("Student", schema);
app.get("/api/students", async (req, res, next) => {
  try {
    res.json(await Student.find().sort({ createdAt: -1 }));
  } catch (e) {
    next(e);
  }
});
app.post("/api/students", async (req, res, next) => {
  try {
    res.status(201).json(await Student.create(req.body));
  } catch (e) {
    next(e);
  }
});
app.delete("/api/students/:id", async (req, res, next) => {
  try {
    const item = await Student.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Student not found" });
    res.json({ message: "Deleted" });
  } catch (e) {
    next(e);
  }
});
app.use((err, req, res, next) =>
  res.status(400).json({ message: err.message }),
);
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() =>
    app.listen(process.env.PORT || 3000, () =>
      console.log("MERN API running at port 3000"),
    ),
  )
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
