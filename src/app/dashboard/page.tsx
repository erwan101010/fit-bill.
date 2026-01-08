"use client";
export default function CoachDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-black text-white">
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-3xl font-extrabold text-[#E21D2C]">TABLEAU DE BORD COACH</h1>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/6"> 
            <div className="text-sm text-white/80">CA Ce Mois</div>
            <div className="text-2xl font-bold text-white">—</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/6">
            <div className="text-sm text-white/80">CA Cette Année</div>
            <div className="text-2xl font-bold text-white">—</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/6">
            <div className="text-sm text-white/80">Nouveaux Messages</div>
            <div className="text-2xl font-bold text-white">—</div>
          </div>
        </section>

        <section className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8 border border-white/6">
          <h2 className="text-lg font-semibold text-white/90">Planning du Jour</h2>
          <p className="text-sm text-white/80 mt-3">Aucun planning connecté (mode dev)</p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/6">
            <h3 className="text-sm text-white/80 mb-4">Derniers messages</h3>
            <ul className="space-y-3 text-white/90">
              <li>Paiement reçu de Jean D. (150€)</li>
              <li>Nouveau message de Sarah L.</li>
              <li>Séance terminée avec Marc A.</li>
            </ul>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/6">
            <h3 className="text-sm text-white/80 mb-4">Notifications clients</h3>
            <ul className="space-y-3 text-white/90">
              <li>Exemple: Nouvelle inscription</li>
              <li>Exemple: Paiement simulé</li>
              <li>Exemple: Suivi manquant</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
