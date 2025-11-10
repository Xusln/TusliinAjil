// src/lib/api.ts
const API_BASE = 'http://localhost:8000/api';

export const api = {
  async login(username: string, password: string) {
    console.log('Нэвтрэх оролдлого:', { username, password });

    try {
      const res = await fetch(`${API_BASE}/auth/login/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        credentials: 'include',  // Session cookie-г хадгална
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      console.log('Серверээс ирсэн хариу:', data);

      if (!res.ok) {
        throw new Error(data.error || 'Нэвтрэхэд алдаа гарлаа');
      }

      return data; // { success: true, user: { ... } }
    } catch (err: any) {
      console.error('Login алдаа:', err.message);
      throw err;
    }
  },

  // Гарах
  async logout() {
    await fetch(`${API_BASE}/auth/logout/`, {
      method: 'POST',
      credentials: 'include',
    });
  },

  // Асуулт авах
  async getQuestions() {
    const res = await fetch(`${API_BASE}/questions/`, { credentials: 'include' });
    return res.json();
  },

  // Асуулт нэмэх
  async addQuestion(question: { category: string; question: string; answer: string; points: number }) {
    const res = await fetch(`${API_BASE}/questions/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(question),
    });
    return res.json();
  },
};