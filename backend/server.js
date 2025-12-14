const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");

const apiRoutes = require("./routes/index");
const authRouter = require("./routes/auth.route");
const logger = require("./middleware/logger");
const { connectDB } = require("./config/db");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 9009;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use(logger);

// Handle invalid JSON
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid JSON format" });
  }
  next();
});

// API Routes
app.use(apiRoutes);
app.use(authRouter);

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "DMS API Server is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: { auth: "/auth", api: "/api", health: "/health" },
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
  res.status(err.status || 500).json({
    success: false,
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`DMS API Server running at http://localhost:${PORT}`);
});
