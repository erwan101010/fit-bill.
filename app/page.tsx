"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Lock,
  Dumbbell,
  Sparkles,
} from "lucide-react";

export default function Page() {
  const router = useRouter();
  const [mode, setMode] = useState<"select" | "coach" | "client">("select");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [coachCode, setCoachCode] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  // Mode développement : bypasser Supabase
  const handleDevSignIn = () => {
    if (typeof window !== "undefined") {
      const userId = "dev-user-" + Date.now();
      localStorage.setItem("demos-user-type", mode === "coach" ? "coach" : "client");
      localStorage.setItem("demos-logged-in", "true");
      localStorage.setItem("demos-user-id", userId);
      localStorage.setItem("demos-user-name", name || (mode === "coach" ? "Coach" : "Client"));
      
      // Si c'est un client avec un code coach, le lier
      if (mode === "client" && coachCode.trim()) {
        const { linkClientToCoach } = require("./utils/coachStorage");
        linkClientToCoach(userId, coachCode.trim().toUpperCase());
      }
      
      // Pour les coaches, générer un code coach
      if (mode === "coach") {
        const { getOrCreateCoachCode } = require("./utils/coachStorage");
        const code = getOrCreateCoachCode(userId, name || "Coach", email);
        localStorage.setItem("demos-coach-code", code);
      }
    }
    
    // Vérifier si le client doit faire l'onboarding
    if (mode === "client") {
      const { isOnboardingComplete } = require("./utils/clientOnboardingStorage");
      const userId = localStorage.getItem("demos-user-id");
      if (userId && !isOnboardingComplete(userId)) {
        router.push("/client-portal/onboarding" + (coachCode ? `?coach_code=${coachCode.toUpperCase()}` : ""));
        return;
      }
    }
    
    router.push(mode === "coach" ? "/dashboard" : "/client-portal");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mode développement : connexion directe sans vérification
    if (!isSignUp) {
      handleDevSignIn();
      return;
    }

    // Pour l'inscription, on garde la logique Supabase (mais on peut aussi bypasser)
    if (isSignUp) {
      // Mode développement : créer un compte fictif
      if (typeof window !== "undefined") {
        const userId = "dev-user-" + Date.now();
        localStorage.setItem("demos-user-type", mode === "coach" ? "coach" : "client");
        localStorage.setItem("demos-logged-in", "true");
        localStorage.setItem("demos-user-id", userId);
        localStorage.setItem("demos-user-name", name);
        
        // Si c'est un client avec un code coach, le lier
        if (mode === "client" && coachCode.trim()) {
          const { linkClientToCoach } = require("./utils/coachStorage");
          linkClientToCoach(userId, coachCode.trim().toUpperCase());
        }
        
        // Pour les coaches, générer un code coach
        if (mode === "coach") {
          const { getOrCreateCoachCode } = require("./utils/coachStorage");
          const code = getOrCreateCoachCode(userId, name, email);
          localStorage.setItem("demos-coach-code", code);
        }
      }
      alert("Inscription réussie (mode développement) !");
      
      // Rediriger vers l'onboarding pour les clients
      if (mode === "client") {
        const userId = localStorage.getItem("demos-user-id");
        if (userId) {
          const { isOnboardingComplete } = require("./utils/clientOnboardingStorage");
          if (!isOnboardingComplete(userId)) {
            router.push("/client-portal/onboarding" + (coachCode ? `?coach_code=${coachCode.toUpperCase()}` : ""));
            return;
          }
        }
      }
      
      handleDevSignIn();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl border border-white/10 p-8 max-w-md w-full backdrop-blur-sm">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-full p-5 w-24 h-24 mx-auto mb-4 flex items-center justify-center shadow-xl shadow-red-500/20 border border-white/10">
            <Dumbbell className="text-white" size={40} />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
            Demos
          </h1>
          <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
            <Sparkles size={14} className="text-red-500" />
            Application de coaching premium
          </p>
        </div>

        {mode === "select" && (
          <div className="space-y-4">
            <button
              onClick={() => setMode("coach")}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl px-6 py-4 text-base font-medium hover:from-red-700 hover:to-red-800 transition-all shadow-xl shadow-red-500/30 flex items-center justify-center gap-3 active:scale-95 border border-white/10"
            >
              <Lock size={24} />
              Accès Coach
            </button>
            <button
              onClick={() => setMode("client")}
              className="w-full bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl px-6 py-4 text-base font-medium hover:from-gray-600 hover:to-gray-700 transition-all shadow-xl shadow-gray-900/50 flex items-center justify-center gap-3 active:scale-95 border border-white/10"
            >
              <Users size={24} />
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
                }}
                className="text-gray-400 hover:text-white text-sm transition"
              >
                Retour
              </button>
            </div>

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
                  className="w-full bg-gray-800/50 backdrop-blur-sm rounded-xl border border-white/10 px-4 py-3 text-base text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none transition-all shadow-lg"
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
                  className="w-full bg-gray-800/50 backdrop-blur-sm rounded-xl border border-white/10 px-4 py-3 text-base text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none transition-all shadow-lg"
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
                    className="w-full bg-gray-800/50 backdrop-blur-sm rounded-xl border border-white/10 px-4 py-3 text-base text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none transition-all shadow-lg uppercase"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Si vous avez reçu un code de votre coach, entrez-le ici
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="flex-1 px-6 py-3 text-gray-300 hover:bg-gray-800/50 rounded-xl transition font-medium text-base border border-white/10 backdrop-blur-sm"
                >
                  {isSignUp ? "J'ai déjà un compte" : "Créer un compte"}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl px-6 py-3 hover:from-red-700 hover:to-red-800 transition-all shadow-xl shadow-red-500/30 font-medium text-base active:scale-95 border border-white/10"
                >
                  {isSignUp ? "S'inscrire" : "Se connecter"}
                </button>
              </div>
            </form>

            {/* Badge mode développement */}
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <Sparkles size={12} />
                <span>Mode développement activé</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
