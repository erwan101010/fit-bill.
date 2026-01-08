"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
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

const NAV_ITEMS = [
  {
    label: "Tableau de Bord",
    icon: Home,
    href: "/dashboard",
  },
  {
    label: "Clients",
    icon: Users,
    href: "/clients",
  },
  {
    label: "Messages",
    icon: MessageCircle,
    href: "/dashboard/chat",
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
    // Local-only logout for dev: clear storage and redirect
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("demos-user-type");
        localStorage.removeItem("demos-logged-in");
        localStorage.removeItem("demos-user-id");
        localStorage.removeItem("demos-user-name");
      }
    } catch (e) {
      // ignore
    }
    router.push("/");
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-black/20 text-white p-3 rounded-xl shadow-xl border border-white/8 backdrop-blur-md"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 text-white z-40 bg-zinc-900/90 transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full glass-card p-4">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-gradient-to-br from-demos-red/20 to-demos-red/30 p-2 rounded-lg shadow-xl shadow-demos-red/20 border border-white/10">
                <Home className="text-white" size={20} />
              </div>
              <img src="/logo.png" alt="DEMOS Coaching Premium" className="h-10 w-auto" />
            </div>
            <div className="flex items-center gap-2 mt-3 ml-11">
              <div className="flex items-center gap-2">
                <span className="text-white text-sm font-medium">
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
                      : "text-white hover:bg-gray-800/40 hover:text-white border border-transparent hover:border-white/5 hover:translate-x-1"
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

          {/* Déconnexion */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:bg-gray-800/50 hover:text-white transition-all border border-transparent hover:border-white/5 group"
            >
              <LogOut size={20} className="text-white transition-colors" />
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
