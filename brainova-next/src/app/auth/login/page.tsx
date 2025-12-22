'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    // Үндсэн шалгалт
    if (!username.trim()) {
      setError('И-мэйл хаягаа оруулна уу');
      setLoading(false);
      return;
    }
    if (!password) {
      setError('Нууц үгээ оруулна уу');
      setLoading(false);
      return;
    }

    try {
      const res = await api.login(username.trim(), password);

      // Амжилттай нэвтрэхэд dashboard руу шилжинэ
      router.push('/dashboard');
    } catch (err: any) {
      // Backend-ээс ирсэн алдааг хэрэглэгчдэд ээлтэй болгоно
      if (err.message.includes('Буруу нэр эсвэл нууц үг')) {
        setError('Таны нэр эсвэл нууц үг буруу байна');
      } else if (err.message.includes('шаардлагатай')) {
        setError('Нэр болон нууц үгээ бүрэн оруулна уу');
      } else {
        setError('Таны нэр эсвэл нууц үг буруу байна');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-blue-100">
        <h1 className="text-5xl font-extrabold text-center mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Brainova Quiz
        </h1>
        <h2 className="text-2xl text-center mb-8 text-gray-700">Нэвтрэх</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-center font-medium text-lg">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">
              И-мэйл хаяг
            </label>
            <input
              type="email"
              placeholder="me@gmail.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">
              Нууц үг
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition"
              required
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-2xl font-bold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
          </button>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600 text-lg">
            Бүртгэлгүй юу?{' '}
            <button
              onClick={() => router.push('/auth/register')}
              className="text-blue-600 font-bold hover:underline"
            >
              Бүртгүүлэх
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}