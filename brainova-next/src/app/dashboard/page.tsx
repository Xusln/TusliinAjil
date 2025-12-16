// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  number: string | number;
  subjects: Subject[];
};

type Question = {
  id: number;
  grade: number;
  subject: number;
  question: string;
  answer: string;
  points: number;
};

export default function Dashboard() {
  const [userType, setUserType] = useState<'teacher' | 'student' | null>(null);
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

  const [newQuestion, setNewQuestion] = useState({
    grade: '',
    subject: '',
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

  const fetchGradesAndQuestions = async () => {
    try {
      const [gradesRes, qsRes] = await Promise.all([
        fetch('http://localhost:8000/api/grades/', { credentials: 'include' }),
        fetch('http://localhost:8000/api/questions/', { credentials: 'include' })
      ]);
      console.log("RES ",qsRes)
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
    const init = async () => {
      const saved = localStorage.getItem('userType');
      if (!saved || !['teacher', 'student'].includes(saved)) {
        return router.push('/auth/login');
      }
      setUserType(saved as 'teacher' | 'student');
      await fetchGradesAndQuestions();
    };
    init();
  }, [router]);

  const submitQuiz = async () => {
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

  // newQuestion.subject нь Subject ID-г агуулна
const handleAddQuestion = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!newQuestion.grade || !newQuestion.subject || !newQuestion.question.trim() || !newQuestion.answer.trim()) {
    return alert('Бүх талбарыг бөглөнө үү!');
  }

setAddingQuestion(true);

try {
  const csrfToken = await getCSRFToken();

  const payload = {
    grade: Number(newQuestion.grade),
    subject: Number(newQuestion.subject),
    question: newQuestion.question.trim(),
    answer: newQuestion.answer.trim(),
    points: Number(newQuestion.points) || 10,
  };

  console.log("📦 Илгээх өгөгдөл:", payload);

  const res = await fetch("http://localhost:8000/api/questions/", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify(payload),
  });

  console.log("📥 Status:", res.status);

  // ⛔ JSON биш HTML буцааж байвал JSON.parse задрана → error
  const raw = await res.text();
  console.log("📄 Backend Raw Response:", raw);

  if (!res.ok) {
    throw new Error("Server error: " + raw);
  }

  alert("Амжилттай нэмэгдлээ!");
  setNewQuestion({
    grade: "",
    subject: "",
    question: "",
    answer: "",
    points: "10",
  });

  await fetchGradesAndQuestions();
  setCurrentView("grades");

} catch (err: any) {
  console.error("❌ Frontend Error:", err);
  alert("Алдаа: " + err.message);
} finally {
  setAddingQuestion(false);
}

};

  const currentQuestions = questions.filter(q => q.subject === selectedSubject);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-4xl font-bold">Ачаалж байна...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <header className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-10 border border-purple-100 flex justify-between items-center">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Brainova Quiz</h1>
          <div className="flex items-center gap-6">
            <span className={`px-8 py-3 rounded-full text-white font-bold text-xl ${userType === 'teacher' ? 'bg-emerald-600' : 'bg-indigo-600'}`}>{userType === 'teacher' ? 'БАГШ' : 'СУРАГЧ'}</span>
            <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-2xl font-bold">Гарах</button>
          </div>
        </header>

        {/* GRADE-LIST */}
        {currentView === 'grades' && (
          <div>
            <h2 className="text-4xl font-bold mb-8 text-center">Анги сонгоно уу</h2>

            {/* Add Question Button */}
            {userType === 'teacher' && (
              <div className="text-center mb-6">
                <button onClick={() => setCurrentView('add-question')} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold">
                  Шинэ асуулт нэмэх
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {grades.map((grade: Grade) => (
                <div key={grade.id} className="bg-white rounded-3xl p-8 shadow-2xl cursor-pointer transform hover:scale-105 text-center"
                  onClick={() => { setSelectedGrade(grade.id); setCurrentView('subjects'); }}
                >
                  <h3 className="text-3xl font-bold mb-4">Анги {grade.number}</h3>
                  <p className="text-xl text-gray-600">{grade.subjects.length} Ангилал</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUBJECT-LIST */}
        {currentView === 'subjects' && selectedGrade !== null && (
          <div>
            <button onClick={() => setCurrentView('grades')} className="mb-6 text-indigo-600 font-bold">← Буцах</button>
            <h2 className="text-4xl font-bold mb-8 text-center">Анги {grades.find((g: Grade) => g.id === selectedGrade)?.number} - Ангилал сонгоно уу</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {grades.find((g: Grade) => g.id === selectedGrade)?.subjects.map((sub: Subject) => (
                <div key={sub.id} className="bg-white rounded-3xl p-8 shadow-2xl cursor-pointer transform hover:scale-105 text-center"
                  onClick={() => { setSelectedSubject(sub.id); setCurrentView('quiz'); setAnswers({}); setResult(null); }}
                >
                  <h3 className="text-2xl font-bold mb-4">{sub.name}</h3>
                  <p className="text-xl text-gray-600">{sub.question_count || 0} асуулт</p>
                  <p className="text-lg text-green-600 font-semibold mt-2">{sub.total_points || 0} оноо</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QUIZ */}
        {currentView === 'quiz' && (
          <div>
            <button onClick={() => setCurrentView('subjects')} className="mb-8 text-indigo-600 font-bold">← Буцах</button>
            <h2 className="text-4xl font-bold mb-8 text-center">
              {grades.find((g: Grade) => g.id === selectedGrade)?.number} - {grades.find((g: Grade) => g.id === selectedGrade)?.subjects.find((s: Subject) => s.id === selectedSubject)?.name}
            </h2>

            <div className="space-y-12 max-w-5xl mx-auto">
              {currentQuestions.map((q, i) => (
                <div key={q.id} className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-purple-100">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-2xl font-bold text-purple-600">Асуулт {i + 1}</span>
                    <span className="text-xl font-bold text-green-600">{q.points} оноо</span>
                  </div>
                  <p className="text-xl text-gray-800 mb-4">{q.question}</p>
                  <input type="text" value={answers[q.id] || ''} disabled={userType==='teacher'}
                    placeholder={userType==='teacher' ? "Багшийн горим" : "Хариулт"} 
                    onChange={(e)=> setAnswers(prev => ({...prev, [q.id]: e.target.value}))}
                    className="w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-purple-500"
                  />
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <button onClick={submitQuiz} disabled={submitting || userType==='teacher'} className="bg-purple-600 text-white px-10 py-5 rounded-xl text-xl font-bold">
                {submitting ? 'Боловсруулж байна...' : 'Дуусгах'}
              </button>
            </div>
          </div>
        )}

        {/* RESULT */}
        {currentView === 'result' && result ? (
  <div className="max-w-4xl mx-auto">
    <h2 className="text-4xl font-bold mb-8 text-center">Таны үр дүн</h2>

    <p className="text-2xl mb-4 text-center">
      Зөв: {result?.correct ?? 0} / {result?.totalQuestions ?? 0}
    </p>
    <p className="text-2xl mb-8 text-center">
      Нийт Оноо: {result?.totalPoints ?? 0}
    </p>

    <div className="space-y-6">
      {result?.details?.map((item: any, index: number) => (
        <div key={index} className={`bg-white p-6 rounded-2xl shadow-lg border-l-8 ${item.is_correct ? 'border-green-500' : 'border-red-500'}`}>
          <h3 className="text-xl font-bold mb-2">Асуулт {index + 1}</h3>
          <p className="text-lg"><strong>Асуулт:</strong> {item.questionObj?.question}</p>
          <p className="text-lg"><strong>Таны хариулт:</strong> {item.selected_answer}</p>
          <p className="text-lg"><strong>Зөв хариулт:</strong> {item.questionObj?.answer}</p>
          <p className={`text-lg font-bold mt-2 ${item.is_correct ? 'text-green-600' : 'text-red-600'}`}>
            {item.is_correct ? 'ЗӨВ' : 'БУРУУ'}
          </p>
          <p className="text-lg">Авсан оноо: {item.points_earned}</p>
        </div>
      ))}
    </div>

    <div className="text-center mt-8">
      <button onClick={retryQuiz} className="bg-green-600 text-white px-10 py-5 rounded-xl font-bold">
        Дахин оролдох
      </button>
    </div>
  </div>
) : (
  <div className="text-center text-xl text-gray-500 mt-10"></div>
)}
        {/* ADD QUESTION */}
        {currentView==='add-question' && userType==='teacher' && (
          <div className="max-w-4xl mx-auto">
            <button onClick={()=>setCurrentView('grades')} className="mb-6 text-indigo-600 font-bold">← Буцах</button>
            <form onSubmit={handleAddQuestion} className="space-y-6 bg-white rounded-3xl p-8 shadow-2xl border-4 border-emerald-200">
              <h2 className="text-3xl font-bold mb-6">Шинэ асуулт нэмэх</h2>

              <select value={newQuestion.grade} onChange={(e)=>setNewQuestion(prev=>({...prev, grade:e.target.value, subject:''}))} required className="w-full p-4 border rounded-lg">
                <option value="">Анги сонгоно уу</option>
                {grades.map((g: Grade) => <option key={g.id} value={g.id}>{g.number}</option>)}
              </select>

              <select value={newQuestion.subject} onChange={(e)=>setNewQuestion(prev=>({...prev, subject:e.target.value}))} required className="w-full p-4 border rounded-lg">
                <option value="">Ангилал сонгоно уу</option>
                {grades.find((g: Grade) => g.id===Number(newQuestion.grade))?.subjects.map((s: Subject) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>

              <textarea value={newQuestion.question} onChange={(e)=>setNewQuestion(prev=>({...prev, question:e.target.value}))} placeholder="Асуулт" required className="w-full p-4 border rounded-lg" />
              <input value={newQuestion.answer} onChange={(e)=>setNewQuestion(prev=>({...prev, answer:e.target.value}))} placeholder="Зөв хариулт" required className="w-full p-4 border rounded-lg" />
              <input value={newQuestion.points} onChange={(e)=>setNewQuestion(prev=>({...prev, points:e.target.value}))} placeholder="Оноо" type="number" className="w-full p-4 border rounded-lg" />

              <button type="submit" disabled={addingQuestion} className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold">{addingQuestion?'Нэмж байна...':'Асуулт нэмэх'}</button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
