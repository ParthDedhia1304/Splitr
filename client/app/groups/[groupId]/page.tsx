'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { AxiosError } from 'axios';

interface Member {
  _id: string;
  name: string;
}

interface GroupDetails {
  _id: string;
  name: string;
  members: Member[];
}

interface Expense {
  _id: string;
  description: string;
  amount: number;
  paid_by: { name: string };
  date: string;
}

interface Debt {
  from: string;
  to: string;
  amount: number;
}

export default function GroupPage({ params }: { params: Promise<{ groupId: string }> }) {
  // Unwrap params using React.use()
  const { groupId } = use(params);
  
  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  
  // Form State
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. Fetch Group Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Parallel fetching for speed
        const [groupRes, expenseRes, balanceRes] = await Promise.all([
          api.get(`/groups/${groupId}`),           // Get Member Names
          api.get(`/expenses/group/${groupId}`),   // Get History
          api.get(`/groups/${groupId}/balance`)    // Get Calculations
        ]);

        setGroup(groupRes.data);
        setExpenses(expenseRes.data);
        setDebts(balanceRes.data.simplifiedDebts);
      } catch (err) {
        console.error("Failed to load group data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [groupId]);

  // 2. Handle Adding Expense
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group) return;

    try {
      // By default, we split EQUALLY among ALL members
      // Map members to the format backend expects: { user: "ID" }
      const splits = group.members.map(m => ({ user: m._id }));

      await api.post('/expenses', {
        description: desc,
        amount: Number(amount),
        groupId: groupId,
        split_type: 'EQUAL', // Keeping it simple for MVP
        splits: splits 
      });

      // Reload page data to show new balance
      window.location.reload(); 
    } catch (err) {
      alert("Failed to add expense");
    }
  };

  // Helper to find name by ID (for the Debt section)
  const getUserName = (id: string) => {
    const member = group?.members.find(m => m._id === id);
    return member ? member.name : 'Unknown';
  };

  if (loading) return <div className="p-10 text-center text-black">Loading Group...</div>;
  if (!group) return <div className="p-10 text-center text-red-500">Group not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-800 mb-6">{group.name}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* LEFT COLUMN: Add Expense & Debts */}
          <div className="space-y-6">
            
            {/* Add Expense Form */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 text-blue-600">Add an Expense</h2>
              <form onSubmit={handleAddExpense} className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Description (e.g. Lunch)"
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  className="w-full p-2 border rounded text-black"
                  required
                />
                <input 
                  type="number" 
                  placeholder="Amount (e.g. 500)"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full p-2 border rounded text-black"
                  required
                />
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                  Split Equally (All Members)
                </button>
              </form>
            </div>

            {/* Balances Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 text-green-600">Balances</h2>
              {debts.length === 0 ? (
                <p className="text-gray-500">All debts are settled!</p>
              ) : (
                <ul className="space-y-2">
                  {debts.map((debt, index) => (
                    <li key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-gray-700">
                        <strong className="text-red-500">{getUserName(debt.from)}</strong> pays{' '}
                        <strong className="text-green-600">{getUserName(debt.to)}</strong>
                      </span>
                      <span className="font-bold text-gray-900">₹{debt.amount}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Recent Activity */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-fit">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Recent Activity</h2>
            <div className="space-y-4">
              {expenses.length === 0 ? (
                <p className="text-gray-400 italic">No expenses yet.</p>
              ) : (
                expenses.map(exp => (
                  <div key={exp._id} className="border-b pb-3 last:border-0">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-800">{exp.description}</span>
                      <span className="font-bold text-gray-900">₹{exp.amount}</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Paid by <span className="font-semibold">{exp.paid_by.name}</span> • {new Date(exp.date).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}