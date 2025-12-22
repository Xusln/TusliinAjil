// src/lib/api.ts
const API_BASE = 'http://localhost:8000/api';

// CSRF token авах + cookie тавих (session эхлүүлэхэд чухал)
async function ensureCsrfToken() {
  await fetch(`${API_BASE}/auth/csrf/`, {
    method: 'GET',
    credentials: 'include',
  });
}

async function getCSRFToken(): Promise<string> {
  const res = await fetch(`${API_BASE}/auth/csrf/`, { credentials: 'include' });
  if (!res.ok) return '';
  const data = await res.json();
  return data.csrfToken || '';
}

export const api = {
  // Нэвтрэхээс өмнө CSRF cookie тавьж, token авна
  async login(username: string, password: string) {
  try {
    await ensureCsrfToken();

    const csrfToken = await getCSRFToken();

    const res = await fetch(`${API_BASE}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify({ username: username.trim(), password }),
    });

    const data = await res.json();

    // Backend-ээс ирсэн тодорхой алдааг шалгана
    if (!res.ok) {
      // Таны backend-ээс ирэх алдааны мессежүүд
      if (data.error && data.error.includes('Буруу нэр эсвэл нууц үг')) {
        throw new Error('Таны нэр эсвэл нууц үг буруу байна');
      }
      if (data.error && data.error.includes('шаардлагатай')) {
        throw new Error('Нэр болон нууц үгээ бүрэн оруулна уу');
      }
      throw new Error(data.error || 'Нэвтрэлт амжилтгүй боллоо');
    }

    if (data.user?.user_type) {
      localStorage.setItem('userType', data.user.user_type);
    }

    return data;
  } catch (err: any) {
    // Ямар ч тохиолдолд хэрэглэгчдэд ээлтэй мессеж өгнө
    throw new Error(err.message || 'Таны нэр эсвэл нууц үг буруу байна');
  }
},

  async logout() {
    try {
      const csrfToken = await getCSRFToken();
      await fetch(`${API_BASE}/auth/logout/`, {
        method: 'POST',
        headers: { 'X-CSRFToken': csrfToken },
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout алдаа:', err);
    }
    localStorage.removeItem('userType');
  },

  async getCurrentUser() {
    const res = await fetch(`${API_BASE}/profile/`, { // ← Таны view-ийн URL
      credentials: 'include',
    });
    if (!res.ok) {
      throw new Error('Нэвтрэлт алдагдсан');
    }
    return res.json();
  },

  async getGrades() {
    const res = await fetch(`${API_BASE}/grades/`, { credentials: 'include' });
    if (!res.ok) throw new Error('Ангиудыг ачаалж чадсангүй');
    return res.json();
  },

  async getSubjects() {
    const res = await fetch(`${API_BASE}/subjects/`, { credentials: 'include' });
    if (!res.ok) throw new Error('Хичээлүүдийг ачаалж чадсангүй');
    return res.json();
  },

  async getQuestions() {
    const res = await fetch(`${API_BASE}/questions/`, { credentials: 'include' });
    if (!res.ok) throw new Error('Асуултуудыг ачаалж чадсангүй');
    return res.json();
  },

  async addQuestion(data: { grade: number; subject: number; question: string; answer: string; points: number }) {
    await ensureCsrfToken();
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
    if (!res.ok) throw new Error(responseData.detail || responseData.error || 'Асуулт нэмэхэд алдаа гарлаа');
    return responseData;
  },

  async register(
    username: string,
    password: string,
    user_type: 'student' | 'teacher' = 'student',
    taught_grades_ids?: number[],
    taught_subjects_ids?: number[]
  ) {
    await ensureCsrfToken();
    const csrfToken = await getCSRFToken();

    const body: any = { username, password, user_type };
    if (user_type === 'teacher') {
      if (!taught_grades_ids?.length || !taught_subjects_ids?.length) {
        throw new Error('Багш бол анги, хичээл заавал сонгоно уу');
      }
      body.taught_grades_ids = taught_grades_ids;
      body.taught_subjects_ids = taught_subjects_ids;
    }

    const res = await fetch(`${API_BASE}/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.detail || 'Бүртгэл амжилтгүй');
    
    if (data.user?.user_type) {
      localStorage.setItem('userType', data.user.user_type);
    }
    return data;
  },
};