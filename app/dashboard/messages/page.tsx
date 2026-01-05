"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  Send,
  Search,
  User,
  Plus,
  FileText,
  StickyNote,
  TrendingUp,
  Image as ImageIcon,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { getAllMessages, getMessages, addMessage, Message } from "../../utils/chatStorage";
import { getSharedFiles, addSharedFile } from "../../utils/fileStorage";

const mockClients = [
  { id: 1, name: "Mathieu Dupont" },
  { id: 2, name: "Chloé Martin" },
  { id: 3, name: "Lucas Bernard" },
  { id: 4, name: "Sophie Lemoine" },
  { id: 5, name: "Didier Renard" },
];

export default function DashboardMessagesPage() {
  const router = useRouter();
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showQuickActions, setShowQuickActions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userId = localStorage.getItem("demos-user-id");
      if (!userId) {
        router.push("/");
      }
    }
  }, [router]);

  useEffect(() => {
    if (selectedClientId) {
      setMessages(getMessages(selectedClientId));
    }
    const handleMessagesUpdate = () => {
      if (selectedClientId) {
        setMessages(getMessages(selectedClientId));
      }
    };
    window.addEventListener('messagesUpdated', handleMessagesUpdate);
    return () => window.removeEventListener('messagesUpdated', handleMessagesUpdate);
  }, [selectedClientId]);

  const handleSend = () => {
    if (!newMessage.trim() || !selectedClientId) return;

    addMessage({
      sender: "coach",
      clientId: selectedClientId,
      message: newMessage,
    });

    setNewMessage("");
  };

  const handleImageUpload = async (file: File) => {
    if (!selectedClientId) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageUrl = event.target?.result as string;
      addMessage({
        sender: "coach",
        clientId: selectedClientId,
        message: `📷 Photo: ${file.name}`,
      });
      if (typeof window !== "undefined") {
        addSharedFile({
          clientId: selectedClientId,
          fileName: file.name,
          fileType: "image" as const,
          fileUrl: imageUrl,
          sender: "coach",
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = async (file: File) => {
    if (!selectedClientId) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const fileUrl = event.target?.result as string;
      addMessage({
        sender: "coach",
        clientId: selectedClientId,
        message: `📎 ${file.name}`,
      });
      if (typeof window !== "undefined") {
        const fileType = file.type === "application/pdf" ? "pdf" : "other";
        addSharedFile({
          clientId: selectedClientId,
          fileName: file.name,
          fileType: fileType as "pdf" | "other",
          fileUrl,
          sender: "coach",
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const filteredClients = mockClients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLastMessage = (clientId: number) => {
    const clientMessages = getMessages(clientId);
    return clientMessages.length > 0 ? clientMessages[clientMessages.length - 1] : null;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 flex">
        {/* Liste des clients */}
        <div className="w-80 bg-white/5 backdrop-blur-3xl border-r border-white/10 flex flex-col" style={{
          backdropFilter: 'blur(60px)',
          WebkitBackdropFilter: 'blur(60px)',
        }}>
          <div className="p-4 border-b border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} strokeWidth={1.5} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un client..."
                className="w-full bg-white/5 backdrop-blur-md rounded-xl border border-white/20 px-10 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none transition-all text-sm"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredClients.map((client) => {
              const lastMessage = getLastMessage(client.id);
              const isSelected = selectedClientId === client.id;
              return (
                <button
                  key={client.id}
                  onClick={() => setSelectedClientId(client.id)}
                  className={`w-full p-4 border-b border-white/10 text-left transition-all duration-300 hover:bg-white/5 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20 ${
                    isSelected ? "bg-white/10 border-l-4 border-l-red-500" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-red-600/20 p-2 rounded-full border border-red-500/30">
                      <User className="text-red-400" size={20} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{client.name}</p>
                      {lastMessage && (
                        <p className="text-gray-400 text-sm truncate mt-1">
                          {lastMessage.message.substring(0, 40)}...
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Zone de chat */}
        <div className="flex-1 flex flex-col">
          {selectedClientId ? (
            <>
              {/* Header */}
              <header className="bg-white/5 backdrop-blur-3xl border-b border-white/10 p-6" style={{
                backdropFilter: 'blur(60px)',
                WebkitBackdropFilter: 'blur(60px)',
              }}>
                <h3 className="text-xl font-bold text-white">
                  {mockClients.find(c => c.id === selectedClientId)?.name}
                </h3>
              </header>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-8 bg-white/5 backdrop-blur-3xl" style={{
                backdropFilter: 'blur(60px)',
                WebkitBackdropFilter: 'blur(60px)',
              }}>
                <div className="max-w-3xl mx-auto space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-20">
                      <MessageCircle className="text-gray-400 mx-auto mb-4" size={48} strokeWidth={1.5} />
                      <p className="text-gray-400">Aucun message pour le moment</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isImage = msg.message.startsWith("📷") || msg.message.includes("Photo:");
                      let imageUrl: string | undefined;
                      if (isImage && selectedClientId) {
                        try {
                          const files = getSharedFiles(selectedClientId);
                          const fileName = msg.message.split(": ")[1]?.trim();
                          imageUrl = files.find((f) => f.fileName === fileName)?.fileUrl;
                        } catch (e) {
                          console.error("Error loading files:", e);
                        }
                      }
                      
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender === "coach" ? "justify-end" : "justify-start"} group`}
                        >
                          <div
                            className={`max-w-[75%] rounded-3xl px-5 py-3 shadow-2xl border transition-all hover:scale-[1.02] message-pop-in ${
                              msg.sender === "coach"
                                ? "bg-gradient-to-br from-gray-700/90 to-gray-900/90 text-white border-white/20 rounded-br-md backdrop-blur-xl"
                                : "bg-gradient-to-br from-red-600/90 to-red-700/90 text-white border-red-500/30 rounded-bl-md backdrop-blur-xl"
                            }`}
                            style={{
                              backdropFilter: 'blur(20px)',
                              WebkitBackdropFilter: 'blur(20px)',
                            }}
                          >
                            {isImage && imageUrl ? (
                              <div className="mb-2">
                                <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{
                                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 2px rgba(255, 255, 255, 0.1)',
                                }}>
                                  <img
                                    src={imageUrl}
                                    alt="Photo partagée"
                                    className="w-full max-w-md h-auto cursor-pointer"
                                    onClick={() => window.open(imageUrl, "_blank")}
                                  />
                                  <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg text-xs text-white">
                                    {msg.message.split(": ")[1]?.trim() || "Photo"}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-base whitespace-pre-wrap leading-relaxed">{msg.message}</div>
                            )}
                            <div className="flex items-center justify-end gap-2 mt-2">
                              <span className="text-xs text-gray-400">
                                {formatTime(msg.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Input */}
              <div className="bg-white/5 backdrop-blur-3xl border-t border-white/10 p-6" style={{
                backdropFilter: 'blur(60px)',
                WebkitBackdropFilter: 'blur(60px)',
              }}>
                <div className="max-w-3xl mx-auto">
                  {/* Quick Actions */}
                  {showQuickActions && (
                    <div className="mb-4 flex gap-3">
                      <button
                        onClick={() => {
                          addMessage({
                            sender: "coach",
                            clientId: selectedClientId!,
                            message: "📊 FICHE ÉVOLUTION\n\nPoids: -\nTaille: -\nMensurations:\n- Poitrine: -\n- Taille: -\n- Hanches: -\n- Bras: -\n- Cuisses: -\n\nNotes:",
                          });
                          setShowQuickActions(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg border border-white/10"
                      >
                        <TrendingUp size={18} strokeWidth={1.5} />
                        <span className="text-sm">Fiche Évolution</span>
                      </button>
                      <button
                        onClick={() => {
                          addMessage({
                            sender: "coach",
                            clientId: selectedClientId!,
                            message: "📝 NOTE PRIVÉE\n\n",
                          });
                          setShowQuickActions(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-xl hover:from-yellow-700 hover:to-yellow-800 transition-all shadow-lg border border-white/10"
                      >
                        <StickyNote size={18} strokeWidth={1.5} />
                        <span className="text-sm">Note Privée</span>
                      </button>
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <input
                      type="file"
                      ref={imageInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && file.type.startsWith("image/")) {
                          handleImageUpload(file);
                        }
                        if (imageInputRef.current) {
                          imageInputRef.current.value = "";
                        }
                      }}
                      accept="image/*"
                      className="hidden"
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file);
                        }
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                      className="hidden"
                    />
                    <button
                      onClick={() => setShowQuickActions(!showQuickActions)}
                      className="bg-white/10 hover:bg-white/20 rounded-2xl px-4 py-4 transition-all border border-white/20 hover:border-white/30 active:scale-95 flex items-center justify-center"
                    >
                      <Plus size={20} strokeWidth={1.5} className="text-white" />
                    </button>
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
                      placeholder="Tapez votre message..."
                      className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 px-5 py-4 text-base text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none transition-all shadow-xl"
                    />
                    <button
                      onClick={() => imageInputRef.current?.click()}
                      className="bg-white/10 hover:bg-white/20 rounded-2xl px-4 py-4 transition-all border border-white/20 hover:border-white/30 active:scale-95 flex items-center justify-center"
                    >
                      <ImageIcon size={20} strokeWidth={1.5} className="text-white" />
                    </button>
                    <button
                      onClick={handleSend}
                      className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl px-6 py-4 hover:from-red-700 hover:to-red-800 transition-all shadow-xl shadow-red-500/30 border border-white/10 flex items-center gap-2 active:scale-95 font-medium"
                    >
                      <Send size={20} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="text-gray-400 mx-auto mb-4" size={64} strokeWidth={1.5} />
                <p className="text-gray-400 text-lg">Sélectionnez un client pour commencer</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

