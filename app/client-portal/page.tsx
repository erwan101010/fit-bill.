"use client";
import { useState, useEffect } from "react";
import {
  Calendar,
  Activity,
  TrendingUp,
  Clock,
  Dumbbell,
  Monitor,
  Home,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getRendezVousByClient } from "../utils/storage";
import { updateDerniereOuvertureClient } from "../utils/seanceStorage";
import { CreditCard, MessageCircle } from "lucide-react";

export default function ClientPortalPage() {
  const pathname = usePathname();
  const [clientName] = useState("Didier Renard"); // En production, cela viendrait de l'authentification
  const [todayRDV, setTodayRDV] = useState<any[]>([]);
  const [poidsActuel, setPoidsActuel] = useState(90);
  const [poidsCible, setPoidsCible] = useState(85);

  useEffect(() => {
    // Mettre à jour la dernière ouverture
    updateDerniereOuvertureClient(5); // ID du client (Didier Renard)

    // Récupérer les RDV d'aujourd'hui pour ce client
    const allRDV = getRendezVousByClient(clientName);
    const today = new Date();
    const todayStr = today.toLocaleDateString("fr-FR");
    const rdvToday = allRDV.filter((rdv) => rdv.date === todayStr);
    setTodayRDV(rdvToday);

    // Charger le poids depuis localStorage
    const savedPoids = localStorage.getItem("client-poids-5");
    if (savedPoids) {
      setPoidsActuel(parseFloat(savedPoids));
    }
  }, [clientName]);

  const progressionPourcentage = ((poidsActuel - 95) / (poidsCible - 95)) * 100;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 shadow-lg">
        <div className="flex items-center justify-between max-w-xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-bold">Bienvenue {clientName.split(" ")[0]} !</h1>
            <p className="text-white/90 text-sm mt-1">Votre espace personnel</p>
          </div>
          <Link
            href="/"
            className="bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 text-sm font-medium transition flex items-center gap-2"
          >
            <LogOut size={16} />
            Déconnexion
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 px-4 py-6 pb-32 max-w-xl mx-auto w-full">
        <section className="space-y-6">
          {/* Ma séance du jour */}
          {todayRDV.length > 0 ? (
            <Link
              href="/client-portal/seance-active?clientId=5"
              className="block bg-gradient-to-br from-red-600 to-red-700 text-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex items-center justify-between mb-4">
                <Dumbbell size={48} className="opacity-90" />
                <div className="bg-white/20 rounded-full px-4 py-2 text-sm font-medium">
                  {todayRDV[0].heure}
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Ma séance du jour</h2>
              <p className="text-white/90 text-sm">
                {todayRDV[0].typeLieu === "salle" ? "En salle Demos" : "En ligne"}
              </p>
              <div className="mt-4 flex items-center gap-2 text-white/90">
                <Clock size={16} />
                <span className="text-sm">{todayRDV[0].duree}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="text-sm font-medium">Cliquez pour démarrer l'entraînement</div>
              </div>
            </Link>
          ) : (
            <Link
              href="/client-portal/agenda"
              className="block bg-gradient-to-br from-red-600 to-red-700 text-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex items-center justify-between mb-4">
                <Calendar size={48} className="opacity-90" />
                <div className="bg-white/20 rounded-full px-4 py-2 text-sm font-medium">
                  Réserver
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Ma séance du jour</h2>
              <p className="text-white/90 text-sm">Aucune séance prévue aujourd'hui</p>
            </Link>
          )}

          {/* Paiement Abonnement */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold text-lg mb-1">Abonnement mensuel</div>
                <div className="text-white/90 text-sm">Accès illimité aux séances</div>
              </div>
              <div className="text-2xl font-bold">89€</div>
            </div>
            <button
              onClick={async () => {
                try {
                  // Simulation du paiement Stripe
                  alert("Simulation de paiement Stripe...\n\nEn production, cela ouvrirait le formulaire de paiement Stripe Checkout.");
                  
                  // Simuler un paiement réussi
                  const paymentData = {
                    id: Date.now(),
                    client: clientName,
                    montant: "89€",
                    date: new Date().toLocaleDateString("fr-FR"),
                    status: "Payé",
                  };

                  // Ajouter au système de paiements
                  const { getPaiements, savePaiements } = await import("../utils/facturationStorage");
                  const paiements = getPaiements();
                  paiements.push(paymentData as any);
                  savePaiements(paiements);
                  
                  // Notifier le Dashboard
                  window.dispatchEvent(new Event('paiementsUpdated'));
                  
                  alert("Paiement réussi ! 🎉\n\nVotre abonnement est actif.");
                } catch (error) {
                  console.error("Erreur paiement:", error);
                  alert("Une erreur est survenue lors du paiement.");
                }
              }}
              className="w-full bg-white text-red-600 rounded-xl px-6 py-3 text-base font-medium hover:bg-gray-50 transition shadow-sm flex items-center justify-center gap-2 active:scale-95"
            >
              <CreditCard size={20} />
              Payer l'abonnement
            </button>
          </div>

          {/* Accès rapide */}
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/client-portal/agenda"
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition flex flex-col items-center justify-center min-h-32 active:scale-95"
            >
              <Calendar className="text-red-600 mb-3" size={32} />
              <div className="font-semibold text-slate-700 text-center">Mon agenda</div>
              <div className="text-xs text-slate-400 text-center mt-1">Réserver une séance</div>
            </Link>
            <Link
              href="/client-portal/chat"
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition flex flex-col items-center justify-center min-h-32 active:scale-95"
            >
              <MessageCircle className="text-red-600 mb-3" size={32} />
              <div className="font-semibold text-slate-700 text-center">Messagerie</div>
              <div className="text-xs text-slate-400 text-center mt-1">Contacter mon coach</div>
            </Link>
            <Link
              href="/client-portal/progression"
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition flex flex-col items-center justify-center min-h-32 active:scale-95"
            >
              <TrendingUp className="text-red-600 mb-3" size={32} />
              <div className="font-semibold text-slate-700 text-center">Ma progression</div>
              <div className="text-xs text-slate-400 text-center mt-1">Voir mes résultats</div>
            </Link>
          </div>

          {/* Graphique de progression */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700 flex items-center">
                <Activity className="text-red-600 mr-2" size={20} />
                Ma progression
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-slate-600 mb-2">
                  <span>Poids actuel</span>
                  <span className="font-semibold text-slate-700">{poidsActuel} kg</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-red-700 rounded-full transition-all"
                    style={{
                      width: `${Math.min(Math.max(progressionPourcentage, 0), 100)}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-2">
                  <span>Objectif: {poidsCible} kg</span>
                  <span>{Math.round(progressionPourcentage)}%</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

