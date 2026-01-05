"use client";
import { useState, useEffect } from "react";
import {
  FileText,
  Euro,
  Clock,
  CheckCircle2,
  Download,
  CreditCard,
  Plus,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import { getPaiements, addPaiement, savePaiements } from "../utils/facturationStorage";

interface Facture {
  id: number;
  client: string;
  montant: string;
  dateEcheance: string;
  joursRestants: number;
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

const mockFacturesEnAttenteInit = [
  {
    id: 1,
    client: "Mathieu Dupont",
    montant: "100€",
    dateEcheance: "20 Jan 2024",
    joursRestants: 5,
  },
  {
    id: 2,
    client: "Chloé Martin",
    montant: "90€",
    dateEcheance: "18 Jan 2024",
    joursRestants: 3,
  },
];

export default function FacturationPage() {
  const [selectedFacture, setSelectedFacture] = useState<number | null>(null);
  const [facturesEnAttente, setFacturesEnAttente] = useState<Facture[]>(mockFacturesEnAttenteInit);
  const [paiementsRecus, setPaiementsRecus] = useState(mockPaiementsRecusInit);
  const [showCreateModal, setShowCreateModal] = useState(false);
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

  const generatePDF = async () => {
    try {
      if (!selectedFacture) {
        alert("Veuillez sélectionner une facture");
        return;
      }

      const clientFacture = facturesEnAttente.find((f) => f.id === selectedFacture);
      if (!clientFacture) {
        alert("Facture introuvable");
        return;
      }

      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      const today = new Date();
      const dateStr = today.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      // En-tête
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
      doc.text("FACTURE", 140, 25);

      // Informations
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Client: ${clientFacture.client}`, 20, 48);
      doc.text(`Montant: ${clientFacture.montant}`, 20, 58);
      doc.text(`Date: ${dateStr}`, 20, 68);

      doc.setDrawColor(200, 200, 200);
      doc.line(20, 78, 190, 78);

      doc.setFontSize(12);
      doc.text("Détails", 20, 93);
      doc.setFontSize(10);
      doc.text("Prestation de coaching", 20, 108);
      doc.text(clientFacture.montant, 160, 108);

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Total:", 140, 128);
      doc.text(clientFacture.montant, 160, 128);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text("Merci pour votre confiance!", 20, 148);

      const fileName = `facture-${clientFacture.client.replace(/\s+/g, "-")}-${Date.now()}.pdf`;
      doc.save(fileName);

      // Déplacer vers paiements reçus
      const todayPayment = new Date();
      const dateStrPayment = todayPayment.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      const newPaiement = {
        id: Date.now(),
        client: clientFacture.client,
        montant: clientFacture.montant,
        date: dateStrPayment,
        status: "Payé" as const,
      };

      const updatedPaiements = [...paiementsRecus, newPaiement];
      setPaiementsRecus(updatedPaiements);
      savePaiements(updatedPaiements);
      window.dispatchEvent(new CustomEvent('paiementsUpdated'));

      setFacturesEnAttente(facturesEnAttente.filter((f) => f.id !== selectedFacture));
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
    };

    setFacturesEnAttente([...facturesEnAttente, nouvelleFacture]);
    setNewFacture({ client: "", montant: "", dateEcheance: "" });
    setShowCreateModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Facturation</h1>
              <p className="text-gray-500 mt-1">Gestion des factures et paiements</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition flex items-center gap-2 shadow-md"
            >
              <Plus size={20} />
              Nouvelle facture
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total reçu</p>
                  <p className="text-2xl font-bold text-gray-800 mt-2">
                    {totalPaiements.toLocaleString("fr-FR")}€
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <Euro className="text-red-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Factures en attente</p>
                  <p className="text-2xl font-bold text-gray-800 mt-2">
                    {facturesEnAttente.length}
                  </p>
                </div>
                <div className="bg-gray-100 p-3 rounded-full">
                  <Clock className="text-gray-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Paiements reçus</p>
                  <p className="text-2xl font-bold text-gray-800 mt-2">
                    {paiementsRecus.length}
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <CheckCircle2 className="text-red-600" size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Paiements reçus */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CheckCircle2 className="text-red-600" size={24} />
                Paiements reçus
              </h2>
              <div className="space-y-2">
                {paiementsRecus.map((paiement) => (
                  <div
                    key={paiement.id}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between hover:shadow-md transition"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{paiement.client}</div>
                      <div className="text-xs text-gray-500 mt-1">{paiement.date}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-red-600">{paiement.montant}</span>
                      <CheckCircle2 className="text-gray-600" size={16} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Factures en attente */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="text-red-600" size={24} />
                Factures en attente
              </h2>
              {facturesEnAttente.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Aucune facture en attente
                </div>
              ) : (
                <div className="space-y-2">
                  {facturesEnAttente.map((facture) => (
                    <div
                      key={facture.id}
                      onClick={() => setSelectedFacture(facture.id)}
                      className={`bg-gray-50 border rounded-lg p-3 cursor-pointer transition ${
                        selectedFacture === facture.id
                          ? "border-red-600 bg-red-50"
                          : "border-gray-200 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{facture.client}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Échéance: {facture.dateEcheance}
                          </div>
                          <div className="text-xs text-gray-600 font-medium mt-1">
                            {facture.joursRestants} jour{facture.joursRestants > 1 ? "s" : ""} restant{facture.joursRestants > 1 ? "s" : ""}
                          </div>
                        </div>
                        <div className="font-semibold text-gray-800">{facture.montant}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bouton générer PDF */}
          {selectedFacture && (
            <div className="mt-6 bg-white rounded-lg shadow-md p-6">
              <button
                onClick={generatePDF}
                className="w-full bg-red-600 text-white rounded-lg px-6 py-3 hover:bg-red-700 transition flex items-center justify-center gap-2 shadow-md"
              >
                <Download size={20} />
                Générer la facture PDF
              </button>
            </div>
          )}

          {/* Modal créer facture */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Nouvelle facture</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client
                    </label>
                    <input
                      type="text"
                      value={newFacture.client}
                      onChange={(e) => setNewFacture({ ...newFacture, client: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none"
                      placeholder="Nom du client"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Montant
                    </label>
                    <input
                      type="text"
                      value={newFacture.montant}
                      onChange={(e) => setNewFacture({ ...newFacture, montant: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none"
                      placeholder="100€"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date d'échéance
                    </label>
                    <input
                      type="date"
                      value={newFacture.dateEcheance}
                      onChange={(e) => setNewFacture({ ...newFacture, dateEcheance: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleCreateFacture}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
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
