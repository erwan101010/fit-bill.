"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Calendar,
  Users,
  FileText,
  MessageCircle,
  LogOut,
  Menu,
  X,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../utils/supabase";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/dashboard",
  },
  {
    label: "Agenda",
    icon: Calendar,
    href: "/agenda",
  },
  {
    label: "Clients",
    icon: Users,
    href: "/clients",
  },
  {
    label: "Messages",
    icon: MessageCircle,
    href: "/dashboard/messages",
  },
  {
    label: "Facturation",
    icon: FileText,
    href: "/facturation",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
              <div className="bg-gradient-to-br from-red-600 to-red-700 p-2 rounded-lg shadow-xl shadow-red-500/20 border border-white/10">
                <Home className="text-white" size={20} />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Demos
              </h1>
            </div>
            <div className="flex items-center gap-2 mt-3 ml-11">
              <div className="flex items-center gap-2">
                <span className="text-gray-300 text-sm font-medium">
                  {typeof window !== "undefined" ? localStorage.getItem("demos-user-name") || "Coach" : "Coach"}
                </span>
                <div className="relative">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                  <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75"></div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-lg">
                <CheckCircle2 className="text-yellow-400" size={12} />
                <span className="text-xs text-yellow-300 font-medium">Certifié</span>
              </div>
            </div>
            <p className="text-gray-400 text-xs mt-1 ml-11">Coaching Premium</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {NAV_ITEMS.map((item, index) => {
              const IconComponent = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group transform ${
                    isActive
                      ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-xl shadow-red-500/50 border border-white/10 translate-x-2 ring-2 ring-red-500/50"
                      : "text-gray-300 hover:bg-gray-800/50 hover:text-white border border-transparent hover:border-white/5 hover:translate-x-1"
                  }`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    ...(isActive ? {
                      boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.3), 0 4px 6px -2px rgba(239, 68, 68, 0.2), 0 0 20px rgba(239, 68, 68, 0.3)',
                    } : {}),
                  }}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
                  )}
                  <IconComponent 
                    size={20} 
                    strokeWidth={1.5}
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
