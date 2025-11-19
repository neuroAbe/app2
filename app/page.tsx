import dynamic from 'next/dynamic';

// Dynamically import GameCanvas with no SSR to avoid window issues
const GameCanvas = dynamic(() => import('@/components/GameCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-gray-900">
      <div className="text-white text-2xl">Loading PixelMatch...</div>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="w-full h-screen">
      <GameCanvas />
    </main>
  );
}
