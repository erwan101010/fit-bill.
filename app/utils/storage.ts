// Utilité pour synchroniser les données entre pages
export interface RendezVous {
  id: number;
  client: string;
  heure: string;
  lieu: string;
  duree: string;
  typeLieu: "salle" | "en_ligne";
  date?: string;
}

const STORAGE_KEY_RDV = "demos-rendez-vous";

export const getRendezVous = (): RendezVous[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY_RDV);
  return stored ? JSON.parse(stored) : [];
};

export const saveRendezVous = (rdv: RendezVous[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_RDV, JSON.stringify(rdv));
};

export const addRendezVous = (rdv: RendezVous) => {
  const allRdv = getRendezVous();
  allRdv.push(rdv);
  saveRendezVous(allRdv);
  return allRdv;
};

export const getRendezVousByClient = (clientName: string): RendezVous[] => {
  const allRdv = getRendezVous();
  return allRdv.filter((rdv) => rdv.client === clientName);
};

