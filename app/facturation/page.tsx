"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Euro,
  Clock,
  CheckCircle2,
  Download,
  CreditCard,
  Plus,
  Folder,
  XCircle,
  Receipt,
  TrendingUp,
  Search,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import { getPaiements, addPaiement, savePaiements, Paiement } from "../utils/facturationStorage";

interface Facture {
  id: number;
  client: string;
  montant: string;
  dateEcheance: string;
  joursRestants: number;
  status: "Payé" | "En attente" | "Annulé";
  dateCreation: string;
}

const mockPaiementsRecusInit = [
  {
    id: 1,
    client: "Lucas Bernard",
    montant: "120€",
    date: "15 Jan 2024",
    status: "Payé" as const,
  },
  {
    id: 2,
    client: "Sophie Lemoine",
    montant: "80€",
    date: "14 Jan 2024",
    status: "Payé" as const,
  },
  {
    id: 3,
    client: "Didier Renard",
    montant: "150€",
    date: "12 Jan 2024",
    status: "Payé" as const,
  },
];

const mockFacturesInit = [
  {
    id: 1,
    client: "Mathieu Dupont",
    montant: "100€",
    dateEcheance: "20 Jan 2024",
    joursRestants: 5,
    status: "En attente" as const,
    dateCreation: "15 Jan 2024",
  },
  {
    id: 2,
    client: "Chloé Martin",
    montant: "90€",
    dateEcheance: "18 Jan 2024",
    joursRestants: 3,
    status: "En attente" as const,
    dateCreation: "13 Jan 2024",
  },
  {
    id: 3,
    client: "Lucas Bernard",
    montant: "120€",
    dateEcheance: "25 Jan 2024",
    joursRestants: 10,
    status: "En attente" as const,
    dateCreation: "10 Jan 2024",
  },
];

export default function FacturationPage() {
  const router = useRouter();
  const [selectedFacture, setSelectedFacture] = useState<number | null>(null);
  const [factures, setFactures] = useState<Facture[]>(mockFacturesInit);
  const [paiementsRecus, setPaiementsRecus] = useState<Paiement[]>(mockPaiementsRecusInit);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newFacture, setNewFacture] = useState({
    client: "",
    montant: "",
    dateEcheance: "",
  });

  useEffect(() => {
    const storedPaiements = getPaiements();
    if (storedPaiements.length > 0) {
      setPaiementsRecus(storedPaiements);
    } else {
      savePaiements(mockPaiementsRecusInit);
      setPaiementsRecus(mockPaiementsRecusInit);
    }
  }, []);

  const totalPaiements = paiementsRecus.reduce((sum, p) => {
    return sum + parseFloat(p.montant.replace("€", ""));
  }, 0);

  // Grouper les factures par client
  const facturesParClient = factures.reduce((acc, facture) => {
    if (!acc[facture.client]) {
      acc[facture.client] = [];
    }
    acc[facture.client].push(facture);
    return acc;
  }, {} as Record<string, Facture[]>);

  const clients = Object.keys(facturesParClient);

  const getStatusBadge = (status: "Payé" | "En attente" | "Annulé") => {
    switch (status) {
      case "Payé":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1.5 status-glow-green" style={{
            textShadow: '0 0 15px rgba(34, 197, 94, 1), 0 0 30px rgba(34, 197, 94, 0.8), 0 0 45px rgba(34, 197, 94, 0.6)',
            boxShadow: '0 0 20px rgba(34, 197, 94, 0.8), 0 0 40px rgba(34, 197, 94, 0.6), inset 0 0 20px rgba(34, 197, 94, 0.2)',
          }}>
            <CheckCircle2 size={12} />
            Payé
          </span>
        );
      case "En attente":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-1.5 status-glow-orange" style={{
            textShadow: '0 0 15px rgba(249, 115, 22, 1), 0 0 30px rgba(249, 115, 22, 0.8), 0 0 45px rgba(249, 115, 22, 0.6)',
            boxShadow: '0 0 20px rgba(249, 115, 22, 0.8), 0 0 40px rgba(249, 115, 22, 0.6), inset 0 0 20px rgba(249, 115, 22, 0.2)',
          }}>
            <Clock size={12} />
            En attente
          </span>
        );
      case "Annulé":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30 flex items-center gap-1.5">
            <XCircle size={12} />
            Annulé
          </span>
        );
    }
  };

  const generatePDF = async (facture: Facture) => {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      const today = new Date();
      const dateStr = today.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      // Logo et en-tête stylisé
      doc.setFillColor(220, 38, 38);
      doc.rect(0, 0, 210, 40, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont("helvetica", "bold");
      doc.text("Demos", 20, 25);
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Coaching Premium", 20, 32);
      
      // Numéro de facture
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("FACTURE", 150, 25);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`N° ${facture.id}`, 150, 32);

      // Informations client et coach
      doc.setFillColor(245, 245, 245);
      doc.rect(0, 40, 210, 50, "F");
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Facturé à:", 20, 55);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(facture.client, 20, 62);
      
      const coachName = typeof window !== "undefined" ? localStorage.getItem("demos-user-name") || "Coach Demos" : "Coach Demos";
      doc.setFont("helvetica", "bold");
      doc.text("Émis par:", 120, 55);
      doc.setFont("helvetica", "normal");
      doc.text(coachName, 120, 62);
      doc.text("Demos Coaching", 120, 69);
      
      doc.setFontSize(10);
      doc.text(`Date: ${dateStr}`, 20, 75);
      doc.text(`Échéance: ${facture.dateEcheance}`, 20, 82);

      // Ligne de séparation
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 95, 190, 95);

      // Détails de la facture
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(220, 38, 38);
      doc.text("Détails de la prestation", 20, 110);
      
      doc.setDrawColor(240, 240, 240);
      doc.rect(20, 115, 170, 20, "F");
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.text("Prestation de coaching personnalisé", 25, 125);
      doc.setFont("helvetica", "bold");
      doc.text(facture.montant, 170, 125);

      // Total
      doc.setDrawColor(220, 38, 38);
      doc.setLineWidth(0.5);
      doc.line(20, 145, 190, 145);
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Total TTC:", 120, 155);
      doc.setTextColor(220, 38, 38);
      doc.text(facture.montant, 170, 155);

      // Pied de page
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.setFont("helvetica", "normal");
      doc.text("Merci pour votre confiance!", 20, 180);
      doc.text("Demos - Coaching Premium", 20, 190);

      const fileName = `facture-${facture.client.replace(/\s+/g, "-")}-${Date.now()}.pdf`;
      doc.save(fileName);

      // Mettre à jour le statut
      setFactures(factures.map(f => 
        f.id === facture.id ? { ...f, status: "Payé" as const } : f
      ));
      
      // Ajouter au paiements reçus
      const todayPayment = new Date();
      const dateStrPayment = todayPayment.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      const newPaiement = {
        id: Date.now(),
        client: facture.client,
        montant: facture.montant,
        date: dateStrPayment,
        status: "Payé" as const,
        factureId: facture.id,
      };

      const updatedPaiements: Paiement[] = [...paiementsRecus, newPaiement];
      setPaiementsRecus(updatedPaiements);
      savePaiements(updatedPaiements);
      window.dispatchEvent(new CustomEvent('paiementsUpdated'));

      setSelectedFacture(null);
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      alert("Une erreur est survenue lors de la génération du PDF");
    }
  };

  const handleCreateFacture = () => {
    if (!newFacture.client || !newFacture.montant || !newFacture.dateEcheance) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    const dateEcheance = new Date(newFacture.dateEcheance);
    const today = new Date();
    const joursRestants = Math.ceil((dateEcheance.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const nouvelleFacture: Facture = {
      id: Date.now(),
      client: newFacture.client,
      montant: newFacture.montant.includes("€") ? newFacture.montant : `${newFacture.montant}€`,
      dateEcheance: dateEcheance.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      joursRestants: joursRestants > 0 ? joursRestants : 0,
      status: "En attente" as const,
      dateCreation: today.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };

    setFactures([...factures, nouvelleFacture]);
    setNewFacture({ client: "", montant: "", dateEcheance: "" });
    setShowCreateModal(false);
  };

  const handleCheckout = (facture: Facture) => {
    router.push(`/checkout?amount=${facture.montant.replace("€", "")}&client=${encodeURIComponent(facture.client)}&factureId=${facture.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Hub de Facturation</h1>
              <p className="text-gray-400 mt-1">Gestion professionnelle des factures et paiements</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-xl shadow-red-500/30 border border-white/10 flex items-center gap-2 font-medium"
              style={{
                boxShadow: '0 0 30px rgba(239, 68, 68, 0.5), 0 10px 25px -5px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Plus size={20} />
              + Nouvelle Facture
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur-xl rounded-xl shadow-2xl p-6 border border-white/20 hover:shadow-red-500/20 hover:-translate-y-1 transition-all duration-300 hover:border-red-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total reçu</p>
                  <p className="text-2xl font-bold text-white mt-2">
                    {totalPaiements.toLocaleString("fr-FR")}€
                  </p>
                </div>
                <div className="bg-red-600/20 p-3 rounded-full border border-red-500/30">
                  <Euro className="text-red-400" size={24} />
              </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-xl shadow-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Factures en attente</p>
                  <p className="text-2xl font-bold text-white mt-2">
                    {factures.filter(f => f.status === "En attente").length}
                  </p>
                    </div>
                <div className="bg-orange-600/20 p-3 rounded-full border border-orange-500/30">
                  <Clock className="text-orange-400" size={24} />
                </div>
            </div>
          </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-xl shadow-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                  <p className="text-gray-400 text-sm font-medium">Paiements reçus</p>
                  <p className="text-2xl font-bold text-white mt-2">
                    {paiementsRecus.length}
                  </p>
                </div>
                <div className="bg-green-600/20 p-3 rounded-full border border-green-500/30">
                  <CheckCircle2 className="text-green-400" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Champ de recherche */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} strokeWidth={1.5} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une facture par client..."
                className="w-full bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 px-12 py-4 text-base text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none transition-all shadow-xl hover:shadow-red-500/20"
                style={{
                  boxShadow: searchQuery ? '0 0 30px rgba(239, 68, 68, 0.3), 0 10px 25px -5px rgba(0, 0, 0, 0.1)' : undefined,
                }}
              />
            </div>
          </div>

          {/* Organisation par dossiers clients */}
          <div className="space-y-8">
            {clients.filter(client => 
              searchQuery === "" || client.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((client) => (
              <div key={client} className="bg-white/5 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 overflow-hidden hover:shadow-red-500/20 hover:-translate-y-1 transition-all duration-300 hover:border-red-500/30">
                <div 
                  className="p-6 border-b border-white/10 cursor-pointer hover:bg-white/5 transition"
                  onClick={() => setSelectedClient(selectedClient === client ? null : client)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-red-600/20 p-2 rounded-lg border border-red-500/30">
                        <Folder className="text-red-400" size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{client}</h3>
                        <p className="text-xs text-gray-400">
                          {facturesParClient[client].length} facture{facturesParClient[client].length > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Total</p>
                      <p className="text-xl font-bold text-white">
                        {facturesParClient[client].reduce((sum, f) => 
                          sum + parseFloat(f.montant.replace("€", "")), 0
                        ).toLocaleString("fr-FR")}€
                      </p>
                    </div>
                  </div>
                </div>
                
                {selectedClient === client && (
                  <div className="p-6 space-y-5 bg-white/2">
                    {facturesParClient[client].map((facture) => (
                      <div
                        key={facture.id}
                        className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-white/30 hover:shadow-red-500/20 hover:-translate-y-1 transition-all duration-300 active:scale-95"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <Receipt className="text-red-400" size={20} strokeWidth={1.5} />
                            <div>
                              <p className="text-white font-semibold text-lg">Facture #{facture.id}</p>
                              <p className="text-sm text-gray-400 mt-1">
                                Créée le {facture.dateCreation} • Échéance: {facture.dateEcheance}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {getStatusBadge(facture.status)}
                            <span className="text-2xl font-bold text-white">{facture.montant}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 mt-6">
                          <button
                            onClick={() => generatePDF(facture)}
                            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg px-4 py-2 hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-500/30 border border-white/10 flex items-center justify-center gap-2 text-sm font-medium hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                          >
                            <Download size={16} />
                            Générer PDF
                          </button>
                          {facture.status === "En attente" && (
                            <button
                              onClick={() => handleCheckout(facture)}
                              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg px-4 py-2 hover:from-green-700 hover:to-green-800 transition-all shadow-lg shadow-green-500/30 border border-white/10 flex items-center justify-center gap-2 text-sm font-medium hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                            >
                              <CreditCard size={16} />
                              Payer
                            </button>
                          )}
                    </div>
                  </div>
                ))}
              </div>
            )}
              </div>
            ))}
          </div>

          {/* Modal créer facture */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-zoom-in">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 max-w-md w-full p-6 modal-content-3d" style={{
                transform: 'perspective(1000px) rotateX(0deg) scale(1)',
                animation: 'modal-zoom-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}>
                <h3 className="text-xl font-bold text-white mb-4">Nouvelle facture</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Client
                    </label>
                    <input
                      type="text"
                      value={newFacture.client}
                      onChange={(e) => setNewFacture({ ...newFacture, client: e.target.value })}
                      className="w-full bg-white/5 backdrop-blur-md rounded-xl border border-white/20 px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none transition-all"
                      placeholder="Nom du client"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Montant
                    </label>
                    <input
                      type="text"
                      value={newFacture.montant}
                      onChange={(e) => setNewFacture({ ...newFacture, montant: e.target.value })}
                      className="w-full bg-white/5 backdrop-blur-md rounded-xl border border-white/20 px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none transition-all"
                      placeholder="100€"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Date d'échéance
                    </label>
                    <input
                      type="date"
                      value={newFacture.dateEcheance}
                      onChange={(e) => setNewFacture({ ...newFacture, dateEcheance: e.target.value })}
                      className="w-full bg-white/5 backdrop-blur-md rounded-xl border border-white/20 px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-white/20 rounded-xl text-gray-300 hover:bg-white/5 transition"
                  >
                    Annuler
                  </button>
            <button
                    onClick={handleCreateFacture}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-lg"
                  >
                    Créer
            </button>
          </div>
              </div>
            </div>
          )}
      </div>
      </main>
    </div>
  );
}
