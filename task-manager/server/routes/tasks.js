const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.get('/', auth, async (req, res) => {
  const { includeArchived } = req.query;
  const query = { userId: req.user.userId };
  if (includeArchived !== 'true') query.isArchived = false;
  try {
    const tasks = await Task.find(query);
    res.json(tasks);
  } catch (err) {
    console.error('Fetch tasks error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  const { title, description, endDate } = req.body;
  try {
    const task = new Task({ title, description, endDate, userId: req.user.userId });
    await task.save();

    if (endDate) {
      const User = require('../models/User');
      const user = await User.findById(req.user.userId);
      if (user && user.email) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: `Task Reminder: ${title}`,
          text: `Your task "${title}" is due on ${new Date(endDate).toLocaleDateString()}.`,
        };
        await transporter.sendMail(mailOptions);
      }
    }

    res.status(201).json(task);
  } catch (err) {
    console.error('Create task error:', err);
    res.status(400).json({ message: 'Failed to create task' });
  }
});

router.put('/:id', auth, async (req, res) => {
  const { title, description, endDate, completed } = req.body;
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { title, description, endDate, completed },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (endDate && endDate !== task.endDate) {
      const User = require('../models/User');
      const user = await User.findById(req.user.userId);
      if (user && user.email) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: `Task Updated: ${title}`,
          text: `Your task "${title}" now ends on ${new Date(endDate).toLocaleDateString()}.`,
        };
        await transporter.sendMail(mailOptions);
      }
    }

    res.json(task);
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// New endpoint for archiving
router.put('/archive/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { isArchived: true },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task archived', task });
  } catch (err) {
    console.error('Archive task error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Restore endpoint remains the same
router.put('/restore/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { isArchived: false },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    console.error('Restore task error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Optional: Keep DELETE for actual deletion if needed in the future
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted permanently' });
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;