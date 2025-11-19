import dynamic from 'next/dynamic';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

// Dynamically import GameCanvas with no SSR to avoid window issues
const GameCanvas = dynamic(() => import('@/components/GameCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-gray-900">
      <div className="text-white text-2xl">Loading PixelMatch...</div>
    </div>
  ),
});

export default async function GamePage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <main className="w-full h-screen">
      <GameCanvas />
    </main>
  );
}
