"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "../../utils/supabase";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Dev bypass: allow logging in locally without Supabase when using admin/admin
    if (email === "admin" && password === "admin") {
      router.push("/dashboard");
      return;
    }

    setLoading(true);
    try {
      const res = await supabase.auth.signInWithPassword({ email, password });
      const authError = (res as any).error;
      const authData = (res as any).data;
      if (authError) {
        alert(authError.message || "Erreur lors de la connexion");
        setLoading(false);
        return;
      }

      const session = authData?.session || (await supabase.auth.getSession())?.data?.session;
      if (!session || !session.user) {
        alert("Impossible de récupérer la session");
        setLoading(false);
        return;
      }

      // Fetch profile to determine role
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type, role, full_name, updated_at")
        .eq("id", session.user.id)
        .single();

      const role = profile?.role || profile?.user_type || "client";

      // store minimal info in localStorage
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("demos-user-id", session.user.id);
          localStorage.setItem("demos-user-name", profile?.full_name || "");
          localStorage.setItem("demos-user-type", role);
          localStorage.setItem("demos-logged-in", "true");
        } catch (e) {
          // ignore localStorage errors
        }
      }

      // Redirect: coaches to /dashboard, others to /client-portal
      if (session.user.email === "erwankm@gmail.com" || role === "coach") {
        router.push("/dashboard");
      } else {
        router.push("/client-portal");
      }
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Erreur lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // no-op
  }, []);

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-gradient-to-br from-gray-900/80 to-black/70 rounded-3xl p-10 shadow-2xl border border-white/6">
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="DEMOS" width={160} height={64} className="object-contain drop-shadow-[0_10px_25px_rgba(226,29,44,0.25)]" />
        </div>
        <h1 className="text-3xl font-black text-center mb-2 tracking-tight">Connexion DEMOS</h1>
        <p className="text-center text-sm text-gray-400 mb-6">Accédez à votre espace coach ou client</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-300">Email</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-2 w-full px-4 py-3 rounded-xl bg-black border border-gray-800 outline-none text-white placeholder-gray-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-2 w-full px-4 py-3 rounded-xl bg-black border border-gray-800 outline-none text-white placeholder-gray-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E21D2C] hover:bg-red-700 text-white font-extrabold py-4 rounded-xl transition disabled:opacity-60 text-lg"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm text-gray-400">
          <Link href="/" className="hover:underline">Retour</Link>
          <Link href="/auth/register" className="text-[#E21D2C] hover:underline">Créer un compte</Link>
        </div>
      </div>
    </main>
  );
}
