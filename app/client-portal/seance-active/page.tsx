"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import {
  Play,
  Pause,
  Square,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Dumbbell,
  SkipForward,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getProgrammeClient } from "../../utils/programmeStorage";
import { getExercices } from "../../utils/exercicesStorage";
import { addSeanceCompletee } from "../../utils/seanceStorage";

function SeanceActivePageContent() {
  const searchParams = useSearchParams();
  const clientId = parseInt(searchParams.get("clientId") || "5");
  const [programme, setProgramme] = useState<any>(null);
  const [exercices, setExercices] = useState<any[]>([]);
  const [currentJourIndex, setCurrentJourIndex] = useState(0);
  const [currentExerciceIndex, setCurrentExerciceIndex] = useState(0);
  const [currentSerieIndex, setCurrentSerieIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(0);
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const prog = getProgrammeClient(clientId);
    if (prog) {
      setProgramme(prog);
      // Trouver le jour d'aujourd'hui ou utiliser le premier
      const today = new Date().getDay();
      const joursMapping = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
      const jourToday = joursMapping[today];
      const jourIndex = prog.semaine.findIndex((j: any) => j.jour === jourToday);
      setCurrentJourIndex(jourIndex >= 0 ? jourIndex : 0);
    }
    setExercices(getExercices());
  }, [clientId]);

  useEffect(() => {
    if (isResting && restTime > 0) {
      intervalRef.current = setInterval(() => {
        setRestTime((prev) => {
          if (prev <= 1) {
            setIsResting(false);
            // Bip sonore
            if (typeof window !== "undefined" && "vibrate" in navigator) {
              navigator.vibrate([200, 100, 200]);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isResting, restTime]);

  const currentJour = programme?.semaine[currentJourIndex];
  const currentExercice =
    currentJour?.exercices[currentExerciceIndex];
  const totalExercices = currentJour?.exercices?.length || 0;
  const totalSeries = currentExercice ? parseInt(currentExercice.series) || 1 : 0;
  const restMinutes = currentExercice
    ? parseInt(currentExercice.repos?.replace(/\D/g, "")) || 2
    : 2;

  const handleStartRest = () => {
    setIsResting(true);
    setRestTime(restMinutes * 60);
  };

  const handleNextSerie = () => {
    if (currentSerieIndex < totalSeries - 1) {
      setCurrentSerieIndex(currentSerieIndex + 1);
      handleStartRest();
    } else {
      // Prochain exercice
      if (currentExerciceIndex < totalExercices - 1) {
        setCurrentExerciceIndex(currentExerciceIndex + 1);
        setCurrentSerieIndex(0);
        handleStartRest();
      } else {
        // Séance terminée
        const today = new Date().toLocaleDateString("fr-FR");
        addSeanceCompletee({
          clientId,
          date: today,
          jour: currentJour?.jour || "",
          exercices: programme?.semaine[currentJourIndex]?.exercices.map((ex: any, idx: number) => ({
            exerciceNom: ex.exerciceNom,
            notes: notes[`${currentJour?.jour}-${ex.exerciceNom}-${idx}`] || "",
          })) || [],
        });
        // Notifier le Dashboard
        window.dispatchEvent(new Event('seancesUpdated'));
        alert("Félicitations ! Séance terminée ! 🎉");
      }
    }
  };

  const handleSkipRest = () => {
    setIsResting(false);
    setRestTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!programme || !currentJour || !currentExercice) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-slate-400 mb-4">Aucun programme défini pour aujourd'hui</div>
          <Link
            href="/client-portal"
            className="text-red-600 hover:text-red-700 font-medium"
          >
            ← Retour au portail
          </Link>
        </div>
      </div>
    );
  }

  const noteKey = `${currentJour.jour}-${currentExercice.exerciceNom}-${currentSerieIndex}`;
  const currentNote = notes[noteKey] || "";

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 shadow-lg">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          <Link
            href="/client-portal"
            className="bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 transition flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Quitter
          </Link>
          <div className="text-right">
            <div className="text-sm opacity-90">Séance active</div>
            <div className="font-bold text-lg">{currentJour.jour}</div>
          </div>
        </div>
      </div>

      {/* Progression */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-xl mx-auto">
          <div className="text-sm text-slate-600 mb-2">
            Exercice {currentExerciceIndex + 1} / {totalExercices}
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-red-700 h-2 rounded-full transition-all"
              style={{
                width: `${((currentExerciceIndex + 1) / totalExercices) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-xl mx-auto px-6 py-6">
          {/* Chronomètre de repos */}
          {isResting && (
            <div className="bg-gradient-to-br from-red-600 to-red-700 text-white rounded-2xl p-8 mb-6 text-center shadow-lg">
              <Clock size={64} className="mx-auto mb-4 animate-pulse" />
              <div className="text-6xl font-bold mb-2">{formatTime(restTime)}</div>
              <div className="text-white/90 mb-4">Temps de repos</div>
              {restTime <= 5 && (
                <div className="text-2xl mb-4 animate-bounce">⏰</div>
              )}
              <button
                onClick={handleSkipRest}
                className="bg-white/20 hover:bg-white/30 rounded-xl px-6 py-3 font-medium transition flex items-center gap-2 mx-auto active:scale-95"
              >
                <SkipForward size={18} />
                Passer le repos
              </button>
            </div>
          )}

        {/* Exercice actuel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-700 flex items-center gap-2">
              <Dumbbell className="text-red-600" size={28} />
              {currentExercice.exerciceNom}
            </h2>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-slate-500 mb-1">Série</div>
                <div className="text-xl font-bold text-slate-700">
                  {currentSerieIndex + 1} / {totalSeries}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Répétitions</div>
                <div className="text-xl font-bold text-slate-700">
                  {currentExercice.repetitions}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Repos</div>
                <div className="text-xl font-bold text-slate-700">
                  {currentExercice.repos}
                </div>
              </div>
            </div>
          </div>

          {/* Notes pour cette série */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Notes (charges, répétitions réelles...)
            </label>
            <textarea
              value={currentNote}
              onChange={(e) => {
                setNotes({ ...notes, [noteKey]: e.target.value });
                // Sauvegarder dans localStorage
                localStorage.setItem(
                  `seance-notes-${clientId}`,
                  JSON.stringify({ ...notes, [noteKey]: e.target.value })
                );
              }}
              placeholder="Ex: 80kg x 12, 75kg x 10..."
              className="w-full bg-white rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none resize-none"
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {!isResting && (
              <>
                <button
                  onClick={handleStartRest}
                  className="flex-1 bg-red-600 text-white rounded-xl px-6 py-4 text-base font-medium hover:bg-red-700 transition shadow-sm flex items-center justify-center gap-2 active:scale-95"
                >
                  <Clock size={20} />
                  Démarrer repos
                </button>
                <button
                  onClick={handleNextSerie}
                  className="flex-1 bg-red-600 text-white rounded-xl px-6 py-4 text-base font-medium hover:bg-red-700 transition shadow-sm flex items-center justify-center gap-2 active:scale-95"
                >
                  <CheckCircle2 size={20} />
                  Série terminée
                </button>
              </>
            )}
          </div>

          {currentExercice.notes && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="text-sm text-slate-600 italic">{currentExercice.notes}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SeanceActivePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Chargement...</div>}>
      <SeanceActivePageContent />
    </Suspense>
  );
}

