const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User({ name, email, password });
    await user.save();
    res.json(user); // Returns the created user with _id
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/auth/login
// @desc    Login user (Simple verification)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }
    res.json(user); // Returns user info including _id
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;