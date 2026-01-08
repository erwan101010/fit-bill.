"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  TrendingUp,
  MessageCircle,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../utils/supabase";

const NAV_ITEMS = [
  {
    label: "Accueil",
    icon: Home,
    href: "/client-portal",
  },
  {
    label: "Progression",
    icon: TrendingUp,
    href: "/client-portal",
  },
  {
    label: "Chat",
    icon: MessageCircle,
    href: "/client-portal/chat",
  },
];

export default function ClientSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [coach, setCoach] = useState<{ name: string } | null>(null);

  useEffect(() => {
    const loadCoach = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Récupérer le coach depuis Supabase
        const { data: coachData } = await supabase
          .from("profiles")
          .select("full_name, updated_at")
          .eq("user_type", "coach")
          .limit(1)
          .single();
        
        if (coachData) {
          setCoach({ name: coachData.full_name || "Coach" });
        }
      }
    };
    loadCoach();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    if (typeof window !== "undefined") {
      localStorage.removeItem("demos-user-type");
      localStorage.removeItem("demos-logged-in");
      localStorage.removeItem("demos-user-id");
      localStorage.removeItem("demos-user-name");
    }
    router.push("/");
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gradient-to-br from-gray-800 to-gray-900 text-white p-3 rounded-xl shadow-xl border border-white/10 backdrop-blur-sm"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white z-40 transform transition-transform duration-300 ease-in-out shadow-2xl border-r border-white/10 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full backdrop-blur-sm">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-gradient-to-br from-demos-red/20 to-demos-red/30 p-2 rounded-lg shadow-xl shadow-demos-red/20 border border-white/10">
                  <Home className="text-white" size={20} />
                </div>
                <img src="/logo.png" alt="DEMOS Coaching Premium" className="h-10 w-auto" />
              </div>
            <div className="flex items-center gap-2 mt-3 ml-11">
              <span className="text-gray-300 text-sm font-medium">
                {typeof window !== "undefined" ? localStorage.getItem("demos-user-name") || "Client" : "Client"}
              </span>
              <div className="relative">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75"></div>
              </div>
            </div>
            <p className="text-gray-400 text-xs mt-1 ml-11">Espace Client</p>
            {coach && (
              <div className="mt-3 ml-11 flex items-center gap-2 text-xs bg-gradient-to-r from-red-600/20 to-red-700/20 border border-red-500/30 rounded-lg px-3 py-2">
                <div className="mt-3 ml-11 flex items-center gap-2 text-xs bg-gradient-to-r from-demos-red/20 to-demos-red/30 border border-demos-red/30 rounded-lg px-3 py-2">
                <div className="mt-3 ml-11 flex items-center gap-2 text-xs bg-gradient-to-r from-demos-red/20 to-demos-red/30 border border-demos-red/30 rounded-lg px-3 py-2">
                <User className="text-red-400" size={14} />
                <span className="text-gray-300">
                  Coach: <span className="text-white font-medium">{coach.name}</span>
                </span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const IconComponent = item.icon;
              const isActive = pathname === item.href || (item.href === "/client-portal" && pathname.startsWith("/client-portal") && pathname !== "/client-portal/chat");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group ${
                    isActive
                      ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-xl shadow-red-500/30 border border-white/10"
                        ? "bg-gradient-to-r from-demos-red to-demos-red/90 text-white shadow-xl shadow-demos-red/30 border border-white/10"
                      : "text-gray-300 hover:bg-gray-800/50 hover:text-white border border-transparent hover:border-white/5"
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
                  )}
                  <IconComponent 
                    size={20} 
                    className={isActive ? "text-white" : "text-gray-400 group-hover:text-white transition-colors"} 
                  />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-800/50 hover:text-white transition-all border border-transparent hover:border-white/5 group"
            >
              <LogOut size={20} className="text-gray-400 group-hover:text-white transition-colors" />
              <span className="font-medium">Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
