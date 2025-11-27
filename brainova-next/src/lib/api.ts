// src/lib/api.ts
const API_BASE = 'http://localhost:8000/api';  // localhost!

async function getCSRFToken(): Promise<string> {
  const res = await fetch(`${API_BASE}/auth/csrf/`, { credentials: 'include' });
  const data = await res.json();
  return data.csrfToken;
}

export const api = {
  async login(username: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login алдаа');
    localStorage.setItem('userType', data.user.user_type);
    return data;
  },

  async logout() {
    const csrfToken = await getCSRFToken();
    await fetch(`${API_BASE}/auth/logout/`, {
      method: 'POST',
      headers: { 'X-CSRFToken': csrfToken },
      credentials: 'include',
    });
    localStorage.removeItem('userType');
  },

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

  async getQuestions() {
    const res = await fetch(`${API_BASE}/questions/`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Асуулт ачаалж чадсангүй');
    return res.json();
  },

  async addQuestion(data: { category: string; question: string; answer: string; points: number }) {
    const csrfToken = await getCSRFToken();
    const res = await fetch(`${API_BASE}/questions/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const responseData = await res.json();
    if (!res.ok) throw new Error(responseData.detail || 'Асуулт нэмэхэд алдаа гарлаа');
    return responseData;
  },


  async register(username: string, password: string, user_type: 'student' | 'teacher' = 'student') {
    const csrfToken = await getCSRFToken(); // CSRF авах

    const res = await fetch(`${API_BASE}/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify({ username, password, user_type }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Бүртгэл амжилтгүй боллоо');
    }

    // Амжилттай бүртгэгдвэл backend автоматаар login хийж өгнө
    localStorage.setItem('userType', data.user.user_type);
    return data;
  },
};