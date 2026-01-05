"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Target,
  Scale,
  Ruler,
  Calendar,
  Shield,
  CheckCircle2,
  ArrowRight,
  UserCircle,
  Users,
} from "lucide-react";
import { saveOnboardingData, ClientOnboardingData } from "../../utils/clientOnboardingStorage";
import { linkClientToCoach } from "../../utils/coachStorage";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    poidsActuel: "",
    taille: "",
    age: "",
    sexe: "" as "Homme" | "Femme" | "",
    objectif: "" as "Sèche" | "Prise de masse" | "Santé" | "",
    rgpdConsent: false,
    coachCode: "",
  });
  const [clientId, setClientId] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const id = localStorage.getItem("demos-user-id");
      if (id) {
        setClientId(id);
      } else {
        router.push("/");
      }
      
      // Vérifier si un code coach est dans l'URL
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("coach_code");
      if (code) {
        setFormData((prev) => ({ ...prev, coachCode: code }));
      }
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      if (!formData.poidsActuel || !formData.taille || !formData.age || !formData.sexe || !formData.objectif) {
        alert("Veuillez remplir tous les champs");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.rgpdConsent) {
        alert("Vous devez accepter le consentement RGPD pour continuer");
        return;
      }
      
      // Sauvegarder les données d'onboarding
      const onboardingData: ClientOnboardingData = {
        clientId: clientId,
        poidsActuel: parseFloat(formData.poidsActuel),
        taille: parseFloat(formData.taille),
        age: parseInt(formData.age),
        sexe: formData.sexe as "Homme" | "Femme",
        objectif: formData.objectif as "Sèche" | "Prise de masse" | "Santé",
        rgpdConsent: formData.rgpdConsent,
        completedAt: new Date().toISOString(),
      };
      
      saveOnboardingData(onboardingData);
      
      // Lier au coach si un code est fourni
      if (formData.coachCode.trim()) {
        linkClientToCoach(clientId, formData.coachCode.trim().toUpperCase());
      }
      
      // Rediriger vers le portail client
      router.push("/client-portal");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blur effect for glassmorphism */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 via-transparent to-red-700/10 blur-3xl"></div>
      <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-full p-5 w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-xl shadow-red-500/20 border border-white/10">
            <User className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
            Bienvenue sur Demos !
          </h1>
          <p className="text-gray-400 text-sm">
            {step === 1 ? "Complétez votre profil pour commencer" : "Consentement RGPD"}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400 font-medium">Étape {step} sur 2</span>
            <span className="text-xs text-gray-300 font-semibold">{step === 1 ? "33%" : step === 2 ? "66%" : "100%"}</span>
          </div>
          <div className="w-full bg-gray-800/50 rounded-full h-1.5 overflow-hidden backdrop-blur-sm border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-red-700 rounded-full transition-all duration-500 ease-out shadow-lg shadow-red-500/30"
              style={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
            ></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <>
              {/* Sexe */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <UserCircle className="text-red-500" size={18} />
                  Sexe
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, sexe: "Homme" })}
                    className={`relative p-6 rounded-2xl border-2 transition-all duration-300 backdrop-blur-sm ${
                      formData.sexe === "Homme"
                        ? "bg-gradient-to-br from-red-600/40 to-red-700/40 border-red-500/60 shadow-2xl shadow-red-500/30 scale-105"
                        : "bg-gray-800/30 border-white/10 hover:border-white/30 hover:shadow-xl hover:scale-102"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className={`p-4 rounded-full ${formData.sexe === "Homme" ? "bg-red-600/20" : "bg-gray-700/30"}`}>
                        <User className={formData.sexe === "Homme" ? "text-red-400" : "text-gray-400"} size={32} />
                      </div>
                      <span className={`font-semibold text-base ${formData.sexe === "Homme" ? "text-white" : "text-gray-300"}`}>
                        Homme
                      </span>
                    </div>
                    {formData.sexe === "Homme" && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 className="text-red-400" size={20} />
                      </div>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, sexe: "Femme" })}
                    className={`relative p-6 rounded-2xl border-2 transition-all duration-300 backdrop-blur-sm ${
                      formData.sexe === "Femme"
                        ? "bg-gradient-to-br from-red-600/40 to-red-700/40 border-red-500/60 shadow-2xl shadow-red-500/30 scale-105"
                        : "bg-gray-800/30 border-white/10 hover:border-white/30 hover:shadow-xl hover:scale-102"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className={`p-4 rounded-full ${formData.sexe === "Femme" ? "bg-red-600/20" : "bg-gray-700/30"}`}>
                        <Users className={formData.sexe === "Femme" ? "text-red-400" : "text-gray-400"} size={32} />
                      </div>
                      <span className={`font-semibold text-base ${formData.sexe === "Femme" ? "text-white" : "text-gray-300"}`}>
                        Femme
                      </span>
                    </div>
                    {formData.sexe === "Femme" && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 className="text-red-400" size={20} />
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Poids actuel */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Scale className="text-red-500" size={18} />
                  Poids actuel (kg)
                </label>
                <input
                  type="number"
                  value={formData.poidsActuel}
                  onChange={(e) => setFormData({ ...formData, poidsActuel: e.target.value })}
                  placeholder="Ex: 75"
                  min="30"
                  max="200"
                  step="0.1"
                  className="w-full bg-white/5 backdrop-blur-md rounded-xl border border-white/20 px-4 py-3 text-base text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none transition-all shadow-xl"
                  required
                />
              </div>

              {/* Taille */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Ruler className="text-red-500" size={18} />
                  Taille (cm)
                </label>
                <input
                  type="number"
                  value={formData.taille}
                  onChange={(e) => setFormData({ ...formData, taille: e.target.value })}
                  placeholder="Ex: 175"
                  min="100"
                  max="250"
                  step="1"
                  className="w-full bg-white/5 backdrop-blur-md rounded-xl border border-white/20 px-4 py-3 text-base text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none transition-all shadow-xl"
                  required
                />
              </div>

              {/* Âge */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Calendar className="text-red-500" size={18} />
                  Âge
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="Ex: 30"
                  min="16"
                  max="100"
                  step="1"
                  className="w-full bg-white/5 backdrop-blur-md rounded-xl border border-white/20 px-4 py-3 text-base text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none transition-all shadow-xl"
                  required
                />
              </div>

              {/* Objectif */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Target className="text-red-500" size={18} />
                  Objectif
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {(["Sèche", "Prise de masse", "Santé"] as const).map((obj) => (
                    <label
                      key={obj}
                      className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all backdrop-blur-md ${
                        formData.objectif === obj
                          ? "bg-gradient-to-r from-red-600/40 to-red-700/40 border-red-500/60 shadow-xl shadow-red-500/30"
                          : "bg-white/5 border-white/20 hover:border-white/30 hover:shadow-lg"
                      }`}
                    >
                      <input
                        type="radio"
                        name="objectif"
                        value={obj}
                        checked={formData.objectif === obj}
                        onChange={(e) => setFormData({ ...formData, objectif: e.target.value as any })}
                        className="w-4 h-4 text-red-600 focus:ring-red-500"
                        required
                      />
                      <span className="text-white font-medium">{obj}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Code Coach (optionnel) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Code Coach (optionnel)
                </label>
                <input
                  type="text"
                  value={formData.coachCode}
                  onChange={(e) => setFormData({ ...formData, coachCode: e.target.value.toUpperCase() })}
                  placeholder="Ex: ABC123"
                  maxLength={6}
                  className="w-full bg-white/5 backdrop-blur-md rounded-xl border border-white/20 px-4 py-3 text-base text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none transition-all shadow-xl uppercase"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Si vous avez reçu un code de votre coach, entrez-le ici
                </p>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-2xl">
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-red-600 to-red-700 p-3 rounded-lg shadow-xl shadow-red-500/30 border border-white/10">
                    <Shield className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Consentement RGPD
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      En cochant cette case, vous acceptez que vos données de santé (poids, taille, mensurations) soient utilisées par votre coach pour vous accompagner dans votre parcours. Ces données sont stockées de manière sécurisée et ne seront jamais partagées avec des tiers.
                    </p>
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.rgpdConsent}
                        onChange={(e) => setFormData({ ...formData, rgpdConsent: e.target.checked })}
                        className="mt-1 w-5 h-5 text-red-600 rounded border-gray-600 focus:ring-red-500 focus:ring-2 bg-gray-700"
                        required
                      />
                      <span className="text-gray-300 text-sm group-hover:text-white transition">
                        J'accepte l'utilisation de mes données de santé conformément au RGPD
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Récapitulatif */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-2xl">
                <h3 className="text-lg font-semibold text-white mb-4">Récapitulatif</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>Poids actuel:</span>
                    <span className="text-white font-medium">{formData.poidsActuel} kg</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Taille:</span>
                    <span className="text-white font-medium">{formData.taille} cm</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Âge:</span>
                    <span className="text-white font-medium">{formData.age} ans</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Sexe:</span>
                    <span className="text-white font-medium">{formData.sexe}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Objectif:</span>
                    <span className="text-white font-medium">{formData.objectif}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex-1 px-6 py-3 text-gray-300 hover:bg-gray-800/50 rounded-xl transition font-medium text-base border border-white/10 backdrop-blur-sm"
              >
                Retour
              </button>
            )}
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl px-6 py-3 hover:from-red-700 hover:to-red-800 transition-all shadow-xl shadow-red-500/30 font-medium text-base active:scale-95 border border-white/10 flex items-center justify-center gap-2"
            >
              {step === 1 ? (
                <>
                  Continuer
                  <ArrowRight size={20} />
                </>
              ) : (
                <>
                  Terminer l'inscription
                  <CheckCircle2 size={20} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

