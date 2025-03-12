const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
require('dotenv').config();

/**
 * POST /api/auth/register
 * Registers a new user and returns a JWT token
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {object} - { token: string, userId: string }
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password and save user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('Generated Token (Registration):', token);

    res.status(201).json({ token, userId: user._id });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(400).json({ message: 'Registration failed', error: error.message });
  }
});

/**
 * POST /api/auth/login
 * Logs in a user and returns a JWT token
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {object} - { token: string, userId: string }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user and verify password
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('Generated Token (Login):', token);

    res.status(200).json({ token, userId: user._id });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(400).json({ message: 'Login failed', error: error.message });
  }
});

/**
 * POST /api/auth/forgot-password
 * Sends a password reset link to the user's email
 * @param {string} email - User's registered email
 * @returns {object} - { message: string }
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.error('This Email isn’t available:', email);
      return res.status(404).json({ message: 'Email not found' });
    }

    // Generate reset token
    const resetToken = Math.random().toString(36).slice(-8); // Simple 8-char token
    const hashedToken = await bcrypt.hash(resetToken, 10);
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
    await user.save();

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Create reset URL
    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}&email=${email}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click this link to reset your password: ${resetUrl}\n\nThis link expires in 1 hour.`,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`Reset link sent to ${email}: ${resetUrl}`);
    res.json({ message: 'Password reset link sent. Check your email.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
});

/**
 * POST /api/auth/reset-password
 * Resets the user's password using a valid reset token
 * @param {string} email - User's email
 * @param {string} token - Reset token from email
 * @param {string} newPassword - New password to set
 * @returns {object} - { message: string }
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: 'Email, token, and new password are required' });
    }

    // Find user with valid reset token
    const user = await User.findOne({ 
      email, 
      resetPasswordExpires: { $gt: Date.now() } 
    });
    if (!user || !(await bcrypt.compare(token, user.resetPasswordToken))) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password and clear reset fields
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully. Please log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
});

module.exports = router;
