// src/app/dashboard/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function Dashboard() {
  const [userType, setUserType] = useState<'teacher' | 'student' | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentView, setCurrentView] = useState<'categories' | 'quiz' | 'add'>('categories');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const type = localStorage.getItem('userType') as 'teacher' | 'student' | null;
    if (!type) {
      router.push('/auth/login');
      return;
    }
    setUserType(type);

    // ЭНД ФУНКЦ БАЙНА
    Promise.all([api.getCategories(), api.getQuestions()])
      .then(([cats, qs]) => {
        setCategories(cats);
        setQuestions(qs);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Ачааллахад алдаа:', err);
        alert('Сервертэй холбогдохгүй байна');
        setLoading(false);
      });
  }, [router]);

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const data = {
      category: form.category.value,
      question: form.question.value,
      answer: form.answer.value,
      points: parseInt(form.points.value),
    };
    try {
      await api.addQuestion(data);
      setCurrentView('categories');
      const qs = await api.getQuestions();
      setQuestions(qs);
    } catch (err: any) {
      alert(err.message || 'Асуулт нэмэхэд алдаа гарлаа');
    }
  }};

  // ... бусад код (UI) өөрчлөгдөөгүй