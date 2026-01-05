"use client";
import { useEffect, useState } from "react";
import {
  BarChart2,
  Calendar,
  Users,
  FileText,
  CheckCircle2,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import { getRendezVous, RendezVous } from "../utils/storage";
import { getTotalPaiements, getPaiements } from "../utils/facturationStorage";
import { getSeancesAujourdhui } from "../utils/seanceStorage";

// Composant pour afficher les derniers paiements
function DerniersPaiements() {
  const [paiements, setPaiements] = useState<any[]>([]);

  useEffect(() => {
    const loadPaiements = () => {
      const allPaiements = getPaiements();
      const sorted = allPaiements.sort((a, b) => {
        const dateA = new Date(a.date.split("/").reverse().join("-"));
        const dateB = new Date(b.date.split("/").reverse().join("-"));
        return dateB.getTime() - dateA.getTime();
      });
      setPaiements(sorted.slice(0, 5));
    };

    loadPaiements();
    const handlePaiementsUpdate = () => loadPaiements();
    window.addEventListener('paiementsUpdated', handlePaiementsUpdate);
    window.addEventListener('focus', handlePaiementsUpdate);
    return () => {
      window.removeEventListener('paiementsUpdated', handlePaiementsUpdate);
      window.removeEventListener('focus', handlePaiementsUpdate);
    };
  }, []);

  if (paiements.length === 0) {
    return (
      <div className="text-sm text-gray-400 text-center py-4">
        Aucun paiement récent
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {paiements.map((paiement) => (
          <div
            key={paiement.id}
            className="bg-gradient-to-br from-white to-gray-50 border border-white/20 rounded-xl p-3 flex items-center justify-between hover:shadow-xl hover:border-red-500/30 transition-all backdrop-blur-sm"
          >
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-800">{paiement.client}</div>
            <div className="text-xs text-gray-500 mt-1">{paiement.date}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-red-600">{paiement.montant}</span>
            <CheckCircle2 className="text-gray-600" size={16} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [chiffreAffaires, setChiffreAffaires] = useState(2300);
  const [seancesAujourdhui, setSeancesAujourdhui] = useState<any[]>([]);
  const objectifCA = 5000;

  useEffect(() => {
    setRendezVous(getRendezVous());
    const initialCA = getTotalPaiements();
    if (initialCA > 0) {
      setChiffreAffaires(initialCA);
    }
    setSeancesAujourdhui(getSeancesAujourdhui());
  }, []);

  useEffect(() => {
    const handlePaiementsUpdate = () => {
      const currentCA = getTotalPaiements();
      if (currentCA > 0) {
        setChiffreAffaires(currentCA);
      }
    };
    const handleSeancesUpdate = () => {
      setSeancesAujourdhui(getSeancesAujourdhui());
    };
    window.addEventListener('paiementsUpdated', handlePaiementsUpdate);
    window.addEventListener('seancesUpdated', handleSeancesUpdate);
    window.addEventListener('focus', () => {
      handlePaiementsUpdate();
      handleSeancesUpdate();
    });
    return () => {
      window.removeEventListener('paiementsUpdated', handlePaiementsUpdate);
      window.removeEventListener('seancesUpdated', handleSeancesUpdate);
    };
  }, []);

  const getClientIdByName = (name: string) => {
    const clients: { [key: string]: number } = {
      "Mathieu Dupont": 1,
      "Chloé Martin": 2,
      "Lucas Bernard": 3,
      "Sophie Lemoine": 4,
      "Didier Renard": 5,
    };
    return clients[name];
  };

  const handleRDVClick = (clientName: string) => {
    const clientId = getClientIdByName(clientName);
    if (clientId) {
      router.push(`/clients?client=${clientId}`);
    }
  };

  const prochainsRDV = rendezVous.slice(0, 3).map((rdv) => ({
    client: rdv.client,
    heure: rdv.heure,
    date: rdv.date || "Aujourd'hui",
    lieu: rdv.lieu,
    typeLieu: rdv.typeLieu,
  }));

  const pourcentageCA = Math.round((chiffreAffaires / objectifCA) * 100);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500 mt-1">Vue d'ensemble de votre activité</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Chiffre d'affaires */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl p-6 border-l-4 border-red-600 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Chiffre d'affaires</p>
                  <p className="text-2xl font-bold text-gray-800 mt-2">
                    {chiffreAffaires.toLocaleString("fr-FR")}€
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <DollarSign className="text-red-600" size={24} />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Objectif: {objectifCA.toLocaleString("fr-FR")}€</span>
                  <span className="font-semibold">{pourcentageCA}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      pourcentageCA >= 100 ? "bg-gray-600" : "bg-red-600"
                    }`}
                    style={{ width: `${Math.min(pourcentageCA, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Séances aujourd'hui */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl p-6 border-l-4 border-gray-600 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Séances aujourd'hui</p>
                  <p className="text-2xl font-bold text-gray-800 mt-2">
                    {seancesAujourdhui.length}
                  </p>
                </div>
                <div className="bg-gray-100 p-3 rounded-full">
                  <CheckCircle2 className="text-gray-600" size={24} />
                </div>
              </div>
            </div>

            {/* Prochains RDV */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl p-6 border-l-4 border-red-600 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Prochains RDV</p>
                  <p className="text-2xl font-bold text-gray-800 mt-2">
                    {prochainsRDV.length}
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <Calendar className="text-red-600" size={24} />
                </div>
              </div>
            </div>

            {/* Clients actifs */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl p-6 border-l-4 border-gray-600 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Clients actifs</p>
                  <p className="text-2xl font-bold text-gray-800 mt-2">5</p>
                </div>
                <div className="bg-gray-100 p-3 rounded-full">
                  <Users className="text-gray-600" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - 2/3 */}
            <div className="lg:col-span-2 space-y-6">
              {/* Prochains RDV */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl p-6 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Calendar className="text-red-600" size={24} />
                    Prochains Rendez-vous
                  </h2>
                </div>
                {prochainsRDV.length > 0 ? (
                  <div className="space-y-3">
                    {prochainsRDV.map((rdv, i) => (
                  <div
                    key={i}
                    onClick={() => handleRDVClick(rdv.client)}
                    className="bg-gradient-to-br from-gray-50 to-white border border-white/20 rounded-xl p-4 hover:shadow-xl hover:border-red-500/30 cursor-pointer transition-all backdrop-blur-sm"
                  >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800">{rdv.client}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {rdv.date} à {rdv.heure}
                            </p>
                            <span className="inline-block mt-2 px-3 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded-full">
                              {rdv.lieu}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    Aucun rendez-vous prévu
                  </div>
                )}
              </div>

              {/* Séances complétées */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl p-6 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <CheckCircle2 className="text-red-600" size={24} />
                    Séances complétées aujourd'hui
                  </h2>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                    {seancesAujourdhui.length}
                  </span>
                </div>
                {seancesAujourdhui.length > 0 ? (
                  <div className="space-y-2">
                    {seancesAujourdhui.map((seance, idx) => (
                      <div
                        key={idx}
                        className="bg-gradient-to-br from-gray-50 to-white border border-white/20 rounded-xl p-3 flex items-center gap-3 backdrop-blur-sm"
                      >
                        <CheckCircle2 className="text-red-600" size={18} />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-800">
                            Client #{seance.clientId}
                          </div>
                          <div className="text-xs text-gray-500">{seance.jour}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-400 text-sm">
                    Aucune séance complétée aujourd'hui
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - 1/3 */}
            <div className="space-y-6">
              {/* Derniers Paiements */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl p-6 border border-white/10 backdrop-blur-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText className="text-red-600" size={24} />
                  Derniers Paiements
                </h2>
                <DerniersPaiements />
              </div>

              {/* Graphique de progression */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl p-6 border border-white/10 backdrop-blur-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="text-red-600" size={24} />
                  Progression
                </h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Objectif mensuel</span>
                      <span className="font-semibold">{pourcentageCA}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          pourcentageCA >= 100 ? "bg-gray-600" : "bg-red-600"
                        }`}
                        style={{ width: `${Math.min(pourcentageCA, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
