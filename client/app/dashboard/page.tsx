'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { AxiosError } from 'axios';
import ThemeToggle from '@/components/ThemeToggle'; // Import Toggle

interface Group {
  _id: string;
  name: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [globalBalance, setGlobalBalance] = useState<number | null>(null);

  const [newGroupName, setNewGroupName] = useState('');
  const [friendEmails, setFriendEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupsRes, balanceRes] = await Promise.all([
          api.get('/groups'),
          api.get('/expenses/my-balance')
        ]);
        setGroups(groupsRes.data);
        setGlobalBalance(balanceRes.data.balance);
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentEmail.trim()) return;
    if (friendEmails.includes(currentEmail)) {
      alert('Email already added!');
      return;
    }
    setFriendEmails([...friendEmails, currentEmail]);
    setCurrentEmail('');
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setFriendEmails(friendEmails.filter(e => e !== emailToRemove));
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      const res = await api.post('/groups', { 
        name: newGroupName,
        members: friendEmails 
      });
      setGroups([...groups, res.data]);
      setNewGroupName(''); 
      setFriendEmails([]); 
      setCurrentEmail('');
      setError('');
    } catch (err) {
      const axiosError = err as AxiosError<{ msg: string }>;
      setError(axiosError.response?.data?.msg || 'Failed to create group');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    router.push('/auth');
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen text-indigo-500 font-medium">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-12 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        
        {/* Navbar */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-xl shadow-lg shadow-indigo-500/30"></div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Splitr</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button 
              onClick={handleLogout}
              className="px-5 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN */}
          <div className="space-y-8">
            
            {/* Global Balance Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 dark:from-indigo-900 dark:to-violet-950 p-8 rounded-3xl shadow-xl shadow-indigo-200 dark:shadow-none text-white relative overflow-hidden ring-1 ring-white/10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
              
              <h2 className="text-indigo-100 text-sm font-semibold uppercase tracking-wider mb-1">Total Balance</h2>
              <div className="mt-2">
                {globalBalance === null ? (
                  <span className="text-2xl opacity-50">Calculating...</span>
                ) : Math.abs(globalBalance) < 0.01 ? (
                  <span className="text-3xl font-bold">All Settled ✨</span>
                ) : (
                  <div>
                    <span className="text-4xl font-extrabold tracking-tight">
                      {globalBalance > 0 ? '+' : ''}₹{Math.abs(globalBalance).toFixed(2)}
                    </span>
                    <p className={`mt-2 text-sm font-medium inline-block px-3 py-1 rounded-full ${globalBalance > 0 ? 'bg-emerald-400/20 text-emerald-100' : 'bg-rose-400/20 text-rose-100'}`}>
                      {globalBalance > 0 ? 'You are owed' : 'You owe'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Create Group Form */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-5">Start a New Group</h2>
              {error && <p className="text-rose-500 text-sm mb-3 bg-rose-50 dark:bg-rose-900/20 p-2 rounded">{error}</p>}
              
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Group Name</label>
                  <input 
                    type="text" 
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g. Summer Trip"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Add Friends (Email)</label>
                  <div className="flex gap-2">
                    <input 
                      type="email" 
                      value={currentEmail}
                      onChange={(e) => setCurrentEmail(e.target.value)}
                      placeholder="friend@email.com"
                      className="flex-1 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                      onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                    />
                    <button type="button" onClick={handleAddEmail} className="bg-slate-800 dark:bg-slate-700 text-white px-5 rounded-xl hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors font-medium">Add</button>
                  </div>

                  {friendEmails.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {friendEmails.map((email) => (
                        <span key={email} className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 border border-indigo-100 dark:border-indigo-800">
                          {email}
                          <button type="button" onClick={() => handleRemoveEmail(email)} className="hover:text-rose-600 ml-1">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all transform active:scale-95">
                  Create Group
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: Group List */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              Your Groups <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-full border dark:border-slate-700">{groups.length}</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.length === 0 ? (
                <div className="col-span-2 py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <p className="text-slate-400">No groups yet. Create one to get started!</p>
                </div>
              ) : (
                groups.map((group) => (
                  <div 
                    key={group._id} 
                    className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all cursor-pointer group"
                    onClick={() => router.push(`/groups/${group._id}`)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        {group.name.charAt(0)}
                      </div>
                      <span className="text-slate-300 dark:text-slate-600">→</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{group.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 font-mono">ID: {group._id.slice(-6)}</p>
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