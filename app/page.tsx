"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Lock,
  Dumbbell,
} from "lucide-react";
import { supabase } from "./utils/supabase";

export default function Page() {
  const router = useRouter();
  const [mode, setMode] = useState<"select" | "coach" | "client">("select");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  // Fonction de connexion avec Supabase
  const handleSupabaseSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        if (typeof window !== "undefined") {
          localStorage.setItem("demos-user-type", mode === "coach" ? "coach" : "client");
          localStorage.setItem("demos-logged-in", "true");
          localStorage.setItem("demos-user-id", data.user.id);
          localStorage.setItem("demos-user-name", name);
        }
        router.push(mode === "coach" ? "/dashboard" : "/client-portal");
      }
    } catch (error: any) {
      console.error("Erreur lors de la connexion:", error);
      alert(error.message || "Erreur lors de la connexion");
    }
  };

  // Fonction d'inscription avec Supabase
  const handleSupabaseSignUp = async () => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            user_type: mode === "coach" ? "coach" : "client",
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        alert("Inscription réussie ! Vous pouvez maintenant vous connecter.");
        setIsSignUp(false);
        setName("");
        setEmail("");
        setPassword("");
      }
    } catch (error: any) {
      console.error("Erreur lors de l'inscription:", error);
      alert(error.message || "Erreur lors de l'inscription");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    if (isSignUp) {
      await handleSupabaseSignUp();
    } else {
      await handleSupabaseSignIn();
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-md w-full">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="bg-gray-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Dumbbell className="text-red-600" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Demos</h1>
          <p className="text-gray-600 text-sm">Application de coaching</p>
        </div>

        {mode === "select" && (
          <div className="space-y-4">
            <button
              onClick={() => setMode("coach")}
              className="w-full bg-red-600 text-white rounded-xl px-6 py-4 text-base font-medium hover:bg-red-700 transition shadow-lg flex items-center justify-center gap-3 active:scale-95"
            >
              <Lock size={24} />
              Accès Coach
            </button>
            <button
              onClick={() => setMode("client")}
              className="w-full bg-gray-800 text-white rounded-xl px-6 py-4 text-base font-medium hover:bg-gray-900 transition shadow-lg flex items-center justify-center gap-3 active:scale-95"
            >
              <Users size={24} />
              Accès Client
            </button>
          </div>
        )}

        {(mode === "coach" || mode === "client") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {isSignUp ? "Inscription" : "Connexion"} {mode === "coach" ? "Coach" : "Client"}
              </h2>
              <button
                onClick={() => {
                  setMode("select");
                  setIsSignUp(false);
                  setName("");
                  setEmail("");
                  setPassword("");
                }}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Retour
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Votre nom"
                  className="w-full bg-white rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full bg-white rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="flex-1 px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition font-medium text-base"
                >
                  {isSignUp ? "J'ai déjà un compte" : "Créer un compte"}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white rounded-xl px-6 py-3 hover:bg-red-700 transition shadow-sm font-medium text-base active:scale-95"
                >
                  {isSignUp ? "S'inscrire" : "Se connecter"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
