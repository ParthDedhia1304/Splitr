'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { AxiosError } from 'axios'; // 1. Import this

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const res = await api.post(endpoint, formData);
      
      localStorage.setItem('userId', res.data._id);
      localStorage.setItem('userName', res.data.name);
      
      alert(`Welcome ${res.data.name}!`);
      router.push('/dashboard');
    } catch (err) {
      // 2. Cast the error to AxiosError with a specific response shape
      const axiosError = err as AxiosError<{ msg: string }>;
      
      // Now TypeScript knows that 'response' and 'data' exist
      setError(axiosError.response?.data?.msg || 'Something went wrong');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">
          {isLogin ? 'Login to Splitr' : 'Create Account'}
        </h2>
        
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Name"
              className="w-full p-2 border rounded text-black"
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded text-black"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded text-black"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600 cursor-pointer hover:underline"
           onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
}