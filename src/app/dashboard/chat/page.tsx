import { supabase } from '@/utils/supabase'

export default function DashboardChatPage() {
  const messages = [
    { id: 1, text: "Salut Coach! Comment ça va?", time: "09:12" },
    { id: 2, text: "Jean: Je confirme ma séance de demain.", time: "10:45" },
    { id: 3, text: "Sarah: Merci pour le programme !", time: "12:05" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-black text-white">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-bold text-[#E21D2C] mb-6">Messagerie Coach (Démo)</h1>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/6">
          <ul className="space-y-4">
            {messages.map((m) => (
              <li key={m.id} className="p-3 bg-black/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="text-white/90">{m.text}</div>
                  <div className="text-xs text-gray-400">{m.time}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
