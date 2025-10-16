import { Link } from "react-router-dom";

export default function Register() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-green-600">Бүртгүүлэх</h2>
        <form className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Нэр"
            className="border p-3 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="email"
            placeholder="Имэйл"
            className="border p-3 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="password"
            placeholder="Нууц үг"
            className="border p-3 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            className="bg-green-500 text-white py-3 rounded hover:bg-green-600 transition"
          >
            Бүртгүүлэх
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Бүртгэлтэй юу?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Нэвтрэх
          </Link>
        </p>
      </div>
    </div>
  );
}
