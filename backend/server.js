const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");

const apiRoutes = require("./routes/index");
const logger = require("./middleware/logger");
const { connectDB } = require("./config/db");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Add error handling for JSON parsing BEFORE other middleware
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({
      success: false,
      error: "Invalid JSON format in request body",
    });
  }
  next();
});

app.use(logger);

// Routes
app.use(apiRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "DMS API Server is running",
    version: "1.0.0",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
