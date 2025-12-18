const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const Group = require('../models/Group');
const auth = require('../middleware/auth');

// @route   POST /api/expenses
// @desc    Add a new expense to a group
router.post('/', auth, async (req, res) => {
  const { description, amount, groupId, split_type, splits } = req.body;
  // splits structure: [{ user: userId, amount: Number, percentage: Number }]

  try {
    // 1. Validate Group membership
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ msg: 'Group not found' });
    if (!group.members.includes(req.user)) {
      return res.status(401).json({ msg: 'User not in this group' });
    }

    // 2. VALIDATION LOGIC BASED ON SPLIT TYPE
    let finalSplits = [];

    if (split_type === 'EQUAL') {
      // Logic: Divide amount equally among selected users
      const numberOfUsers = splits.length;
      const share = amount / numberOfUsers;
      
      // Handle decimals (simple approach for MVP: keeping it precise)
      finalSplits = splits.map(s => ({
        user: s.user,
        amount: Number(share.toFixed(2)) // 2 decimal places
      }));
      
      // Fix rounding error on the last person (if 100 / 3 = 33.33, 33.33, 33.34)
      let currentSum = finalSplits.reduce((acc, curr) => acc + curr.amount, 0);
      if (currentSum !== amount) {
        finalSplits[0].amount += (amount - currentSum);
        finalSplits[0].amount = Number(finalSplits[0].amount.toFixed(2));
      }

    } else if (split_type === 'EXACT') {
      // Logic: Ensure the sum of split amounts equals total amount
      const sum = splits.reduce((acc, curr) => acc + Number(curr.amount), 0);
      
      if (Math.abs(sum - amount) > 0.01) { // Allowing tiny floating point margin
        return res.status(400).json({ msg: `Split amounts sum (${sum}) does not equal total (${amount})` });
      }
      finalSplits = splits;

    } else if (split_type === 'PERCENTAGE') {
      // Logic: Ensure percentages add up to 100
      const totalPercent = splits.reduce((acc, curr) => acc + Number(curr.percentage), 0);
      
      if (totalPercent !== 100) {
        return res.status(400).json({ msg: `Percentages must add up to 100%. Current: ${totalPercent}%` });
      }

      finalSplits = splits.map(s => ({
        user: s.user,
        amount: Number(((amount * s.percentage) / 100).toFixed(2)),
        percentage: s.percentage
      }));
    }

    // 3. Save Expense
    const newExpense = new Expense({
      description,
      amount,
      group: groupId,
      paid_by: req.user,
      split_type,
      splits: finalSplits
    });

    const expense = await newExpense.save();
    res.json(expense);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/expenses/group/:groupId
// @desc    Get all expenses for a specific group
router.get('/group/:groupId', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ group: req.params.groupId })
      .populate('paid_by', 'name email') // Show name of payer
      .sort({ date: -1 }); // Newest first
    res.json(expenses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;