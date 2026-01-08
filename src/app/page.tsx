import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen relative flex items-center justify-center p-6 text-center">
      <div className="bg-floats" aria-hidden>
        <div className="float-1" />
        <div className="float-2" />
        <div className="float-3" />
      </div>

      <div className="space-y-8 max-w-2xl z-10">
        <Image src="/logo.png" alt="DEMOS" width={200} height={200} priority className="mx-auto drop-shadow-[0_0_25px_rgba(226,29,44,0.6)]" />
        <h1 className="text-4xl font-extrabold uppercase tracking-tight text-white">Connexion <span className="text-[#E21D2C]">Coach</span></h1>
        <p className="text-lg text-gray-300">Connexion <span className="text-gray-400">Client</span></p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10">
          <Link href="/auth/login" aria-label="Accès Coach" className="inline-block glass-card bg-opacity-90 text-white font-black py-5 px-10 rounded-xl transition-all text-lg uppercase text-center">
            <span className="text-[#E21D2C]">Connexion Coach</span>
          </Link>
          <Link href="/auth/login" aria-label="Accès Client" className="inline-block glass-card border border-white/8 text-white font-black py-5 px-10 rounded-xl transition-all text-lg uppercase text-center">
            <span className="text-gray-200">Connexion Client</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
