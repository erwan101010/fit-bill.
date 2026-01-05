// Utilité pour gérer les séances complétées
export interface SeanceCompletee {
  clientId: number;
  date: string;
  jour: string;
  exercices: Array<{
    exerciceNom: string;
    notes: string;
  }>;
}

const STORAGE_KEY_SEANCES = "demos-seances-completees";

export const getSeancesCompletees = (): SeanceCompletee[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY_SEANCES);
  return stored ? JSON.parse(stored) : [];
};

export const addSeanceCompletee = (seance: SeanceCompletee) => {
  if (typeof window === "undefined") return;
  const allSeances = getSeancesCompletees();
  allSeances.push(seance);
  localStorage.setItem(STORAGE_KEY_SEANCES, JSON.stringify(allSeances));
};

export const getSeancesAujourdhui = (): SeanceCompletee[] => {
  const today = new Date().toLocaleDateString("fr-FR");
  return getSeancesCompletees().filter((s) => s.date === today);
};

export const getDerniereOuvertureClient = (clientId: number): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(`client-derniere-ouverture-${clientId}`);
};

export const updateDerniereOuvertureClient = (clientId: number) => {
  if (typeof window === "undefined") return;
  const today = new Date().toLocaleDateString("fr-FR");
  localStorage.setItem(`client-derniere-ouverture-${clientId}`, today);
};

