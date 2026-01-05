"use client";
import { useState, useEffect, Suspense } from "react";
import {
  Users,
  StickyNote,
  TrendingUp,
  Image as ImageIcon,
  Plus,
  Home,
  Calendar,
  FileText,
  Info,
  X,
  Activity,
  Camera,
  History,
  Edit,
  Dumbbell,
  Monitor,
  Search,
  BookOpen,
  Trash2,
  Play,
  MessageCircle,
  Send,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import Sidebar from "../components/Sidebar";
import { getRendezVousByClient, RendezVous } from "../utils/storage";
import { getExercices, Exercice } from "../utils/exercicesStorage";
import { getProgrammeClient, saveProgrammeClient, ProgrammeClient, JourProgramme } from "../utils/programmeStorage";
import { getDerniereOuvertureClient } from "../utils/seanceStorage";
import { getMessages, addMessage, Message as ChatMessage } from "../utils/chatStorage";

const mockClients = [
  {
    id: 1,
    name: "Mathieu Dupont",
    email: "mathieu.dupont@email.com",
    phone: "06 12 34 56 78",
    status: "Actif",
    poidsActuel: 85,
    poidsCible: 80,
    programme: "Sèche",
  },
  {
    id: 2,
    name: "Chloé Martin",
    email: "chloe.martin@email.com",
    phone: "06 98 76 54 32",
    status: "Actif",
    poidsActuel: 65,
    poidsCible: 62,
    programme: "Sèche",
  },
  {
    id: 3,
    name: "Lucas Bernard",
    email: "lucas.bernard@email.com",
    phone: "06 11 22 33 44",
    status: "Actif",
    poidsActuel: 72,
    poidsCible: 75,
    programme: "Prise de masse",
  },
  {
    id: 4,
    name: "Sophie Lemoine",
    email: "sophie.lemoine@email.com",
    phone: "06 55 66 77 88",
    status: "Actif",
    poidsActuel: 58,
    poidsCible: 60,
    programme: "Prise de masse",
  },
  {
    id: 5,
    name: "Didier Renard",
    email: "didier.renard@email.com",
    phone: "06 44 33 22 11",
    status: "Actif",
    poidsActuel: 90,
    poidsCible: 85,
    programme: "Sèche",
  },
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

type ProgrammeType = "Perte de gras" | "Prise de muscle" | "Remise en forme" | "Sèche" | "Prise de masse";

function ClientsPageContent() {
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [showDetails, setShowDetails] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"profil" | "evolution" | "seances" | "programme" | "chat">("profil");
  const [searchQuery, setSearchQuery] = useState("");
  const [taille, setTaille] = useState<number | "">("");
  const [poids, setPoids] = useState<number | "">("");
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
  const [historiqueRDV, setHistoriqueRDV] = useState<RendezVous[]>([]);
  const [photoAvant, setPhotoAvant] = useState<string>("");
  const [photoApres, setPhotoApres] = useState<string>("");
  const [photoEnGrand, setPhotoEnGrand] = useState<string | null>(null);
  const [exercices, setExercices] = useState<Exercice[]>([]);
  const [programmeClient, setProgrammeClient] = useState<ProgrammeClient | null>(null);
  const [showProgrammeModal, setShowProgrammeModal] = useState(false);
  const [selectedJour, setSelectedJour] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newChatMessage, setNewChatMessage] = useState("");
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Ouvrir le dossier client si spécifié dans l'URL
  useEffect(() => {
    const clientId = searchParams.get("client");
    if (clientId && !showDetails) {
      setShowDetails(parseInt(clientId));
    }
  }, [searchParams]);

  // Charger les exercices depuis la bibliothèque
  useEffect(() => {
    setExercices(getExercices());
  }, []);

  // Charger les données du client depuis localStorage
  useEffect(() => {
    if (showDetails !== null) {
      const client = mockClients.find((c) => c.id === showDetails);
      if (client) {
        // Charger les données sauvegardées
        const savedTaille = localStorage.getItem(`client-taille-${showDetails}`);
        const savedPoids = localStorage.getItem(`client-poids-${showDetails}`);
        const savedMensurations = localStorage.getItem(`client-mensurations-${showDetails}`);
        const savedHistorique = localStorage.getItem(`client-historique-mensurations-${showDetails}`);

        if (savedTaille) setTaille(parseFloat(savedTaille));
        if (savedPoids) setPoids(parseFloat(savedPoids));
        if (savedMensurations) setMensurations(JSON.parse(savedMensurations));
        if (savedHistorique) setHistoriqueMensurations(JSON.parse(savedHistorique));

        // Charger les photos
        const savedPhotoAvant = localStorage.getItem(`client-photo-avant-${showDetails}`);
        const savedPhotoApres = localStorage.getItem(`client-photo-apres-${showDetails}`);
        if (savedPhotoAvant) setPhotoAvant(savedPhotoAvant);
        if (savedPhotoApres) setPhotoApres(savedPhotoApres);

        // Charger l'historique des RDV
        setHistoriqueRDV(getRendezVousByClient(client.name));

        // Charger le programme
        const programme = getProgrammeClient(showDetails);
        setProgrammeClient(programme);

        // Charger les messages de chat
        setChatMessages(getMessages(showDetails));
      }
      setActiveTab("profil");
    }
  }, [showDetails]);

  // Recharger les messages quand ils sont mis à jour
  useEffect(() => {
    const handleMessagesUpdate = () => {
      if (showDetails !== null) {
        setChatMessages(getMessages(showDetails));
      }
    };
    window.addEventListener('messagesUpdated', handleMessagesUpdate);
    return () => window.removeEventListener('messagesUpdated', handleMessagesUpdate);
  }, [showDetails]);

  // Sauvegarder taille et poids dans localStorage
  useEffect(() => {
    if (showDetails !== null) {
      if (taille) localStorage.setItem(`client-taille-${showDetails}`, taille.toString());
      if (poids) localStorage.setItem(`client-poids-${showDetails}`, poids.toString());
    }
  }, [taille, poids, showDetails]);

  // Sauvegarder mensurations dans localStorage
  useEffect(() => {
    if (showDetails !== null) {
      localStorage.setItem(`client-mensurations-${showDetails}`, JSON.stringify(mensurations));
    }
  }, [mensurations, showDetails]);

  // Recharger l'historique quand on change de page ou d'onglet (pour la synchronisation)
  useEffect(() => {
    const handleFocus = () => {
      if (showDetails !== null) {
        const client = mockClients.find((c) => c.id === showDetails);
        if (client) {
          setHistoriqueRDV(getRendezVousByClient(client.name));
        }
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [showDetails]);

  // Recharger l'historique des RDV quand on ouvre l'onglet Séances
  useEffect(() => {
    if (showDetails !== null && activeTab === "seances") {
      const client = mockClients.find((c) => c.id === showDetails);
      if (client) {
        setHistoriqueRDV(getRendezVousByClient(client.name));
      }
    }
  }, [activeTab, showDetails]);

  // Charger les notes depuis localStorage quand un client est sélectionné
  useEffect(() => {
    if (selectedClient !== null) {
      const savedNotes = localStorage.getItem(`client-notes-${selectedClient}`);
      setNotes(savedNotes || "");
    } else {
      setNotes("");
    }
  }, [selectedClient]);

  // Sauvegarder les notes dans localStorage quand elles changent
  useEffect(() => {
    if (selectedClient !== null) {
      localStorage.setItem(`client-notes-${selectedClient}`, notes);
    }
  }, [notes, selectedClient]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Gestion des clients</h1>
            <p className="text-gray-500 mt-1">
              {mockClients.length} client{mockClients.length > 1 ? "s" : ""} au total
            </p>
          </div>

          <section className="space-y-6">

          {/* Barre de recherche */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher un client par nom..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white rounded-lg border border-gray-200 px-4 py-2.5 pl-10 text-sm text-gray-700 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>

          {/* Liste des clients */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="font-semibold text-gray-800 mb-4 flex items-center justify-between">
              <span className="text-xl">Liste des clients</span>
              <button className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition">
                <Plus size={20} />
              </button>
            </div>
            <div className="space-y-2">
              {mockClients
                .filter((client) =>
                  client.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((client) => {
                // Client toujours actif

                // Vérifier si le client n'a pas eu de séance depuis plus de 7 jours
                const clientRDV = getRendezVousByClient(client.name);
                const lastRDV = clientRDV.length > 0 
                  ? clientRDV[clientRDV.length - 1]
                  : null;
                let needsRelance = false;
                if (lastRDV && lastRDV.date) {
                  const lastDate = new Date(lastRDV.date.split('/').reverse().join('-'));
                  const today = new Date();
                  const daysSince = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
                  needsRelance = daysSince > 7;
                } else if (clientRDV.length === 0) {
                  needsRelance = true; // Pas de séance enregistrée
                }
                
                return (
                  <div
                    key={client.id}
                    className={`holographic bg-white/80 backdrop-blur-2xl rounded-xl border-2 border-white/40 shadow-2xl p-4 transition-all duration-300 relative ${
                      selectedClient === client.id
                        ? "ring-2 ring-red-600 bg-white/90 scale-105"
                        : "hover:bg-white/90 hover:scale-105 hover:shadow-red-500/20 hover:border-red-500/30"
                    }`}
                    style={{
                      boxShadow: selectedClient === client.id 
                        ? '0 25px 50px -12px rgba(239, 68, 68, 0.3), 0 0 0 1px rgba(239, 68, 68, 0.1), 0 0 40px rgba(239, 68, 68, 0.2)' 
                        : undefined,
                    }}
                    onMouseMove={(e) => {
                      const card = e.currentTarget;
                      const rect = card.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      const centerX = rect.width / 2;
                      const centerY = rect.height / 2;
                      const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
                      card.style.setProperty('--holographic-angle', `${angle}deg`);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div
                        onClick={() => setSelectedClient(client.id)}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-slate-700">
                            {client.name}
                          </div>
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full border border-green-200 relative" style={{
                            boxShadow: '0 0 10px rgba(34, 197, 94, 0.5), 0 0 20px rgba(34, 197, 94, 0.3)',
                            textShadow: '0 0 8px rgba(34, 197, 94, 0.8)',
                          }}>
                            Client Actif
                          </span>
                          {needsRelance && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full border border-gray-200">
                              À relancer
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {client.email} • {client.phone}
                        </div>
                        <div className="text-xs text-red-600 mt-1 font-medium">
                          {client.status}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDetails(showDetails === client.id ? null : client.id);
                        }}
                        className="ml-2 p-2 text-red-600 hover:bg-gray-100 rounded-lg transition"
                      >
                        <Info size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modal Dossier Sportif */}
          {showDetails && (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[10000] p-4" onClick={(e) => e.target === e.currentTarget && setShowDetails(null)}>
              <div className="bg-white rounded-lg border border-slate-200 shadow-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
                {(() => {
                  const client = mockClients.find((c) => c.id === showDetails);
                  if (!client) return null;
                  return (
                    <>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-2xl font-semibold text-slate-700">
                            Dossier Sportif
                          </h2>
                          <p className="text-sm text-slate-400 mt-1">{client.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={async () => {
                              try {
                                const { jsPDF } = await import("jspdf");
                                const doc = new jsPDF();
                                const today = new Date();
                                const dateStr = today.toLocaleDateString("fr-FR", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                });

                                // En-tête avec logo et nom du coach
                                doc.setFontSize(24);
                                doc.setTextColor(220, 38, 38);
                                doc.setFont("helvetica", "bold");
                                doc.text("Demos", 20, 25);
                                
                                doc.setFontSize(12);
                                doc.setTextColor(0, 0, 0);
                                doc.setFont("helvetica", "normal");
                                doc.text("Coach Demos", 20, 32);
                                
                                doc.setFontSize(16);
                                doc.setTextColor(220, 38, 38);
                                doc.setFont("helvetica", "bold");
                                doc.text("BILAN CLIENT", 140, 25);

                                // Ligne de séparation sous l'en-tête
                                doc.setDrawColor(200, 200, 200);
                                doc.line(20, 38, 190, 38);

                                // Informations client
                                doc.setFontSize(12);
                                doc.setTextColor(0, 0, 0);
                                doc.text(`Client: ${client.name}`, 20, 48);
                                doc.text(`Date du bilan: ${dateStr}`, 20, 55);

                                // Profil
                                let yPos = 65;
                                doc.setFontSize(14);
                                doc.setTextColor(220, 38, 38);
                                doc.text("PROFIL", 20, yPos);
                                yPos += 8;
                                doc.setFontSize(10);
                                doc.setTextColor(0, 0, 0);
                                if (taille && poids) {
                                  const imc = (poids as number) / Math.pow((taille as number) / 100, 2);
                                  doc.text(`Taille: ${taille} cm`, 20, yPos);
                                  yPos += 6;
                                  doc.text(`Poids: ${poids} kg`, 20, yPos);
                                  yPos += 6;
                                  doc.text(`IMC: ${imc.toFixed(1)}`, 20, yPos);
                                  yPos += 6;
                                }
                                doc.text(`Poids actuel: ${client.poidsActuel} kg`, 20, yPos);
                                yPos += 6;
                                doc.text(`Poids cible: ${client.poidsCible} kg`, 20, yPos);
                                yPos += 6;
                                doc.text(`Programme: ${client.programme}`, 20, yPos);
                                yPos += 10;

                                // Évolution
                                if (historiqueMensurations.length > 0) {
                                  doc.setFontSize(14);
                                  doc.setTextColor(220, 38, 38);
                                  doc.text("ÉVOLUTION", 20, yPos);
                                  yPos += 8;
                                  doc.setFontSize(10);
                                  doc.setTextColor(0, 0, 0);
                                  const lastEntry = historiqueMensurations[historiqueMensurations.length - 1];
                                  doc.text(`Dernières mensurations (${lastEntry.date}):`, 20, yPos);
                                  yPos += 6;
                                  if (lastEntry.poitrine)
                                    doc.text(`- Poitrine: ${lastEntry.poitrine} cm`, 25, yPos);
                                  yPos += 6;
                                  if (lastEntry.taille)
                                    doc.text(`- Taille: ${lastEntry.taille} cm`, 25, yPos);
                                  yPos += 6;
                                  if (lastEntry.hanches)
                                    doc.text(`- Hanches: ${lastEntry.hanches} cm`, 25, yPos);
                                  yPos += 10;
                                }

                                // Prochain rendez-vous
                                if (historiqueRDV.length > 0) {
                                  doc.setFontSize(14);
                                  doc.setTextColor(220, 38, 38);
                                  doc.text("PROCHAIN RENDEZ-VOUS", 20, yPos);
                                  yPos += 8;
                                  doc.setFontSize(10);
                                  doc.setTextColor(0, 0, 0);
                                  const nextRDV = historiqueRDV[historiqueRDV.length - 1];
                                  doc.text(`Date: ${nextRDV.date || "À définir"}`, 20, yPos);
                                  yPos += 6;
                                  doc.text(`Heure: ${nextRDV.heure}`, 20, yPos);
                                  yPos += 6;
                                  doc.text(`Lieu: ${nextRDV.lieu}`, 20, yPos);
                                }

                                // Sauvegarder
                                const fileName = `bilan-${client.name.replace(/\s+/g, "-")}-${Date.now()}.pdf`;
                                doc.save(fileName);
                              } catch (error) {
                                console.error("Erreur lors de la génération du PDF:", error);
                                alert("Une erreur est survenue lors de la génération du PDF");
                              }
                            }}
                            className="bg-red-600 text-white rounded-xl px-6 py-3 text-base font-medium hover:bg-red-700 transition flex items-center gap-2 shadow-sm"
                          >
                            <FileText size={16} />
                            Générer Bilan PDF
                          </button>
                          <button
                            onClick={() => setShowDetails(null)}
                            className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition"
                          >
                            <X size={24} />
                          </button>
                        </div>
                      </div>

                      {/* Onglets */}
                      <div className="flex gap-2 mb-6 border-b border-slate-200 bg-white overflow-x-auto">
                        <button
                          onClick={() => setActiveTab("profil")}
                          className={`px-5 py-3 font-medium text-base transition relative whitespace-nowrap min-w-[80px] ${
                            activeTab === "profil"
                              ? "text-red-600"
                              : "text-slate-400 hover:text-slate-600"
                          }`}
                        >
                          <Users className="inline mr-2" size={18} />
                          Profil
                          {activeTab === "profil" && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-700 rounded-t"></div>
                          )}
                        </button>
                        <button
                          onClick={() => setActiveTab("evolution")}
                          className={`px-5 py-3 font-medium text-base transition relative whitespace-nowrap min-w-[80px] ${
                            activeTab === "evolution"
                              ? "text-red-600"
                              : "text-slate-400 hover:text-slate-600"
                          }`}
                        >
                          <TrendingUp className="inline mr-2" size={18} />
                          Évolution
                          {activeTab === "evolution" && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-700 rounded-t"></div>
                          )}
                        </button>
                        <button
                          onClick={() => setActiveTab("seances")}
                          className={`px-5 py-3 font-medium text-base transition relative whitespace-nowrap min-w-[80px] ${
                            activeTab === "seances"
                              ? "text-red-600"
                              : "text-slate-400 hover:text-slate-600"
                          }`}
                        >
                          <History className="inline mr-2" size={18} />
                          Séances
                          {activeTab === "seances" && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-700 rounded-t"></div>
                          )}
                        </button>
                        <button
                          onClick={() => setActiveTab("programme")}
                          className={`px-5 py-3 font-medium text-base transition relative whitespace-nowrap min-w-[80px] ${
                            activeTab === "programme"
                              ? "text-red-600"
                              : "text-slate-400 hover:text-slate-600"
                          }`}
                        >
                          <BookOpen className="inline mr-2" size={18} />
                          Programme
                          {activeTab === "programme" && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-700 rounded-t"></div>
                          )}
                        </button>
                      </div>

                      {/* Contenu des onglets */}
                      <div className="space-y-4">
                        {activeTab === "profil" && (
                          <div className="space-y-4">
                            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-slate-700">Informations</h3>
                                <button
                                  onClick={() => {
                                    // Pour l'instant, on utilise l'onglet Programme pour modifier
                                  }}
                                  className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                                >
                                  <Edit size={14} />
                                  Voir dans l'onglet Programme
                                </button>
                              </div>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">
                                      Taille (cm)
                                    </label>
                                    <input
                                      type="number"
                                      value={taille}
                                      onChange={(e) => setTaille(e.target.value ? parseFloat(e.target.value) : "")}
                                      placeholder="Ex: 175"
                                      className="w-full bg-white rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">
                                      Poids (kg)
                                    </label>
                                    <input
                                      type="number"
                                      value={poids}
                                      onChange={(e) => setPoids(e.target.value ? parseFloat(e.target.value) : "")}
                                      placeholder="Ex: 75"
                                      className="w-full bg-white rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none"
                                    />
                                  </div>
                                </div>
                                {taille && poids && (
                                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
                                    <div className="text-sm font-medium text-red-700 mb-1">IMC (Indice de Masse Corporelle)</div>
                                    <div className="text-2xl font-bold text-gray-900">
                                      {((poids as number) / Math.pow((taille as number) / 100, 2)).toFixed(1)}
                                    </div>
                                    <div className="text-xs text-red-600 mt-1">
                                      {(() => {
                                        const imc = (poids as number) / Math.pow((taille as number) / 100, 2);
                                        if (imc < 18.5) return "Insuffisance pondérale";
                                        if (imc < 25) return "Poids normal";
                                        if (imc < 30) return "Surpoids";
                                        return "Obésité";
                                      })()}
                                    </div>
                                  </div>
                                )}
                                <table className="w-full text-sm">
                                  <tbody>
                                    <tr className="border-b border-slate-200">
                                      <td className="py-2 font-medium text-slate-600 w-1/2">
                                        Poids actuel
                                      </td>
                                      <td className="py-2 text-slate-700">{client.poidsActuel} kg</td>
                                    </tr>
                                    <tr className="border-b border-slate-200">
                                      <td className="py-2 font-medium text-slate-600">Poids cible</td>
                                      <td className="py-2 text-slate-700">{client.poidsCible} kg</td>
                                    </tr>
                                    <tr>
                                      <td className="py-2 font-medium text-slate-600">
                                        Programme actuel
                                      </td>
                                      <td className="py-2 text-slate-700">{client.programme}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeTab === "evolution" && (
                          <div className="space-y-4">
                            {/* Formulaire de saisie des mensurations */}
                            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                              <h3 className="font-semibold text-slate-700 mb-4">Nouvelles mensurations</h3>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-slate-600 mb-1">
                                    Poitrine (cm)
                                  </label>
                                  <input
                                    type="number"
                                    value={mensurations.poitrine}
                                    onChange={(e) =>
                                      setMensurations({ ...mensurations, poitrine: e.target.value })
                                    }
                                    placeholder="Ex: 95"
                                    className="w-full bg-white rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-slate-600 mb-1">
                                    Taille (cm)
                                  </label>
                                  <input
                                    type="number"
                                    value={mensurations.taille}
                                    onChange={(e) =>
                                      setMensurations({ ...mensurations, taille: e.target.value })
                                    }
                                    placeholder="Ex: 75"
                                    className="w-full bg-white rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-slate-600 mb-1">
                                    Hanches (cm)
                                  </label>
                                  <input
                                    type="number"
                                    value={mensurations.hanches}
                                    onChange={(e) =>
                                      setMensurations({ ...mensurations, hanches: e.target.value })
                                    }
                                    placeholder="Ex: 100"
                                    className="w-full bg-white rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-slate-600 mb-1">
                                    Bras (cm)
                                  </label>
                                  <input
                                    type="number"
                                    value={mensurations.bras}
                                    onChange={(e) =>
                                      setMensurations({ ...mensurations, bras: e.target.value })
                                    }
                                    placeholder="Ex: 35"
                                    className="w-full bg-white rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-slate-600 mb-1">
                                    Cuisses (cm)
                                  </label>
                                  <input
                                    type="number"
                                    value={mensurations.cuisses}
                                    onChange={(e) =>
                                      setMensurations({ ...mensurations, cuisses: e.target.value })
                                    }
                                    placeholder="Ex: 60"
                                    className="w-full bg-white rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none"
                                  />
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  if (
                                    mensurations.poitrine ||
                                    mensurations.taille ||
                                    mensurations.hanches ||
                                    mensurations.bras ||
                                    mensurations.cuisses
                                  ) {
                                    const newEntry = {
                                      date: new Date().toLocaleDateString("fr-FR"),
                                      ...mensurations,
                                    };
                                    const updated = [...historiqueMensurations, newEntry];
                                    setHistoriqueMensurations(updated);
                                    localStorage.setItem(
                                      `client-historique-mensurations-${showDetails}`,
                                      JSON.stringify(updated)
                                    );
                                    setMensurations({
                                      poitrine: "",
                                      taille: "",
                                      hanches: "",
                                      bras: "",
                                      cuisses: "",
                                    });
                                  }
                                }}
                                className="mt-4 w-full bg-red-600 text-white rounded-xl px-6 py-3 text-base font-medium hover:bg-red-700 transition shadow-sm active:scale-95"
                              >
                                Enregistrer les mensurations
                              </button>
                            </div>

                            {/* Historique des mensurations */}
                            {historiqueMensurations.length > 0 && (
                              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                                <h3 className="font-semibold text-slate-700 mb-3">Historique</h3>
                                <div className="space-y-2">
                                  {historiqueMensurations
                                    .slice()
                                    .reverse()
                                    .map((entry, index) => (
                                      <div
                                        key={index}
                                        className="bg-white rounded-lg border border-slate-200 p-3"
                                      >
                                        <div className="text-xs font-medium text-slate-600 mb-2">
                                          {entry.date}
                                        </div>
                                        <div className="grid grid-cols-5 gap-2 text-xs">
                                          {entry.poitrine && (
                                            <div>
                                              <span className="text-slate-400">Poitrine:</span>{" "}
                                              <span className="font-medium text-slate-700">
                                                {entry.poitrine}cm
                                              </span>
                                            </div>
                                          )}
                                          {entry.taille && (
                                            <div>
                                              <span className="text-slate-400">Taille:</span>{" "}
                                              <span className="font-medium text-slate-700">
                                                {entry.taille}cm
                                              </span>
                                            </div>
                                          )}
                                          {entry.hanches && (
                                            <div>
                                              <span className="text-slate-400">Hanches:</span>{" "}
                                              <span className="font-medium text-slate-700">
                                                {entry.hanches}cm
                                              </span>
                                            </div>
                                          )}
                                          {entry.bras && (
                                            <div>
                                              <span className="text-slate-400">Bras:</span>{" "}
                                              <span className="font-medium text-slate-700">
                                                {entry.bras}cm
                                              </span>
                                            </div>
                                          )}
                                          {entry.cuisses && (
                                            <div>
                                              <span className="text-slate-400">Cuisses:</span>{" "}
                                              <span className="font-medium text-slate-700">
                                                {entry.cuisses}cm
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}

                            {/* Photos Avant/Après */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                  Photo de départ
                                </label>
                                <div className="relative">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                          const base64String = reader.result as string;
                                          setPhotoAvant(base64String);
                                          if (showDetails !== null) {
                                            localStorage.setItem(
                                              `client-photo-avant-${showDetails}`,
                                              base64String
                                            );
                                          }
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                    className="hidden"
                                    id="photo-avant-input"
                                  />
                                  <label
                                    htmlFor="photo-avant-input"
                                    className="cursor-pointer block bg-white rounded-lg border border-slate-200 shadow-sm p-6 flex flex-col items-center justify-center min-h-48 hover:bg-slate-50 transition"
                                  >
                                    {photoAvant ? (
                                      <img
                                        src={photoAvant}
                                        alt="Photo de départ"
                                        className="w-full h-48 object-cover rounded-lg cursor-pointer"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          setPhotoEnGrand(photoAvant);
                                        }}
                                      />
                                    ) : (
                                      <>
                                        <Camera className="text-slate-400 mb-2" size={32} />
                                        <div className="text-sm font-medium text-slate-600 mb-1">
                                          Photo de départ
                                        </div>
                                        <div className="text-xs text-slate-400 text-center">
                                          Cliquez pour ajouter une photo
                                        </div>
                                      </>
                                    )}
                                  </label>
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                  Photo actuelle
                                </label>
                                <div className="relative">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                          const base64String = reader.result as string;
                                          setPhotoApres(base64String);
                                          if (showDetails !== null) {
                                            localStorage.setItem(
                                              `client-photo-apres-${showDetails}`,
                                              base64String
                                            );
                                          }
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                    className="hidden"
                                    id="photo-apres-input"
                                  />
                                  <label
                                    htmlFor="photo-apres-input"
                                    className="cursor-pointer block bg-white rounded-lg border border-slate-200 shadow-sm p-6 flex flex-col items-center justify-center min-h-48 hover:bg-slate-50 transition"
                                  >
                                    {photoApres ? (
                                      <img
                                        src={photoApres}
                                        alt="Photo actuelle"
                                        className="w-full h-48 object-cover rounded-lg"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          setPhotoEnGrand(photoApres);
                                        }}
                                      />
                                    ) : (
                                      <>
                                        <Camera className="text-slate-400 mb-2" size={32} />
                                        <div className="text-sm font-medium text-slate-600 mb-1">
                                          Photo actuelle
                                        </div>
                                        <div className="text-xs text-slate-400 text-center">
                                          Cliquez pour ajouter une photo
                                        </div>
                                      </>
                                    )}
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeTab === "seances" && (
                          <div className="space-y-4">
                            {historiqueRDV.length === 0 ? (
                              <div className="text-center py-8 text-slate-400 text-sm bg-white rounded-lg border border-slate-200 shadow-sm">
                                Aucune séance enregistrée
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {historiqueRDV.map((rdv) => (
                                  <div
                                    key={rdv.id}
                                    className="bg-white rounded-lg border border-slate-200 shadow-sm p-3 flex items-start gap-3"
                                  >
                                    {rdv.typeLieu === "salle" ? (
                                      <Dumbbell className="text-gray-700 mt-0.5" size={18} />
                                    ) : (
                                      <Monitor className="text-gray-700 mt-0.5" size={18} />
                                    )}
                                    <div className="flex-1">
                                      <div className="font-medium text-slate-700">
                                        {rdv.date || "Séance"}
                                      </div>
                                      <div className="text-xs text-slate-400 mt-1">
                                        {rdv.heure} • {rdv.lieu} • {rdv.duree}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {activeTab === "programme" && (
                          <div className="space-y-4">
                            {programmeClient ? (
                              <div className="space-y-4">
                                {programmeClient.semaine.map((jour, index) => (
                                  <div
                                    key={index}
                                    className="bg-white rounded-xl border border-slate-200 shadow-sm p-5"
                                  >
                                    <h3 className="font-semibold text-slate-700 mb-4 text-lg">
                                      {jour.jour}
                                    </h3>
                                    {jour.exercices.length === 0 ? (
                                      <div className="text-sm text-slate-400 text-center py-4">
                                        Aucun exercice pour ce jour
                                      </div>
                                    ) : (
                                      <div className="space-y-3">
                                        {jour.exercices.map((ex, idx) => (
                                          <div
                                            key={idx}
                                            className="bg-slate-50 rounded-lg p-4 border border-slate-200"
                                          >
                                            <div className="font-medium text-slate-700 mb-2">
                                              {ex.exerciceNom}
                                            </div>
                                            <div className="text-sm text-slate-600 space-y-1">
                                              <div>Séries: {ex.series}</div>
                                              <div>Répétitions: {ex.repetitions}</div>
                                              <div>Repos: {ex.repos}</div>
                                              {ex.notes && (
                                                <div className="text-slate-500 italic mt-2">
                                                  {ex.notes}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                                <button
                                  onClick={() => {
                                    setSelectedJour("");
                                    setShowProgrammeModal(true);
                                  }}
                                  className="w-full bg-red-600 text-white rounded-xl px-6 py-4 text-base font-medium hover:bg-red-700 transition shadow-sm flex items-center justify-center gap-2"
                                >
                                  <Edit size={20} />
                                  Modifier le programme
                                </button>
                              </div>
                            ) : (
                              <div className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm">
                                <BookOpen className="text-slate-300 mx-auto mb-4" size={48} />
                                <div className="text-slate-400 text-sm mb-2">
                                  Aucun programme défini
                                </div>
                                <button
                                  onClick={() => {
                                    setSelectedJour("");
                                    setShowProgrammeModal(true);
                                  }}
                                  className="mt-4 bg-red-600 text-white rounded-xl px-6 py-3 text-base font-medium hover:bg-red-700 transition shadow-sm flex items-center gap-2 mx-auto"
                                >
                                  <Plus size={20} />
                                  Créer un programme
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Modal Créer/Modifier Programme */}
                      {showProgrammeModal && (
                        <ProgrammeModal
                          clientId={showDetails!}
                          exercices={exercices}
                          programmeClient={programmeClient}
                          onClose={() => {
                            setShowProgrammeModal(false);
                            setSelectedJour("");
                            // Recharger le programme
                            if (showDetails !== null) {
                              const programme = getProgrammeClient(showDetails);
                              setProgrammeClient(programme);
                            }
                          }}
                        />
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}

        </section>

        {/* Modal pour afficher la photo en grand */}
        {photoEnGrand && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[10001] p-4"
            onClick={() => setPhotoEnGrand(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] w-full">
              <button
                onClick={() => setPhotoEnGrand(null)}
                className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-700 rounded-full p-2 shadow-lg transition z-10"
              >
                <X size={24} />
              </button>
              <img
                src={photoEnGrand}
                alt="Photo en grand"
                className="w-full h-auto rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}

// Composant Modal Programme
function ProgrammeModal({
  clientId,
  exercices,
  programmeClient,
  onClose,
}: {
  clientId: number;
  exercices: Exercice[];
  programmeClient: ProgrammeClient | null;
  onClose: () => void;
}) {
  const jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
  const [programme, setProgramme] = useState<JourProgramme[]>(
    programmeClient?.semaine ||
      jours.map((jour) => ({
        jour,
        exercices: [],
      }))
  );
  const [selectedJour, setSelectedJour] = useState<string>("");
  const [selectedExerciceId, setSelectedExerciceId] = useState<number | null>(null);
  const [series, setSeries] = useState("");
  const [repetitions, setRepetitions] = useState("");
  const [repos, setRepos] = useState("");
  const [notes, setNotes] = useState("");

  const handleAddExercice = () => {
    if (!selectedJour || !selectedExerciceId) return;

    const exercice = exercices.find((ex) => ex.id === selectedExerciceId);
    if (!exercice) return;

    const updated = programme.map((jour) => {
      if (jour.jour === selectedJour) {
        return {
          ...jour,
          exercices: [
            ...jour.exercices,
            {
              exerciceId: exercice.id,
              exerciceNom: exercice.nom,
              series: series || "3",
              repetitions: repetitions || "12",
              repos: repos || "2 min",
              notes: notes || undefined,
            },
          ],
        };
      }
      return jour;
    });

    setProgramme(updated);
    setSelectedExerciceId(null);
    setSeries("");
    setRepetitions("");
    setRepos("");
    setNotes("");
  };

  const handleRemoveExercice = (jour: string, index: number) => {
    const updated = programme.map((j) => {
      if (j.jour === jour) {
        return {
          ...j,
          exercices: j.exercices.filter((_, i) => i !== index),
        };
      }
      return j;
    });
    setProgramme(updated);
  };

  const handleSave = () => {
    const programmeToSave: ProgrammeClient = {
      clientId,
      semaine: programme,
    };
    saveProgrammeClient(programmeToSave);
    onClose();
  };

  return (
      <div
        className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[10002] p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
      <div className="bg-white rounded-xl border border-slate-200 shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-slate-700">Créer le programme d'entraînement</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {jours.map((jour) => {
            const jourData = programme.find((j) => j.jour === jour);
            return (
              <div key={jour} className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                <h4 className="font-semibold text-slate-700 mb-3">{jour}</h4>

                {/* Liste des exercices */}
                {jourData && jourData.exercices.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {jourData.exercices.map((ex, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-lg p-3 flex items-start justify-between border border-slate-200"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-slate-700">{ex.exerciceNom}</div>
                          <div className="text-xs text-slate-500 mt-1">
                            {ex.series} séries × {ex.repetitions} reps • Repos: {ex.repos}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveExercice(jour, idx)}
                          className="text-red-500 hover:bg-red-50 p-1 rounded transition ml-2"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Formulaire pour ajouter un exercice */}
                {selectedJour === jour ? (
                  <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-3">
                    <select
                      value={selectedExerciceId || ""}
                      onChange={(e) => setSelectedExerciceId(e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full bg-white rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none"
                    >
                      <option value="">Sélectionner un exercice</option>
                      {exercices.map((ex) => (
                        <option key={ex.id} value={ex.id}>
                          {ex.nom}
                        </option>
                      ))}
                    </select>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Séries"
                        value={series}
                        onChange={(e) => setSeries(e.target.value)}
                        className="w-full bg-white rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Répétitions"
                        value={repetitions}
                        onChange={(e) => setRepetitions(e.target.value)}
                        className="w-full bg-white rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Repos"
                        value={repos}
                        onChange={(e) => setRepos(e.target.value)}
                        className="w-full bg-white rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Notes (optionnel)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-white rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleAddExercice}
                        className="flex-1 bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-700 transition"
                      >
                        Ajouter
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedJour("");
                          setSelectedExerciceId(null);
                          setSeries("");
                          setRepetitions("");
                          setRepos("");
                          setNotes("");
                        }}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition text-sm"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedJour(jour)}
                    className="w-full text-red-600 hover:bg-gray-50 rounded-lg px-4 py-2 text-sm font-medium transition border border-gray-200"
                  >
                    <Plus size={16} className="inline mr-2" />
                    Ajouter un exercice
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition font-medium text-base"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-red-600 text-white rounded-xl px-6 py-3 hover:bg-red-700 transition shadow-sm font-medium text-base"
          >
            Enregistrer le programme
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Chargement...</div>}>
      <ClientsPageContent />
    </Suspense>
  );
}

