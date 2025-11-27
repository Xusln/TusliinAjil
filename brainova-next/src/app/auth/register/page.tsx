// src/app/auth/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [userType, setUserType] = useState<'student' | 'teacher'>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Шалгалт
    if (!username || !password || !fullName) {
      return setError('Бүх талбарыг бөглөнө үү!');
    }
    if (password !== confirmPassword) {
      return setError('Нууц үг таарахгүй байна!');
    }
    if (password.length < 6) {
      return setError('Нууц үг дор хаяж 6 тэмдэгт байх ёстой!');
    }
    if (!username.includes('@')) {
      return setError('И-мэйл хаяг оруулна уу (жишээ: name@gmail.com)');
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username,
          password,
          full_name: fullName,
          user_type: userType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.detail || 'Бүртгэл амжилтгүй боллоо');
      }

      // Амжилттай бол нэвтрэх хуудас руу шилжүүлнэ
      alert('Амжилттай бүртгүүллээ! Одоо нэвтэрнэ үү.');
      router.push('/auth/login');

    } catch (err: any) {
      setError(err.message || 'Сервертэй холбогдохгүй байна');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-4">
      <div className="bg-white/90 backdrop-blur-sm p-10 rounded-3xl shadow-2xl w-full max-w-lg border border-purple-100">

        <div className="text-center mb-8">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Brainova Quiz
          </h1>
          <p className="text-xl text-gray-600 mt-2">Шинэ хэрэглэгч бүртгүүлэх</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">

          {/* Нэр */}
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">
              Таны нэр <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Жишээ: Бат-Эрдэнэ"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none text-lg transition"
              required
            />
          </div>

          {/* И-мэйл */}
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">
              И-мэйл хаяг <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="name@gmail.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none text-lg transition"
              required
            />
          </div>

          {/* Нууц үг */}
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">
              Нууц үг <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none text-lg transition"
              required
            />
          </div>

          {/* Нууц үг давтах */}
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">
              Нууц үгээ давтан оруулна уу <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none text-lg transition"
              required
            />
          </div>

          {/* Хэрэглэгчийн төрөл */}
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              Та хэн бэ? <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center justify-center p-6 border-4 border-indigo-200 rounded-2xl cursor-pointer hover:border-indigo-500 transition has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50">
                <input
                  type="radio"
                  name="userType"
                  value="student"
                  checked={userType === 'student'}
                  onChange={() => setUserType('student')}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="text-5xl mb-3">Student</div>
                  <div className="text-xl font-bold text-indigo-700">Сурагч</div>
                </div>
              </label>

              <label className="flex items-center justify-center p-6 border-4 border-emerald-200 rounded-2xl cursor-pointer hover:border-emerald-500 transition has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50">
                <input
                  type="radio"
                  name="userType"
                  value="teacher"
                  checked={userType === 'teacher'}
                  onChange={() => setUserType('teacher')}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="text-5xl mb-3">Teacher</div>
                  <div className="text-xl font-bold text-emerald-700">Багш</div>
                </div>
              </label>
            </div>
          </div>

          {/* Бүртгүүлэх товч */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-2xl font-extrabold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Бүртгэж байна...' : 'Бүртгүүлэх'}
          </button>
        </form>

        <div className="text-center mt-8">
          <p className="text-gray-600">
            Аль хэдийн бүртгэлтэй юу?{' '}
            <button
              onClick={() => router.push('/auth/login')}
              className="text-purple-600 font-bold hover:underline"
            >
              Нэвтрэх
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}