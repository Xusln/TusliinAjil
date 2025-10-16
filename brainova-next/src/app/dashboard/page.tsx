"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const [userType, setUserType] = useState<"teacher" | "student">("student");
  const [questions, setQuestions] = useState([
    { id: 1, question: "Монгол улсын нийслэл юу вэ?", answer: "Улаанбаатар", points: 10 },
    { id: 2, question: "2 + 2 = ?", answer: "4", points: 5 },
  ]);
  const [newQuestion, setNewQuestion] = useState({ question: "", answer: "", points: "" });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const router = useRouter(); // ✅ FIXED: Added "const"

  // Mock user type - replace with real auth
  useEffect(() => {
    const type = localStorage.getItem("userType") || "student";
    setUserType(type as "teacher" | "student");
  }, []);

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const points = parseInt(newQuestion.points);
    setQuestions([...questions, { 
      id: Date.now(), 
      question: newQuestion.question, 
      answer: newQuestion.answer, 
      points 
    }]);
    setNewQuestion({ question: "", answer: "", points: "" });
  };

  const handleSubmitAnswer = () => {
    if (userAnswer.toLowerCase() === questions[currentQuestion].answer.toLowerCase()) {
      setScore(score + questions[currentQuestion].points);
    }
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setUserAnswer("");
    } else {
      setShowResult(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setUserAnswer("");
    setScore(0);
    setShowResult(false);
  };

  if (showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-blue-900 mb-2">Дууслаа!</h2>
          <p className="text-xl text-blue-700 mb-6">Таны оноо: <span className="font-bold text-green-600">{score}</span>/{questions.reduce((a, b) => a + b.points, 0)}</p>
          <button onClick={restartQuiz} className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
            Дахин тоглох
          </button>
          <Link href="/dashboard" className="block mt-4 text-blue-600 hover:text-blue-700 text-sm">
            Бүх асуултууд руу буцах
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-md">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-blue-600">Brainova</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              userType === "teacher" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
            }`}>
              {userType === "teacher" ? "БАГШ" : "СУРАГЧ"}
            </span>
          </div>
          <Link href="/auth/login" className="text-red-600 hover:text-red-700 font-medium transition">
            Гарах
          </Link>
        </div>
      </header>

      <main className="container mx-auto p-6 max-w-4xl">
        {/* TEACHER DASHBOARD */}
        {userType === "teacher" && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Questions List */}
            <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6 border border-white/50">
              <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Асуултууд ({questions.length})
              </h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {questions.map((q) => (
                  <div key={q.id} className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">{q.question}</p>
                    <p className="text-xs text-gray-600">Хариу: {q.answer}</p>
                    <p className="text-xs text-green-600">Оноо: {q.points}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Question Form */}
            <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6 border border-white/50">
              <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Шинэ асуулт
              </h2>
              <form onSubmit={handleAddQuestion} className="space-y-3">
                <input
                  type="text"
                  placeholder="Асуулт"
                  value={newQuestion.question}
                  onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  type="text"
                  placeholder="Зөв хариу"
                  value={newQuestion.answer}
                  onChange={(e) => setNewQuestion({...newQuestion, answer: e.target.value})}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  type="number"
                  placeholder="Оноо"
                  value={newQuestion.points}
                  onChange={(e) => setNewQuestion({...newQuestion, points: e.target.value})}
                  min="1"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button type="submit" className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition">
                  Нэмэх
                </button>
              </form>
            </div>
          </div>
        )}

        {/* STUDENT DASHBOARD */}
        {userType === "student" && (
          <div>
            {/* Quiz Stats */}
            <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6 border border-white/50 mb-6 text-center">
              <h2 className="text-xl font-bold text-blue-900 mb-2">КВИЗ</h2>
              <p className="text-blue-700 mb-4">Асуулт: {currentQuestion + 1} / {questions.length}</p>
              <div className="flex justify-center gap-4 text-sm">
                <span className="text-green-600 font-semibold">Оноо: {score}</span>
                <span className="text-gray-600">Нийт: {questions.reduce((a, b) => a + b.points, 0)}</span>
              </div>
            </div>

            {/* Current Question */}
            {questions.length > 0 ? (
              <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6 border border-white/50">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-blue-900 mb-2">{questions[currentQuestion].question}</h3>
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {questions[currentQuestion].points} оноо
                  </span>
                </div>
                
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Хариултаа бичнэ үү..."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!userAnswer.trim()}
                    className={`w-full py-3 rounded-lg font-semibold transition text-sm ${
                      userAnswer.trim()
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Дараагийн асуулт
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6 border border-white/50 text-center">
                <p className="text-gray-600">Асуулт байхгүй байна. Багш нар нэмнэ.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}