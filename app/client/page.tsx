"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  MessageCircle,
  TrendingUp,
  User,
  Dumbbell,
} from "lucide-react";
import ClientSidebar from "../components/ClientSidebar";

export default function ClientPage() {
  const router = useRouter();
  const [clientName, setClientName] = useState("Client");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const name = localStorage.getItem("demos-user-name") || "Client";
      setClientName(name);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex">
      <ClientSidebar />
      
      <main className="flex-1 lg:ml-64 p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Bienvenue {clientName.split(" ")[0]} !</h1>
            <p className="text-gray-400 mt-1">Votre espace personnel</p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Séance du jour */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl shadow-2xl p-6 border border-white/20 hover:shadow-red-500/20 hover:-translate-y-1 transition-all duration-300 hover:border-red-500/30">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-red-600/20 p-3 rounded-full border border-red-500/30">
                  <Dumbbell className="text-red-400" size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Ma séance</h3>
                  <p className="text-gray-400 text-sm">Programme d'entraînement</p>
                </div>
              </div>
              <p className="text-gray-300">Consultez votre programme personnalisé</p>
            </div>

            {/* Messages */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl shadow-2xl p-6 border border-white/20 hover:shadow-red-500/20 hover:-translate-y-1 transition-all duration-300 hover:border-red-500/30">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-red-600/20 p-3 rounded-full border border-red-500/30">
                  <MessageCircle className="text-red-400" size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Messages</h3>
                  <p className="text-gray-400 text-sm">Discutez avec votre coach</p>
                </div>
              </div>
              <p className="text-gray-300">Accédez à vos conversations</p>
            </div>

            {/* Progression */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl shadow-2xl p-6 border border-white/20 hover:shadow-red-500/20 hover:-translate-y-1 transition-all duration-300 hover:border-red-500/30">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-red-600/20 p-3 rounded-full border border-red-500/30">
                  <TrendingUp className="text-red-400" size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Progression</h3>
                  <p className="text-gray-400 text-sm">Suivez vos résultats</p>
                </div>
              </div>
              <p className="text-gray-300">Visualisez votre évolution</p>
            </div>

            {/* Agenda */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl shadow-2xl p-6 border border-white/20 hover:shadow-red-500/20 hover:-translate-y-1 transition-all duration-300 hover:border-red-500/30">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-red-600/20 p-3 rounded-full border border-red-500/30">
                  <Calendar className="text-red-400" size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Agenda</h3>
                  <p className="text-gray-400 text-sm">Vos rendez-vous</p>
                </div>
              </div>
              <p className="text-gray-300">Gérez vos séances</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

