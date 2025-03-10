require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// Health check route
app.get("/", (req, res) => {
  res.send("Server is up and running!");
});

// Connect to MongoDB and start the server
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(5000, () => console.log("Server running on port 5000"));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
