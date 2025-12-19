const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const User = require('../models/User');
const auth = require('../middleware/auth'); // Import our middleware
const Expense = require('../models/Expense');
// @route   POST /api/groups
// @desc    Create a new group
// @route   GET /api/groups/:groupId/balance
// @desc    Get simplified balances for a group
router.get('/:groupId/balance', auth, async (req, res) => {
  try {
    const { groupId } = req.params;

    // 1. Fetch all expenses for this group
    const expenses = await Expense.find({ group: groupId });

    // 2. Calculate Net Balance for each user
    let balances = {}; // { userId: amount }

    expenses.forEach(expense => {
      // Payer gets POSITIVE credit (they paid, so they are owed money)
      const payerId = expense.paid_by.toString();
      balances[payerId] = (balances[payerId] || 0) + expense.amount;

      // Splitters get NEGATIVE debit (they consumed, so they owe money)
      expense.splits.forEach(split => {
        const userId = split.user.toString();
        balances[userId] = (balances[userId] || 0) - split.amount;
      });
    });

    // 3. Simplify the Graph
    const transactions = simplifyDebts(balances);

    // 4. Return the simplified transactions (Who pays Whom)
    res.json({ 
      groupId, 
      balances, // Raw net balances (e.g., A: +50, B: -50)
      simplifiedDebts: transactions // The instructions: "B pays A 50"
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @desc    Create a new group with members (by email)
router.post('/', auth, async (req, res) => {
  const { name, members } = req.body; // Expecting members to be an array of EMAILS now
  
  try {
    let memberIds = [];

    // If emails are provided, find the corresponding User IDs
    if (members && Array.isArray(members) && members.length > 0) {
      const users = await User.find({ email: { $in: members } });
      memberIds = users.map(user => user._id);
      
      if (users.length !== members.length) {
         // Optional: Warn if some emails weren't found, but for now we proceed
         console.log('Some emails were not found in the database');
      }
    }

    // Create group with found IDs + the Creator's ID
    const newGroup = new Group({
      name,
      members: [...memberIds, req.user] 
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

// Helper: Simplify Debts Algorithm
function simplifyDebts(balances) {
  // balances = { 'userId': 50, 'userId2': -50 }
  let debtors = [];
  let creditors = [];

  // Separate into two lists
  for (const [user, amount] of Object.entries(balances)) {
    if (amount < -0.01) debtors.push({ user, amount });
    if (amount > 0.01) creditors.push({ user, amount });
  }

  // Sort to optimize greedy approach (optional but good)
  debtors.sort((a, b) => a.amount - b.amount); // Ascending (most negative first)
  creditors.sort((a, b) => b.amount - a.amount); // Descending (most positive first)

  let transactions = [];

  let i = 0; // debtors pointer
  let j = 0; // creditors pointer

  while (i < debtors.length && j < creditors.length) {
    let debtor = debtors[i];
    let creditor = creditors[j];

    // The amount to settle is the minimum of what's owed vs what's receivable
    let amount = Math.min(Math.abs(debtor.amount), creditor.amount);
    
    // Round to 2 decimals
    amount = Math.round(amount * 100) / 100;

    if (amount > 0) {
      transactions.push({
        from: debtor.user,
        to: creditor.user,
        amount: amount
      });
    }

    // Adjust remaining balances
    debtor.amount += amount;
    creditor.amount -= amount;

    // Move pointers if settled
    if (Math.abs(debtor.amount) < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return transactions;
}

router.get('/:id', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate('members', 'name email');
    if (!group) return res.status(404).json({ msg: 'Group not found' });
    res.json(group);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;