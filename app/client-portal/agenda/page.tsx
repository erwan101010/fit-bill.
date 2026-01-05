"use client";
import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  Dumbbell,
  Monitor,
  Calendar as CalendarIcon,
} from "lucide-react";
import Link from "next/link";
import { getRendezVousByClient, RendezVous } from "../../utils/storage";

export default function ClientAgendaPage() {
  const clientName = "Didier Renard"; // En production, cela viendrait de l'authentification
  const clientId = 5;
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);

  useEffect(() => {
    const allRDV = getRendezVousByClient(clientName);
    // Trier par date (plus récents en premier)
    const sorted = allRDV.sort((a: RendezVous, b: RendezVous) => {
      if (!a.date || !b.date) return 0;
      const dateA = new Date(a.date.split("/").reverse().join("-"));
      const dateB = new Date(b.date.split("/").reverse().join("-"));
      return dateA.getTime() - dateB.getTime();
    });
    setRendezVous(sorted);
  }, []);

  const today = new Date().toLocaleDateString("fr-FR");
  const rdvAujourdhui = rendezVous.filter((rdv) => rdv.date === today);
  const rdvProchains = rendezVous.filter((rdv) => {
    if (!rdv.date) return false;
    const rdvDate = new Date(rdv.date.split("/").reverse().join("-"));
    const todayDate = new Date(today.split("/").reverse().join("-"));
    return rdvDate > todayDate;
  });
  const rdvPasses = rendezVous.filter((rdv) => {
    if (!rdv.date) return false;
    const rdvDate = new Date(rdv.date.split("/").reverse().join("-"));
    const todayDate = new Date(today.split("/").reverse().join("-"));
    return rdvDate < todayDate;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr.split("/").reverse().join("-"));
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateStr === today.toLocaleDateString("fr-FR")) {
      return "Aujourd'hui";
    } else if (dateStr === tomorrow.toLocaleDateString("fr-FR")) {
      return "Demain";
    } else {
      return date.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
    }
  };

  const downloadCalendar = (rdv: RendezVous) => {
    if (!rdv.date) return;
    
    const date = new Date(rdv.date.split("/").reverse().join("-"));
    const [heures, minutes] = rdv.heure.split(":");
    date.setHours(parseInt(heures), parseInt(minutes), 0, 0);
    
    const dateFin = new Date(date);
    const dureeMinutes = rdv.duree.includes("h")
      ? parseInt(rdv.duree) * 60
      : parseInt(rdv.duree.replace(/\D/g, ""));
    dateFin.setMinutes(dateFin.getMinutes() + dureeMinutes);

    const formatICSDate = (d: Date) => {
      return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Demos//Demos Calendar//FR
BEGIN:VEVENT
DTSTART:${formatICSDate(date)}
DTEND:${formatICSDate(dateFin)}
SUMMARY:Séance avec votre coach
DESCRIPTION:${rdv.lieu} - ${rdv.duree}
LOCATION:${rdv.lieu}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `seance-${rdv.date || "rdv"}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
            <h1 className="text-2xl font-bold">Mon agenda</h1>
            <p className="text-white/90 text-sm mt-1">Vos séances programmées</p>
          </div>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 px-4 py-6 pb-8 max-w-xl mx-auto w-full">
        <section className="space-y-6">
          {/* Séances d'aujourd'hui */}
          {rdvAujourdhui.length > 0 && (
            <div>
              <h2 className="font-semibold text-slate-700 mb-3 flex items-center">
                <Calendar className="text-red-600 mr-2" size={20} />
                Aujourd'hui
              </h2>
              <div className="space-y-3">
                {rdvAujourdhui.map((rdv) => {
                  const bgColor =
                    rdv.typeLieu === "salle"
                      ? "bg-gray-50 border border-gray-200"
                      : "bg-gray-50 border border-gray-200";
                  return (
                    <div key={rdv.id} className={`${bgColor} rounded-xl p-4`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          {rdv.typeLieu === "salle" ? (
                            <Dumbbell className="text-gray-700 mt-0.5" size={20} />
                          ) : (
                            <Monitor className="text-gray-700 mt-0.5" size={20} />
                          )}
                          <div className="flex-1">
                            <div className="font-semibold text-slate-700 mb-1">
                              Séance avec votre coach
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                              <div className="flex items-center gap-1">
                                <Clock size={14} />
                                <span>{rdv.heure} ({rdv.duree})</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin size={14} />
                                <span>{rdv.lieu}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => downloadCalendar(rdv)}
                        className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1 active:scale-95"
                      >
                        <CalendarIcon size={14} />
                        Ajouter au calendrier
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Prochains rendez-vous */}
          {rdvProchains.length > 0 && (
            <div>
              <h2 className="font-semibold text-slate-700 mb-3 flex items-center">
                <Calendar className="text-red-600 mr-2" size={20} />
                Prochaines séances
              </h2>
              <div className="space-y-3">
                {rdvProchains.map((rdv) => {
                  const bgColor =
                    rdv.typeLieu === "salle"
                      ? "bg-gray-50 border border-gray-200"
                      : "bg-gray-50 border border-gray-200";
                  return (
                    <div key={rdv.id} className={`${bgColor} rounded-xl p-4`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          {rdv.typeLieu === "salle" ? (
                            <Dumbbell className="text-gray-700 mt-0.5" size={20} />
                          ) : (
                            <Monitor className="text-gray-700 mt-0.5" size={20} />
                          )}
                          <div className="flex-1">
                            <div className="font-semibold text-slate-700 mb-1">
                              {formatDate(rdv.date || "")}
                            </div>
                            <div className="text-sm text-slate-600 mb-2">
                              Séance avec votre coach
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                              <div className="flex items-center gap-1">
                                <Clock size={14} />
                                <span>{rdv.heure} ({rdv.duree})</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin size={14} />
                                <span>{rdv.lieu}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => downloadCalendar(rdv)}
                        className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1 active:scale-95"
                      >
                        <CalendarIcon size={14} />
                        Ajouter au calendrier
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Historique */}
          {rdvPasses.length > 0 && (
            <div>
              <h2 className="font-semibold text-slate-700 mb-3 flex items-center">
                <Calendar className="text-slate-400 mr-2" size={20} />
                Séances passées
              </h2>
              <div className="space-y-3">
                {rdvPasses.slice(-5).reverse().map((rdv) => {
                  return (
                    <div
                      key={rdv.id}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-4"
                    >
                      <div className="flex items-start gap-3">
                        <Calendar className="text-slate-400 mt-0.5" size={20} />
                        <div className="flex-1">
                          <div className="font-medium text-slate-600 mb-1">
                            {formatDate(rdv.date || "")}
                          </div>
                          <div className="text-sm text-slate-500">
                            {rdv.heure} - {rdv.lieu} ({rdv.duree})
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Message si aucun RDV */}
          {rendezVous.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
              <Calendar className="text-slate-300 mx-auto mb-4" size={48} />
              <div className="text-slate-400 text-sm mb-2">
                Aucune séance programmée
              </div>
              <div className="text-slate-300 text-xs">
                Contactez votre coach pour réserver une séance
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

