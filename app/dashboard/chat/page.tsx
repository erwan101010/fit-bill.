"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Send, Plus } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { supabase } from "../../utils/supabase";

interface Message {
  id: number;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  sender_type: "coach" | "client";
}

interface Client {
  id: string;
  name: string;
  email?: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const channelRef = useRef<any>(null);

  // Fix Hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Vérifier l'authentification et charger les clients
  useEffect(() => {
    if (!mounted) return;

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
        return;
      }

      const currentUserId = session.user.id;
      setUserId(currentUserId);

      // Récupérer les clients depuis Supabase
      const { data: clientsData, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("user_type", "client");

      if (error) {
        console.error("Erreur chargement clients:", error);
        return;
      }

      if (clientsData && clientsData.length > 0) {
        const clientsList: Client[] = clientsData.map((c) => ({
          id: c.id,
          name: c.full_name || "Client",
          email: c.email,
        }));
        setClients(clientsList);
        // Sélectionner le premier client par défaut
        if (!selectedClientId && clientsList.length > 0) {
          setSelectedClientId(clientsList[0].id);
        }
      }
    };

    checkAuth();
  }, [mounted, router]);

  // Charger les messages quand un client est sélectionné
  useEffect(() => {
    if (!mounted || !selectedClientId || !userId) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${selectedClientId}),and(sender_id.eq.${selectedClientId},receiver_id.eq.${userId})`)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Erreur chargement messages:", error);
        return;
      }

      if (data) {
        setMessages(data as Message[]);
      }
    };

    loadMessages();

    // S'abonner au Realtime
    const channel = supabase
      .channel(`chat:${userId}:${selectedClientId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `or(and(sender_id.eq.${userId},receiver_id.eq.${selectedClientId}),and(sender_id.eq.${selectedClientId},receiver_id.eq.${userId}))`,
        },
        (payload) => {
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === (payload.new as Message).id);
            if (exists) return prev;
            return [...prev, payload.new as Message];
          });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [mounted, selectedClientId, userId]);

  useEffect(() => {
    if (mounted) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, mounted]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedClientId || !userId) return;

    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: userId,
        receiver_id: selectedClientId,
        message: newMessage,
        sender_type: "coach",
      });

      if (error) throw error;
      setNewMessage("");
    } catch (err) {
      console.error("Erreur envoi message:", err);
      alert("Erreur lors de l'envoi du message");
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  if (!mounted) return null;

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  return (
    <div className="min-h-screen bg-black flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex-1 lg:ml-64 flex h-full">
        {/* Liste des clients - Gauche */}
        <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col h-full">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {clients.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-gray-400 text-sm">Aucun client</p>
              </div>
            ) : (
              clients.map((client) => {
                const isSelected = selectedClientId === client.id;
                return (
                  <button
                    key={client.id}
                    onClick={() => setSelectedClientId(client.id)}
                    className={`w-full p-4 border-b border-gray-800 text-left transition-all ${
                      isSelected ? "bg-red-600/20 border-l-4 border-l-red-500" : "hover:bg-gray-800"
                    }`}
                  >
                    <p className="text-white font-medium">{client.name}</p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Zone de chat - Droite */}
        <div className="flex-1 flex flex-col h-full bg-black">
          {selectedClientId && selectedClient ? (
            <>
              {/* Header */}
              <header className="bg-gray-900 border-b border-gray-800 p-4 flex-shrink-0">
                <h3 className="text-lg font-bold text-white">{selectedClient.name}</h3>
              </header>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-8 bg-black">
                <div className="max-w-3xl mx-auto space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center py-20">
                      <p className="text-gray-400">Aucun message pour le moment</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      // ROUGE pour l'envoyeur (coach), GRIS pour le receveur (client)
                      const isCoach = msg.sender_type === "coach" || msg.sender_id === userId;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isCoach ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                              isCoach
                                ? "bg-red-600 text-white rounded-br-md"
                                : "bg-gray-700 text-white rounded-bl-md"
                            }`}
                          >
                            <div className="text-sm">{msg.message}</div>
                            <div className="text-xs opacity-70 mt-1">
                              {formatTime(msg.created_at)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Barre d'envoi */}
              <div className="bg-gray-900 border-t border-gray-800 p-4 flex-shrink-0">
                <div className="max-w-3xl mx-auto flex gap-3">
                  <label className="bg-gray-800 hover:bg-gray-700 rounded-lg px-4 py-2 cursor-pointer border border-gray-700">
                    <Plus size={20} className="text-white" />
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                  </label>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Message"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 outline-none focus:border-red-500"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!newMessage.trim()}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-400">
                {clients.length === 0 ? "Aucun client disponible" : "Sélectionnez un client"}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
