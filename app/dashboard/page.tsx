"use client";
import { useEffect, useState } from "react";
import {
  BarChart2,
  AlertCircle,
  Calendar,
  Users,
  FileText,
  Home,
  Dumbbell,
  Monitor,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getRendezVous, RendezVous } from "../utils/storage";
import { getTotalPaiements, getPaiements } from "../utils/facturationStorage";
import { getSeancesAujourdhui, getDerniereOuvertureClient } from "../utils/seanceStorage";

const mockDashboard = {
  chiffreAffaires: 2300, // En nombre pour les calculs
  objectifCA: 5000,
  alertClients: [
    { name: "Mathieu Dupont", lastActive: "il y a 4 jours" },
    { name: "Chloé Martin", lastActive: "il y a 3 jours" },
  ],
  prochainsRDV: [
    {
      client: "Lucas Bernard",
      heure: "14:00",
      date: "Aujourd'hui",
      lieu: "Salle Demos",
    },
    {
      client: "Sophie Lemoine",
      heure: "16:30",
      date: "Aujourd'hui",
      lieu: "En ligne",
    },
    {
      client: "Didier Renard",
      heure: "10:00",
      date: "Demain",
      lieu: "Salle Urban",
    },
  ],
};

const NAV_ITEMS = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/dashboard",
  },
  {
    label: "Agenda",
    icon: Calendar,
    href: "/agenda",
  },
  {
    label: "Clients",
    icon: Users,
    href: "/clients",
  },
  {
    label: "Bibliothèque",
    icon: BookOpen,
    href: "/bibliotheque",
  },
  {
    label: "Facturation",
    icon: FileText,
    href: "/facturation",
  },
];

// Composant pour afficher les derniers paiements
function DerniersPaiements() {
  const [paiements, setPaiements] = useState<any[]>([]);

  useEffect(() => {
    const loadPaiements = () => {
      const allPaiements = getPaiements();
      // Trier par date (plus récents en premier) et prendre les 5 derniers
      const sorted = allPaiements.sort((a, b) => {
        const dateA = new Date(a.date.split("/").reverse().join("-"));
        const dateB = new Date(b.date.split("/").reverse().join("-"));
        return dateB.getTime() - dateA.getTime();
      });
      setPaiements(sorted.slice(0, 5));
    };

    loadPaiements();

    const handlePaiementsUpdate = () => {
      loadPaiements();
    };
    window.addEventListener('paiementsUpdated', handlePaiementsUpdate);
    window.addEventListener('focus', handlePaiementsUpdate);
    return () => {
      window.removeEventListener('paiementsUpdated', handlePaiementsUpdate);
      window.removeEventListener('focus', handlePaiementsUpdate);
    };
  }, []);

  if (paiements.length === 0) {
    return (
      <div className="text-sm text-slate-400 text-center py-4">
        Aucun paiement récent
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {paiements.map((paiement) => (
        <div
          key={paiement.id}
          className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between"
        >
          <div className="flex-1">
            <div className="text-sm font-medium text-slate-700">{paiement.client}</div>
            <div className="text-xs text-slate-500 mt-1">{paiement.date}</div>
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

function DashboardPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [chiffreAffaires, setChiffreAffaires] = useState(2300);
  const [seancesAujourdhui, setSeancesAujourdhui] = useState<any[]>([]);

  useEffect(() => {
    setRendezVous(getRendezVous());
    // Charger le CA depuis localStorage
    const initialCA = getTotalPaiements();
    if (initialCA > 0) {
      setChiffreAffaires(initialCA);
    }
    // Charger les séances complétées aujourd'hui
    setSeancesAujourdhui(getSeancesAujourdhui());
  }, []);

  // Mettre à jour le CA quand les paiements changent
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

  // Récupérer les prochains RDV depuis localStorage
  const prochainsRDV = rendezVous.slice(0, 3).map((rdv) => ({
    client: rdv.client,
    heure: rdv.heure,
    date: rdv.date || "Aujourd'hui",
    lieu: rdv.lieu,
    typeLieu: rdv.typeLieu,
  }));

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      {/* Main Content */}
      <div className="flex-1 px-4 py-6 pb-24 max-w-xl mx-auto w-full">
        <section className="space-y-6">
          {/* Chiffre d'affaires */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 mb-4">
            <div className="flex items-center mb-4">
              <BarChart2 className="text-red-600 mr-4" size={32} />
              <div>
                <div className="text-slate-400 text-sm">Chiffre d'affaires</div>
                <div className="text-2xl font-semibold">
                  {chiffreAffaires.toLocaleString("fr-FR")}€
                </div>
              </div>
            </div>
            {/* Barre de progression */}
            <div>
              <div className="flex justify-between text-sm text-slate-600 mb-2">
                <span>Objectif du mois: {mockDashboard.objectifCA.toLocaleString("fr-FR")}€</span>
                <span className="font-semibold">
                  {Math.round((chiffreAffaires / mockDashboard.objectifCA) * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    chiffreAffaires >= mockDashboard.objectifCA
                      ? "bg-gray-600"
                      : "bg-red-600"
                  }`}
                  style={{
                    width: `${Math.min(
                      (chiffreAffaires / mockDashboard.objectifCA) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Séances complétées aujourd'hui */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="font-semibold text-slate-700 mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle2 className="text-red-600 mr-2" size={20} />
                Séances complétées aujourd'hui
              </div>
              <div className="bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-sm font-medium">
                {seancesAujourdhui.length}
              </div>
            </div>
            {seancesAujourdhui.length === 0 ? (
              <div className="text-sm text-slate-400 text-center py-4">
                Aucune séance complétée aujourd'hui
              </div>
            ) : (
              <div className="space-y-2">
                {seancesAujourdhui.map((seance, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center gap-2"
                  >
                    <CheckCircle2 className="text-red-600" size={18} />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-700">Client #{seance.clientId}</div>
                      <div className="text-xs text-slate-500">{seance.jour}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Derniers Paiements */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="font-semibold text-slate-700 mb-4 flex items-center">
              <FileText className="text-red-600 mr-2" size={20} />
              Derniers Paiements
            </div>
            <DerniersPaiements />
          </div>

          {/* Prochains RDV */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 mt-4">
            <div className="font-semibold text-slate-700 mb-3 flex items-center">
              <Calendar className="text-red-600 mr-2" size={20} />
              Prochains RDV
            </div>
            <ol className="space-y-2">
              {prochainsRDV.length > 0 ? (
                prochainsRDV.map((rdv, i) => {
                  const isSalle = rdv.typeLieu === "salle";
                  const badgeColor = isSalle
                    ? "bg-gray-100 text-gray-700 border border-gray-200"
                    : "bg-gray-100 text-gray-800 border border-gray-200";
                  return (
                    <li
                      onClick={() => handleRDVClick(rdv.client)}
                      className="bg-white rounded-lg border border-slate-200 flex justify-between items-center p-3 hover:bg-gray-50 hover:border-gray-300 cursor-pointer transition"
                      key={rdv.client + rdv.heure + i}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {isSalle ? (
                          <Dumbbell className="text-gray-700" size={18} />
                        ) : (
                          <Monitor className="text-gray-700" size={18} />
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-slate-700">{rdv.client}</div>
                          <div className="text-xs text-slate-500 mt-1">
                            {rdv.date}, {rdv.heure}
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-medium ${badgeColor}`}
                        >
                          {rdv.lieu}
                        </span>
                      </div>
                    </li>
                  );
                })
              ) : (
                <div className="text-center py-4 text-slate-400 text-sm">
                  Aucun rendez-vous prévu
                </div>
              )}
            </ol>
          </div>
        </section>
      </div>

      {/* Bottom Navigation (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t z-[9999] max-w-xl mx-auto">
        <ul className="flex justify-around px-2 py-3">
          {NAV_ITEMS.map((item) => {
            const IconComponent = item.icon;
            const isActive = pathname === item.href;
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl transition min-w-[60px] active:scale-95 ${
                    isActive
                      ? "text-red-600 bg-gray-50"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <IconComponent size={24} />
                  <span className="text-xs mt-1 font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export default DashboardPage;

