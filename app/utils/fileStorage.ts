// Utilité pour gérer les fichiers partagés dans le chat
export interface SharedFile {
  id: number;
  clientId: number;
  fileName: string;
  fileType: "pdf" | "image" | "video" | "other";
  fileUrl: string;
  sender: "coach" | "client";
  timestamp: string;
}

const STORAGE_KEY_FILES = "demos-shared-files";

export const getSharedFiles = (clientId: number): SharedFile[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY_FILES);
  if (!stored) return [];
  const allFiles: SharedFile[] = JSON.parse(stored);
  return allFiles.filter((f) => f.clientId === clientId);
};

export const addSharedFile = (file: Omit<SharedFile, "id" | "timestamp">) => {
  if (typeof window === "undefined") return;
  const stored = localStorage.getItem(STORAGE_KEY_FILES);
  const allFiles: SharedFile[] = stored ? JSON.parse(stored) : [];
  const newFile: SharedFile = {
    ...file,
    id: Date.now(),
    timestamp: new Date().toISOString(),
  };
  allFiles.push(newFile);
  localStorage.setItem(STORAGE_KEY_FILES, JSON.stringify(allFiles));
  window.dispatchEvent(new Event('filesUpdated'));
  return newFile;
};

