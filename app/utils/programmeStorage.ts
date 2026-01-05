// Utilité pour gérer les programmes d'entraînement des clients
export interface JourProgramme {
  jour: string;
  exercices: Array<{
    exerciceId: number;
    exerciceNom: string;
    series: string;
    repetitions: string;
    repos: string;
    notes?: string;
  }>;
}

export interface ProgrammeClient {
  clientId: number;
  semaine: JourProgramme[];
}

const STORAGE_KEY_PROGRAMMES = "demos-programmes";

export const getProgrammeClient = (clientId: number): ProgrammeClient | null => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY_PROGRAMMES);
  if (!stored) return null;
  const allProgrammes: ProgrammeClient[] = JSON.parse(stored);
  return allProgrammes.find((p) => p.clientId === clientId) || null;
};

export const saveProgrammeClient = (programme: ProgrammeClient) => {
  if (typeof window === "undefined") return;
  const stored = localStorage.getItem(STORAGE_KEY_PROGRAMMES);
  let allProgrammes: ProgrammeClient[] = stored ? JSON.parse(stored) : [];
  const index = allProgrammes.findIndex((p) => p.clientId === programme.clientId);
  if (index >= 0) {
    allProgrammes[index] = programme;
  } else {
    allProgrammes.push(programme);
  }
  localStorage.setItem(STORAGE_KEY_PROGRAMMES, JSON.stringify(allProgrammes));
};

