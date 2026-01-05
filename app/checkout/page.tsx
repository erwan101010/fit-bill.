"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CreditCard,
  Lock,
  ArrowLeft,
  CheckCircle2,
  Receipt,
  Shield,
} from "lucide-react";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvc: "",
    cardholderName: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Récupérer les paramètres de la commande depuis l'URL
  const amount = searchParams.get("amount") || "100";
  const client = searchParams.get("client") || "Client";
  const factureId = searchParams.get("factureId") || "";

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    if (typeof window !== "undefined") {
      const userId = localStorage.getItem("demos-user-id");
      if (!userId) {
        router.push("/");
      }
    }
  }, [router]);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData({ ...formData, cardNumber: formatted });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    setFormData({ ...formData, expiryDate: formatted });
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, "").substring(0, 3);
    setFormData({ ...formData, cvc: v });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cardNumber || !formData.expiryDate || !formData.cvc || !formData.cardholderName) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    if (formData.cardNumber.replace(/\s/g, "").length < 16) {
      alert("Numéro de carte invalide");
      return;
    }

    setIsProcessing(true);

    // Simulation du traitement Stripe (à remplacer par l'API Stripe réelle)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsProcessing(false);
    setIsComplete(true);

    // Rediriger après 2 secondes
    setTimeout(() => {
      router.push("/client-portal");
    }, 2000);
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12 max-w-md w-full text-center">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-xl shadow-green-500/30 border border-white/10">
            <CheckCircle2 className="text-white" size={40} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Paiement réussi !</h2>
          <p className="text-gray-400 mb-8">
            Votre paiement de {amount}€ a été traité avec succès.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Shield size={16} />
            <span>Transaction sécurisée</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blur effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 via-transparent to-red-700/10 blur-3xl"></div>
      
      <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 max-w-2xl w-full">
        {/* Header */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-6"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Retour</span>
        </button>

        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-xl shadow-red-500/20 border border-white/10">
            <CreditCard className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
            Paiement sécurisé
          </h1>
          <p className="text-gray-400 text-sm">
            Complétez votre paiement en toute sécurité
          </p>
        </div>

        {/* Récapitulatif */}
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Receipt className="text-red-400" size={20} />
            <h3 className="text-lg font-semibold text-white">Récapitulatif</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>Client:</span>
              <span className="text-white font-medium">{client}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Montant:</span>
              <span className="text-white font-semibold text-lg">{amount}€</span>
            </div>
          </div>
        </div>

        {/* Formulaire de paiement */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nom du titulaire */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nom du titulaire de la carte
            </label>
            <input
              type="text"
              value={formData.cardholderName}
              onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value.toUpperCase() })}
              placeholder="JEAN DUPONT"
              className="w-full bg-white/5 backdrop-blur-md rounded-xl border border-white/20 px-4 py-3 text-base text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none transition-all shadow-xl uppercase"
              required
            />
          </div>

          {/* Numéro de carte */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Numéro de carte
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.cardNumber}
                onChange={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="w-full bg-white/5 backdrop-blur-md rounded-xl border border-white/20 px-4 py-3 text-base text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none transition-all shadow-xl font-mono"
                required
              />
              <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            </div>
          </div>

          {/* Date d'expiration et CVC */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date d'expiration
              </label>
              <input
                type="text"
                value={formData.expiryDate}
                onChange={handleExpiryChange}
                placeholder="MM/AA"
                maxLength={5}
                className="w-full bg-white/5 backdrop-blur-md rounded-xl border border-white/20 px-4 py-3 text-base text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none transition-all shadow-xl font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                CVC
              </label>
              <input
                type="text"
                value={formData.cvc}
                onChange={handleCvcChange}
                placeholder="123"
                maxLength={3}
                className="w-full bg-white/5 backdrop-blur-md rounded-xl border border-white/20 px-4 py-3 text-base text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none transition-all shadow-xl font-mono"
                required
              />
            </div>
          </div>

          {/* Sécurité */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Lock size={14} />
            <span>Vos données sont protégées par un chiffrement SSL</span>
          </div>

          {/* Bouton de paiement */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl px-6 py-4 hover:from-red-700 hover:to-red-800 transition-all shadow-xl shadow-red-500/30 font-semibold text-base active:scale-95 border border-white/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Traitement en cours...</span>
              </>
            ) : (
              <>
                <Lock size={20} />
                <span>Payer {amount}€</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}

