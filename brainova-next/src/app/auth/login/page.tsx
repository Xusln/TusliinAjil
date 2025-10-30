// src/app/auth/login/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (type: 'student' | 'teacher') => {
    setError('');
    try {
      const res = await api.login(username, password);
      if (res.success && res.user?.user_type === type) {
        localStorage.setItem('userType', type);
        router.push('/dashboard');
      } else {
        setError('Буруу нэр, нууц үг эсвэл төрөл');
      }
    } catch (err) {
      setError('Сервертэй холбогдохгүй байна');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Brainova Quiz</h1>
        <h2 className="text-xl text-center mb-6 text-gray-600">Нэвтрэх</h2>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="me@gmail.com"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <input
          type="password"
          placeholder="Нууц үг"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg mb-6 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />

        <div className="space-y-3">
          <button
            onClick={() => handleLogin('student')}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Сурагчаар нэвтрэх
          </button>
          <button
            onClick={() => handleLogin('teacher')}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Багшаар нэвтрэх
          </button>
        </div>
      </div>
    </div>
  );
}