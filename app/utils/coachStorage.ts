// Gestion des codes coach et liaisons coach-client

export interface CoachData {
  id: string;
  name: string;
  email: string;
  coach_code: string;
  created_at: string;
}

export interface ClientCoachLink {
  clientId: string;
  coachId: string;
  coachCode: string;
  linkedAt: string;
}

const STORAGE_KEY_COACHES = "demos-coaches";
const STORAGE_KEY_COACH_LINKS = "demos-coach-client-links";

// Générer un code coach unique
export const generateCoachCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclut les caractères ambigus
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Obtenir ou créer un code coach
export const getOrCreateCoachCode = (coachId: string, coachName: string, coachEmail: string): string => {
  if (typeof window === "undefined") return "";
  
  const stored = localStorage.getItem(STORAGE_KEY_COACHES);
  let coaches: CoachData[] = stored ? JSON.parse(stored) : [];
  
  let coach = coaches.find((c) => c.id === coachId);
  
  if (!coach) {
    const newCoach: CoachData = {
      id: coachId,
      name: coachName,
      email: coachEmail,
      coach_code: generateCoachCode(),
      created_at: new Date().toISOString(),
    };
    coaches.push(newCoach);
    localStorage.setItem(STORAGE_KEY_COACHES, JSON.stringify(coaches));
    return newCoach.coach_code;
  }
  
  return coach.coach_code;
};

// Trouver un coach par son code
export const findCoachByCode = (code: string): CoachData | null => {
  if (typeof window === "undefined") return null;
  
  const stored = localStorage.getItem(STORAGE_KEY_COACHES);
  if (!stored) return null;
  
  const coaches: CoachData[] = JSON.parse(stored);
  return coaches.find((c) => c.coach_code === code) || null;
};

// Lier un client à un coach
export const linkClientToCoach = (clientId: string, coachCode: string): boolean => {
  if (typeof window === "undefined") return false;
  
  const coach = findCoachByCode(coachCode);
  if (!coach) return false;
  
  const stored = localStorage.getItem(STORAGE_KEY_COACH_LINKS);
  let links: ClientCoachLink[] = stored ? JSON.parse(stored) : [];
  
  // Vérifier si le lien existe déjà
  const existingLink = links.find((l) => l.clientId === clientId);
  if (existingLink) {
    // Mettre à jour le lien existant
    existingLink.coachId = coach.id;
    existingLink.coachCode = coachCode;
    existingLink.linkedAt = new Date().toISOString();
  } else {
    // Créer un nouveau lien
    links.push({
      clientId,
      coachId: coach.id,
      coachCode,
      linkedAt: new Date().toISOString(),
    });
  }
  
  localStorage.setItem(STORAGE_KEY_COACH_LINKS, JSON.stringify(links));
  return true;
};

// Obtenir le coach d'un client
export const getClientCoach = (clientId: string): CoachData | null => {
  if (typeof window === "undefined") return null;
  
  const storedLinks = localStorage.getItem(STORAGE_KEY_COACH_LINKS);
  if (!storedLinks) return null;
  
  const links: ClientCoachLink[] = JSON.parse(storedLinks);
  const link = links.find((l) => l.clientId === clientId);
  if (!link) return null;
  
  const storedCoaches = localStorage.getItem(STORAGE_KEY_COACHES);
  if (!storedCoaches) return null;
  
  const coaches: CoachData[] = JSON.parse(storedCoaches);
  return coaches.find((c) => c.id === link.coachId) || null;
};

// Obtenir tous les clients d'un coach
export const getCoachClients = (coachId: string): string[] => {
  if (typeof window === "undefined") return [];
  
  const stored = localStorage.getItem(STORAGE_KEY_COACH_LINKS);
  if (!stored) return [];
  
  const links: ClientCoachLink[] = JSON.parse(stored);
  return links.filter((l) => l.coachId === coachId).map((l) => l.clientId);
};

