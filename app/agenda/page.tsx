"use client";
import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  ChevronLeft,
  ChevronRight,
  Home,
  Users,
  FileText,
  X,
  Dumbbell,
  Monitor,
  BookOpen,
  Calendar as CalendarIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getRendezVous, addRendezVous, RendezVous as RendezVousType } from "../utils/storage";

const listeClients = [
  "Mathieu Dupont",
  "Chloé Martin",
  "Lucas Bernard",
  "Sophie Lemoine",
  "Didier Renard",
];

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

function AgendaPage() {
  const pathname = usePathname();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [rendezVous, setRendezVous] = useState<RendezVousType[]>([]);

  // Charger les RDV depuis localStorage
  useEffect(() => {
    const storedRdv = getRendezVous();
    if (storedRdv.length === 0) {
      // Initialiser avec des données de base
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const initialRdv: RendezVousType[] = [
        {
          id: 1,
          client: "Lucas Bernard",
          heure: "09:00",
          lieu: "Salle Demos",
          duree: "1h",
          typeLieu: "salle",
          date: today.toLocaleDateString("fr-FR"),
        },
        {
          id: 2,
          client: "Sophie Lemoine",
          heure: "14:00",
          lieu: "En ligne",
          duree: "45min",
          typeLieu: "en_ligne",
          date: today.toLocaleDateString("fr-FR"),
        },
        {
          id: 3,
          client: "Didier Renard",
          heure: "16:30",
          lieu: "En ligne",
          duree: "1h",
          typeLieu: "en_ligne",
          date: tomorrow.toLocaleDateString("fr-FR"),
        },
      ];
      setRendezVous(initialRdv);
      initialRdv.forEach((rdv) => addRendezVous(rdv));
    } else {
      setRendezVous(storedRdv);
    }
  }, []);

  const [formData, setFormData] = useState({
    client: "",
    heure: "",
    typeLieu: "salle" as "salle" | "en_ligne",
    duree: "1h",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.client && formData.heure) {
      const lieu = formData.typeLieu === "salle" ? "Salle Demos" : "En ligne";
      // Utiliser la date sélectionnée ou aujourd'hui
      const rdvDate = selectedDate || new Date();
      const newRendezVous: RendezVousType = {
        id: Date.now(),
        client: formData.client,
        heure: formData.heure,
        lieu: lieu,
        duree: formData.duree,
        typeLieu: formData.typeLieu,
        date: rdvDate.toLocaleDateString("fr-FR"),
      };
      const updatedRdv = addRendezVous(newRendezVous);
      setRendezVous(updatedRdv);
      
      // Créer automatiquement une note dans le dossier du client
      const clientIdMap: { [key: string]: number } = {
        "Mathieu Dupont": 1,
        "Chloé Martin": 2,
        "Lucas Bernard": 3,
        "Sophie Lemoine": 4,
        "Didier Renard": 5,
      };
      const clientId = clientIdMap[formData.client];
      if (clientId) {
        const existingNotes = localStorage.getItem(`client-notes-${clientId}`) || "";
        const dateStr = rdvDate.toLocaleDateString("fr-FR");
        const newNote = `Séance prévue le ${dateStr} à ${formData.heure} (${formData.typeLieu === "salle" ? "Salle Demos" : "En ligne"})`;
        const updatedNotes = existingNotes
          ? `${existingNotes}\n\n${newNote}`
          : newNote;
        localStorage.setItem(`client-notes-${clientId}`, updatedNotes);
      }
      
      setFormData({ client: "", heure: "", typeLieu: "salle", duree: "1h" });
      setShowModal(false);
    }
  };

  // Générer le calendrier mensuel
  const getMonthDays = (): (Date | null)[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days: (Date | null)[] = [];

    // Ajouter les jours vides du début
    for (let i = 0; i < (startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1); i++) {
      days.push(null);
    }

    // Ajouter les jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const monthDays = getMonthDays();
  const today = new Date();
  const dayNames = ["L", "M", "M", "J", "V", "S", "D"];

  const isToday = (date: Date | null) => {
    if (!date) return false;
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSameDay = (date1: Date | null, date2: Date | null) => {
    if (!date1 || !date2) return false;
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const getRendezVousForDate = (date: Date | null): RendezVousType[] => {
    if (!date) return [];
    const dateStr = date.toLocaleDateString("fr-FR");
    return rendezVous.filter((rdv) => {
      if (!rdv.date) return false;
      return rdv.date === dateStr;
    });
  };

  const hasRendezVous = (date: Date | null): boolean => {
    return getRendezVousForDate(date).length > 0;
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  };

  const getCurrentYear = () => currentMonth.getFullYear();
  const getYears = (): number[] => {
    const years: number[] = [];
    for (let i = 2025; i <= 2030; i++) {
      years.push(i);
    }
    return years;
  };

  const getMonths = () => {
    return [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre",
    ];
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentMonth(newDate);
  };

  const navigateYear = (year: number) => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(year);
    setCurrentMonth(newDate);
  };

  const navigateMonthYear = (month: number, year: number) => {
    const newDate = new Date(year, month, 1);
    setCurrentMonth(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  const selectedDateRDV = selectedDate ? getRendezVousForDate(selectedDate) : [];

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      {/* Main Content */}
      <div className="flex-1 px-4 py-6 pb-24 max-w-xl mx-auto w-full">
        <section className="space-y-6">
          {/* Header avec bouton Ajouter */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 mb-4 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-700 mb-1 flex items-center">
                <Calendar className="text-red-600 mr-2" size={24} />
                Agenda
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-red-600 text-white rounded-xl px-6 py-3 text-base font-medium flex items-center gap-2 hover:bg-red-700 transition shadow-sm"
            >
              <Plus size={18} />
              <span className="text-sm font-medium">Ajouter un créneau</span>
            </button>
          </div>

          {/* Calendrier mensuel */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 mb-4">
            {/* Navigation mois et année */}
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <ChevronLeft className="text-slate-600" size={20} />
                </button>
                <div className="flex items-center gap-2">
                  <select
                    value={currentMonth.getMonth()}
                    onChange={(e) => {
                      const month = parseInt(e.target.value);
                      navigateMonthYear(month, currentMonth.getFullYear());
                    }}
                    className="text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    {getMonths().map((month, index) => (
                      <option key={month} value={index}>
                        {month}
                      </option>
                    ))}
                  </select>
                  <select
                    value={getCurrentYear()}
                    onChange={(e) => {
                      const year = parseInt(e.target.value);
                      navigateMonthYear(currentMonth.getMonth(), year);
                    }}
                    className="text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    {getYears().map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <ChevronRight className="text-slate-600" size={20} />
                </button>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={goToToday}
                  className="text-sm text-red-600 hover:text-red-700 font-medium px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
                >
                  Aujourd'hui
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day, index) => (
                <div
                  key={index}
                  className="text-center text-xs font-medium text-slate-500 py-2"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="aspect-square"></div>;
                }
                const hasRDV = hasRendezVous(date);
                const isSelected = selectedDate && isSameDay(date, selectedDate);
                return (
                  <button
                    key={date.getTime()}
                    onClick={() => setSelectedDate(date)}
                    className={`aspect-square rounded-lg p-1 flex flex-col items-center justify-center transition ${
                      isToday(date)
                        ? "bg-gray-100 border border-gray-300 text-red-700 font-semibold"
                        : isSelected
                        ? "bg-gray-50 border border-gray-200 text-slate-700"
                        : "hover:bg-slate-50 text-slate-700 border border-transparent"
                    }`}
                  >
                    <span className="text-sm">{date.getDate()}</span>
                    {hasRDV && (
                      <div className="flex gap-0.5 mt-0.5">
                        {getRendezVousForDate(date).map((rdv) => (
                          <div
                            key={rdv.id}
                            className={`w-1.5 h-1.5 rounded-full ${
                              rdv.typeLieu === "salle" ? "bg-red-600" : "bg-gray-700"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rendez-vous du jour sélectionné */}
          {selectedDate && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
              <div className="font-semibold text-slate-700 mb-3 flex items-center">
                <Clock className="text-red-600 mr-2" size={20} />
                Séances du {selectedDate.toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                })}
              </div>
              {selectedDateRDV.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  Aucune séance prévue ce jour
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedDateRDV.map((rdv) => {
                    const bgColor =
                      rdv.typeLieu === "salle"
                        ? "bg-gray-50 border border-gray-200"
                        : "bg-gray-50 border border-gray-200";
                    return (
                      <div
                        key={rdv.id}
                        className={`${bgColor} rounded-lg p-3 flex items-start justify-between`}
                      >
                        <div className="flex items-start gap-3 flex-1">
                          {rdv.typeLieu === "salle" ? (
                            <Dumbbell className="text-gray-700 mt-0.5" size={18} />
                          ) : (
                            <Monitor className="text-gray-700 mt-0.5" size={18} />
                          )}
                          <div className="flex-1">
                            <div className="font-medium text-slate-700 mb-1">
                              {rdv.client}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-400">
                              <div className="flex items-center gap-1">
                                <Clock size={14} />
                                <span>
                                  {rdv.heure} ({rdv.duree})
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin size={14} />
                                <span>{rdv.lieu}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                // Créer un fichier .ics pour le calendrier
                                const date = new Date(selectedDate || new Date());
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
SUMMARY:Séance avec ${rdv.client}
DESCRIPTION:${rdv.lieu} - ${rdv.duree}
LOCATION:${rdv.lieu}
END:VEVENT
END:VCALENDAR`;

                                const blob = new Blob([icsContent], { type: "text/calendar" });
                                const url = URL.createObjectURL(blob);
                                const link = document.createElement("a");
                                link.href = url;
                                link.download = `seance-${rdv.client}-${rdv.date || "rdv"}.ics`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                URL.revokeObjectURL(url);
                              }}
                              className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1 active:scale-95"
                            >
                              <CalendarIcon size={14} />
                              Ajouter au calendrier
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
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

      {/* Modal pour ajouter un créneau */}
      {showModal && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-700">
                Ajouter un créneau
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Client
                </label>
                <select
                  value={formData.client}
                  onChange={(e) =>
                    setFormData({ ...formData, client: e.target.value })
                  }
                  className="w-full bg-white rounded-lg p-3 text-sm text-slate-700 border border-slate-200 focus:ring-2 focus:ring-red-600 outline-none"
                  required
                >
                  <option value="">Sélectionnez un client</option>
                  {listeClients.map((client) => (
                    <option key={client} value={client}>
                      {client}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Heure
                </label>
                <input
                  type="time"
                  value={formData.heure}
                  onChange={(e) =>
                    setFormData({ ...formData, heure: e.target.value })
                  }
                  className="w-full bg-white rounded-lg p-3 text-sm text-slate-700 border border-slate-200 focus:ring-2 focus:ring-red-600 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Type de séance
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="typeLieu"
                      value="salle"
                      checked={formData.typeLieu === "salle"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          typeLieu: e.target.value as "salle" | "en_ligne",
                        })
                      }
                      className="w-4 h-4 text-red-600 focus:ring-red-600"
                    />
                    <span className="text-sm text-slate-700">En salle Demos</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="typeLieu"
                      value="en_ligne"
                      checked={formData.typeLieu === "en_ligne"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          typeLieu: e.target.value as "salle" | "en_ligne",
                        })
                      }
                      className="w-4 h-4 text-red-600 focus:ring-red-600"
                    />
                    <span className="text-sm text-slate-700">En ligne</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Durée
                </label>
                <select
                  value={formData.duree}
                  onChange={(e) =>
                    setFormData({ ...formData, duree: e.target.value })
                  }
                  className="w-full bg-white rounded-lg p-3 text-sm text-slate-700 border border-slate-200 focus:ring-2 focus:ring-red-600 outline-none"
                >
                  <option value="30min">30 minutes</option>
                  <option value="45min">45 minutes</option>
                  <option value="1h">1 heure</option>
                  <option value="1h30">1h30</option>
                  <option value="2h">2 heures</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-100 text-slate-700 rounded-lg px-4 py-2 hover:bg-slate-200 transition font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white rounded-xl px-6 py-3 text-base hover:bg-red-700 transition font-medium shadow-sm"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AgendaPage;

