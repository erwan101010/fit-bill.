import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <Image src="/logo.png" alt="DEMOS Logo" width={200} height={200} priority className="object-contain" />
        </div>
        <h1 className="text-4xl font-bold tracking-tighter uppercase">DEMOS</h1>
        <p className="text-gray-400 text-lg">Coaching Premium & Performance</p>
        <div className="flex flex-col gap-4 mt-10">
          <Link href="/auth/login" className="bg-[#E21D2C] hover:bg-red-700 text-white font-bold py-4 px-8 rounded-xl transition-all text-center text-lg">
            ACCÈS COACH
          </Link>
          <Link href="/auth/login" className="border-2 border-white/20 hover:border-white text-white font-bold py-4 px-8 rounded-xl transition-all text-center text-lg">
            ACCÈS CLIENT
          </Link>
        </div>
      </div>
    </main>
  );
}
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock } from "lucide-react";
import { supabase } from "./utils/supabase";

export default function Page() {
  const router = useRouter();
  const [mode, setMode] = useState<"select" | "coach" | "client">("select");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [coachCode, setCoachCode] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Vérifier si l'utilisateur est déjà connecté
    const checkSession = async () => {
      const res = await supabase.auth.getSession();
      const session = res?.data?.session;
      if (session && session.user) {
        const userEmail = session.user.email || "";
        if (userEmail === "erwankm@gmail.com") {
          router.push("/dashboard");
        } else {
          router.push("/client-portal");
        }
      }
    };
    checkSession();
  }, [router]);

  if (!mounted) return null;

  // Connexion avec Supabase
  const handleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // Si erreur "Email not confirmed", essayer de récupérer la session
        if (authError.message.includes("Email not confirmed")) {
          const res2 = await supabase.auth.getSession();
          const sessionCheck = res2?.data?.session;
          if (!sessionCheck) throw authError;
        } else {
          throw authError;
        }
      }

      const session = authData?.session || (await supabase.auth.getSession())?.data?.session;
      if (!session || !session.user) {
        throw new Error("Erreur de connexion");
      }

      // Récupérer le profil avec le rôle
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_type, role, full_name, updated_at")
        .eq("id", session.user.id)
        .single();

      if (profileError) throw profileError;

      const role = profile?.role || profile?.user_type;

      // Stocker les infos dans localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("demos-user-id", session.user.id);
        localStorage.setItem("demos-user-name", profile?.full_name || name);
        localStorage.setItem("demos-user-type", role || "client");
        localStorage.setItem("demos-logged-in", "true");
      }

      // Rediriger selon l'email (priorité donnée à l'email spécifique)
      const userEmail = session.user.email;
      if (userEmail === "erwankm@gmail.com") {
        router.push("/dashboard");
      } else {
        router.push("/client-portal");
      }
    } catch (err: any) {
      setError(err.message || "Erreur de connexion");
      console.error("Erreur de connexion:", err);
    } finally {
      setLoading(false);
    }
  };

  // Inscription avec Supabase
  const handleSignUp = async () => {
    setLoading(true);
    setError("");

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("Erreur lors de l'inscription");
      }

      // Créer le profil avec le rôle
      const userType = mode === "coach" ? "coach" : "client";
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: authData.user.id,
          full_name: name,
          email: email,
          user_type: userType,
          role: userType,
        });

      if (profileError) throw profileError;

      // Si client avec code coach, lier au coach
      if (mode === "client" && coachCode.trim()) {
        const { linkClientToCoach } = require("./utils/coachStorage");
        linkClientToCoach(authData.user.id, coachCode.trim().toUpperCase());
      }

      // Stocker les infos
      if (typeof window !== "undefined") {
        localStorage.setItem("demos-user-id", authData.user.id);
        localStorage.setItem("demos-user-name", name);
        localStorage.setItem("demos-user-type", userType);
        localStorage.setItem("demos-logged-in", "true");
      }

      alert("Inscription réussie ! Vérifiez votre email pour confirmer votre compte.");

      // Rediriger selon l'email (priorité donnée à l'email spécifique)
      const signupEmail = authData.user?.email;
      if (signupEmail === "erwankm@gmail.com") {
        router.push("/dashboard");
      } else {
        router.push("/client-portal");
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'inscription");
      console.error("Erreur d'inscription:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isSignUp) {
      await handleSignUp();
    } else {
      await handleSignIn();
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="bg-gray-900/70 rounded-3xl shadow-2xl border border-white/10 p-8 max-w-md w-full backdrop-blur-sm">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="DEMOS" width={160} height={64} className="mx-auto mb-4 h-16 w-auto" />
          <h1 className="text-5xl sm:text-6xl font-extrabold bg-clip-text text-transparent mb-2 bg-gradient-to-r from-red-600 to-red-500">
            DEMOS
          </h1>
          <p className="text-gray-300 text-sm max-w-xl mx-auto">Coaching premium personnalisé — programme, suivi et messagerie en temps réel.</p>
        </div>

        {mode === "select" && (
          <div className="space-y-4">
            <button
              onClick={() => setMode("coach")}
              className="w-full bg-red-600 text-white rounded-xl px-6 py-4 text-lg font-semibold hover:bg-red-700 transition-all shadow-lg flex items-center justify-center active:scale-95"
            >
              Accès Coach
            </button>
            <button
              onClick={() => setMode("client")}
              className="w-full bg-red-600 text-white rounded-xl px-6 py-4 text-lg font-semibold hover:bg-red-700 transition-all shadow-lg flex items-center justify-center active:scale-95"
            >
              Accès Client
            </button>
          </div>
        )}

        {(mode === "coach" || mode === "client") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">
                {isSignUp ? "Inscription" : "Connexion"} {mode === "coach" ? "Coach" : "Client"}
              </h2>
              <button
                onClick={() => {
                  setMode("select");
                  setIsSignUp(false);
                  setName("");
                  setEmail("");
                  setPassword("");
                  setCoachCode("");
                  setError("");
                }}
                className="text-gray-400 hover:text-white text-sm transition"
              >
                Retour
              </button>
            </div>

            {error && (
              <div className="bg-demos-red/20 border border-demos-red/50 rounded-xl p-3 text-demos-red/70 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Votre nom"
                  className="w-full bg-gray-800/50 backdrop-blur-sm rounded-xl border border-white/10 px-4 py-3 text-base text-white placeholder-gray-500 focus:ring-2 focus:ring-demos-red/50 focus:border-demos-red/50 outline-none transition-all shadow-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full bg-gray-800/50 backdrop-blur-sm rounded-xl border border-white/10 px-4 py-3 text-base text-white placeholder-gray-500 focus:ring-2 focus:ring-demos-red/50 focus:border-demos-red/50 outline-none transition-all shadow-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-800/50 backdrop-blur-sm rounded-xl border border-white/10 px-4 py-3 text-base text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none transition-all shadow-lg"
                  required
                />
              </div>

              {/* Code Coach (uniquement pour les clients en inscription) */}
              {mode === "client" && isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Code Coach (optionnel)
                  </label>
                  <input
                    type="text"
                    value={coachCode}
                    onChange={(e) => setCoachCode(e.target.value.toUpperCase())}
                    placeholder="Ex: ABC123"
                    maxLength={6}
                    className="w-full bg-gray-800/50 backdrop-blur-sm rounded-xl border border-white/10 px-4 py-3 text-base text-white placeholder-gray-500 focus:ring-2 focus:ring-demos-red/50 focus:border-demos-red/50 outline-none transition-all shadow-lg uppercase"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Si vous avez reçu un code de votre coach, entrez-le ici
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError("");
                  }}
                  className="flex-1 px-6 py-3 text-white bg-demos-red/10 hover:bg-demos-red/15 rounded-xl transition font-medium text-base border border-demos-red/40 backdrop-blur-sm"
                >
                  {isSignUp ? "J'ai déjà un compte" : "Créer un compte"}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-demos-red to-demos-red/90 text-white rounded-xl px-6 py-3 hover:from-demos-red/90 hover:to-demos-red/80 transition-all shadow-xl shadow-demos-red/30 font-medium text-base active:scale-95 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Chargement..." : isSignUp ? "S'inscrire" : "Se connecter"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
