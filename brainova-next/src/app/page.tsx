import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto flex justify-between items-center p-4">
          <h1 className="text-2xl font-bold text-blue-600">Brainova</h1>
          <nav className="flex gap-6">
            <a href="/" className="text-gray-700 hover:text-blue-600 transition">
              Home
            </a>
            <Link href="/auth/login" className="text-gray-700 hover:text-blue-600 transition">
              Login
            </Link>
            <Link href="/auth/register" className="text-gray-700 hover:text-blue-600 transition">
              Register
            </Link>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col justify-center items-center text-center px-6">
        <h2 className="text-5xl font-extrabold text-blue-900 mb-4">
          Сургалтын ирээдүйг Brainova-тай бүтээ
        </h2>
        <p className="text-lg text-blue-800 max-w-xl mb-8">
          Багш нар асуулт оруулж, сурагчид хариулж, оноо болон алдаагаа
          харах боломжтой. Цахим боловсрол, интерактив туршлага, бодит цагийн
          үр дүн.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <a
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
          >
            Нэвтрэх
          </a>
          <a
            href="/register"
            className="px-6 py-3 border border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 transition"
          >
            Бүртгүүлэх
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-inner mt-8">
        <div className="container mx-auto text-center p-4 text-gray-600">
          &copy; 2025 Brainova. Бүх эрх хуулиар хамгаалагдсан.
        </div>
      </footer>
    </div>
  );
}
