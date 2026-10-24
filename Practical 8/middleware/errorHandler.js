
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.message);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = "A record with this value already exists";
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

export default errorHandler;
