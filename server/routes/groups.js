const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const User = require('../models/User');
const auth = require('../middleware/auth'); // Import our middleware

// @route   POST /api/groups
// @desc    Create a new group
router.post('/', auth, async (req, res) => {
  const { name, members } = req.body; // members = array of emails or User IDs
  
  try {
    // 1. Resolve emails to User IDs (if frontend sends emails)
    // For MVP, let's assume frontend sends an array of User IDs including the creator
    
    const newGroup = new Group({
      name,
      members: [...members, req.user] // Add the creator (req.user) to the group automatically
    });

    const group = await newGroup.save();
    res.json(group);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/groups
// @desc    Get all groups the current user belongs to
router.get('/', auth, async (req, res) => {
  try {
    // Find groups where 'members' array contains the current user's ID
    const groups = await Group.find({ members: req.user });
    res.json(groups);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;