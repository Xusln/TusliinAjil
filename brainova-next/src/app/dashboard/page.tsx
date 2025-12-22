'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

async function getCSRFToken(): Promise<string> {
  const res = await fetch('http://localhost:8000/api/auth/csrf/', { credentials: 'include' });
  const data = await res.json();
  return data.csrfToken || '';
}

type Subject = {
  id: number;
  name: string;
  question_count?: number;
  total_points?: number;
};

type Grade = {
  id: number;
  number: number;
  subjects: Subject[];
};

type Question = {
  id: number;
  grade: number;
  subject: number;
  question: string;
  answer: string;
  points: number;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
};

type CurrentUser = {
  id: number;
  username: string;
  user_type: 'teacher' | 'student';
  taught_grades: { id: number; number: number }[];
  taught_subjects: { id: number; name: string }[];
};


export function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  const startValue = useRef(0); // энэ нь зөв

  useEffect(() => {
    const start = startValue.current;
    const end = target;
    const startTime = performance.now();

    function animate(time: number) {
      const progress = Math.min((time - startTime) / duration, 1);
      const current = Math.floor(start + (end - start) * progress);
      setValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        startValue.current = end;
      }
    }

    requestAnimationFrame(animate);
  }, [target, duration]);

  return value;
}


export default function Dashboard() {
  const [userType, setUserType] = useState<'teacher' | 'student' | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentView, setCurrentView] = useState<'grades' | 'subjects' | 'quiz' | 'result' | 'add-question'>('grades');
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<{ 
  student_id: number; 
  student_name: string; 
  total_points: number 
}[]>([]);
  const [newQuestion, setNewQuestion] = useState({
    grade: '',
    subject: '',
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    answer: '',
    points: '10'
  });

  const router = useRouter();

  const fetchLeaderboard = async () => {
  try {
    const res = await fetch('http://localhost:8000/api/leaderboard/', { credentials: 'include' });
    if (!res.ok) throw new Error('Leaderboard ачаалж чадсангүй');
    const data = await res.json();
    setLeaderboard(data.slice(0, 10)); // Top 10
  } catch (err) {
    console.error(err);
  }
};

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

  const fetchData = async () => {
    try {
      const userData = await api.getCurrentUser();
      setCurrentUser(userData);
      setUserType(userData.user_type);

      const [gradesRes, qsRes] = await Promise.all([
        fetch('http://localhost:8000/api/grades/', { credentials: 'include' }),
        fetch('http://localhost:8000/api/questions/', { credentials: 'include' })
      ]);

      if (!gradesRes.ok || !qsRes.ok) throw new Error();

      const gradesData: Grade[] = await gradesRes.json();
      const qsData: Question[] = await qsRes.json();

      setGrades(gradesData);
      setQuestions(qsData);
    } catch {
      localStorage.removeItem('userType');
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('userType');
    if (!saved || !['teacher', 'student'].includes(saved)) {
      return router.push('/auth/login');
    }
    fetchData();
  }, [router]);

  const submitQuiz = async () => {
    setShowLeaderboard(false);
    if (Object.keys(answers).length === 0) return alert('Ядаж нэг асуултад хариулна уу!');
    setSubmitting(true);

    try {
      const csrfToken = await getCSRFToken();
      const promises = Object.entries(answers).map(([qid, ans]) =>
        fetch('http://localhost:8000/api/results/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
          credentials: 'include',
          body: JSON.stringify({ question: Number(qid), selected_answer: ans.trim() })
        }).then(async r => {
          const data = await r.json();
          if (!r.ok) throw new Error(data.detail || 'Алдаа гарлаа');
          return data;
        })
      );

      const results = await Promise.all(promises);
      const correct = results.filter(r => r.is_correct).length;
      const totalQuestions = questions.filter(q => q.subject === selectedSubject).length;
      const totalPoints = results.reduce((s, r) => s + (Number(r.points_earned) || 0), 0);

      setResult({
        correct,
        totalQuestions,
        percentage: totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0,
        totalPoints,
        details: results.map(r => ({ ...r, questionObj: questions.find(q => q.id === r.question) }))
      });
      setCurrentView('result');
      await fetchTotalPoints();
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

  const handleAddQuestion = async (e: React.FormEvent) => {
  e.preventDefault();
    setShowLeaderboard(false);
  // ШИНЭ ШАЛГАЛТ: grade, subject заавал бөглөгдсөн байх
  if (!newQuestion.grade || !newQuestion.subject) {
    return alert('Анги болон хичээлээ сонгоно уу!');
  }

  if (!newQuestion.question.trim()) {
    return alert('Асуултын текстийг оруулна уу!');
  }

  if (!newQuestion.option_a.trim() || !newQuestion.option_b.trim()) {
    return alert('Хамгийн багадаа A, B сонголтыг оруулна уу!');
  }

  if (!newQuestion.answer) {
    return alert('Зөв хариултаа сонгоно уу!');
  }

  setAddingQuestion(true);

  try {
    const csrfToken = await getCSRFToken();

    const payload = {
      grade: Number(newQuestion.grade),     // зөв ID (тоо)
      subject: Number(newQuestion.subject), // зөв ID (тоо)
      question: newQuestion.question.trim(),
      answer: newQuestion.answer,
      points: Number(newQuestion.points) || 10,
      option_a: newQuestion.option_a.trim(),
      option_b: newQuestion.option_b.trim(),
      option_c: newQuestion.option_c?.trim() || '',
      option_d: newQuestion.option_d?.trim() || '',
    };

    console.log('Илгээж буй payload:', payload); // debug

    const res = await fetch("http://localhost:8000/api/questions/", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || 'Асуулт нэмэхэд алдаа гарлаа');
    }

    alert("Амжилттай нэмэгдлээ! 🎉");
    setNewQuestion({
      grade: '',
      subject: '',
      question: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      answer: '',
      points: '10'
    });
    await fetchData();
    setCurrentView("grades");

  } catch (err: any) {
    alert("Алдаа: " + err.message);
  } finally {
    setAddingQuestion(false);
  }
};
const [totalPoints, setTotalPoints] = useState<number>(0);
useEffect(() => {
  if (userType === 'student') {
    fetchTotalPoints();
  }
}, [userType]);
const fetchTotalPoints = async () => {
  if (userType !== 'student') return;

  try {
    const res = await fetch(
      'http://localhost:8000/api/student/total-points/',
      { credentials: 'include' }
    );

    if (res.ok) {
      const data = await res.json();
      setTotalPoints(data.total_points);
    }
  } catch (err) {
    console.error('Нийт оноо шинэчилж чадсангүй', err);
  }
};
  const animatedPoints = useCountUp(totalPoints, 700);
  const currentQuestions = questions.filter(q => q.subject === selectedSubject);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-purple-600 mx-auto mb-6"></div>
        <p className="text-3xl font-bold text-purple-800">Ачаалж байна...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 py-8 px-4 relative">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
<header className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-12 border border-purple-100 flex justify-between items-center sticky top-4 z-40">
  <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
    Brainova Quiz
  </h1>
  <div className="flex items-center gap-10">
  <div className="text-right">
    <p className="text-2xl font-bold text-gray-800">{currentUser?.username || 'Хэрэглэгч'}</p>
    <p className="text-xl text-gray-600">{userType === 'teacher' ? 'Багш' : ''}</p>

    {userType === 'student' && (
      <div className="mt-3 flex items-center justify-end gap-3">
        <span className="text-lg text-gray-600">Нийт оноо:</span>
        <span className="text-3xl font-extrabold text-yellow-600">
  {animatedPoints}
</span>
        <span className="text-2xl">🏆</span>
      </div>
    )}
  </div>

  <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-10 py-5 rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl transition">
    Гарах
  </button>
</div>
</header>
<button
  onClick={() => {
    if (!showLeaderboard) fetchLeaderboard();
    setShowLeaderboard(prev => !prev);
  }}
  className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold shadow-lg"
>
  Leaderboard
</button>
  {showLeaderboard && (
  <div className="mt-10 bg-white rounded-3xl shadow-2xl p-8 border-4 border-yellow-300 max-w-xl mx-auto animate-fadeIn">
    <h2 className="text-4xl font-bold text-center mb-8">Top 10 Сурагч</h2>
    <ol className="list-decimal list-inside space-y-4 text-2xl">
      {leaderboard.map((stu, i) => (
        <li key={i} className="flex justify-between">
          <span>{stu.student_name}</span>
          <span className="font-bold text-yellow-600">{stu.total_points} 🏆</span>
        </li>
      ))}
    </ol>
  </div>
)}
        {/* GRADES VIEW */}
        {currentView === 'grades' && (
          <div className="animate-fadeIn">
            <h2 className="text-5xl font-extrabold text-center mb-12 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {userType === 'teacher' ? 'Миний хариуцдаг хичээлүүд' : 'Анги сонгоно уу'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {grades.map((grade: Grade) => {
                const visibleSubjects = userType === 'teacher' && currentUser
                  ? grade.subjects.filter(sub => 
                      currentUser.taught_subjects.some(ts => ts.id === sub.id)
                    )
                  : grade.subjects;

                if (userType === 'teacher' && visibleSubjects.length === 0) return null;

                return (
                  <div key={grade.id} className="bg-white rounded-3xl p-12 shadow-2xl border-4 border-purple-200 hover:border-purple-400 transition-all hover:scale-105">
                    <h3 className="text-5xl font-extrabold text-center mb-10 text-purple-700">
                      {grade.number}-р анги
                    </h3>
                    <p className="text-2xl text-center text-gray-700 mb-10">
                      {visibleSubjects.length} хичээл
                    </p>

                    <div className="space-y-6">
                      {visibleSubjects.map((sub: Subject) => (
                        <div
                          key={sub.id}
                          onClick={() => {
                            setSelectedGrade(grade.id);
                            setSelectedSubject(sub.id);
                            setCurrentView('quiz');
                            setAnswers({});
                            setResult(null);
                          }}
                          className="bg-gradient-to-r from-emerald-100 to-teal-100 p-10 rounded-3xl cursor-pointer hover:scale-105 transition-all shadow-xl text-center border-4 border-emerald-200 hover:border-emerald-500"
                        >
                          <h4 className="text-3xl font-bold text-emerald-800 mb-4">{sub.name}</h4>
                          <div className="flex justify-center gap-8 text-xl">
                            <span className="text-gray-700">{sub.question_count || 0} асуулт</span>
                            <span className="text-green-600 font-bold">{sub.total_points || 0} оноо</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* QUIZ VIEW - ТЕСТ МАЯГИЙН АСУУЛТ (2-4 СОНГОЛТТОЙ) */}
        {currentView === 'quiz' && selectedSubject && (
          <div className="animate-fadeIn max-w-5xl mx-auto">
            <button onClick={() => setCurrentView('grades')} className="mb-10 text-indigo-600 font-bold text-2xl hover:underline">← Буцах</button>
            <h2 className="text-5xl font-extrabold text-center mb-16 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {grades.find(g => g.id === selectedGrade)?.subjects.find(s => s.id === selectedSubject)?.name}
            </h2>

            <div className="space-y-16">
              {currentQuestions.map((q, i) => (
                <div key={q.id} className="bg-white rounded-3xl shadow-2xl p-12 border-4 border-purple-200">
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="text-4xl font-bold text-purple-700">Асуулт {i + 1}</h3>
                    <span className="bg-green-100 text-green-800 px-8 py-4 rounded-full text-3xl font-bold">
                      {q.points} оноо
                    </span>
                  </div>
                  <p className="text-3xl text-gray-800 mb-12 leading-relaxed">{q.question}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {['A', 'B', 'C', 'D'].map(letter => {
                      const option = q[`option_${letter.toLowerCase()}` as keyof Question] as string | undefined;
                      if (!option || !option.trim()) return null;

                      return (
                        <button
                          key={letter}
                          onClick={() => userType === 'student' && setAnswers(prev => ({ ...prev, [q.id]: letter }))}
                          disabled={userType === 'teacher'}
                          className={`p-12 rounded-3xl text-3xl font-bold transition-all shadow-2xl border-4 ${
                            answers[q.id] === letter
                              ? 'bg-purple-600 text-white scale-105 border-purple-700'
                              : 'bg-white border-purple-300 hover:bg-purple-50 hover:border-purple-500 hover:scale-105'
                          } ${userType === 'teacher' ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                        >
                          <span className="text-4xl mr-8">{letter}</span> {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {userType === 'student' && (
              <div className="text-center mt-20">
                <button
                  onClick={submitQuiz}
                  disabled={submitting}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-20 py-10 rounded-3xl text-4xl font-extrabold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all disabled:opacity-70"
                >
                  {submitting ? 'Боловсруулж байна...' : 'Quiz дуусгах'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* RESULT VIEW */}
        {currentView === 'result' && result && (
          <div className="animate-fadeIn max-w-5xl mx-auto">
            <h2 className="text-6xl font-extrabold text-center mb-16 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Таны үр дүн
            </h2>

            <div className="bg-white rounded-3xl shadow-2xl p-16 mb-16 text-center border-4 border-purple-200">
              <p className="text-5xl mb-8">Зөв хариулт: <span className="text-green-600 font-extrabold">{result.correct}/{result.totalQuestions}</span></p>
              <p className="text-5xl mb-8">Нийт оноо: <span className="text-blue-600 font-extrabold">{result.totalPoints}</span></p>
              <p className="text-4xl">Хувь: <span className="font-extrabold text-purple-600">{result.percentage}%</span></p>
            </div>

            <div className="space-y-10">
              {result.details.map((item: any, index: number) => (
                <div key={index} className={`bg-white p-10 rounded-3xl shadow-2xl border-l-8 ${item.is_correct ? 'border-green-500' : 'border-red-500'}`}>
                  <h3 className="text-3xl font-bold mb-6">Асуулт {index + 1}</h3>
                  <p className="text-2xl mb-4"><strong>Асуулт:</strong> {item.questionObj?.question}</p>
                  <p className="text-2xl mb-4"><strong>Таны хариулт:</strong> {item.selected_answer || '(хоосон)'}</p>
                  <p className="text-2xl mb-6"><strong>Зөв хариулт:</strong> {item.questionObj?.answer}</p>
                  <p className={`text-3xl font-bold ${item.is_correct ? 'text-green-600' : 'text-red-600'}`}>
                    {item.is_correct ? '✅ ЗӨВ' : '❌ БУРУУ'} — {item.points_earned} оноо
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center mt-16">
              <button onClick={retryQuiz} className="bg-green-600 hover:bg-green-700 text-white px-20 py-10 rounded-3xl text-4xl font-extrabold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition">
                Дахин оролдох
              </button>
            </div>
          </div>
        )}

        {/* ADD QUESTION - 2-4 СОНГОЛТТОЙ БОЛНО */}
        {currentView === 'add-question' && userType === 'teacher' && currentUser && (
          <div className="animate-fadeIn max-w-5xl mx-auto">
            <button onClick={() => setCurrentView('grades')} className="mb-10 text-indigo-600 font-bold text-2xl hover:underline">← Буцах</button>
            <form onSubmit={handleAddQuestion} className="bg-white rounded-3xl p-16 shadow-2xl border-4 border-emerald-300">
              <h2 className="text-6xl font-extrabold text-center mb-16 text-emerald-800">Шинэ тест асуулт нэмэх</h2>

              {/* Анги, хичээл сонгох */}
              <div className="mb-16">
                <label className="block text-3xl font-bold mb-10 text-emerald-800">Хариуцдаг хичээлээсээ сонгоно уу</label>
                {currentUser.taught_grades.length === 0 ? (
                  <p className="text-red-600 text-3xl text-center">Та ямар ч анги хариуцдаггүй байна.</p>
                ) : (
                  <div className="space-y-12">
                    {currentUser.taught_grades.map((tg: any) => {
                      const grade = grades.find(g => g.id === tg.id);
                      if (!grade) return null;

                      const mySubjects = grade.subjects.filter(sub =>
                        currentUser.taught_subjects.some(ts => ts.id === sub.id)
                      );

                      if (mySubjects.length === 0) return null;

                      return (
                        <div key={tg.id} className="bg-emerald-50 p-12 rounded-3xl border-4 border-emerald-300">
                          <h3 className="text-4xl font-bold text-emerald-800 mb-8 text-center">{tg.number}-р анги</h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                            {mySubjects.map(sub => (
                              <button
                                type="button"
                                key={sub.id}
                                onClick={() => setNewQuestion(prev => ({
                                  ...prev,
                                  grade: tg.id.toString(),
                                  subject: sub.id.toString()
                                }))}
                                className={`p-10 rounded-3xl font-bold text-3xl transition-all shadow-2xl ${
                                  newQuestion.subject === sub.id.toString()
                                    ? 'bg-emerald-600 text-white scale-110'
                                    : 'bg-white border-4 border-emerald-400 hover:bg-emerald-100 hover:scale-105'
                                }`}
                              >
                                {sub.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <textarea
                value={newQuestion.question}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                placeholder="Асуултын текст (жишээ: Монголын нийслэл хаана байдаг вэ?)"
                required
                className="w-full p-10 text-2xl border-4 rounded-3xl h-64 mb-12 focus:border-emerald-600 transition"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                <div>
                  <label className="block text-2xl font-semibold mb-4 text-emerald-700">A сонголт <span className="text-red-500">*</span></label>
                  <input
                    value={newQuestion.option_a}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, option_a: e.target.value }))}
                    placeholder="A) Улаанбаатар"
                    required
                    className="w-full p-8 text-xl border-4 rounded-2xl focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-2xl font-semibold mb-4 text-emerald-700">B сонголт <span className="text-red-500">*</span></label>
                  <input
                    value={newQuestion.option_b}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, option_b: e.target.value }))}
                    placeholder="B) Дархан"
                    required
                    className="w-full p-8 text-xl border-4 rounded-2xl focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-2xl font-semibold mb-4 text-emerald-700">C сонголт</label>
                  <input
                    value={newQuestion.option_c}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, option_c: e.target.value }))}
                    placeholder="C) Эрдэнэт (заавал биш)"
                    className="w-full p-8 text-xl border-4 rounded-2xl focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-2xl font-semibold mb-4 text-emerald-700">D сонголт</label>
                  <input
                    value={newQuestion.option_d}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, option_d: e.target.value }))}
                    placeholder="D) Чойбалсан (заавал биш)"
                    className="w-full p-8 text-xl border-4 rounded-2xl focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* ЗӨВ ХАРИУЛТ СОНГОХ - ЗӨВХӨН БАГШИД */}
              <div className="mb-20">
                <label className="block text-3xl font-bold mb-8 text-emerald-800">Зөв хариулт сонгоно уу</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {['A', 'B', 'C', 'D'].map(letter => {
                    const hasOption = newQuestion[`option_${letter.toLowerCase()}` as keyof typeof newQuestion]?.trim();
                    return (
                      <button
                        type="button"
                        key={letter}
                        disabled={!hasOption}
                        onClick={() => hasOption && setNewQuestion(prev => ({ ...prev, answer: letter }))}
                        className={`p-12 rounded-3xl text-4xl font-bold transition-all shadow-2xl ${
                          newQuestion.answer === letter
                            ? 'bg-emerald-600 text-white scale-110'
                            : hasOption
                              ? 'bg-white border-4 border-emerald-400 hover:bg-emerald-100 hover:scale-105'
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-60'
                        }`}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>
              </div>

              <input
                value={newQuestion.points}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, points: e.target.value }))}
                type="number"
                placeholder="Оноо (жишээ: 10)"
                className="w-full p-10 text-2xl border-4 rounded-3xl mb-20 focus:border-emerald-600"
              />

              <div className="text-center">
                <button
                  type="submit"
                  disabled={addingQuestion}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white px-32 py-12 rounded-3xl font-extrabold text-5xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all"
                >
                  {addingQuestion ? 'Нэмж байна...' : 'Асуулт нэмэх'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* FLOATING + BUTTON */}
        {userType === 'teacher' && currentView !== 'add-question' && (
          <button
            onClick={() => setCurrentView('add-question')}
            className="fixed bottom-10 right-10 bg-emerald-600 hover:bg-emerald-700 text-white w-20 h-20 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all flex items-center justify-center text-6xl font-bold z-50"
          >
            +
          </button>
        )}

      </div>
    </div>
  );
}