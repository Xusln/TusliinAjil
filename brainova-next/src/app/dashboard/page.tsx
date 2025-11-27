// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

async function getCSRFToken(): Promise<string> {
  const res = await fetch('http://localhost:8000/api/auth/csrf/', { credentials: 'include' });
  const data = await res.json();
  return data.csrfToken || '';
}

export default function Dashboard() {
  const [userType, setUserType] = useState<'teacher' | 'student' | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentView, setCurrentView] = useState<'categories' | 'quiz' | 'result' | 'add-question'>('categories');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [addingQuestion, setAddingQuestion] = useState(false);

  // Шинэ асуулт нэмэх форм
  const [newQuestion, setNewQuestion] = useState({
    category: '',
    question: '',
    answer: '',
    points: '10'
  });

  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/api/auth/logout/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-CSRFToken': await getCSRFToken() }
      });
    } catch {}
    localStorage.removeItem('userType');
    router.push('/auth/login');
  };

  useEffect(() => {
    const init = async () => {
      const saved = localStorage.getItem('userType');
      if (!saved || !['teacher', 'student'].includes(saved)) {
        return router.push('/auth/login');
      }
      setUserType(saved as 'teacher' | 'student');

      try {
        const [catsRes, qsRes] = await Promise.all([
          fetch('http://localhost:8000/api/categories/', { credentials: 'include' }),
          fetch('http://localhost:8000/api/questions/', { credentials: 'include' })
        ]);

        if (!catsRes.ok || !qsRes.ok) throw new Error();

        const cats = await catsRes.json();
        const qs = await qsRes.json();

        setCategories(cats);
        setQuestions(qs);
      } catch {
        localStorage.removeItem('userType');
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  // Шалгалт дуусгах
  const submitQuiz = async () => {
    if (Object.keys(answers).length === 0) return alert('Ядаж нэг асуултад хариулна уу!');

    setSubmitting(true);

    const csrfToken = await getCSRFToken();

    try {
      const promises = Object.entries(answers).map(([qid, ans]) =>
        fetch('http://localhost:8000/api/results/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
          },
          credentials: 'include',
          body: JSON.stringify({
            question: Number(qid),
            selected_answer: ans.trim(),
          }),
        }).then(async r => {
          const data = await r.json();
          if (!r.ok) throw new Error(data.detail || 'Алдаа гарлаа');
          return data;
        })
      );

      const results = await Promise.all(promises);

      const correct = results.filter(r => r.is_correct).length;
      const totalQuestions = questions.filter(q => q.category_name === selectedCategory).length;
      const totalPoints = results.reduce((s, r) => s + (Number(r.points_earned) || 0), 0);

      setResult({
        correct,
        totalQuestions,
        percentage: totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0,
        totalPoints,
        details: results.map(r => ({
          ...r,
          questionObj: questions.find(q => q.id === r.question)
        }))
      });

      setCurrentView('result');
    } catch (err: any) {
      alert('Алдаа: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const retryQuiz = () => {
    setAnswers({});
    setResult(null);
    setCurrentView('quiz');
  };

  // ШИНЭ АСУУЛТ НЭМЭХ
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.category || !newQuestion.question.trim() || !newQuestion.answer.trim()) {
      return alert('Бүх талбарыг бөглөнө уу!');
    }

    setAddingQuestion(true);
    try {
      const csrfToken = await getCSRFToken();
      const res = await fetch('http://localhost:8000/api/questions/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({
          category: newQuestion.category, // ID илгээнэ
          question: newQuestion.question.trim(),
          answer: newQuestion.answer.trim(),
          points: Number(newQuestion.points) || 10,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Асуулт нэмэхэд алдаа гарлаа');
      }

      alert('Амжилттай нэмэгдлээ!');

      // Форм цэвэрлэх + шинэчлэх
      setNewQuestion({ category: '', question: '', answer: '', points: '10' });
      setCurrentView('categories');

      // Дахин ачаалж, тоо шинэчлэгдэнэ
      const [catsRes, qsRes] = await Promise.all([
        fetch('http://localhost:8000/api/categories/', { credentials: 'include' }),
        fetch('http://localhost:8000/api/questions/', { credentials: 'include' })
      ]);
      setCategories(await catsRes.json());
      setQuestions(await qsRes.json());

    } catch (err: any) {
      alert('Алдаа: ' + err.message);
    } finally {
      setAddingQuestion(false);
    }
  };

  const currentQuestions = questions.filter(q => q.category_name === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
        <div className="text-4xl font-bold text-purple-700 animate-pulse">Ачаалж байна...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <header className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-10 border border-purple-100">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Brainova Quiz
            </h1>
            <div className="flex items-center gap-6">
              <span className={`px-10 py-4 rounded-full text-white text-xl font-bold shadow-lg ${
                userType === 'teacher' ? 'bg-emerald-600' : 'bg-indigo-600'
              }`}>
                {userType === 'teacher' ? 'БАГШ' : 'СУРАГЧ'}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-2xl font-bold text-xl shadow-lg transition transform hover:scale-105"
              >
                Гарах
              </button>
            </div>
          </div>
        </header>

        {/* БАГШИД ЗОРИУЛСАН ТОВЧ */}
        {userType === 'teacher' && currentView === 'categories' && (
          <div className="text-right mb-10">
            <button
              onClick={() => setCurrentView('add-question')}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-10 py-5 rounded-2xl text-2xl font-bold shadow-2xl transform hover:scale-110 transition"
            >
              + Шинэ асуулт нэмэх
            </button>
          </div>
        )}

        {/* АНГИЛАЛУУД */}
        {currentView === 'categories' && (
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-12 text-gray-800">
              {userType === 'teacher' ? 'Ангилал удирдах • Шалгалт өгөх' : 'Шалгалтын ангилал сонгоно уу'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
              {categories.map(cat => (
                <div
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setAnswers({});
                    setResult(null);
                    setCurrentView('quiz');
                  }}
                  className="bg-white rounded-3xl p-12 text-center shadow-2xl cursor-pointer transform hover:scale-110 hover:shadow-3xl transition-all duration-300 border-4 border-transparent hover:border-purple-400"
                >
                  <h3 className="text-3xl font-bold mb-6 text-gray-800">{cat.name}</h3>
                  <div className="text-6xl font-extrabold text-purple-600 mb-2">
                    {cat.question_count || 0}
                  </div>
                  <p className="text-xl text-gray-600">асуулт</p>
                  <p className="text-lg text-green-600 font-semibold mt-4">{cat.total_points || 0} оноо</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* КВИЗ */}
        {currentView === 'quiz' && (
          <div>
            <button
              onClick={() => setCurrentView('categories')}
              className="mb-8 text-indigo-600 hover:text-indigo-800 font-bold text-xl"
            >
              ← Буцах
            </button>

            <h2 className="text-5xl font-extrabold text-center mb-12 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {selectedCategory}
            </h2>

            <p className="text-center text-xl text-gray-700 mb-10">
              Нийт <strong className="text-purple-600">{currentQuestions.length}</strong> асуулт
            </p>

            <div className="space-y-12 max-w-5xl mx-auto">
              {currentQuestions.map((q, i) => (
                <div key={q.id} className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-purple-100">
                  <div className="flex justify-between items-center mb-8">
                    <span className="text-2xl font-bold text-purple-600 bg-purple-100 px-6 py-3 rounded-full">
                      Асуулт {i + 1}
                    </span>
                    <span className="text-3xl font-extrabold text-green-600">{q.points} оноо</span>
                  </div>
                  <p className="text-2xl font-medium text-gray-800 mb-8">{q.question}</p>
                  <input
                    type="text"
                    placeholder="Хариултаа энд бичнэ үү..."
                    value={answers[q.id] || ''}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                    className="w-full px-8 py-5 text-xl border-4 border-gray-300 rounded-2xl focus:border-purple-500 outline-none transition"
                  />
                </div>
              ))}
            </div>

            <div className="text-center mt-16">
              <button
                onClick={submitQuiz}
                disabled={submitting}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-24 py-10 rounded-3xl text-4xl font-extrabold shadow-2xl transform hover:scale-110 transition disabled:opacity-50"
              >
                {submitting ? 'Боловсруулж байна...' : 'Дуусгах → Үр дүнг харах'}
              </button>
            </div>
          </div>
        )}

        {/* ҮР ДҮН */}
        {currentView === 'result' && result && (
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-7xl font-extrabold mb-16 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Таны үр дүн
            </h2>
            <div className="bg-white rounded-3xl shadow-3xl p-20 mb-16 border-8 border-purple-200">
              <div className="text-9xl font-extrabold mb-8"
                style={{ color: result.percentage >= 80 ? '#10b981' : result.percentage >= 60 ? '#f59e0b' : '#ef4444' }}>
                {result.percentage}%
              </div>
              <p className="text-5xl mb-8 text-gray-700">
                <strong className="text-purple-600">{result.correct}</strong> зөв / {result.totalQuestions} асуултаас
              </p>
              <p className="text-7xl font-extrabold text-green-600">
                +{result.totalPoints} оноо
              </p>
            </div>

            <h3 className="text-4xl font-bold mb-10">Нарийвчилсан хариулт</h3>
            <div className="space-y-8">
              {result.details.map((r: any) => (
                <div key={r.question} className={`p-10 rounded-3xl shadow-xl border-4 text-left ${
                  r.is_correct ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'
                }`}>
                  <p className="text-2xl font-bold mb-4">{r.questionObj?.question}</p>
                  <p className="text-xl">
                    Таны хариулт: <code className="bg-gray-200 px-4 py-2 rounded">{r.selected_answer}</code>
                  </p>
                  {!r.is_correct && (
                    <p className="text-xl font-bold text-red-600 mt-4">
                      Зөв хариулт: {r.correct_answer}
                    </p>
                  )}
                  {r.is_correct && <p className="text-2xl font-bold text-green-600 mt-4">ЗӨВ!</p>}
                </div>
              ))}
            </div>

            <button
              onClick={retryQuiz}
              className="mt-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-32 py-12 rounded-3xl text-5xl font-extrabold shadow-3xl transform hover:scale-110 transition"
            >
              Дахин оролдох
            </button>
          </div>
        )}

        {/* ШИНЭ АСУУЛТ НЭМЭХ ФОРМ — DROPDOWN-ТОЙ */}
        {currentView === 'add-question' && userType === 'teacher' && (
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setCurrentView('categories')}
              className="mb-8 text-indigo-600 hover:text-indigo-800 font-bold text-xl flex items-center gap-2"
            >
              ← Буцах
            </button>

            <div className="bg-white rounded-3xl shadow-3xl p-16 border-8 border-emerald-200">
              <h2 className="text-5xl font-extrabold text-center mb-16 text-emerald-700">
                Шинэ асуулт нэмэх
              </h2>

              <form onSubmit={handleAddQuestion} className="space-y-12">
                {/* АНГИЛАЛ DROPDOWN */}
                <div>
                  <label className="block text-2xl font-bold text-gray-700 mb-4">
                    Ангилал сонгоно уу <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newQuestion.category}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-8 py-5 text-xl border-4 border-gray-300 rounded-2xl focus:border-emerald-600 outline-none bg-white"
                    required
                  >
                    <option value="">— Сонгоно уу —</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* АСУУЛТ */}
                <div>
                  <label className="block text-2xl font-bold text-gray-700 mb-4">
                    Асуулт <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="Асуултаа энд бичнэ үү..."
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                    rows={4}
                    className="w-full px-8 py-6 text-xl border-4 border-gray-300 rounded-2xl focus:border-emerald-600 outline-none resize-none"
                    required
                  />
                </div>

                {/* ХАРИУЛТ */}
                <div>
                  <label className="block text-2xl font-bold text-gray-700 mb-4">
                    Зөв хариулт <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Зөв хариултаа энд бичнэ үү"
                    value={newQuestion.answer}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, answer: e.target.value }))}
                    className="w-full px-8 py-6 text-xl border-4 border-gray-300 rounded-2xl focus:border-emerald-600 outline-none"
                    required
                  />
                </div>

                {/* ОНОО */}
                <div>
                  <label className="block text-2xl font-bold text-gray-700 mb-4">Оноо (заавал биш)</label>
                  <input
                    type="number"
                    value={newQuestion.points}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, points: e.target.value }))}
                    className="w-full px-8 py-6 text-xl border-4 border-gray-300 rounded-2xl focus:border-emerald-600 outline-none"
                    min="1"
                    placeholder="10"
                  />
                </div>

                <div className="text-center pt-8">
                  <button
                    type="submit"
                    disabled={addingQuestion}
                    className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white px-32 py-12 rounded-3xl text-4xl font-extrabold shadow-3xl transform hover:scale-110 transition disabled:opacity-60"
                  >
                    {addingQuestion ? 'Нэмж байна...' : 'Асуулт нэмэх'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}