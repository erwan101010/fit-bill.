import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <Image src="/logo.png" alt="DEMOS Logo" width={200} height={200} priority className="object-contain" />
        </div>
        <h1 className="text-4xl font-bold tracking-tighter uppercase">DEMOS</h1>
        <p className="text-gray-400 text-lg">Coaching Premium & Performance</p>
        <div className="flex flex-col gap-4 mt-10">
          <Link href="/auth/login" className="bg-[#E21D2C] hover:bg-red-700 text-white font-bold py-4 px-8 rounded-xl transition-all text-center text-lg">
            ACCÈS COACH
          </Link>
          <Link href="/auth/login" className="border-2 border-white/20 hover:border-white text-white font-bold py-4 px-8 rounded-xl transition-all text-center text-lg">
            ACCÈS CLIENT
          </Link>
        </div>
      </div>
    </main>
  );
}
