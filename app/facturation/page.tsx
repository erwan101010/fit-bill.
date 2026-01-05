"use client";
import { useState, useEffect } from "react";
import {
  FileText,
  Euro,
  Clock,
  CheckCircle2,
  Download,
  Home,
  Calendar,
  Users,
  BookOpen,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

export default function FacturationPage() {
  const pathname = usePathname();
  const [selectedFacture, setSelectedFacture] = useState<number | null>(null);
  const [facturesEnAttente, setFacturesEnAttente] = useState<Facture[]>(mockFacturesEnAttenteInit);
  const [paiementsRecus, setPaiementsRecus] = useState(mockPaiementsRecusInit);

  // Charger les paiements depuis localStorage
  useEffect(() => {
    const storedPaiements = getPaiements();
    if (storedPaiements.length > 0) {
      setPaiementsRecus(storedPaiements);
    } else {
      // Initialiser avec les paiements par défaut
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

      // Import dynamique de jsPDF pour éviter les problèmes avec Next.js
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
      doc.setTextColor(220, 38, 38); // Rouge
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

      // Informations du client
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Nom du client: ${clientFacture.client}`, 20, 48);
      doc.text(`Montant: ${clientFacture.montant}`, 20, 58);
      doc.text(`Date: ${dateStr}`, 20, 68);

      // Ligne de séparation
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 78, 190, 78);

      // Détails
      doc.setFontSize(12);
      doc.text("Détails de la facture", 20, 93);
      
      doc.setFontSize(10);
      doc.text("Prestation de coaching", 20, 108);
      doc.text(clientFacture.montant, 160, 108);

      // Total
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Total:", 140, 128);
      doc.text(clientFacture.montant, 160, 128);

      // Bas de page
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text("Merci pour votre confiance!", 20, 148);

      // Télécharger le PDF
      const fileName = `facture-${clientFacture.client.replace(/\s+/g, "-")}-${Date.now()}.pdf`;
      doc.save(fileName);

      // Déplacer la facture de "en attente" vers "Payé"
      const todayPayment = new Date();
      const dateStrPayment = todayPayment.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      // Ajouter aux paiements reçus
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
      
      // Déclencher un événement personnalisé pour mettre à jour le Dashboard
      window.dispatchEvent(new CustomEvent('paiementsUpdated'));

      // Retirer des factures en attente
      setFacturesEnAttente(facturesEnAttente.filter((f) => f.id !== selectedFacture));
      setSelectedFacture(null);
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      alert("Une erreur est survenue lors de la génération du PDF");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      {/* Main Content */}
      <div className="flex-1 px-4 py-6 pb-24 max-w-xl mx-auto w-full">
        <section className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow p-5 mb-4">
            <div className="font-semibold text-slate-700 mb-1 flex items-center">
              <FileText className="text-red-600 mr-2" size={24} />
              Facturation
            </div>
            <div className="text-sm text-slate-400">
              Gestion des factures et paiements
            </div>
          </div>

          {/* Récapitulatif des paiements reçus */}
          <div className="bg-white rounded-xl shadow p-5">
            <div className="font-semibold text-slate-700 mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle2 className="text-red-600 mr-2" size={20} />
                Paiements reçus
              </div>
              <div className="text-lg font-bold text-red-600">
                {totalPaiements}€
              </div>
            </div>
            <div className="space-y-2">
              {paiementsRecus.map((paiement) => (
                <div
                  key={paiement.id}
                  className="bg-white rounded-lg border border-slate-200 shadow-sm p-3 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="font-medium text-slate-700">
                      {paiement.client}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {paiement.date}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">
                      {paiement.montant}
                    </span>
                    <CheckCircle2 className="text-gray-600" size={16} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bouton Paiement en ligne */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl p-6 shadow-lg mb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-lg mb-1 flex items-center">
                  <CreditCard className="mr-2" size={24} />
                  Paiement en ligne
                </div>
                <div className="text-white/90 text-sm">
                  Activez Stripe pour accepter les paiements en ligne
                </div>
              </div>
              <button
                onClick={() => {
                  alert(
                    "Configuration Stripe :\n\n1. Créez un compte Stripe sur stripe.com\n2. Récupérez vos clés API (publiques et secrètes)\n3. Configurez les webhooks pour les notifications\n4. Intégrez l'API Stripe dans votre application\n\nNous préparerons cette intégration prochainement !"
                  );
                }}
                className="bg-white/20 hover:bg-white/30 text-white rounded-xl px-6 py-3 font-medium text-base transition flex items-center gap-2"
              >
                <CreditCard size={18} />
                Activer Stripe
              </button>
            </div>
          </div>

          {/* Factures en attente */}
          <div className="bg-white rounded-xl shadow p-5">
            <div className="font-semibold text-slate-700 mb-4 flex items-center">
              <Clock className="text-red-600 mr-2" size={20} />
              Factures en attente
            </div>
            {facturesEnAttente.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                Aucune facture en attente
              </div>
            ) : (
              <div className="space-y-2">
                {facturesEnAttente.map((facture) => (
                  <div
                    key={facture.id}
                    onClick={() => setSelectedFacture(facture.id)}
                    className={`bg-white rounded-lg border border-slate-200 shadow-sm p-3 flex items-center justify-between cursor-pointer transition ${
                      selectedFacture === facture.id
                        ? "ring-2 ring-red-600 bg-gray-50"
                        : "hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-slate-700">
                        {facture.client}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Échéance : {facture.dateEcheance}
                      </div>
                      <div className="text-xs text-gray-600 font-medium mt-1">
                        {facture.joursRestants} jour
                        {facture.joursRestants > 1 ? "s" : ""} restant
                        {facture.joursRestants > 1 ? "s" : ""}
                      </div>
                    </div>
                    <div className="font-semibold text-slate-700">
                      {facture.montant}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bouton Générer une facture PDF */}
          <div className="bg-white rounded-xl shadow p-5">
            <button
              onClick={generatePDF}
              disabled={selectedFacture === null}
              className={`w-full rounded-lg px-4 py-3 flex items-center justify-center gap-2 transition ${
                selectedFacture === null
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              <Download className={selectedFacture === null ? "text-slate-500" : "text-white"} size={20} />
              <span className="font-medium">
                {selectedFacture === null
                  ? "Sélectionnez une facture pour générer le PDF"
                  : "Générer une facture PDF"}
              </span>
            </button>
          </div>
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
    </div>
  );
}

