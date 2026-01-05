"use client";
import { useEffect, useState } from "react";
import {
  TrendingUp,
  ArrowUp,
  ArrowDown,
  UserPlus,
  MessageCircle,
  DollarSign,
  Search,
  Command,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import { getTotalPaiements } from "../utils/facturationStorage";
import { getOrCreateCoachCode } from "../utils/coachStorage";
import { getAllMessages } from "../utils/chatStorage";
import { getClientCoach } from "../utils/coachStorage";

export default function DashboardPage() {
  const router = useRouter();
  const [chiffreAffaires, setChiffreAffaires] = useState(2300);
  const [coachCode, setCoachCode] = useState<string>("");
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const objectifCA = 5000;

  // Raccourci clavier CMD+K ou CTRL+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Données pour le graphique d'évolution
  const caMoisActuel = chiffreAffaires;
  const caMoisPrecedent = 1800;
  const evolutionCA = ((caMoisActuel - caMoisPrecedent) / caMoisPrecedent) * 100;
  
  // Données mensuelles pour le graphique (6 derniers mois)
  const donneesMensuelles = [
    { mois: "Août", ca: 1500 },
    { mois: "Sept", ca: 1700 },
    { mois: "Oct", ca: 1800 },
    { mois: "Nov", ca: 1900 },
    { mois: "Déc", ca: 2000 },
    { mois: "Jan", ca: caMoisActuel },
  ];
  const maxCA = Math.max(...donneesMensuelles.map(d => d.ca));

  useEffect(() => {
    const initialCA = getTotalPaiements();
    if (initialCA > 0) {
      setChiffreAffaires(initialCA);
    }
    
    // Générer ou récupérer le code coach
    if (typeof window !== "undefined") {
      const coachId = localStorage.getItem("demos-user-id");
      const coachName = localStorage.getItem("demos-user-name") || "Coach";
      const coachEmail = localStorage.getItem("demos-user-email") || "";
      if (coachId) {
        const code = getOrCreateCoachCode(coachId, coachName, coachEmail);
        setCoachCode(code);
      }

      // Récupérer les 3 dernières activités
      const activities: any[] = [];
      
      // Dernier message reçu
      const allMessages = getAllMessages();
      if (allMessages.length > 0) {
        const lastMessage = allMessages[allMessages.length - 1];
        if (lastMessage.sender === "client") {
          activities.push({
            type: "message",
            icon: MessageCircle,
            title: "Nouveau message",
            description: `Message de client #${lastMessage.clientId}`,
            time: new Date(lastMessage.timestamp).toLocaleDateString("fr-FR"),
            color: "blue",
            href: "/dashboard/messages",
          });
        }
      }

      // Nouveau client (simulé - à remplacer par vraie logique)
      activities.push({
        type: "client",
        icon: UserPlus,
        title: "Nouveau client",
        description: "Mathieu Dupont a rejoint",
        time: "Il y a 2 jours",
        color: "green",
        href: "/clients",
      });

      // Nouveau paiement
      if (initialCA > 0) {
        activities.push({
          type: "paiement",
          icon: DollarSign,
          title: "Paiement reçu",
          description: `${initialCA}€ ce mois`,
          time: "Aujourd'hui",
          color: "red",
          href: "/facturation",
        });
      }

      setRecentActivities(activities.slice(0, 3));
    }
  }, []);

  useEffect(() => {
    const handlePaiementsUpdate = () => {
      const currentCA = getTotalPaiements();
      if (currentCA > 0) {
        setChiffreAffaires(currentCA);
      }
    };
    window.addEventListener('paiementsUpdated', handlePaiementsUpdate);
    window.addEventListener('focus', handlePaiementsUpdate);
    return () => {
      window.removeEventListener('paiementsUpdated', handlePaiementsUpdate);
    };
  }, []);

  const pourcentageCA = Math.round((chiffreAffaires / objectifCA) * 100);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Barre de recherche flottante */}
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
            <button
              onClick={() => setShowSearch(true)}
              className="w-full bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-white/40 px-6 py-4 flex items-center gap-4 hover:shadow-red-500/30 hover:border-red-500/30 transition-all duration-300 group"
              style={{
                boxShadow: '0 0 30px rgba(239, 68, 68, 0.3), 0 10px 25px -5px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Search className="text-gray-400 group-hover:text-red-500 transition-colors" size={20} strokeWidth={1.5} />
              <span className="flex-1 text-left text-gray-500 group-hover:text-gray-700 transition-colors">Rechercher clients, factures...</span>
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg">
                <Command size={14} className="text-gray-500" />
                <span className="text-xs text-gray-500">K</span>
              </div>
            </button>
          </div>

          {/* Modal de recherche */}
          {showSearch && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20" onClick={() => setShowSearch(false)}>
              <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border-2 border-white/40 w-full max-w-2xl mx-4 p-6" onClick={(e) => e.stopPropagation()} style={{
                boxShadow: '0 0 50px rgba(239, 68, 68, 0.4), 0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              }}>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} strokeWidth={1.5} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher clients, factures..."
                    className="w-full bg-white/50 backdrop-blur-md rounded-xl border-2 border-white/40 px-12 py-4 text-base text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none transition-all shadow-lg"
                    autoFocus
                  />
                  <button
                    onClick={() => setShowSearch(false)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ESC
                  </button>
                </div>
                {searchQuery && (
                  <div className="mt-4 space-y-2">
                    <div className="text-xs text-gray-500 px-2">Résultats pour "{searchQuery}"</div>
                    <div className="text-sm text-gray-400 px-2">Fonctionnalité de recherche en cours de développement...</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Header */}
          <div className="mb-8 mt-20">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500 mt-1">Vue d'ensemble de votre activité</p>
          </div>

          {/* Carte principale avec Border Beam */}
          <div className="relative bg-white/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-8 border-2 border-white/40 overflow-hidden card-tilt" style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(239, 68, 68, 0.1), 0 0 40px rgba(239, 68, 68, 0.1)',
          }}>
            {/* Background Glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/20 via-transparent to-red-500/20 opacity-50 -z-10 blur-2xl"></div>
            {/* Border Beam effect */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent">
                <div 
                  className="absolute w-32 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent"
                  style={{
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    animation: 'border-beam-top 3s linear infinite',
                  }}
                ></div>
                <div 
                  className="absolute w-0.5 h-32 bg-gradient-to-b from-transparent via-red-500 to-transparent"
                  style={{
                    right: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    animation: 'border-beam-right 3s linear infinite 0.75s',
                  }}
                ></div>
                <div 
                  className="absolute w-32 h-0.5 bg-gradient-to-l from-transparent via-red-500 to-transparent"
                  style={{
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    animation: 'border-beam-bottom 3s linear infinite 1.5s',
                  }}
                ></div>
                <div 
                  className="absolute w-0.5 h-32 bg-gradient-to-t from-transparent via-red-500 to-transparent"
                  style={{
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    animation: 'border-beam-left 3s linear infinite 2.25s',
                  }}
                ></div>
              </div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <TrendingUp className="text-red-600" size={28} />
                  Évolution du Chiffre d'Affaires
                </h2>
                <div className="flex items-center gap-3 relative">
                  {evolutionCA >= 0 ? (
                    <div className="flex items-center gap-2 text-green-600 relative">
                      <div style={{ 
                        position: 'absolute', 
                        top: '-15px', 
                        right: '-25px', 
                        zIndex: 9999,
                        pointerEvents: 'none',
                      }}>
                        <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[15px] animate-pulse" style={{
                          borderBottomColor: '#00FF00',
                          animation: 'float-rotate 2s ease-in-out infinite',
                          filter: 'drop-shadow(0 0 8px #00FF00)',
                        }}></div>
                        <div className="absolute inset-0 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[15px] opacity-50 animate-ping" style={{
                          borderBottomColor: '#00FF00',
                          filter: 'drop-shadow(0 0 12px #00FF00)',
                        }}></div>
                      </div>
                      <ArrowUp size={18} strokeWidth={1.5} />
                      <span className="text-sm font-semibold">+{evolutionCA.toFixed(1)}%</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-600">
                      <ArrowDown size={18} strokeWidth={1.5} />
                      <span className="text-sm font-semibold">{evolutionCA.toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-end justify-between gap-3 h-64">
                  {donneesMensuelles.map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-3">
                      <div className="relative w-full h-56 flex items-end">
                        <div
                          className="w-full bg-gradient-to-t from-red-600 to-red-700 rounded-t-xl transition-all hover:from-red-700 hover:to-red-800 cursor-pointer shadow-lg shadow-red-500/20 border border-white/10"
                          style={{ height: `${(data.ca / maxCA) * 100}%` }}
                          title={`${data.mois}: ${data.ca}€`}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 font-medium">{data.mois}</span>
                      <span className="text-xs text-gray-500">{data.ca}€</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600">Mois actuel</p>
                    <p className="text-2xl font-bold text-gray-800">{caMoisActuel}€</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Mois précédent</p>
                    <p className="text-2xl font-bold text-gray-800">{caMoisPrecedent}€</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bouton VOIR CÔTÉ CLIENT */}
          <div className="flex justify-center my-12">
            <a
              href="/client"
              className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl px-12 py-6 text-xl font-bold flex items-center gap-3 hover:from-red-700 hover:to-red-800 transition-all shadow-2xl shadow-red-500/50 border-2 border-white/20 hover:border-white/40 hover:scale-105 active:scale-95"
              style={{
                boxShadow: '0 0 50px rgba(239, 68, 68, 0.6), 0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              }}
            >
              <User size={28} strokeWidth={2} />
              VOIR CÔTÉ CLIENT
            </a>
          </div>

          {/* 3 Dernières activités */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800">Dernières activités</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentActivities.map((activity, index) => {
                const IconComponent = activity.icon;
                const colorClasses = {
                  blue: "bg-blue-100 text-blue-600",
                  green: "bg-green-100 text-green-600",
                  red: "bg-red-100 text-red-600",
                };
                return (
                  <div
                    key={index}
                    onClick={() => {
                      if (activity.href) {
                        router.push(activity.href);
                      }
                    }}
                    className="bg-white/80 backdrop-blur-2xl rounded-xl shadow-2xl p-6 border-2 border-white/40 hover:shadow-red-500/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer active:scale-95 card-tilt relative" 
                    style={{
                      boxShadow: activity.href 
                        ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(239, 68, 68, 0.1), 0 0 30px rgba(239, 68, 68, 0.1)' 
                        : undefined,
                    }}
                  >
                    {/* Background Glow */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-red-500/10 via-transparent to-red-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl"></div>
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${colorClasses[activity.color as keyof typeof colorClasses]}`}>
                        <IconComponent size={24} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-1">{activity.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
