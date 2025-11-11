// src/lib/api.ts
const API_BASE = 'http://localhost:8000/api';

export const api = {
  // Нэвтрэх
  async login(username: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });
    return res.json();
  },

  // Гарах
  async logout() {
    await fetch(`${API_BASE}/auth/logout/`, {
      method: 'POST',
      credentials: 'include',
    });
  },

  // АНГИЛАЛ АВАХ
  async getCategories() {
    const res = await fetch(`${API_BASE}/categories/`, { credentials: 'include' });
    if (!res.ok) throw new Error('Ангилал ачаалж чадсангүй');
    return res.json();
  },

  // АСУУЛТ АВАХ
  async getQuestions() {
    const res = await fetch(`${API_BASE}/questions/`, { credentials: 'include' });
    if (!res.ok) throw new Error('Асуулт ачаалж чадсангүй');
    return res.json();
  },

  // АСУУЛТ НЭМЭХ
  async addQuestion(data: {
    category: string;
    question: string;
    answer: string;
    points: number;
  }) {
    const res = await fetch(`${API_BASE}/questions/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Асуулт нэмэхэд алдаа гарлаа');
    }
    return res.json();
  },
};