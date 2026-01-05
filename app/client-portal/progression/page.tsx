"use client";
import { useState, useEffect } from "react";
import {
  TrendingUp,
  ArrowLeft,
  Activity,
  Target,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import ClientSidebar from "../../components/ClientSidebar";
import { getSeancesCompletees, SeanceCompletee } from "../../utils/seanceStorage";
import { getOnboardingData } from "../../utils/clientOnboardingStorage";

export default function ClientProgressionPage() {
  const [clientId, setClientId] = useState<string>("");
  const [clientName, setClientName] = useState("");
  const [poidsActuel, setPoidsActuel] = useState<number | "">(90);
  const [poidsCible, setPoidsCible] = useState(85);
  const [taille, setTaille] = useState<number | "">("");
  const [mensurations, setMensurations] = useState({
    poitrine: "",
    taille: "",
    hanches: "",
    bras: "",
    cuisses: "",
  });
  const [historiqueMensurations, setHistoriqueMensurations] = useState<
    Array<{
      date: string;
      poitrine: string;
      taille: string;
      hanches: string;
      bras: string;
      cuisses: string;
    }>
  >([]);
  const [seancesCompletees, setSeancesCompletees] = useState<SeanceCompletee[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const id = localStorage.getItem("demos-user-id");
    const name = localStorage.getItem("demos-user-name") || "Client";
    if (id) {
      setClientId(id);
      setClientName(name);
      
      // Charger les données d'onboarding
      const onboardingData = getOnboardingData(id);
      if (onboardingData) {
        setPoidsActuel(onboardingData.poidsActuel);
        setTaille(onboardingData.taille);
        // Calculer le poids cible basé sur l'objectif
        if (onboardingData.objectif === "Sèche") {
          setPoidsCible(onboardingData.poidsActuel - 5);
        } else if (onboardingData.objectif === "Prise de masse") {
          setPoidsCible(onboardingData.poidsActuel + 5);
        } else {
          setPoidsCible(onboardingData.poidsActuel);
        }
      }
      
      // Charger les données depuis localStorage
      const savedPoids = localStorage.getItem(`client-poids-${id}`);
      const savedTaille = localStorage.getItem(`client-taille-${id}`);
      const savedMensurations = localStorage.getItem(`client-mensurations-${id}`);
      const savedHistorique = localStorage.getItem(`client-historique-mensurations-${id}`);

      if (savedPoids) setPoidsActuel(parseFloat(savedPoids));
      if (savedTaille) setTaille(parseFloat(savedTaille));
      if (savedMensurations) setMensurations(JSON.parse(savedMensurations));
      if (savedHistorique) setHistoriqueMensurations(JSON.parse(savedHistorique));

      // Charger les séances complétées
      const allSeances = getSeancesCompletees();
      const clientSeances = allSeances.filter((s: SeanceCompletee) => s.clientId === parseInt(id) || s.clientId.toString() === id);
      setSeancesCompletees(clientSeances);
    }
  }, []);

  const progressionPourcentage =
    typeof poidsActuel === "number" && poidsCible
      ? Math.min(
          Math.max(
            ((poidsActuel - 95) / (poidsCible - 95)) * 100,
            0
          ),
          100
        )
      : 0;

  const seancesCount = seancesCompletees.length;
  const seancesCetteSemaine = seancesCompletees.filter((s) => {
    const seanceDate = new Date(s.date.split("/").reverse().join("-"));
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    return seanceDate >= weekAgo;
  }).length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ClientSidebar />
      
      <main className="flex-1 lg:ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Ma progression</h1>
            <p className="text-gray-500 mt-1">Suivez vos résultats</p>
          </div>

          <section className="space-y-6">
          {/* Statistiques rapides */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl border border-white/10 backdrop-blur-sm p-6 border-l-4 border-red-600">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="text-red-600" size={20} />
                <span className="text-sm text-gray-600">Séances totales</span>
              </div>
              <div className="text-2xl font-bold text-gray-800">{seancesCount}</div>
            </div>
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl border border-white/10 backdrop-blur-sm p-6 border-l-4 border-gray-600">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="text-red-600" size={20} />
                <span className="text-sm text-gray-600">Cette semaine</span>
              </div>
              <div className="text-2xl font-bold text-gray-800">{seancesCetteSemaine}</div>
            </div>
          </div>

          {/* Progression du poids */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl border border-white/10 backdrop-blur-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Target className="text-red-600" size={24} />
                Progression du poids
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-600">Poids actuel</div>
                  <div className="text-2xl font-bold text-gray-800">
                    {typeof poidsActuel === "number" ? `${poidsActuel} kg` : "Non défini"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Objectif</div>
                  <div className="text-2xl font-bold text-red-600">{poidsCible} kg</div>
                </div>
              </div>
              {typeof poidsActuel === "number" && (
                <>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-600 to-red-700 rounded-full transition-all"
                      style={{
                        width: `${Math.min(Math.max(progressionPourcentage, 0), 100)}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Départ: {typeof poidsActuel === "number" ? poidsActuel : 95} kg</span>
                    <span>{Math.round(progressionPourcentage)}% vers l'objectif</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mensurations */}
          {historiqueMensurations.length > 0 && (
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl border border-white/10 backdrop-blur-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="text-red-600" size={24} />
                Mensurations
              </h2>
              <div className="space-y-3">
                {historiqueMensurations.slice(-5).reverse().map((mesure, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-4"
                  >
                    <div className="text-sm font-medium text-slate-700 mb-2">{mesure.date}</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {mesure.poitrine && (
                        <div>
                          <span className="text-slate-500">Poitrine:</span>{" "}
                          <span className="font-medium text-slate-700">{mesure.poitrine} cm</span>
                        </div>
                      )}
                      {mesure.taille && (
                        <div>
                          <span className="text-slate-500">Taille:</span>{" "}
                          <span className="font-medium text-slate-700">{mesure.taille} cm</span>
                        </div>
                      )}
                      {mesure.hanches && (
                        <div>
                          <span className="text-slate-500">Hanches:</span>{" "}
                          <span className="font-medium text-slate-700">{mesure.hanches} cm</span>
                        </div>
                      )}
                      {mesure.bras && (
                        <div>
                          <span className="text-slate-500">Bras:</span>{" "}
                          <span className="font-medium text-slate-700">{mesure.bras} cm</span>
                        </div>
                      )}
                      {mesure.cuisses && (
                        <div>
                          <span className="text-slate-500">Cuisses:</span>{" "}
                          <span className="font-medium text-slate-700">{mesure.cuisses} cm</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Séances récentes */}
          {seancesCompletees.length > 0 && (
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl border border-white/10 backdrop-blur-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Activity className="text-red-600" size={24} />
                Séances récentes
              </h2>
              <div className="space-y-2">
                {seancesCompletees.slice(-5).reverse().map((seance, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-gray-50 to-white border border-white/20 rounded-xl p-3 flex items-center justify-between backdrop-blur-sm"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-700">{seance.date}</div>
                      <div className="text-xs text-slate-500">{seance.jour}</div>
                      {seance.exercices.length > 0 && (
                        <div className="text-xs text-slate-400 mt-1">
                          {seance.exercices.length} exercice{seance.exercices.length > 1 ? "s" : ""}
                        </div>
                      )}
                    </div>
                    <div className="bg-green-500 text-white rounded-full px-3 py-1 text-xs font-medium">
                      ✓ Complétée
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message si aucune donnée */}
          {seancesCompletees.length === 0 && typeof poidsActuel !== "number" && (
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl border border-white/10 backdrop-blur-sm p-12 text-center">
              <TrendingUp className="text-gray-300 mx-auto mb-4" size={48} />
              <div className="text-slate-400 text-sm mb-2">
                Aucune donnée de progression
              </div>
              <div className="text-slate-300 text-xs">
                Complétez des séances pour voir votre progression
              </div>
            </div>
          )}
          </section>
        </div>
      </main>
    </div>
  );
}

