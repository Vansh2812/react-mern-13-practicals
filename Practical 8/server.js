
import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db.js";
import logger from "./middleware/logger.js";
import errorHandler from "./middleware/errorHandler.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();

// Built-in middleware to parse JSON request bodies
app.use(express.json());

// Custom middleware to log requests
app.use(logger);

// Home route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the Express.js Backend Server",
    endpoints: {
      users: "/api/users",
    },
  });
});

// User routes
app.use("/api/users", userRoutes);

// Handle unknown routes
app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Error-handling middleware (must come after routes)
app.use(errorHandler);

// Connect to MongoDB and start the server
const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
