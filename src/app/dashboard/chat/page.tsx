"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../../utils/supabase";
import Sidebar from "../../components/Sidebar";

interface Message {
  id?: number | string;
  sender_id?: string;
  receiver_id?: string;
  message: string;
  created_at?: string;
}

export default function DashboardChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadMessages = async () => {
      try {
        // Try to load last 50 messages relevant to dashboard
        const { data, error } = await supabase.from("messages").select("*").order("created_at", { ascending: true }).limit(50);
        if (error) {
          console.error("Erreur chargement messages dashboard:", error);
          // fallback sample messages
          if (mounted) {
            setMessages([
              { id: 1, message: "Bienvenue dans le chat coach — ceci est un message exemple.", created_at: new Date().toISOString() },
              { id: 2, message: "Jean: Salut Coach, est-ce que tu es dispo demain?", created_at: new Date().toISOString() },
            ]);
          }
        } else if (data) {
          if (mounted) setMessages(data as Message[]);
        }
      } catch (err) {
        console.error(err);
        if (mounted) {
          setMessages([
            { id: 1, message: "Bienvenue dans le chat coach — ceci est un message exemple.", created_at: new Date().toISOString() },
            { id: 2, message: "Jean: Salut Coach, est-ce que tu es dispo demain?", created_at: new Date().toISOString() },
          ]);
        }
      }
    };

    loadMessages();

    const channel = supabase.channel("public:messages").on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
      const newM = (payload as any).new as Message;
      setMessages((prev) => [...prev, newM]);
    }).subscribe();

    return () => {
      mounted = false;
      try { supabase.removeChannel(channel); } catch (e) {}
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      await supabase.from("messages").insert({ message: newMessage });
      setNewMessage("");
    } catch (e) {
      console.error("Erreur envoi message:", e);
      alert("Impossible d'envoyer le message");
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-[#E21D2C] mb-6">Messagerie Coach</h1>

          <div className="glass-card p-6 min-h-[60vh] flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.map((m) => (
                <div key={m.id} className="p-3 rounded-lg bg-black/30">
                  <div className="text-sm text-gray-200">{m.message}</div>
                  <div className="text-xs text-gray-400 mt-1">{m.created_at ? new Date(m.created_at).toLocaleString() : ''}</div>
                </div>
              ))}
              <div ref={endRef} />
            </div>

            <div className="mt-4 flex gap-3">
              <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="flex-1 px-4 py-3 rounded-xl bg-black border border-white/8 outline-none text-white" placeholder="Écrire un message..." />
              <button onClick={handleSend} className="bg-[#E21D2C] px-4 py-3 rounded-xl font-bold">Envoyer</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
