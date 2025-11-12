// src/lib/api.ts
const API_BASE = 'http://127.0.0.1:8000/api';

export const api = {
  // Нэвтрэх
  async login(username: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // sessionid cookie авна
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Нэвтрэхэд алдаа гарлаа');

  // localStorage-д зөвхөн user_type хадгална
  localStorage.setItem('userType', data.user.user_type);
  return data;
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
    const res = await fetch(`${API_BASE}/categories/`, {
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Ангилал ачаалж чадсангүй');
    }
    return res.json();
  },

  // АСУУЛТ АВАХ
  async getQuestions() {
    const res = await fetch(`${API_BASE}/questions/`, {
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Асуулт ачаалж чадсангүй');
    }
    return res.json();
  },

  // АСУУЛТ НЭМЭХ
  async addQuestion(data: { category: string; question: string; answer: string; points: number }) {
    const res = await fetch(`${API_BASE}/questions/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const responseData = await res.json();
    if (!res.ok) {
      const errorMsg = responseData.detail || responseData.error || 'Асуулт нэмэхэд алдаа гарлаа';
      throw new Error(errorMsg);
    }
    return responseData;
  },
};