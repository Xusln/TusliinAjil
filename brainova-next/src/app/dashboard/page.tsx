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
  const router = useRouter();

  useEffect(() => {
    const type = localStorage.getItem('userType') as 'teacher' | 'student' | null;
    if (!type) {
      router.push('/auth/login');
      return;
    }
    setUserType(type);

    Promise.all([api.getCategories(), api.getQuestions()])
      .then(([cats, qs]) => {
        setCategories(cats);
        setQuestions(qs);
        setLoading(false);
      })
      .catch(() => {
        alert('Сервертэй холбогдохгүй байна');
        setLoading(false);
      });
  }, [router]);

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const data = {
      category: form.category.value,
      question: form.question.value,
      answer: form.answer.value,
      points: parseInt(form.points.value),
    };
    try {
      await api.addQuestion(data);
      setCurrentView('categories');
      const qs = await api.getQuestions();
      setQuestions(qs);
    } catch (err: any) {
      alert(err.message || 'Асуулт нэмэхэд алдаа гарлаа');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Ачаалж байна...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="bg-white p-4 rounded-lg shadow mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Brainova Quiz</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              {userType === 'teacher' ? 'Багш' : 'Сурагч'}
            </span>
            <button
              onClick={async () => {
                await api.logout();
                localStorage.removeItem('userType');
                router.push('/auth/login');
              }}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Гарах
            </button>
          </div>
        </header>

        {/* Categories View */}
        {currentView === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Ангилал сонгоно уу</h2>
              {userType === 'teacher' && (
                <button
                  onClick={() => setCurrentView('add')}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                  + Шинэ асуулт
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categories.length === 0 ? (
                <p className="text-gray-500 col-span-3 text-center">Ангилал байхгүй</p>
              ) : (
                categories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      setCurrentView('quiz');
                    }}
                    className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition cursor-pointer text-center"
                  >
                    <h3 className="text-lg font-bold text-gray-800">{cat.name}</h3>
                    <p className="text-sm text-gray-600 mt-2">
                      {cat.question_count} асуулт
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Quiz View */}
        {currentView === 'quiz' && (
          <div>
            <button
              onClick={() => setCurrentView('categories')}
              className="mb-4 text-blue-600 hover:underline flex items-center gap-1"
            >
              ← Буцах
            </button>
            <h2 className="text-xl font-semibold mb-4">{selectedCategory}</h2>

            <div className="space-y-4">
              {questions
                .filter((q) => q.category_name === selectedCategory)
                .map((q) => (
                  <div key={q.id} className="bg-white p-5 rounded-lg shadow">
                    <p className="font-medium text-gray-800">{q.question}</p>
                    {userType === 'teacher' && (
                      <div className="mt-3 text-sm text-gray-600">
                        <span className="font-medium">Хариулт:</span> {q.answer} |{' '}
                        <span className="font-medium">Оноо:</span>{' '}
                        <span className="text-green-600 font-bold">{q.points}</span>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Add Question View */}
        {currentView === 'add' && userType === 'teacher' && (
          <div>
            <button
              onClick={() => setCurrentView('categories')}
              className="mb-4 text-blue-600 hover:underline flex items-center gap-1"
            >
              ← Буцах
            </button>
            <h2 className="text-xl font-semibold mb-4">Шинэ асуулт нэмэх</h2>

            <form onSubmit={handleAddQuestion} className="bg-white p-6 rounded-lg shadow space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ангилал</label>
                <select
                  name="category"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Сонгоно уу</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Асуулт</label>
                <input
                  name="question"
                  placeholder="Жишээ: Монгол улсын нийслэл юу вэ?"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Хариулт</label>
                <input
                  name="answer"
                  placeholder="Жишээ: Улаанбаатар"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Оноо</label>
                <input
                  name="points"
                  type="number"
                  defaultValue={5}
                  min={1}
                  max={100}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Асуулт нэмэх
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}