'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api'; // Таны өмнө үүсгэсэн api.ts

export default function Register() {
  const [username, setUsername] = useState(''); // email
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [userType, setUserType] = useState<'student' | 'teacher'>('student');

  // Багшийн нэмэлт талбарууд
  const [grades, setGrades] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedGradeId, setSelectedGradeId] = useState<string>('');
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const router = useRouter();

  // Анги, хичээлүүдийг ачаалах (public endpoint)
 useEffect(() => {
  const loadData = async () => {
    setLoadingData(true);
    try {
      // api.ts ашиглан ачаална
      const gradesData = await api.getGrades();
      setGrades(gradesData);
      console.log('Ачаалагдсан ангиуд:', gradesData);
      const subjectsData = await api.getSubjects();
      setSubjects(subjectsData);
      console.log('Ачаалагдсан хичээлүүд:', subjectsData);
    } catch (err: any) {
      console.error('Өгөгдөл ачааллахад алдаа:', err);
      setError('Анги, хичээлийг ачаалж чадсангүй. Сервер ажиллаж байгаа эсэхийг шалгана уу.');
    } finally {
      setLoadingData(false);
    }
  };

  loadData();
}, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Ерөнхий шалгалт
    if (!username || !password || !fullName) {
      return setError('Бүх үндсэн талбарыг бөглөнө үү!');
    }
    if (password !== confirmPassword) {
      return setError('Нууц үг таарахгүй байна!');
    }
    if (password.length < 6) {
      return setError('Нууц үг дор хаяж 6 тэмдэгт байх ёстой!');
    }
    if (!username.includes('@')) {
      return setError('Зөв и-мэйл хаяг оруулна уу (жишээ: name@gmail.com)');
    }

    // Багшийн хувьд нэмэлт шалгалт
    if (userType === 'teacher') {
      if (!selectedGradeId) {
        return setError('Багш бол анги заавал сонгоно уу!');
      }
      if (selectedSubjectIds.length === 0) {
        return setError('Багш бол дор хаяж 1 хичээл сонгоно уу!');
      }
    }

    setLoading(true);

    try {
      await api.register(
        username,
        password,
        userType,
        userType === 'teacher' ? [parseInt(selectedGradeId)] : undefined,
        userType === 'teacher' ? selectedSubjectIds.map(Number) : undefined
      );

      alert('Амжилттай бүртгүүллээ! 🚀');
      router.push('/auth/login');
    } catch (err: any) {
      setError(err.message || 'Бүртгэл амжилтгүй боллоо. Дахин оролдоно уу.');
    } finally {
      setLoading(false);
    }
  };

  // Тухайн ангийн хичээлүүдийг шүүх
  const filteredSubjects = subjects.filter(
    (subject: any) => subject.grade === parseInt(selectedGradeId)
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-4">
      <div className="bg-white/90 backdrop-blur-sm p-10 rounded-3xl shadow-2xl w-full max-w-2xl border border-purple-100 overflow-y-auto max-h-screen">

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

          {/* Таны нэр */}
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
            <div className="grid grid-cols-2 gap-6">
              <label className={`flex flex-col items-center justify-center p-8 border-4 rounded-3xl cursor-pointer transition-all ${
                userType === 'student' 
                  ? 'border-indigo-600 bg-indigo-50 shadow-lg' 
                  : 'border-indigo-200 hover:border-indigo-400'
              }`}>
                <input
                  type="radio"
                  name="userType"
                  value="student"
                  checked={userType === 'student'}
                  onChange={() => setUserType('student')}
                  className="sr-only"
                />
                <div className="text-6xl mb-4">Student</div>
                <div className="text-2xl font-bold text-indigo-700">Сурагч</div>
              </label>

              <label className={`flex flex-col items-center justify-center p-8 border-4 rounded-3xl cursor-pointer transition-all ${
                userType === 'teacher' 
                  ? 'border-emerald-600 bg-emerald-50 shadow-lg' 
                  : 'border-emerald-200 hover:border-emerald-400'
              }`}>
                <input
                  type="radio"
                  name="userType"
                  value="teacher"
                  checked={userType === 'teacher'}
                  onChange={() => setUserType('teacher')}
                  className="sr-only"
                />
                <div className="text-6xl mb-4">Teacher</div>
                <div className="text-2xl font-bold text-emerald-700">Багш</div>
              </label>
            </div>
          </div>

          {/* Багшийн нэмэлт хэсэг */}
          {userType === 'teacher' && (
            <div className="mt-8 p-8 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl border-2 border-emerald-200">
              <h3 className="text-2xl font-bold text-emerald-800 text-center mb-6">
                Та ямар анги, хичээл хариуцдаг вэ?
              </h3>

              {loadingData ? (
                <p className="text-center text-gray-600">Анги, хичээл ачаалж байна...</p>
              ) : (
                <>
                  {/* Анги сонгох */}
                  <div className="mb-6">
                    <label className="block text-lg font-semibold text-gray-800 mb-3">
                      Анги сонгоно уу <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedGradeId}
                      onChange={(e) => {
                        setSelectedGradeId(e.target.value);
                        setSelectedSubjectIds([]); // шинэ анги сонгоход хичээл reset
                      }}
                      className="w-full px-6 py-4 text-lg border-2 border-emerald-300 rounded-xl focus:border-emerald-600 focus:outline-none"
                      required
                    >
                      <option value="">— Анги сонгоно уу —</option>
                      {grades.map((grade) => (
                        <option key={grade.id} value={grade.number}>
                          {grade.number}-р анги
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Хичээл сонгох */}
                  {selectedGradeId && (
                    <div>
                      <label className="block text-lg font-semibold text-gray-800 mb-4">
                        Хичээл сонгоно уу (олон сонгох боломжтой) <span className="text-red-500">*</span>
                      </label>
                      {filteredSubjects.length === 0 ? (
                        <p className="text-orange-600 text-center py-4">Энэ ангид хичээл алга байна.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-64 overflow-y-auto pr-2">
                          {filteredSubjects.map((subject: any) => (
                            <label
                              key={subject.id}
                              className="flex items-center p-4 bg-white border-2 border-emerald-200 rounded-xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition"
                            >
                              <input
                                type="checkbox"
                                value={subject.id}
                                checked={selectedSubjectIds.includes(subject.id.toString())}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedSubjectIds([...selectedSubjectIds, subject.id.toString()]);
                                  } else {
                                    setSelectedSubjectIds(selectedSubjectIds.filter(id => id !== subject.id.toString()));
                                  }
                                }}
                                className="w-6 h-6 text-emerald-600 rounded focus:ring-emerald-500"
                              />
                              <span className="ml-4 text-lg font-medium">{subject.name}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Бүртгүүлэх товч */}
          <button
            type="submit"
            disabled={loading || loadingData}
            className="w-full py-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-2xl font-extrabold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
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