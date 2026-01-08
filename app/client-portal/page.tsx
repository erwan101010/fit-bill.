"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, TrendingUp } from "lucide-react";
import ClientSidebar from "../components/ClientSidebar";

export default function ClientPage() {
  const router = useRouter();
  const [clientName, setClientName] = useState("Client");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const name = localStorage.getItem("demos-user-name") || "Client";
      setClientName(name);
    }
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black flex">
      <ClientSidebar />
      
      <main className="flex-1 lg:ml-64 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Bienvenue {clientName.split(" ")[0]} !</h1>
            <p className="text-gray-400 mt-1">Votre espace personnel</p>
          </div>

          {/* Suivi */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-demos-red/20 p-3 rounded-full border border-demos-red/30">
                <TrendingUp className="text-red-400" size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Mon suivi</h3>
                <p className="text-gray-400 text-sm">Votre progression</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <p className="text-gray-300 text-sm mb-2">Poids actuel</p>
                <p className="text-white text-2xl font-bold">75 kg</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <p className="text-gray-300 text-sm mb-2">Objectif</p>
                <p className="text-white text-2xl font-bold">70 kg</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <p className="text-gray-300 text-sm mb-2">Prochaine séance</p>
                <p className="text-white text-lg">Demain à 18h00</p>
              </div>
            </div>
          </div>

          {/* Bouton Chat */}
          <button
            onClick={() => router.push("/client-portal/chat")}
            className="w-full bg-gradient-to-r from-demos-red to-demos-red/90 text-white rounded-xl shadow-2xl p-6 border border-demos-red/30 hover:from-demos-red/90 hover:to-demos-red/80 transition-all duration-300 shadow-demos-red/40 hover:-translate-y-1 flex items-center justify-center gap-4"
          >
            <MessageCircle size={28} strokeWidth={1.5} />
            <div className="text-left">
              <h3 className="text-xl font-bold">Messagerie</h3>
              <p className="text-red-100 text-sm">Discutez avec votre coach</p>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}
