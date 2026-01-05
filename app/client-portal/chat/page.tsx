"use client";
import { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Send,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { getMessages, addMessage, Message } from "../../utils/chatStorage";

export default function ClientChatPage() {
  const clientId = 5; // En production, cela viendrait de l'authentification
  const clientName = "Didier Renard";
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(getMessages(clientId));
    
    const handleMessagesUpdate = () => {
      setMessages(getMessages(clientId));
    };
    window.addEventListener('messagesUpdated', handleMessagesUpdate);
    return () => window.removeEventListener('messagesUpdated', handleMessagesUpdate);
  }, [clientId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    addMessage({
      sender: "client",
      clientId,
      message: newMessage,
    });

    setNewMessage("");
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 shadow-lg">
        <div className="flex items-center gap-4 max-w-xl mx-auto w-full">
          <Link
            href="/client-portal"
            className="bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 transition flex items-center gap-2 active:scale-95"
          >
            <ArrowLeft size={18} />
            Retour
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Messagerie</h1>
            <p className="text-white/90 text-sm">Conversation avec votre coach</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-xl mx-auto w-full pb-32">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <MessageCircle className="mx-auto mb-4 text-slate-300" size={48} />
              <div className="text-sm">Aucun message pour le moment</div>
              <div className="text-xs text-slate-300 mt-1">Envoyez le premier message !</div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "client" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-xl p-4 ${
                    msg.sender === "client"
                      ? "bg-red-600 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{msg.message}</div>
                  <div
                    className={`text-xs mt-2 ${
                      msg.sender === "client" ? "text-white/90" : "text-slate-400"
                    }`}
                  >
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 max-w-xl mx-auto shadow-lg">
        <div className="flex gap-3">
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
            className="flex-1 bg-white rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-700 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none"
          />
          <button
            onClick={handleSend}
            className="bg-red-600 text-white rounded-xl px-6 py-3 hover:bg-red-700 transition shadow-sm flex items-center gap-2 active:scale-95"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

