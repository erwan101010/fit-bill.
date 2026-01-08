"use client";
import { useRouter } from "next/navigation";
import { supabase } from "../../utils/supabase";
import { useState } from "react";

import { Wallet, Calendar, MessageSquare } from "lucide-react";

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
    <div className="min-h-screen relative text-white">
      <div className="max-w-7xl mx-auto p-8">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-[#E21D2C]">TABLEAU DE BORD COACH</h1>
          <div>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="bg-[#E21D2C] text-white px-4 py-2 rounded-lg font-bold hover:brightness-95 disabled:opacity-60"
            >
              {loading ? "Déconnexion..." : "Déconnexion"}
            </button>
          </div>
        </header>

        {/* SECTION 1: Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 border border-[#E21D2C]">
            <div className="flex items-center gap-4">
              <Wallet className="text-[#E21D2C]" size={28} />
              <div>
                <div className="text-sm text-white/80">CA Ce Mois</div>
                <div className="text-2xl font-bold text-white">2 300€</div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border border-[#E21D2C]">
            <div className="flex items-center gap-4">
              <Wallet className="text-[#E21D2C]" size={28} />
              <div>
                <div className="text-sm text-white/80">CA Cette Année</div>
                <div className="text-2xl font-bold text-white">27 400€</div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border border-[#E21D2C]">
            <div className="flex items-center gap-4">
              <MessageSquare className="text-[#E21D2C]" size={28} />
              <div>
                <div className="text-sm text-white/80">Nouveaux Messages</div>
                <div className="text-2xl font-bold text-white">3</div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: Planning du jour */}
        <section className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Planning du Jour</h2>
            <div className="text-sm text-gray-400">Aujourd'hui</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left table-auto">
              <thead>
                <tr className="text-gray-400 text-sm">
                  <th className="py-2">Heure</th>
                  <th className="py-2">Client</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-white/6">
                  <td className="py-3">09:00</td>
                  <td className="py-3">Mathieu Dupont</td>
                  <td className="py-3">Séance 1:1</td>
                  <td className="py-3 text-sm text-green-400">Confirmé</td>
                </tr>
                <tr className="border-t border-white/6">
                  <td className="py-3">11:30</td>
                  <td className="py-3">Chloé Martin</td>
                  <td className="py-3">Bilan</td>
                  <td className="py-3 text-sm text-yellow-300">À confirmer</td>
                </tr>
                <tr className="border-t border-white/6">
                  <td className="py-3">15:00</td>
                  <td className="py-3">Lucas Bernard</td>
                  <td className="py-3">Séance 1:1</td>
                  <td className="py-3 text-sm text-gray-300">Planifié</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 3: Messages et notifications */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h3 className="text-sm text-gray-400 mb-4">Derniers messages</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E21D2C]/20 flex items-center justify-center text-[#E21D2C]">M</div>
                <div>
                  <div className="text-sm font-medium">Mathieu Dupont</div>
                  <div className="text-xs text-gray-400">Salut Coach, pouvez-vous confirmer la séance de demain ?</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white">C</div>
                <div>
                  <div className="text-sm font-medium">Chloé Martin</div>
                  <div className="text-xs text-gray-400">Merci pour le programme !</div>
                </div>
              </li>
            </ul>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-sm text-gray-400 mb-4">Notifications clients</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li>Paiement reçu de Jean D. (150€)</li>
              <li>Nouveau message de Sarah L.</li>
              <li>Séance terminée avec Marc A.</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
