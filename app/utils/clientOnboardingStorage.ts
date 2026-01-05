// Stockage des données d'onboarding client

export interface ClientOnboardingData {
  clientId: string;
  poidsActuel: number;
  taille: number;
  age: number;
  sexe?: "Homme" | "Femme";
  objectif: "Sèche" | "Prise de masse" | "Santé";
  rgpdConsent: boolean;
  completedAt: string;
}

const STORAGE_KEY_ONBOARDING = "demos-client-onboarding";

// Vérifier si l'onboarding est complété
export const isOnboardingComplete = (clientId: string): boolean => {
  if (typeof window === "undefined") return false;
  
  const stored = localStorage.getItem(STORAGE_KEY_ONBOARDING);
  if (!stored) return false;
  
  const onboardings: ClientOnboardingData[] = JSON.parse(stored);
  return onboardings.some((o) => o.clientId === clientId && o.rgpdConsent);
};

// Sauvegarder les données d'onboarding
export const saveOnboardingData = (data: ClientOnboardingData): void => {
  if (typeof window === "undefined") return;
  
  const stored = localStorage.getItem(STORAGE_KEY_ONBOARDING);
  let onboardings: ClientOnboardingData[] = stored ? JSON.parse(stored) : [];
  
  const index = onboardings.findIndex((o) => o.clientId === data.clientId);
  if (index >= 0) {
    onboardings[index] = data;
  } else {
    onboardings.push(data);
  }
  
  localStorage.setItem(STORAGE_KEY_ONBOARDING, JSON.stringify(onboardings));
  
  // Sauvegarder aussi dans les données client standard
  localStorage.setItem(`client-poids-${data.clientId}`, data.poidsActuel.toString());
  localStorage.setItem(`client-taille-${data.clientId}`, data.taille.toString());
};

// Obtenir les données d'onboarding
export const getOnboardingData = (clientId: string): ClientOnboardingData | null => {
  if (typeof window === "undefined") return null;
  
  const stored = localStorage.getItem(STORAGE_KEY_ONBOARDING);
  if (!stored) return null;
  
  const onboardings: ClientOnboardingData[] = JSON.parse(stored);
  return onboardings.find((o) => o.clientId === clientId) || null;
};

