"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Send, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ClientSidebar from "../../components/ClientSidebar";
import { supabase } from "../../utils/supabase";

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

  // Fix Hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Redirect old route to new client-portal chat
    if (mounted) router.replace("/client-portal/chat");
  }, [mounted, router]);

  // Vérifier l'authentification et charger le coach
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

      // Récupérer le type d'utilisateur
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

      // Récupérer le coach (premier coach trouvé)
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

  // Charger les messages et s'abonner au Realtime
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

    // S'abonner aux nouveaux messages en temps réel
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
    // This route was moved to /client-portal/chat. Redirecting.
    null
  );
}
