'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

// 1. Define specific types instead of 'any'
interface Member {
  _id: string;
  name: string;
}

interface Expense {
  _id: string;
  amount: number;
  paid_by: {
    _id: string;
  };
}

interface Props {
  expenses: Expense[];
  members: Member[];
}

export default function SpendingChart({ expenses, members }: Props) {
  // Calculate total spending per user
  const data = members.map((member) => {
    const totalSpent = expenses
      .filter((e) => e.paid_by._id === member._id)
      .reduce((sum, e) => sum + e.amount, 0);
    
    return {
      name: member.name.split(' ')[0], // First name only
      amount: totalSpent,
    };
  }).sort((a, b) => b.amount - a.amount); // Sort by highest spender

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

  if (expenses.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800"
    >
      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Spending Breakdown</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 0 }}>
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              axisLine={false} 
              tickLine={false} 
              width={60}
              tick={{ fill: '#94a3b8', fontSize: 12 }} 
            />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={20}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}