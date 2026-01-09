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
  X,
  Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "../components/Sidebar";
import { ComplianceStatus } from "../components/ComplianceStatus";
import { getTotalPaiements } from "../utils/facturationStorage";
import { getOrCreateCoachCode } from "../utils/coachStorage";
import { supabase } from "../utils/supabase";

export default function DashboardPage() {
  const router = useRouter();
  const [chiffreAffaires, setChiffreAffaires] = useState(2300);
  const [coachCode, setCoachCode] = useState<string>("");
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCAModal, setShowCAModal] = useState(false);
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
    const loadData = async () => {
      const initialCA = getTotalPaiements();
      if (initialCA > 0) {
        setChiffreAffaires(initialCA);
      }
      
      // Générer ou récupérer le code coach
      if (typeof window !== "undefined") {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const coachId = session.user.id;
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email, updated_at")
            .eq("id", coachId)
            .single();
          
          if (profile) {
            const code = getOrCreateCoachCode(coachId, profile.full_name || "Coach", profile.email || "");
            setCoachCode(code);
          }

          // Récupérer les 3 dernières activités
          const activities: any[] = [];
          
          // Dernier message reçu depuis Supabase
          const { data: messagesData } = await supabase
            .from("messages")
            .select("*")
            .eq("receiver_id", coachId)
            .order("created_at", { ascending: false })
            .limit(1);
          
          if (messagesData && messagesData.length > 0) {
            const lastMessage = messagesData[0];
            activities.push({
              type: "message",
              icon: MessageCircle,
              title: "Nouveau message",
              description: "Message reçu",
              time: new Date(lastMessage.created_at).toLocaleDateString("fr-FR"),
              color: "blue",
              href: "/dashboard/chat",
            });
          }

          // Nouveau client (depuis Supabase)
          const { data: clientsData } = await supabase
            .from("profiles")
            .select("full_name, created_at, updated_at")
            .eq("user_type", "client")
            .order("created_at", { ascending: false })
            .limit(1);
          
          if (clientsData && clientsData.length > 0) {
            const newClient = clientsData[0];
            activities.push({
              type: "client",
              icon: UserPlus,
              title: "Nouveau client",
              description: `${newClient.full_name || "Client"} a rejoint`,
              time: new Date(newClient.created_at).toLocaleDateString("fr-FR"),
              color: "green",
              href: "/clients",
            });
          }

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
      }
    };

    loadData();
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
          {/* Header avec badge de conformité */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
            <ComplianceStatus />
          </div>

          {/* Barre de recherche flottante */}
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
            <button
              onClick={() => setShowSearch(true)}
              className="w-full bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-white/40 px-6 py-4 flex items-center gap-4 hover:shadow-demos-red/30 hover:border-demos-red/30 transition-all duration-300 group"
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
                          className="w-full bg-white/50 backdrop-blur-md rounded-xl border-2 border-white/40 px-12 py-4 text-base text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-demos-red/50 focus:border-demos-red/50 outline-none transition-all shadow-lg"
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
                  <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                    <div className="text-xs text-gray-500 px-2 mb-3">Résultats pour "{searchQuery}"</div>
                    {/* Clients */}
                    <div className="space-y-2">
                      {[
                        { id: 1, name: "Mathieu Dupont", email: "mathieu.dupont@email.com" },
                        { id: 2, name: "Chloé Martin", email: "chloe.martin@email.com" },
                        { id: 3, name: "Lucas Bernard", email: "lucas.bernard@email.com" },
                        { id: 4, name: "Sophie Lemoine", email: "sophie.lemoine@email.com" },
                        { id: 5, name: "Didier Renard", email: "didier.renard@email.com" },
                      ]
                        .filter(client => 
                          client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          client.email.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map(client => (
                          <button
                            key={client.id}
                            onClick={() => {
                              router.push(`/clients?client=${client.id}`);
                              setShowSearch(false);
                              setSearchQuery("");
                            }}
                            className="w-full text-left p-3 bg-white/50 hover:bg-white/80 rounded-xl border border-white/40 hover:border-red-500/50 transition-all hover:shadow-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="bg-demos-red/20 p-2 rounded-lg border border-demos-red/30">
                                <User size={18} className="text-red-500" strokeWidth={1.5} />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{client.name}</p>
                                <p className="text-xs text-gray-500">{client.email}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                    </div>
                    {/* Factures */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="text-xs text-gray-500 px-2 mb-2">Factures</div>
                      <div className="text-sm text-gray-400 px-2">Recherche de factures en cours de développement...</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Header */}
          <div className="mb-8 mt-20">
            <h1 className="text-3xl font-bold text-gray-800">BIENVENUE COACH</h1>
            <p className="text-gray-500 mt-1">Vue d'ensemble de votre activité</p>
          </div>

          {/* Carte principale avec Border Beam */}
          <div 
            onClick={() => setShowCAModal(true)}
            className="relative bg-white/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-8 border-2 border-white/40 overflow-hidden card-tilt cursor-pointer hover:scale-[1.02] transition-transform duration-300" 
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(239, 68, 68, 0.1), 0 0 40px rgba(239, 68, 68, 0.1)',
            }}
          >
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
                          className="w-full bg-gradient-to-t from-demos-red to-demos-red/90 rounded-t-xl transition-all hover:from-demos-red/90 hover:to-demos-red/80 cursor-pointer shadow-lg shadow-demos-red/20 border border-white/10"
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
              href="/client-portal"
              className="bg-gradient-to-r from-demos-red to-demos-red/90 text-white rounded-2xl px-12 py-6 text-xl font-bold flex items-center gap-3 hover:from-demos-red/90 hover:to-demos-red/80 transition-all shadow-2xl shadow-demos-red/50 border-2 border-white/20 hover:border-white/40 hover:scale-105 active:scale-95"
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

      {/* Modale 3D pour le graphique CA */}
      {showCAModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          onClick={() => setShowCAModal(false)}
        >
          <div 
            className="bg-white/95 backdrop-blur-3xl rounded-3xl shadow-2xl border-2 border-white/40 p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto modal-zoom-in"
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: '0 0 60px rgba(239, 68, 68, 0.5), 0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <TrendingUp className="text-red-600" size={32} />
                Détails du Chiffre d'Affaires
              </h2>
              <button
                onClick={() => setShowCAModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Graphique agrandi */}
              <div className="bg-white/50 backdrop-blur-xl rounded-2xl p-6 border border-white/40">
                <div className="flex items-end justify-between gap-4 h-80">
                  {donneesMensuelles.map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-3">
                      <div className="relative w-full h-72 flex items-end">
                        <div
                          className="w-full bg-gradient-to-t from-red-600 to-red-700 rounded-t-xl transition-all hover:from-red-700 hover:to-red-800 shadow-xl shadow-red-500/30 border border-white/20"
                          style={{ height: `${(data.ca / maxCA) * 100}%` }}
                          title={`${data.mois}: ${data.ca}€`}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{data.mois}</span>
                      <span className="text-xs text-gray-600 font-medium">{data.ca}€</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Statistiques détaillées */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
                  <p className="text-sm text-red-700 font-medium mb-1">Mois actuel</p>
                  <p className="text-3xl font-bold text-red-800">{caMoisActuel}€</p>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                  <p className="text-sm text-gray-700 font-medium mb-1">Mois précédent</p>
                  <p className="text-3xl font-bold text-gray-800">{caMoisPrecedent}€</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                  <p className="text-sm text-green-700 font-medium mb-1">Évolution</p>
                  <p className="text-3xl font-bold text-green-800">
                    {evolutionCA >= 0 ? '+' : ''}{evolutionCA.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <p className="text-sm text-blue-700 font-medium mb-1">Objectif mensuel</p>
                  <p className="text-3xl font-bold text-blue-800">{objectifCA}€</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
