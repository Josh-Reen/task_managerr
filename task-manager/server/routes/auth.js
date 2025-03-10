const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Registration endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the new user to the database
    const user = new User({ email, password: hashedPassword });
    await user.save();

    // Generate a token for the new user
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('Generated Token (Registration):', token); // Debugging: Log the token

    // Return the token and userId in the response
    res.status(201).json({ token, userId: user._id });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(400).json({ message: 'Registration failed', error: error.message });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate a token for the logged-in user
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('Generated Token (Login):', token); // Debugging: Log the token

    // Return the token and userId in the response
    res.status(200).json({ token, userId: user._id });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(400).json({ message: 'Login failed', error: error.message });
  }
});

module.exports = router;
