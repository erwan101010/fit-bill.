"use client";
import { useRouter } from "next/navigation";
import { supabase } from "../../utils/supabase";
import { useState } from "react";

export default function CoachDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      if (supabase?.auth?.signOut) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      // ignore errors
    }

    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("demos-logged-in");
        localStorage.removeItem("demos-user-id");
        localStorage.removeItem("demos-user-name");
        localStorage.removeItem("demos-user-type");
      }
    } catch (e) {
      // ignore
    }

    setLoading(false);
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-3xl w-full p-8 text-center">
        <h1 className="text-4xl font-extrabold text-[#E21D2C] mb-6">TABLEAU DE BORD COACH</h1>
        <p className="text-gray-400 mb-8">Bienvenue — ceci est une page de développement</p>
        <button
          onClick={handleLogout}
          disabled={loading}
          className="bg-[#E21D2C] text-white px-6 py-3 rounded-lg font-bold hover:brightness-95 disabled:opacity-60"
        >
          {loading ? "Déconnexion..." : "Déconnexion"}
        </button>
      </div>
    </div>
  );
}
