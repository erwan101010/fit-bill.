// Utilité pour gérer la bibliothèque d'exercices
export interface Exercice {
  id: number;
  nom: string;
  videoUrl: string;
  consignes: string;
}

const STORAGE_KEY_EXERCICES = "demos-exercices";

export const getExercices = (): Exercice[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY_EXERCICES);
  return stored ? JSON.parse(stored) : [];
};

export const saveExercices = (exercices: Exercice[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_EXERCICES, JSON.stringify(exercices));
};

