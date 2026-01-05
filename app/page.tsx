"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  Users,
  Lock,
  Dumbbell,
} from "lucide-react";
import { supabase } from "./utils/supabase";

const CLIENT_NAMES = [
  "Mathieu Dupont",
  "Chloé Martin",
  "Lucas Bernard",
  "Sophie Lemoine",
  "Didier Renard",
];

const CLIENT_ID_MAP: { [key: string]: number } = {
      "Mathieu Dupont": 1,
      "Chloé Martin": 2,
      "Lucas Bernard": 3,
      "Sophie Lemoine": 4,
      "Didier Renard": 5,
    };

export default function Page() {
  const router = useRouter();
  const [mode, setMode] = useState<"select" | "coach" | "client">("select");
  const [coachCode, setCoachCode] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
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
          localStorage.setItem("fitclub-user-type", "coach");
          localStorage.setItem("fitclub-logged-in", "true");
          localStorage.setItem("fitclub-user-id", data.user.id);
        }
        router.push("/dashboard");
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
      });

      if (error) throw error;

      if (data.user) {
        alert("Inscription réussie ! Vous pouvez maintenant vous connecter.");
        setIsSignUp(false);
        setEmail("");
        setPassword("");
      }
    } catch (error: any) {
      console.error("Erreur lors de l'inscription:", error);
      alert(error.message || "Erreur lors de l'inscription");
    }
  };

  const handleCoachLogin = async () => {
    try {
      // Pour l'instant, on garde le système de code simple comme fallback
      // Vous pouvez utiliser handleSupabaseSignIn() si vous avez configuré les utilisateurs dans Supabase
      if (coachCode === "COACH") {
        if (typeof window !== "undefined") {
          localStorage.setItem("fitclub-user-type", "coach");
          localStorage.setItem("fitclub-logged-in", "true");
        }
        router.push("/dashboard");
      } else {
        if (typeof window !== "undefined") {
          alert("Code incorrect. Le code est : COACH");
        }
      }
    } catch (error) {
      console.error("Erreur lors de la connexion coach:", error);
      router.push("/dashboard");
    }
  };

  const handleClientLogin = (clientName: string) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("fitclub-user-type", "client");
        localStorage.setItem("fitclub-client-id", CLIENT_ID_MAP[clientName]?.toString() || "5");
        localStorage.setItem("fitclub-logged-in", "true");
      }
      router.push("/client-portal");
    } catch (error) {
      console.error("Erreur lors de la connexion client:", error);
      router.push("/client-portal");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="bg-indigo-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Dumbbell className="text-indigo-600" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-slate-700 mb-2">FitClub</h1>
          <p className="text-slate-400 text-sm">Application de coaching</p>
        </div>

        {mode === "select" && (
          <div className="space-y-4">
            <button
              onClick={() => setMode("coach")}
              className="w-full bg-indigo-500 text-white rounded-xl px-6 py-4 text-base font-medium hover:bg-indigo-600 transition shadow-lg flex items-center justify-center gap-3 active:scale-95"
            >
              <Lock size={24} />
              Accès Coach
            </button>
            <button
              onClick={() => setMode("client")}
              className="w-full bg-purple-500 text-white rounded-xl px-6 py-4 text-base font-medium hover:bg-purple-600 transition shadow-lg flex items-center justify-center gap-3 active:scale-95"
            >
              <Users size={24} />
              Accès Client
            </button>
            </div>
        )}

        {mode === "coach" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Code d'accès
              </label>
              <input
                type="password"
                value={coachCode}
                onChange={(e) => setCoachCode(e.target.value)}
                placeholder="Entrez le code COACH"
                className="w-full bg-white rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleCoachLogin();
                  }
                }}
              />
              </div>
            <div className="flex gap-3">
              <button
                onClick={() => setMode("select")}
                className="flex-1 px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition font-medium text-base"
              >
                Retour
              </button>
              <button
                onClick={handleCoachLogin}
                className="flex-1 bg-indigo-500 text-white rounded-xl px-6 py-3 hover:bg-indigo-600 transition shadow-sm font-medium text-base active:scale-95"
              >
                Se connecter
              </button>
            </div>
          </div>
        )}

        {mode === "client" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Sélectionnez votre nom
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {CLIENT_NAMES.map((name) => (
                  <button
                    key={name}
                    onClick={() => handleClientLogin(name)}
                    className="w-full bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl px-4 py-3 text-left text-slate-700 font-medium transition active:scale-95"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => setMode("select")}
              className="w-full px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition font-medium text-base"
            >
              Retour
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
