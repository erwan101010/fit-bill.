import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 text-center">
      <div className="space-y-8 max-w-2xl z-10">
        <h1 className="text-5xl font-extrabold uppercase tracking-tight text-[#E21D2C]">FIT-BILL</h1>

        <div className="flex items-center justify-center gap-6 pt-10">
          <a href="/auth/login" aria-label="Accès Coach" className="inline-block backdrop-blur-md bg-white/10 border border-white/20 text-white font-black py-4 px-8 rounded-xl transition-all text-lg uppercase text-center">
            ACCÈS COACH
          </a>
          <a href="/auth/login" aria-label="Accès Client" className="inline-block backdrop-blur-md bg-white/10 border border-white/20 text-white font-black py-4 px-8 rounded-xl transition-all text-lg uppercase text-center">
            ACCÈS CLIENT
          </a>
        </div>
      </div>
    </main>
  );
}
