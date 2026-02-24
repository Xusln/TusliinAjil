// app/login/page.tsx
'use client'

import { useState } from 'react'
import axios from 'axios'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:8000/api/auth/login/', { email, password })
      // success → redirect эсвэл token хадгалах
      console.log('Амжилттай нэвтэрлээ', res.data)
    } catch (err) {
      console.error('Алдаа', err)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md p-8 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-6">Нэвтрэх</h1>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="И-мэйл"
          className="w-full p-3 mb-4 border rounded"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Нууц үг"
          className="w-full p-3 mb-6 border rounded"
        />
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
        >
          Нэвтрэх
        </button>
      </div>
    </div>
  )
}