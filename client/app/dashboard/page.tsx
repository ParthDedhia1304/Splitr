'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { AxiosError } from 'axios';

// Define what a Group looks like
interface Group {
  _id: string;
  name: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);

  // State for the form
  const [newGroupName, setNewGroupName] = useState('');
  const [friendEmail, setFriendEmail] = useState(''); // <--- NEW: State for friend's email
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Fetch Groups on Page Load
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.get('/groups');
        setGroups(res.data);
      } catch (err) {
        console.error('Failed to fetch groups', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  // 2. Handle Creating a New Group
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      // Send the friend's email in the 'members' array
      // If the field is empty, send an empty array (just you)
      const memberList = friendEmail ? [friendEmail] : [];

      const res = await api.post('/groups', { 
        name: newGroupName,
        members: memberList 
      });
      
      // Add the new group to the list instantly
      setGroups([...groups, res.data]);
      
      // Clear inputs
      setNewGroupName(''); 
      setFriendEmail(''); 
      setError('');
    } catch (err) {
      const axiosError = err as AxiosError<{ msg: string }>;
      setError(axiosError.response?.data?.msg || 'Failed to create group');
    }
  };

  // 3. Logout Function
  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    router.push('/auth');
  };

  if (loading) return <div className="p-10 text-center text-black">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Your Groups</h1>
        <button 
          onClick={handleLogout}
          className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
        >
          Logout
        </button>
      </div>

      {/* Create Group Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8 max-w-2xl">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Create a New Group</h2>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        
        <form onSubmit={handleCreateGroup} className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Group Name (e.g. Goa Trip)"
            className="flex-1 p-2 border rounded text-black"
            required
          />
          
          {/* NEW: Input for Friend's Email */}
          <input 
            type="email" 
            value={friendEmail}
            onChange={(e) => setFriendEmail(e.target.value)}
            placeholder="Friend's Email (Optional)"
            className="flex-1 p-2 border rounded text-black"
          />

          <button 
            type="submit" 
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Create
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-2">
          Note: Your friend must already be registered with this email.
        </p>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {groups.length === 0 ? (
          <p className="text-gray-500">You are not part of any groups yet.</p>
        ) : (
          groups.map((group) => (
            <div 
              key={group._id} 
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer border border-gray-100"
              onClick={() => router.push(`/groups/${group._id}`)}
            >
              <h3 className="text-xl font-bold text-blue-600">{group.name}</h3>
              <p className="text-sm text-gray-400 mt-2">ID: {group._id}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}