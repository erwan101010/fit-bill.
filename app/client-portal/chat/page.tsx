"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Send, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ClientSidebar from "../../components/ClientSidebar";
import { supabase } from "@/utils/supabase";

interface Message {
  id: number;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  sender_type: "coach" | "client";
}

export default function ClientChatPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [coachId, setCoachId] = useState<string | null>(null);
  const [coachName, setCoachName] = useState("Coach");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type, role, updated_at")
        .eq("id", currentUserId)
        .single();

      const userRole = profile?.role || profile?.user_type;
      if (userRole !== "client") {
        router.push("/dashboard");
        return;
      }

      const { data: coachData } = await supabase
        .from("profiles")
        .select("id, full_name, updated_at")
        .eq("user_type", "coach")
        .limit(1)
        .single();

      if (coachData) {
        setCoachId(coachData.id);
        setCoachName(coachData.full_name || "Coach");
      }
    };

    checkAuth();
  }, [mounted, router]);

  useEffect(() => {
    if (!mounted || !coachId || !userId) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${coachId}),and(sender_id.eq.${coachId},receiver_id.eq.${userId})`)
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

    const channel = supabase
      .channel(`chat:${userId}:${coachId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `or(and(sender_id.eq.${userId},receiver_id.eq.${coachId}),and(sender_id.eq.${coachId},receiver_id.eq.${userId}))`,
        },
        (payload: any) => {
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
  }, [mounted, coachId, userId]);

  useEffect(() => {
    if (mounted) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, mounted]);

  const handleSend = async () => {
    if (!newMessage.trim() || !coachId || !userId) return;

    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: userId,
        receiver_id: coachId,
        message: newMessage,
        sender_type: "client",
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

  if (!userId || !coachId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex h-screen overflow-hidden">
      <ClientSidebar />

      <main className="flex-1 lg:ml-64 flex flex-col h-full bg-black">
        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-800 p-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            <Link
              href="/client-portal"
              className="bg-gray-800 hover:bg-gray-700 rounded-lg px-4 py-2 transition-all flex items-center gap-2 text-white"
            >
              <ArrowLeft size={18} />
              Retour
            </Link>
            <div>
              <h1 className="text-lg font-bold text-white">Messagerie</h1>
              <p className="text-sm text-gray-400">Conversation avec {coachName}</p>
            </div>
          </div>
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
                const isClient = msg.sender_type === "client" || msg.sender_id === userId;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isClient ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                        isClient
                          ? "bg-demos-red text-white rounded-br-md"
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
              className="bg-demos-red hover:bg-demos-red/90 text-white rounded-lg px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
