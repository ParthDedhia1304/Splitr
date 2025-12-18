const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true }, // Total amount paid
  date: { type: Date, default: Date.now },
  
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  paid_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Who paid
  
  // Requirement: Supported split types [cite: 195]
  split_type: { 
    type: String, 
    enum: ['EQUAL', 'EXACT', 'PERCENTAGE'], 
    required: true 
  },

  // This array stores exactly how much each person owes for this specific expense
  splits: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: { type: Number }, // The calculated debt (e.g., if split is 50%, this is total * 0.5)
    percentage: { type: Number } // Optional: used only if split_type is PERCENTAGE
  }]
});

module.exports = mongoose.model('Expense', ExpenseSchema);