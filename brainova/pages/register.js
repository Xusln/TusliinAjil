import { useState } from "react";
import Link from "next/link";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Бүртгэл: ${name} - ${email}`);
    // TODO: Django backend API call
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-10">
      <h1 className="text-3xl font-bold mb-6">Бүртгүүлэх</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
        <input
          type="text"
          placeholder="Нэр"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          required
        />
        <input
          type="email"
          placeholder="Имэйл"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          required
        />
        <input
          type="password"
          placeholder="Нууц үг"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          required
        />
        <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition">
          Бүртгүүлэх
        </button>
      </form>
      <p className="mt-4">
        Өмнө нь бүртгүүлсэн үү? <Link href="/login" className="text-green-500">Нэвтрэх</Link>
      </p>
    </div>
  );
}
