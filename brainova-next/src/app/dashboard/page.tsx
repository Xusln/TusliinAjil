"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const [userType, setUserType] = useState<"teacher" | "student">("student");
  const [currentView, setCurrentView] = useState<"categories" | "quiz" | "add">("categories");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [questions, setQuestions] = useState([
    { id: 1, category: "Монгол түүх", question: "Монгол улсын нийслэл юу вэ?", answer: "Улаанбаатар", points: 10 },
    { id: 2, category: "Математик", question: "2 + 2 = ?", answer: "4", points: 5 },
    { id: 3, category: "Монгол түүх", question: "Чингис хаан хаан болсон жил?", answer: "1206", points: 15 },
    { id: 4, category: "Англи хэл", question: "Hello гэдэг нь?", answer: "Сайн байна уу", points: 8 },
  ]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const type = localStorage.getItem("userType") || "student";
    setUserType(type as "teacher" | "student");
  }, []);

  const filteredQuestions = selectedCategory 
    ? questions.filter(q => q.category === selectedCategory)
    : questions;

  const categories = [...new Set(questions.map(q => q.category))];

  const handleSubmitAnswer = () => {
    if (userAnswer.toLowerCase() === filteredQuestions[currentQuestion].answer.toLowerCase()) {
      setScore(score + filteredQuestions[currentQuestion].points);
    }
    if (currentQuestion < filteredQuestions.length - 1) {
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
          <p className="text-xl text-blue-700 mb-2">
            Ангилал: <span className="font-bold text-purple-600">{selectedCategory}</span>
          </p>
          <p className="text-xl mb-6">
            Оноо: <span className="font-bold text-green-600">{score}</span>/{filteredQuestions.reduce((a, b) => a + b.points, 0)}
          </p>
          <button onClick={restartQuiz} className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition mb-4">
            Дахин тоглох
          </button>
          <button 
            onClick={() => { setShowResult(false); setCurrentView("categories"); }}
            className="w-full py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
          >
            Өөр ангилал сонгох
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
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
        {currentView === "categories" && (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-blue-900 mb-8">КВИЗ СОНГОХ</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setCurrentView("quiz");
                    setCurrentQuestion(0);
                    setScore(0);
                  }}
                  className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6 border border-white/50 hover:shadow-2xl transition transform hover:-translate-y-1"
                >
                  <div className="text-2xl mb-2">📚</div>
                  <h3 className="font-bold text-blue-900 text-lg">{category}</h3>
                  <p className="text-xs text-gray-600">
                    {questions.filter(q => q.category === category).length} асуулт
                  </p>
                </button>
              ))}
            </div>

            {userType === "teacher" && (
              <button
                onClick={() => setCurrentView("add")}
                className="w-full max-w-md mx-auto py-4 bg-green-600 text-white rounded-xl font-semibold text-lg hover:bg-green-700 transition"
              >
                ➕ Шинэ асуулт нэмэх
              </button>
            )}
          </div>
        )}

        {currentView === "quiz" && filteredQuestions.length > 0 && (
          <div>
            <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6 border border-white/50 mb-6 text-center">
              <h2 className="text-xl font-bold text-purple-900 mb-2">{selectedCategory}</h2>
              <p className="text-blue-700 mb-4">Асуулт: {currentQuestion + 1} / {filteredQuestions.length}</p>
              <div className="flex justify-center gap-4 text-sm">
                <span className="text-green-600 font-semibold">Оноо: {score}</span>
                <span className="text-gray-600">
                  Нийт: {filteredQuestions.reduce((a, b) => a + b.points, 0)}
                </span>
              </div>
              <button
                onClick={() => setCurrentView("categories")}
                className="mt-4 text-blue-600 hover:text-blue-700 text-sm"
              >
                ← Өөр ангилал
              </button>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6 border border-white/50">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-blue-900 mb-2">
                  {filteredQuestions[currentQuestion].question}
                </h3>
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {filteredQuestions[currentQuestion].points} оноо
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
                  {currentQuestion === filteredQuestions.length - 1 ? "Дуусгах" : "Дараагийн асуулт"}
                </button>
              </div>
            </div>
          </div>
        )}

        {currentView === "add" && userType === "teacher" && (
          <div className="max-w-md mx-auto">
            <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6 border border-white/50 mb-6 text-center">
              <h2 className="text-xl font-bold text-green-900 mb-4">ШИНЭ АСУУЛТ</h2>
              <button
                onClick={() => setCurrentView("categories")}
                className="text-blue-600 hover:text-blue-700 text-sm mb-4"
              >
                ← Ангилал руу
              </button>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6 border border-white/50">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const newQ = {
                    id: Date.now(),
                    category: formData.get("category") as string,
                    question: formData.get("question") as string,
                    answer: formData.get("answer") as string,
                    points: parseInt(formData.get("points") as string),
                  };
                  setQuestions([...questions, newQ]);
                  setCurrentView("categories");
                }}
                className="space-y-3"
              >
                <select name="category" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
                  <option value="">Ангилал сонгох</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                
                <input
                  name="question"
                  type="text"
                  placeholder="Асуулт"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  name="answer"
                  type="text"
                  placeholder="Зөв хариу"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  name="points"
                  type="number"
                  placeholder="Оноо"
                  min="1"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button type="submit" className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition">
                  ➕ Нэмэх
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}