import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-zinc-900 text-white">
      <h1 className="text-6xl font-bold mb-8">Splitr</h1>
      <p className="text-xl mb-8">The easiest way to split expenses with friends.</p>
      
      <div className="flex gap-4">
        <Link href="/auth">
          <button className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition">
            Get Started
          </button>
        </Link>
      </div>
    </main>
  );
}