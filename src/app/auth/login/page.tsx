"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Placeholder: simulate login success and redirect back to home
    setTimeout(() => {
      setLoading(false);
      router.push("/");
    }, 600);
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-gray-900/80 rounded-2xl p-8 shadow-xl">
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="DEMOS" width={140} height={56} className="object-contain" />
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">Se connecter</h1>
        <p className="text-center text-sm text-gray-400 mb-6">Entrez votre email et mot de passe</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full px-4 py-3 rounded-xl bg-gray-800 border border-white/6 outline-none text-white"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full px-4 py-3 rounded-xl bg-gray-800 border border-white/6 outline-none text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E21D2C] hover:bg-red-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-60"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-400">
          <Link href="/" className="hover:underline">
            Retour
          </Link>
        </div>
      </div>
    </main>
  );
}
