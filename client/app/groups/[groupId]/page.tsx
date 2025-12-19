'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle'; // Import Toggle

interface Member {
  _id: string;
  name: string;
  email: string;
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
  paid_by: { _id: string; name: string };
  date: string;
  split_type: string;
  splits: { user: string; amount: number }[];
}

interface Debt {
  from: string;
  to: string;
  amount: number;
}

interface SplitPayload {
  user: string;
  amount?: number;
  percentage?: number;
}

type SplitType = 'EQUAL' | 'EXACT' | 'PERCENTAGE';

export default function GroupPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = use(params);
  const router = useRouter();

  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);

  const [splitType, setSplitType] = useState<SplitType>('EQUAL');
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  const [customValues, setCustomValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) setCurrentUserId(userId);

    const fetchData = async () => {
      try {
        const [groupRes, expenseRes, balanceRes] = await Promise.all([
          api.get(`/groups/${groupId}`),
          api.get(`/expenses/group/${groupId}`),
          api.get(`/groups/${groupId}/balance`)
        ]);

        const groupData = groupRes.data as GroupDetails;
        setGroup(groupData);
        setExpenses(expenseRes.data);
        setDebts(balanceRes.data.simplifiedDebts);
        const allMemberIds = new Set(groupData.members.map((m) => m._id));
        setSelectedMemberIds(allMemberIds);
      } catch (err) {
        console.error("Failed to load group data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [groupId]);

  const toggleMember = (memberId: string) => {
    const newSelection = new Set(selectedMemberIds);
    if (newSelection.has(memberId)) newSelection.delete(memberId);
    else newSelection.add(memberId);
    setSelectedMemberIds(newSelection);
  };

  const handleCustomValueChange = (userId: string, val: string) => {
    setCustomValues({ ...customValues, [userId]: val });
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group) return;

    try {
      let splits: SplitPayload[] = [];
      const totalAmount = Number(amount);

      if (splitType === 'EQUAL') {
        if (selectedMemberIds.size === 0) {
          alert('Select at least one person.');
          return;
        }
        splits = Array.from(selectedMemberIds).map(id => ({ user: id }));
      } 
      else if (splitType === 'EXACT') {
        let sum = 0;
        splits = group.members.map((m): SplitPayload | null => {
          const val = Number(customValues[m._id] || 0);
          if (val > 0) {
            sum += val;
            return { user: m._id, amount: val };
          }
          return null;
        }).filter((s): s is SplitPayload => s !== null);

        if (Math.abs(sum - totalAmount) > 0.01) {
          alert(`Amounts sum to ${sum}, but total is ${totalAmount}. Please fix.`);
          return;
        }
      } 
      else if (splitType === 'PERCENTAGE') {
        let totalPercent = 0;
        splits = group.members.map((m): SplitPayload | null => {
          const val = Number(customValues[m._id] || 0);
          if (val > 0) {
            totalPercent += val;
            return { user: m._id, percentage: val };
          }
          return null;
        }).filter((s): s is SplitPayload => s !== null);

        if (totalPercent !== 100) {
          alert(`Percentages sum to ${totalPercent}%, but must be 100%.`);
          return;
        }
      }

      await api.post('/expenses', {
        description: desc,
        amount: totalAmount,
        groupId: groupId,
        split_type: splitType,
        splits: splits
      });
      window.location.reload();
    } catch (err) {
      alert("Failed to add expense");
    }
  };

  const handleSettleUp = async (toUser: string, amount: number) => {
    if (!confirm(`Confirm payment of ₹${amount}?`)) return;
    try {
      await api.post('/expenses', {
        description: 'Settlement',
        amount: amount,
        groupId: groupId,
        split_type: 'EQUAL',
        splits: [{ user: toUser }]
      });
      window.location.reload();
    } catch (err) { alert("Failed"); }
  };

  const getUserName = (id: string) => {
    if (id === currentUserId) return 'You';
    const member = group?.members.find(m => m._id === id);
    return member ? member.name : 'Unknown';
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen text-indigo-500">Loading Group...</div>;
  if (!group) return <div className="p-10 text-center text-rose-500">Group not found</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-900 text-slate-500 hover:text-indigo-600 shadow-sm border border-slate-200 dark:border-slate-800 transition-all">
              ←
            </button>
            <div>
               <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">{group.name}</h1>
               <p className="text-slate-400 text-sm">{group.members.length} members</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Add Expense & Balances (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* ADD EXPENSE CARD */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 sticky top-4 transition-colors">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Add Expense</h2>
              <form onSubmit={handleAddExpense} className="space-y-4">
                
                <div className="relative">
                  <span className="absolute left-4 top-3 text-slate-400">📝</span>
                  <input type="text" placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} className="w-full pl-10 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all" required />
                </div>
                
                <div className="relative">
                   <span className="absolute left-4 top-3 text-slate-400">₹</span>
                   <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="w-full pl-10 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all" required />
                </div>

                {/* Styled Tabs */}
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  {(['EQUAL', 'EXACT', 'PERCENTAGE'] as SplitType[]).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSplitType(type)}
                      className={`flex-1 text-[10px] font-bold py-2 rounded-lg transition-all uppercase tracking-wide ${splitType === type ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    >
                      {type === 'PERCENTAGE' ? '%' : type}
                    </button>
                  ))}
                </div>

                {/* Member List */}
                <div className="space-y-2 max-h-52 overflow-y-auto pr-2 custom-scrollbar">
                  {group.members.map(member => (
                    <div key={member._id} className="flex items-center justify-between p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer group" onClick={() => splitType === 'EQUAL' && toggleMember(member._id)}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
                          {member.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {member._id === currentUserId ? 'You' : member.name}
                        </span>
                      </div>
                      
                      {splitType === 'EQUAL' && (
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedMemberIds.has(member._id) ? 'border-indigo-600 bg-indigo-600 dark:border-indigo-500 dark:bg-indigo-500' : 'border-slate-300 dark:border-slate-600'}`}>
                           {selectedMemberIds.has(member._id) && <span className="text-white text-[10px]">✓</span>}
                        </div>
                      )}

                      {splitType === 'EXACT' && (
                        <input 
                          type="number" 
                          placeholder="₹" 
                          value={customValues[member._id] || ''}
                          onChange={(e) => handleCustomValueChange(member._id, e.target.value)}
                          className="w-20 p-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-right focus:border-indigo-500 dark:text-white outline-none"
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}

                      {splitType === 'PERCENTAGE' && (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="number" 
                            placeholder="0" 
                            value={customValues[member._id] || ''}
                            onChange={(e) => handleCustomValueChange(member._id, e.target.value)}
                            className="w-12 p-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-right focus:border-indigo-500 dark:text-white outline-none"
                          />
                          <span className="text-slate-400 text-xs font-bold">%</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all">
                  Add Expense
                </button>
              </form>
            </div>

            {/* BALANCES CARD */}
            <div className="bg-slate-900 dark:bg-black text-slate-100 p-6 rounded-2xl shadow-lg ring-1 ring-slate-800">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>⚡</span> Debts
              </h2>
              {debts.length === 0 ? (
                <div className="text-center py-6 opacity-50">
                   <p>No pending debts.</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {debts.map((debt, i) => {
                    const isIOwe = debt.from === currentUserId;
                    return (
                      <li key={i} className="flex justify-between items-center text-sm">
                        <div className="flex flex-col">
                           <span className="text-slate-400 text-xs">
                             {isIOwe ? 'You owe' : `${getUserName(debt.from)} owes`}
                           </span>
                           <span className={`font-bold ${isIOwe ? 'text-white' : 'text-indigo-300'}`}>
                             {isIOwe ? getUserName(debt.to) : 'You'}
                           </span>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className="font-mono text-lg text-white">₹{debt.amount}</span>
                           {isIOwe && (
                             <button onClick={() => handleSettleUp(debt.to, debt.amount)} className="bg-emerald-500 hover:bg-emerald-400 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-lg shadow-emerald-500/20">
                               Pay
                             </button>
                           )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Recent Activity (8 cols) */}
          <div className="lg:col-span-8">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Recent Activity</h2>
            <div className="space-y-3">
               {expenses.length === 0 ? (
                 <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-slate-400">No expenses yet. Add one on the left!</p>
                 </div>
               ) : (
                 expenses.map(exp => {
                    const isPayer = exp.paid_by._id === currentUserId;
                    const mySplit = exp.splits.find(s => s.user === currentUserId);
                    const netLent = isPayer ? (exp.amount - (mySplit?.amount || 0)) : 0;

                    return (
                      <div key={exp._id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-md dark:hover:border-slate-700 transition-all flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          {/* Date Box */}
                          <div className="flex flex-col items-center justify-center w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 font-bold group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                             <span className="text-[10px] uppercase tracking-wide">{new Date(exp.date).toLocaleString('default', { month: 'short' })}</span>
                             <span className="text-xl leading-none">{new Date(exp.date).getDate()}</span>
                          </div>
                          
                          <div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">{exp.description}</h3>
                            <p className="text-xs font-medium text-slate-400">
                               {isPayer ? <span className="text-indigo-600 dark:text-indigo-400">You</span> : exp.paid_by.name} paid <span className="text-slate-600 dark:text-slate-300">₹{exp.amount}</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="block text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-wider mb-1">{exp.split_type}</span>
                          {isPayer ? (
                             <span className="text-emerald-600 dark:text-emerald-400 text-sm font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">
                               + ₹{Number(netLent.toFixed(2))}
                             </span>
                          ) : mySplit ? (
                             <span className="text-rose-500 dark:text-rose-400 text-sm font-bold bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded-lg">
                               - ₹{mySplit.amount}
                             </span>
                          ) : (
                             <span className="text-slate-400 text-sm bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">
                               Not involved
                             </span>
                          )}
                        </div>
                      </div>
                    );
                 })
               )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}