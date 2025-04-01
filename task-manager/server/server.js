require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron"); // Add node-cron
const nodemailer = require("nodemailer");
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const Task = require("./models/Task"); // Import Task model
const User = require("./models/User"); // Import User model

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

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send reminder emails
const sendTaskReminders = async () => {
  try {
    const now = new Date();
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +1 day
    const twoDaysFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000); // +2 days

    // Find tasks with endDate within 1-2 days, not completed, and not archived
    const tasks = await Task.find({
      endDate: { 
        $gte: oneDayFromNow.setHours(0, 0, 0, 0), // Start of 1 day from now
        $lte: twoDaysFromNow.setHours(23, 59, 59, 999) // End of 2 days from now
      },
      completed: false,
      isArchived: false,
    }).populate('userId', 'email'); // Populate user email

    for (const task of tasks) {
      const daysUntilDue = Math.ceil((task.endDate - now) / (24 * 60 * 60 * 1000));
      if (task.userId && task.userId.email) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: task.userId.email,
          subject: `Task Reminder: ${task.title} Due Soon`,
          text: `Your task "${task.title}" is due in ${daysUntilDue} day(s) on ${new Date(task.endDate).toLocaleDateString()}.`,
        };
        await transporter.sendMail(mailOptions);
        console.log(`Reminder sent for task "${task.title}" to ${task.userId.email}`);
      }
    }
  } catch (err) {
    console.error('Error sending task reminders:', err);
  }
};

// Schedule the reminder check to run every day at 8:00 AM (adjust as needed)
cron.schedule('0 8 * * *', () => {
  console.log('Running daily task reminder check...');
  sendTaskReminders();
});

// Connect to MongoDB and start the server
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(5000, () => {
      console.log("Server running on port 5000");
      // Run once immediately on startup (optional, for testing)
      sendTaskReminders();
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });