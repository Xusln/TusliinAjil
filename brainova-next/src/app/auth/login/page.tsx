"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.push('/dashboard');
    } catch (err) {
      setError("Нэвтрэхэд алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div 
      className="flex flex-col min-h-screen"
      style={{
        backgroundImage: `url('/newtreh.gif')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <header className="bg-white/90 backdrop-blur-sm shadow-md">
        <div className="container mx-auto flex justify-between items-center p-4">
          <h1 className="text-2xl font-bold text-blue-600">Brainova</h1>
          <Link href="/" className="text-gray-700 hover:text-blue-600 transition font-medium">
            Нүүр хуудас
          </Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6 border border-white/50">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-blue-900 mb-1">Нэвтрэх</h2>
              <p className="text-blue-700 text-sm">Brainova бүртгэлээрээ нэвтэрнэ үү</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50/90 border border-red-200/80 rounded-lg backdrop-blur-sm">
                <p className="text-red-700 text-xs">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-800 mb-1">
                  Имэйл хаяг
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300/80 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white/90 text-sm"
                  placeholder="example@brainova.mn"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-medium text-gray-800 mb-1">
                  Нууц үг
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300/80 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white/90 text-sm"
                  placeholder="Нууц үгээ оруулна уу"
                />
              </div>

              <div className="flex justify-between items-center text-xs">
                <label className="flex items-center text-gray-700">
                  <input type="checkbox" className="rounded border-gray-300/80 text-blue-600 focus:ring-blue-500 mr-1" />
                  Санаж үлдээх
                </label>
                <Link href="/auth/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium transition">
                  Нууц үгээ мартсан
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 px-4 rounded-lg font-semibold text-white transition shadow-lg text-sm ${
                  loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Нэвтэрч байна...
                  </span>
                ) : (
                  "Нэвтрэх"
                )}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300/50" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white/80 text-gray-500">эсвэл</span>
              </div>
            </div>

            <button className="w-full py-2.5 px-4 border border-gray-300/50 rounded-lg hover:bg-gray-50/80 transition flex items-center justify-center text-gray-700 font-medium text-sm bg-white/90">
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google-аар нэвтрэх
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-gray-800 bg-white/70 py-1.5 px-3 rounded-lg text-xs">
              Бүртгэлгүй юу?{" "}
              <Link href="/auth/register" className="font-semibold text-blue-600 hover:text-blue-700 transition">
                Бүртгүүлэх
              </Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-white/90 backdrop-blur-sm shadow-inner mt-auto">
        <div className="container mx-auto text-center p-4 text-gray-600">
          © 2025 Brainova. Бүх эрх хуулиар хамгаалагдсан.
        </div>
      </footer>
    </div>
  );
}