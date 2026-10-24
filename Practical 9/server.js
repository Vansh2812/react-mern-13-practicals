
import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Create uploads directory
const uploadDir = path.resolve("uploads");
fs.mkdirSync(uploadDir, { recursive: true });

// Serve uploaded files
app.use("/uploads", express.static(uploadDir));

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    );
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// MongoDB schema
const fileSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  storedName: { type: String, required: true },
  mimeType: String,
  size: Number,
  path: String,
  uploadedAt: { type: Date, default: Date.now },
});

const FileRecord = mongoose.model("FileRecord", fileSchema);

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "File upload API",
    maxFileSize: "5 MB",
  });
});

// Get all uploaded files
app.get("/files", async (req, res, next) => {
  try {
    const files = await FileRecord.find().sort({
      uploadedAt: -1,
    });

    res.json(files);
  } catch (error) {
    next(error);
  }
});

// Upload a file
app.post("/upload", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Select a file using the file field",
      });
    }

    const record = await FileRecord.create({
      originalName: req.file.originalname,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: `/uploads/${req.file.filename}`,
    });

    res.status(201).json({
      message: "File uploaded successfully",
      data: record,
    });
  } catch (error) {
    // Remove the uploaded file if saving its record fails
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error("File cleanup failed:", cleanupError.message);
      }
    }

    next(error);
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);

  const statusCode =
    err instanceof multer.MulterError
      ? 400
      : err.statusCode || 500;

  res.status(statusCode).json({
    message:
      err instanceof multer.MulterError &&
      err.code === "LIMIT_FILE_SIZE"
        ? "File size must not exceed 5 MB"
        : err.message || "Internal Server Error",
  });
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error("MONGODB_URI is missing in the .env file");
    }

    await mongoose.connect(mongoURI);
    console.log("MongoDB connected successfully");

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`Upload API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
