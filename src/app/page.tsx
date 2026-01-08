import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="space-y-8 max-w-2xl">
        <Image src="/logo.png" alt="DEMOS" width={180} height={180} priority className="mx-auto drop-shadow-[0_0_15px_rgba(226,29,44,0.5)]" />
        <h1 className="text-6xl font-black tracking-tighter uppercase italic text-white">DOMINEZ <span className="text-[#E21D2C]">VOTRE DISCIPLINE</span></h1>
        <p className="text-xl text-gray-400 font-light tracking-widest">COACHING PREMIUM & PERFORMANCE DE HAUT NIVEAU</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10">
          <Link href="/auth/login" className="bg-[#E21D2C] hover:bg-red-700 text-white font-black py-5 px-10 rounded-0 transform skew-x-[-10deg] transition-all text-xl uppercase">
            Accès Coach
          </Link>
          <Link href="/auth/login" className="border-2 border-white hover:bg-white hover:text-black text-white font-black py-5 px-10 rounded-0 transform skew-x-[-10deg] transition-all text-xl uppercase">
            Accès Client
          </Link>
        </div>
      </div>
    </main>
  );
}
