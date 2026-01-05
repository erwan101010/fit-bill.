"use client";
import { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Send,
  ArrowLeft,
  CheckCheck,
  Plus,
  FileText,
  Image as ImageIcon,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ClientSidebar from "../../components/ClientSidebar";
import { getMessages, addMessage, Message } from "../../utils/chatStorage";
import { getSharedFiles, addSharedFile, SharedFile } from "../../utils/fileStorage";

export default function ClientChatPage() {
  const router = useRouter();
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientName, setClientName] = useState("Client");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showFiles, setShowFiles] = useState(false);
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([]);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const id = localStorage.getItem("demos-user-id");
      const name = localStorage.getItem("demos-user-name");
      if (!id) {
        router.push("/");
        return;
      }
      setClientId(id);
      if (name) setClientName(name);
      
      const numericId = parseInt(id.replace(/\D/g, "")) || 1;
      setMessages(getMessages(numericId));
      setSharedFiles(getSharedFiles(numericId));
    }
  }, [router]);

  useEffect(() => {
    if (!clientId) return;
    const numericId = parseInt(clientId.replace(/\D/g, "")) || 1;
    const handleMessagesUpdate = () => {
      setMessages(getMessages(numericId));
    };
    const handleFilesUpdate = () => {
      setSharedFiles(getSharedFiles(numericId));
    };
    window.addEventListener('messagesUpdated', handleMessagesUpdate);
    window.addEventListener('filesUpdated', handleFilesUpdate);
    return () => {
      window.removeEventListener('messagesUpdated', handleMessagesUpdate);
      window.removeEventListener('filesUpdated', handleFilesUpdate);
    };
  }, [clientId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim() || !clientId) return;

    const numericId = parseInt(clientId.replace(/\D/g, "")) || 1;
    addMessage({
      sender: "client",
      clientId: numericId,
      message: newMessage,
    });

    setNewMessage("");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !clientId) return;

    const numericId = parseInt(clientId.replace(/\D/g, "")) || 1;
    const fileType = file.type.startsWith("image/") ? "image" : 
                    file.type === "application/pdf" ? "pdf" :
                    file.type.startsWith("video/") ? "video" : "other";
    
    // Simuler l'upload (en production, uploader vers un serveur)
    const reader = new FileReader();
    reader.onload = (event) => {
      const fileUrl = event.target?.result as string;
      
      addSharedFile({
        clientId: numericId,
        fileName: file.name,
        fileType: fileType as "pdf" | "image" | "video" | "other",
        fileUrl,
        sender: "client",
      });

      // Ajouter un message pour notifier l'envoi du fichier
      if (fileType === "image") {
        addMessage({
          sender: "client",
          clientId: numericId,
          message: `📷 Photo: ${file.name}`,
        });
      } else {
        addMessage({
          sender: "client",
          clientId: numericId,
          message: `📎 ${file.name}`,
        });
      }
    };
    reader.readAsDataURL(file);

    setShowFilePicker(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "pdf":
        return <FileText size={20} strokeWidth={1.5} />;
      case "image":
        return <ImageIcon size={20} strokeWidth={1.5} />;
      default:
        return <FileText size={20} strokeWidth={1.5} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex">
      <ClientSidebar />
      
      <main className="flex-1 lg:ml-64 flex flex-col">
        {/* Header */}
        <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/client-portal"
                className="bg-white/10 hover:bg-white/20 rounded-xl px-4 py-2 transition-all flex items-center gap-2 text-white border border-white/20 hover:border-white/30 active:scale-95 shadow-lg"
              >
                <ArrowLeft size={18} strokeWidth={1.5} />
                Retour
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Messagerie</h1>
                <p className="text-gray-400 text-sm">Conversation avec votre coach</p>
              </div>
            </div>
            <button
              onClick={() => setShowFiles(!showFiles)}
              className="bg-white/10 hover:bg-white/20 rounded-xl px-4 py-2 transition-all text-white border border-white/20 hover:border-white/30 active:scale-95 shadow-lg flex items-center gap-2"
            >
              <FileText size={18} strokeWidth={1.5} />
              <span className="text-sm">Fichiers partagés</span>
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Messages */}
          <div className={`flex-1 overflow-y-auto px-6 py-8 bg-gradient-to-b from-gray-900/50 to-gray-800/50 transition-all duration-300 ${showFiles ? "w-2/3" : "w-full"}`}>
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-20">
                  <div className="bg-white/5 backdrop-blur-xl rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center border border-white/10 shadow-2xl">
                    <MessageCircle className="text-gray-400" size={48} strokeWidth={1.5} />
                  </div>
                  <div className="text-gray-400 text-lg mb-2">Aucun message pour le moment</div>
                  <div className="text-gray-500 text-sm">Envoyez le premier message !</div>
                </div>
              ) : (
              messages.map((msg) => {
                const isImage = msg.message.startsWith("📷") || msg.message.includes("Photo:");
                const imageFile = sharedFiles.find(f => msg.message.includes(f.fileName));
                const imageUrl = imageFile?.fileUrl;
                
                return (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "client" ? "justify-end" : "justify-start"} group`}
                  >
                    <div
                      className={`max-w-[75%] rounded-3xl px-5 py-3 shadow-2xl border transition-all hover:scale-[1.02] ${
                        msg.sender === "client"
                          ? "bg-gradient-to-br from-red-600 to-red-700 text-white border-red-500/30 rounded-br-md"
                          : "bg-gradient-to-br from-gray-700 to-gray-900 text-white border-white/20 rounded-bl-md"
                      }`}
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
                              {imageFile?.fileName || "Photo"}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-base whitespace-pre-wrap leading-relaxed">{msg.message}</div>
                      )}
                      <div className="flex items-center justify-end gap-2 mt-2">
                        <span
                          className={`text-xs ${
                            msg.sender === "client" ? "text-white/70" : "text-gray-400"
                          }`}
                        >
                          {formatTime(msg.timestamp)}
                        </span>
                        {msg.sender === "client" && (
                          <CheckCheck className="text-blue-400" size={14} strokeWidth={1.5} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Panneau Fichiers partagés */}
          {showFiles && (
            <div className="w-1/3 bg-white/5 backdrop-blur-xl border-l border-white/10 p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Fichiers partagés</h3>
                <button
                  onClick={() => setShowFiles(false)}
                  className="text-gray-400 hover:text-white transition"
                >
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>
              {sharedFiles.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <FileText className="mx-auto mb-4" size={48} strokeWidth={1.5} />
                  <p className="text-sm">Aucun fichier partagé</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sharedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:border-white/30 transition-all cursor-pointer"
                      onClick={() => window.open(file.fileUrl, "_blank")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-red-600/20 p-2 rounded-lg border border-red-500/30">
                          {getFileIcon(file.fileType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm truncate">{file.fileName}</p>
                          <p className="text-gray-400 text-xs mt-1">
                            {formatTime(file.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="bg-white/5 backdrop-blur-xl border-t border-white/10 p-6 shadow-2xl">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.gif,.mp4"
              />
              <button
                onClick={() => {
                  setShowFilePicker(!showFilePicker);
                  if (!showFilePicker) {
                    fileInputRef.current?.click();
                  }
                }}
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
                onClick={handleSend}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl px-6 py-4 hover:from-red-700 hover:to-red-800 transition-all shadow-xl shadow-red-500/30 border border-white/10 flex items-center gap-2 active:scale-95 font-medium"
              >
                <Send size={20} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
