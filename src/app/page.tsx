import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-900 to-black flex items-center justify-center p-6 text-center">
      <div className="space-y-8 max-w-2xl z-10">
        <Image src="/logo.png" alt="DEMOS" width={200} height={200} priority className="mx-auto drop-shadow-[0_0_25px_rgba(226,29,44,0.6)]" />
        <h1 className="text-4xl font-extrabold uppercase tracking-tight text-white">Connexion</h1>

        <div className="flex items-center justify-center gap-6 pt-10">
          <Link href="/auth/login" aria-label="Accès Coach" className="inline-block glass-card bg-opacity-90 text-white font-black py-4 px-8 rounded-xl transition-all text-lg uppercase text-center border-2 border-red-600">
            COACH
          </Link>
          <Link href="/auth/login" aria-label="Accès Client" className="inline-block glass-card border-2 border-red-600 text-white font-black py-4 px-8 rounded-xl transition-all text-lg uppercase text-center">
            CLIENT
          </Link>
        </div>
      </div>
    </main>
  );
}
