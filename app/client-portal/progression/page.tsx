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
import { getSeancesCompletees, SeanceCompletee } from "../../utils/seanceStorage";

export default function ClientProgressionPage() {
  const clientId = 5; // En production, cela viendrait de l'authentification
  const clientName = "Didier Renard";
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
    // Charger les données depuis localStorage
    const savedPoids = localStorage.getItem(`client-poids-${clientId}`);
    const savedTaille = localStorage.getItem(`client-taille-${clientId}`);
    const savedMensurations = localStorage.getItem(`client-mensurations-${clientId}`);
    const savedHistorique = localStorage.getItem(`client-historique-mensurations-${clientId}`);

    if (savedPoids) setPoidsActuel(parseFloat(savedPoids));
    if (savedTaille) setTaille(parseFloat(savedTaille));
    if (savedMensurations) setMensurations(JSON.parse(savedMensurations));
    if (savedHistorique) setHistoriqueMensurations(JSON.parse(savedHistorique));

    // Charger les séances complétées
    const allSeances = getSeancesCompletees();
    const clientSeances = allSeances.filter((s: SeanceCompletee) => s.clientId === clientId);
    setSeancesCompletees(clientSeances);
  }, [clientId]);

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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 shadow-lg">
        <div className="flex items-center justify-between max-w-xl mx-auto w-full">
          <Link
            href="/client-portal"
            className="bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 transition flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Retour
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Ma progression</h1>
            <p className="text-white/90 text-sm mt-1">Suivez vos résultats</p>
          </div>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 px-4 py-6 pb-8 max-w-xl mx-auto w-full">
        <section className="space-y-6">
          {/* Statistiques rapides */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="text-red-600" size={20} />
                <span className="text-sm text-slate-600">Séances totales</span>
              </div>
              <div className="text-2xl font-bold text-slate-700">{seancesCount}</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="text-red-600" size={20} />
                <span className="text-sm text-slate-600">Cette semaine</span>
              </div>
              <div className="text-2xl font-bold text-slate-700">{seancesCetteSemaine}</div>
            </div>
          </div>

          {/* Progression du poids */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-700 flex items-center">
                <Target className="text-red-600 mr-2" size={20} />
                Progression du poids
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-slate-600">Poids actuel</div>
                  <div className="text-2xl font-bold text-slate-700">
                    {typeof poidsActuel === "number" ? `${poidsActuel} kg` : "Non défini"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-600">Objectif</div>
                  <div className="text-2xl font-bold text-red-600">{poidsCible} kg</div>
                </div>
              </div>
              {typeof poidsActuel === "number" && (
                <>
                  <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-600 to-red-700 rounded-full transition-all"
                      style={{
                        width: `${Math.min(Math.max(progressionPourcentage, 0), 100)}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Départ: 95 kg</span>
                    <span>{Math.round(progressionPourcentage)}% vers l'objectif</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mensurations */}
          {historiqueMensurations.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="font-semibold text-slate-700 mb-4 flex items-center">
                <TrendingUp className="text-red-600 mr-2" size={20} />
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
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="font-semibold text-slate-700 mb-4 flex items-center">
                <Activity className="text-red-600 mr-2" size={20} />
                Séances récentes
              </h2>
              <div className="space-y-2">
                {seancesCompletees.slice(-5).reverse().map((seance, idx) => (
                  <div
                    key={idx}
                    className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between"
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
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
              <TrendingUp className="text-slate-300 mx-auto mb-4" size={48} />
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
    </div>
  );
}

