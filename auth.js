const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authenticate = require('../middleware/authenticate');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 🔐 Helper to create JWT token
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ✅ POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, contact, password } = req.body;

  try {
    // Check if user exists
    let existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // Create user
    const newUser = new User({ name, email, contact, password });
    await newUser.save();

    // Create token
    const token = generateToken(newUser);

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Invalid email or password' });

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    // Create token
    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ GET /api/auth/profile (requires JWT)
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      contact: user.contact,
      area: user.area,
      place: user.place,
      district: user.district,
      state: user.state,
      houseNumber: user.houseNumber,
      role: user.role
    });
  } catch (error) {
    console.error('GET /profile error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ PUT /api/auth/profile (update)
router.put('/profile', authenticate, async (req, res) => {
  try {
    const {
      name, contact, area, place, district, state, houseNumber
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update fields
    user.name = name || user.name;
    user.contact = contact || user.contact;
    user.area = area || user.area;
    user.place = place || user.place;
    user.district = district || user.district;
    user.state = state || user.state;
    user.houseNumber = houseNumber || user.houseNumber;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        contact: user.contact,
        area: user.area,
        place: user.place,
        district: user.district,
        state: user.state,
        houseNumber: user.houseNumber,
        role: user.role
      }
    });
  } catch (error) {
    console.error('PUT /profile error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
