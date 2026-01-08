export default function DashboardChatPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-black text-white">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-bold text-[#E21D2C] mb-6">Messagerie Coach</h1>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/6">
          <p className="text-gray-300">Aucun chat connecté (mode dev)</p>
          <ul className="mt-4 space-y-2 text-white/90">
            <li>Paiement reçu de Jean D. (150€)</li>
            <li>Nouveau message de Sarah L.</li>
            <li>Séance terminée avec Marc A.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
