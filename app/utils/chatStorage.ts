// Utilité pour gérer les messages de chat
export interface Message {
  id: number;
  sender: "coach" | "client";
  clientId: number;
  message: string;
  timestamp: string;
}

const STORAGE_KEY_CHAT = "demos-chat-messages";

export const getMessages = (clientId: number): Message[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY_CHAT);
  if (!stored) return [];
  const allMessages: Message[] = JSON.parse(stored);
  return allMessages.filter((m) => m.clientId === clientId);
};

export const addMessage = (message: Omit<Message, "id" | "timestamp">) => {
  if (typeof window === "undefined") return;
  const stored = localStorage.getItem(STORAGE_KEY_CHAT);
  const allMessages: Message[] = stored ? JSON.parse(stored) : [];
  const newMessage: Message = {
    ...message,
    id: Date.now(),
    timestamp: new Date().toISOString(),
  };
  allMessages.push(newMessage);
  localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(allMessages));
  // Notifier les autres composants
  window.dispatchEvent(new Event('messagesUpdated'));
  return newMessage;
};

export const getAllMessages = (): Message[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY_CHAT);
  return stored ? JSON.parse(stored) : [];
};

