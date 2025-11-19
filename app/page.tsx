import Link from 'next/link';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  const user = await currentUser();

  // If user is already signed in, redirect to game
  if (user) {
    redirect('/game');
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6">
            Welcome to <span className="text-blue-400">PixelMatch</span>
          </h1>
          <p className="text-2xl text-gray-300 mb-4">
            Dating Meets Adventure
          </p>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Explore a nostalgic pixel world, meet real people, and make genuine connections
            through gameplay instead of endless swiping
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-4 justify-center mb-20">
          <Link
            href="/sign-up"
            className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition shadow-lg"
          >
            Start Your Adventure
          </Link>
          <Link
            href="/sign-in"
            className="px-8 py-4 bg-gray-700 text-white text-lg font-semibold rounded-lg hover:bg-gray-600 transition"
          >
            Sign In
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="text-4xl mb-4">🎮</div>
            <h3 className="text-xl font-bold text-white mb-2">Play & Connect</h3>
            <p className="text-gray-400">
              Navigate through towns, encounter other players, and strike up natural conversations
              in a fun, low-pressure environment
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-xl font-bold text-white mb-2">Safe & Verified</h3>
            <p className="text-gray-400">
              Identity verification, moderation tools, and safety features ensure a secure
              dating experience for everyone
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-bold text-white mb-2">Nostalgic Fun</h3>
            <p className="text-gray-400">
              Relive the magic of classic games while making real connections.
              Complete quests, earn badges, and explore together
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">How It Works</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                1
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">Create Your Profile</h4>
                <p className="text-gray-400">Sign up, verify your identity, and customize your pixel avatar</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                2
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">Explore the World</h4>
                <p className="text-gray-400">Walk around towns, visit different locations, and discover new areas</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                3
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">Meet People</h4>
                <p className="text-gray-400">Random encounters with real users lead to organic conversations</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                4
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">Build Connections</h4>
                <p className="text-gray-400">Chat, complete quests together, and exchange contact info when you click</p>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-20 text-center">
          <Link
            href="/sign-up"
            className="inline-block px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 transition shadow-xl"
          >
            Begin Your Journey
          </Link>
        </div>
      </div>
    </main>
  );
}
