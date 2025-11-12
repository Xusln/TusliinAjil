// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function Dashboard() {
  const [userType, setUserType] = useState<'teacher' | 'student' | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentView, setCurrentView] = useState<'categories' | 'quiz' | 'add'>('categories');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // ЭНД ФУНКЦУУДЫГ БИЧНЭ (useEffect-н өмнө)
  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error('Гарахад алдаа:', err);
    } finally {
      localStorage.removeItem('userType');
      router.push('/auth/login');
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const data = {
      category: form.category.value.trim(),
      question: form.question.value.trim(),
      answer: form.answer.value.trim(),
      points: parseInt(form.points.value),
    };

    if (!data.category || !data.question || !data.answer || data.points < 1) {
      alert('Бүх талбарыг зөв бөглөнө үү');
      return;
    }

    try {
      await api.addQuestion(data);
      alert('Асуулт амжилттай нэмэгдлээ!');
      setCurrentView('categories');
      const qs = await api.getQuestions();
      setQuestions(qs);
    } catch (err: any) {
      alert(err.message || 'Асуулт нэмэхэд алдаа гарлаа');
    }
  };

// src/app/dashboard/page.tsx
useEffect(() => {
  const initAuth = async () => {
    const savedType = localStorage.getItem('userType') as 'teacher' | 'student' | null;

    // 1. localStorage-д userType байхгүй → login руу
    if (!savedType) {
      router.push('/auth/login');
      return;
    }

    // 2. userType байгаа → шууд хэрэглэнэ (сервер шалгахгүй)
    setUserType(savedType);

    try {
      // Мэдээлэл ачаалах (session байгаа бол ажиллана, байхгүй бол алдаа гарна)
      const [cats, qs] = await Promise.all([
        api.getCategories(),
        api.getQuestions(),
      ]);
      setCategories(cats);
      setQuestions(qs);
    } catch (err: any) {
      // Сервер алдаа → хэрэглэгчийг харахыг зөвшөөрнө
      setError(err.message || 'Сервертэй холбогдохгүй байна');
    } finally {
      setLoading(false);
    }
  };

  initAuth();
}, [router]);

  // АЧААЛЖ БАЙГАА
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl font-medium text-gray-700">Ачаалж байна...</div>
      </div>
    );
  }

  // АЛДАА
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-3">Алдаа гарлаа</h2>
          <p className="text-gray-700 mb-5">{error}</p>
          <button
            onClick={() => {
              localStorage.removeItem('userType');
              router.push('/auth/login');
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Дахин нэвтрэх
          </button>
        </div>
      </div>
    );
  }

  // UI — ЭНД `handleLogout`, `handleAddQuestion` ашиглана
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <header className="bg-white p-5 rounded-xl shadow-md mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Brainova Quiz</h1>
          <div className="flex items-center gap-3">
            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
              userType === 'teacher' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {userType === 'teacher' ? 'Багш' : 'Сурагч'}
            </span>
            <button
              onClick={handleLogout} // ЭНД АШИГЛАНА
              className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition transform hover:scale-105"
            >
              Гарах
            </button>
          </div>
        </header>

        {/* АНГИЛАЛ ХАРАХ */}
        {currentView === 'categories' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">Ангилал сонгоно уу</h2>
              {userType === 'teacher' && (
                <button
                  onClick={() => setCurrentView('add')}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition transform hover:scale-105 flex items-center gap-2"
                >
                  Шинэ асуулт
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.length === 0 ? (
                <p className="col-span-full text-center text-gray-500 py-10 text-lg">
                  Ангилал байхгүй. Багш шинээр нэмнэ үү.
                </p>
              ) : (
                categories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      setCurrentView('quiz');
                    }}
                    className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border border-gray-100"
                  >
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{cat.name}</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium">{cat.question_count ?? 0}</span> асуулт</p>
                      <p><span className="font-medium text-green-600">{cat.total_points ?? 0}</span> оноо</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* КВИЗ ХАРАХ */}
        {currentView === 'quiz' && (
          <div>
            <button
              onClick={() => setCurrentView('categories')}
              className="mb-6 text-blue-600 hover:underline flex items-center gap-1 font-medium"
            >
              ← Буцах
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-6">{selectedCategory}</h2>

            <div className="space-y-5">
              {questions
                .filter((q) => q.category_name === selectedCategory)
                .map((q) => (
                  <div key={q.id} className="bg-white p-5 rounded-xl shadow-md border border-gray-100">
                    <p className="font-medium text-gray-800 mb-2">{q.question}</p>
                    {userType === 'teacher' && (
                      <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <span className="font-medium">Хариулт:</span> <span className="text-blue-700">{q.answer}</span> |{' '}
                        <span className="font-medium">Оноо:</span>{' '}
                        <span className="text-green-600 font-bold">{q.points}</span>
                      </div>
                    )}
                  </div>
                ))}

              {questions.filter((q) => q.category_name === selectedCategory).length === 0 && (
                <p className="text-center text-gray-500 py-10">Энд асуулт байхгүй.</p>
              )}
            </div>
          </div>
        )}

        {/* АСУУЛТ НЭМЭХ */}
        {currentView === 'add' && userType === 'teacher' && (
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setCurrentView('categories')}
              className="mb-6 text-blue-600 hover:underline flex items-center gap-1 font-medium"
            >
              ← Буцах
            </button>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-7 text-center">Шинэ асуулт нэмэх</h2>

              <form onSubmit={handleAddQuestion} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ангилал</label>
                  <input name="category" type="text" placeholder="Жишээ: Түүх" required className="w-full px-4 py-3 border rounded-lg" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Асуулт</label>
                  <textarea name="question" placeholder="Жишээ: ..." required rows={3} className="w-full px-4 py-3 border rounded-lg resize-none" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Хариулт</label>
                  <input name="answer" type="text" placeholder="Жишээ: ..." required className="w-full px-4 py-3 border rounded-lg" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Оноо</label>
                  <input name="points" type="number" min="1" max="100" defaultValue={10} required className="w-full px-4 py-3 border rounded-lg" />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3.5 rounded-lg hover:from-green-600 hover:to-green-700 transition transform hover:scale-105 shadow-md"
                >
                  Асуулт нэмэх
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}