"use client";
import { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Video,
  X,
  Edit,
  Trash2,
  Home,
  Calendar,
  Users,
  FileText,
  Play,
  Maximize2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Sidebar from "../components/Sidebar";

interface Exercice {
  id: number;
  nom: string;
  videoUrl: string;
  consignes: string;
}

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
    label: "Bibliothèque",
    icon: BookOpen,
    href: "/bibliotheque",
  },
  {
    label: "Facturation",
    icon: FileText,
    href: "/facturation",
  },
];

const STORAGE_KEY_EXERCICES = "demos-exercices";

export default function BibliothequePage() {
  const pathname = usePathname();
  const [exercices, setExercices] = useState<Exercice[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nom: "",
    videoUrl: "",
    consignes: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY_EXERCICES);
    if (stored) {
      setExercices(JSON.parse(stored));
    }
  }, []);

  const saveExercices = (newExercices: Exercice[]) => {
    localStorage.setItem(STORAGE_KEY_EXERCICES, JSON.stringify(newExercices));
    setExercices(newExercices);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom.trim()) return;

    if (editingId !== null) {
      // Modifier
      const updated = exercices.map((ex) =>
        ex.id === editingId ? { ...formData, id: editingId } : ex
      );
      saveExercices(updated);
    } else {
      // Ajouter
      const newExercice: Exercice = {
        id: Date.now(),
        ...formData,
      };
      saveExercices([...exercices, newExercice]);
    }

    setFormData({ nom: "", videoUrl: "", consignes: "" });
    setShowModal(false);
    setEditingId(null);
  };

  const handleEdit = (exercice: Exercice) => {
    setFormData({
      nom: exercice.nom,
      videoUrl: exercice.videoUrl,
      consignes: exercice.consignes,
    });
    setEditingId(exercice.id);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet exercice ?")) {
      saveExercices(exercices.filter((ex) => ex.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-6">
        <div className="max-w-7xl mx-auto">
        <section className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-700 mb-1 flex items-center">
                  <BookOpen className="text-red-600 mr-2" size={24} />
                  Bibliothèque d'exercices
                </div>
                <div className="text-sm text-slate-400">
                  {exercices.length} exercice{exercices.length > 1 ? "s" : ""}
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingId(null);
                  setFormData({ nom: "", videoUrl: "", consignes: "" });
                  setShowModal(true);
                }}
                className="bg-red-600 text-white rounded-xl px-6 py-3 flex items-center gap-2 hover:bg-red-700 transition shadow-sm font-medium text-base"
              >
                <Plus size={20} />
                Ajouter
              </button>
            </div>
          </div>

          {/* Liste des exercices */}
          <div className="space-y-3">
            {exercices.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
                <BookOpen className="text-slate-300 mx-auto mb-4" size={48} />
                <div className="text-slate-400 text-sm">
                  Aucun exercice pour le moment
                </div>
                <div className="text-slate-300 text-xs mt-1">
                  Cliquez sur "Ajouter" pour commencer
                </div>
              </div>
            ) : (
              exercices.map((exercice) => (
                <div
                  key={exercice.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-700 text-lg mb-2">
                        {exercice.nom}
                      </h3>
                      {exercice.videoUrl && (
                        <VideoPlayer url={exercice.videoUrl} />
                      )}
                      {exercice.consignes && (
                        <p className="text-sm text-slate-600 mt-2">{exercice.consignes}</p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(exercice)}
                        className="p-2 text-red-600 hover:bg-gray-50 rounded-lg transition"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(exercice.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
        </div>
      </main>

      {/* Modal Ajouter/Modifier */}
      {showModal && (
        <div
          className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="bg-white rounded-xl border border-slate-200 shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-700">
                {editingId !== null ? "Modifier l'exercice" : "Ajouter un exercice"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nom de l'exercice *
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Ex: Développé couché"
                  className="w-full bg-white rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-700 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  URL de la vidéo
                </label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/..."
                  className="w-full bg-white rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-700 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Consignes
                </label>
                <textarea
                  value={formData.consignes}
                  onChange={(e) => setFormData({ ...formData, consignes: e.target.value })}
                  placeholder="Ex: 4 séries de 12 répétitions, 2 min de repos..."
                  rows={4}
                  className="w-full bg-white rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-700 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition font-medium text-base"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white rounded-xl px-6 py-3 hover:bg-red-700 transition shadow-sm font-medium text-base"
                >
                  {editingId !== null ? "Modifier" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant VideoPlayer pour intégrer YouTube
function VideoPlayer({ url }: { url: string }) {
  const [showVideo, setShowVideo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Extraire l'ID de la vidéo YouTube
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYouTubeId(url);
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;

  if (!videoId) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium mb-2"
      >
        <Play size={16} />
        Voir la vidéo
      </a>
    );
  }

  if (showVideo) {
    return (
      <div className={`mb-4 ${isFullscreen ? "fixed inset-0 z-50 bg-black" : ""}`}>
        <div className="relative bg-black rounded-lg overflow-hidden" style={{ paddingTop: "56.25%" }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
          <button
            onClick={() => {
              setIsFullscreen(!isFullscreen);
            }}
            className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-lg p-2 transition z-10"
          >
            <Maximize2 size={18} />
          </button>
          <button
            onClick={() => {
              setShowVideo(false);
              setIsFullscreen(false);
            }}
            className="absolute top-2 left-2 bg-black/70 hover:bg-black/90 text-white rounded-lg p-2 transition z-10"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div
        className="relative rounded-lg overflow-hidden cursor-pointer group"
        onClick={() => setShowVideo(true)}
      >
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt="Miniature vidéo"
            className="w-full h-48 object-cover group-hover:opacity-90 transition"
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition">
          <div className="bg-white/90 rounded-full p-4 group-hover:scale-110 transition">
            <Play size={32} className="text-red-600 ml-1" fill="currentColor" />
          </div>
        </div>
      </div>
    </div>
  );
}

