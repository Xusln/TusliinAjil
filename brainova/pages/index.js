import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-10">
      <h1 className="text-5xl font-bold mb-6">Brainova</h1>
      <p className="text-lg mb-8 text-center max-w-xl">
        Сурагч, багш, эцэг эхийг холбосон асуулт хариултын платформ.
      </p>
      <div className="flex gap-4">
        <Link href="/login">
          <button className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
            Нэвтрэх
          </button>
        </Link>
        <Link href="/register">
          <button className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 transition">
            Бүртгүүлэх
          </button>
        </Link>
      </div>
    </div>
  );
}
