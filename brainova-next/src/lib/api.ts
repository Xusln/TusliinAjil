// src/lib/api.ts
const API_BASE = 'http://localhost:8000/api';

export const api = {
  async login(username: string, password: string) {
  console.log('Нэвтрэх оролдлого:', { username, password });
  const res = await fetch(`${API_BASE}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  console.log('Серверээс ирсэн хариу:', data);
  return data;
},

  async logout() {
    await fetch(`${API_BASE}/auth/logout/`, { 
      method: 'POST', 
      credentials: 'include' 
    });
  },

  async getCategories() {
    const res = await fetch(`${API_BASE}/categories/`, { credentials: 'include' });
    if (!res.ok) throw new Error('Categories ачаалж чадсангүй');
    return res.json();
  },

  async getQuestions(category?: string) {
    const url = category 
      ? `${API_BASE}/questions/?category=${category}`
      : `${API_BASE}/questions/`;
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error('Questions ачаалж чадсангүй');
    return res.json();
  },

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