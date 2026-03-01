const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// POST /auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email already exists'
      });
    }

    // Create new user
    console.log('Creating new user with:', { name, email, password: '***' });
    
    // Hash password manually as backup
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed manually in route');
    
    const user = new User({ name, email, password: hashedPassword });
    console.log('User object created with hashed password, calling save()...');
    await user.save();
    console.log('User saved successfully');

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
      stack: error.stack
    });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    // Check password
    user.comparePassword(password, (err, isMatch) => {
      if (err) {
        console.error('Error during password comparison:', err);
        return res.status(500).json({ message: 'Server error during login' });
      }
      if (!isMatch) {
        console.log('Password does not match for user:', email);
        return res.status(401).json({
          message: 'Invalid credentials'
        });
      }

      console.log('Password matched for user:', email);
      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// GET /auth/me
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
