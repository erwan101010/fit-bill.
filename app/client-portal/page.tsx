"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Activity,
  TrendingUp,
  Clock,
  Dumbbell,
  MessageCircle,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import ClientSidebar from "../components/ClientSidebar";
import { getRendezVousByClient } from "../utils/storage";
import { updateDerniereOuvertureClient } from "../utils/seanceStorage";
import { isOnboardingComplete, getOnboardingData } from "../utils/clientOnboardingStorage";

export default function ClientPortalPage() {
  const router = useRouter();
  const [clientName, setClientName] = useState("");
  const [todayRDV, setTodayRDV] = useState<any[]>([]);
  const [poidsActuel, setPoidsActuel] = useState(90);
  const [poidsCible, setPoidsCible] = useState(85);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const clientId = localStorage.getItem("demos-user-id");
    const userName = localStorage.getItem("demos-user-name") || "Client";
    setClientName(userName);
    
    // Vérifier si l'onboarding est complété
    if (clientId && !isOnboardingComplete(clientId)) {
      router.push("/client-portal/onboarding");
      return;
    }
    
    // Charger les données d'onboarding
    if (clientId) {
      const onboardingData = getOnboardingData(clientId);
      if (onboardingData) {
        setPoidsActuel(onboardingData.poidsActuel);
        // Calculer le poids cible basé sur l'objectif
        if (onboardingData.objectif === "Sèche") {
          setPoidsCible(onboardingData.poidsActuel - 5);
        } else if (onboardingData.objectif === "Prise de masse") {
          setPoidsCible(onboardingData.poidsActuel + 5);
        } else {
          setPoidsCible(onboardingData.poidsActuel);
        }
      }
    }
    
    updateDerniereOuvertureClient(5);
    const allRDV = getRendezVousByClient(userName);
    const today = new Date();
    const todayStr = today.toLocaleDateString("fr-FR");
    const rdvToday = allRDV.filter((rdv) => rdv.date === todayStr);
    setTodayRDV(rdvToday);

    const savedPoids = localStorage.getItem("client-poids-5");
    if (savedPoids) {
      setPoidsActuel(parseFloat(savedPoids));
    }
    
    setLoading(false);
  }, [router]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  const progressionPourcentage = ((poidsActuel - 95) / (poidsCible - 95)) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ClientSidebar />
      
      <main className="flex-1 lg:ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Bienvenue {clientName.split(" ")[0]} !
            </h1>
            <p className="text-gray-500 mt-1">Votre espace personnel</p>
          </div>

          {/* Séance du jour */}
          {todayRDV.length > 0 ? (
            <Link
              href="/client-portal/seance-active?clientId=5"
              className="block bg-gradient-to-br from-red-600 to-red-700 text-white rounded-xl p-8 shadow-lg hover:shadow-xl transition transform hover:scale-[1.01] mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <Dumbbell size={48} className="opacity-90" />
                <div className="bg-white/20 rounded-full px-4 py-2 text-sm font-medium">
                  {todayRDV[0].heure}
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Ma séance du jour</h2>
              <p className="text-white/90 text-sm mb-4">
                {todayRDV[0].typeLieu === "salle" ? "En salle Demos" : "En ligne"}
              </p>
              <div className="flex items-center gap-2 text-white/90 mb-4">
                <Clock size={16} />
                <span className="text-sm">{todayRDV[0].duree}</span>
              </div>
              <div className="pt-4 border-t border-white/20">
                <div className="text-sm font-medium">Cliquez pour démarrer l'entraînement</div>
              </div>
            </Link>
          ) : (
            <Link
              href="/client-portal/agenda"
              className="block bg-gradient-to-br from-red-600 to-red-700 text-white rounded-xl p-8 shadow-lg hover:shadow-xl transition transform hover:scale-[1.01] mb-6"
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Link
              href="/client-portal/agenda"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border-l-4 border-red-600"
            >
              <div className="flex items-center gap-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <Calendar className="text-red-600" size={24} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium">Mon agenda</p>
                  <p className="text-gray-800 font-semibold mt-1">Réserver une séance</p>
                </div>
              </div>
            </Link>

            <Link
              href="/client-portal/chat"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border-l-4 border-gray-600"
            >
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 p-3 rounded-full">
                  <MessageCircle className="text-gray-600" size={24} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium">Messagerie</p>
                  <p className="text-gray-800 font-semibold mt-1">Contacter mon coach</p>
                </div>
              </div>
            </Link>

            <Link
              href="/client-portal/progression"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border-l-4 border-red-600"
            >
              <div className="flex items-center gap-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <TrendingUp className="text-red-600" size={24} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium">Ma progression</p>
                  <p className="text-gray-800 font-semibold mt-1">Voir mes résultats</p>
                </div>
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progression */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Activity className="text-red-600" size={24} />
                Ma progression
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Poids actuel</span>
                    <span className="font-semibold text-gray-800">{poidsActuel} kg</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-4 bg-gradient-to-r from-red-600 to-red-700 rounded-full transition-all"
                      style={{
                        width: `${Math.min(Math.max(progressionPourcentage, 0), 100)}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Objectif: {poidsCible} kg</span>
                    <span>{Math.round(progressionPourcentage)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Abonnement */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg shadow-md p-6">
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
                    alert("Simulation de paiement Stripe...\n\nEn production, cela ouvrirait le formulaire de paiement Stripe Checkout.");
                    const paymentData = {
                      id: Date.now(),
                      client: clientName,
                      montant: "89€",
                      date: new Date().toLocaleDateString("fr-FR"),
                      status: "Payé",
                    };
                    const { getPaiements, savePaiements } = await import("../utils/facturationStorage");
                    const paiements = getPaiements();
                    paiements.push(paymentData as any);
                    savePaiements(paiements);
                    window.dispatchEvent(new Event('paiementsUpdated'));
                    alert("Paiement réussi ! 🎉\n\nVotre abonnement est actif.");
                  } catch (error) {
                    console.error("Erreur paiement:", error);
                    alert("Une erreur est survenue lors du paiement.");
                  }
                }}
                className="w-full bg-white text-red-600 rounded-lg px-6 py-3 text-base font-medium hover:bg-gray-50 transition shadow-sm flex items-center justify-center gap-2"
              >
                <CreditCard size={20} />
                Payer l'abonnement
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
