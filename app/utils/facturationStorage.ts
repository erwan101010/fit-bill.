// Utilité pour stocker les paiements dans localStorage
export interface Paiement {
  id: number | string;
  client: string;
  montant: string;
  date: string;
  status: "Payé" | "En attente" | "Annulé";
  factureId?: number;
  stripePaymentId?: string;
}

const STORAGE_KEY_PAIEMENTS = "demos-paiements";

export const getPaiements = (): Paiement[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY_PAIEMENTS);
  return stored ? JSON.parse(stored) : [];
};

export const savePaiements = (paiements: Paiement[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_PAIEMENTS, JSON.stringify(paiements));
};

export const addPaiement = (paiement: Paiement) => {
  const allPaiements = getPaiements();
  allPaiements.push(paiement);
  savePaiements(allPaiements);
  return allPaiements;
};

export const getTotalPaiements = (): number => {
  const paiements = getPaiements();
  return paiements.reduce((sum, p) => {
    return sum + parseFloat(p.montant.replace("€", ""));
  }, 0);
};

