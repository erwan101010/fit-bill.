// Stockage des données client
export interface ClientData {
  id: number;
  programme: string;
  poidsHistorique: { date: string; poids: number }[];
}

const STORAGE_KEY_CLIENTS = "demos-clients-data";

export const getClientData = (clientId: number): ClientData | null => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY_CLIENTS);
  if (!stored) return null;
  const allData: ClientData[] = JSON.parse(stored);
  return allData.find((c) => c.id === clientId) || null;
};

export const saveClientData = (data: ClientData) => {
  if (typeof window === "undefined") return;
  const stored = localStorage.getItem(STORAGE_KEY_CLIENTS);
  let allData: ClientData[] = stored ? JSON.parse(stored) : [];
  const index = allData.findIndex((c) => c.id === data.id);
  if (index >= 0) {
    allData[index] = data;
  } else {
    allData.push(data);
  }
  localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(allData));
};

export const updateClientProgramme = (clientId: number, programme: string) => {
  const clientData = getClientData(clientId);
  const updatedData: ClientData = {
    id: clientId,
    programme,
    poidsHistorique: clientData?.poidsHistorique || [],
  };
  saveClientData(updatedData);
};

