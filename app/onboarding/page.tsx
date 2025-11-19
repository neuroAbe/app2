'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    displayName: '',
    age: '',
    gender: '',
    lookingFor: '',
    bio: '',
    interests: [] as string[],
    avatarColor: '#00ff00',
  });

  const interestOptions = [
    'Gaming', 'Movies', 'Music', 'Sports', 'Travel',
    'Cooking', 'Art', 'Reading', 'Fitness', 'Technology'
  ];

  const handleInterestToggle = (interest: string) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async () => {
    // TODO: Save profile to database
    console.log('Profile to save:', profile);

    // For now, just redirect to game
    router.push('/game');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-white mb-2">Create Your Profile</h1>
        <p className="text-gray-400 mb-6">Step {step} of 3</p>

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl text-white mb-4">Basic Information</h2>

            <div>
              <label className="block text-gray-300 mb-2">Display Name</label>
              <input
                type="text"
                value={profile.displayName}
                onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="How should others see you?"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Age</label>
              <input
                type="number"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Must be 18+"
                min="18"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Gender</label>
              <select
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Looking For</label>
              <select
                value={profile.lookingFor}
                onChange={(e) => setProfile({ ...profile, lookingFor: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                <option value="friendship">Friendship</option>
                <option value="dating">Dating</option>
                <option value="relationship">Long-term Relationship</option>
                <option value="not-sure">Not Sure Yet</option>
              </select>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!profile.displayName || !profile.age || !profile.gender || !profile.lookingFor}
              className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl text-white mb-4">About You</h2>

            <div>
              <label className="block text-gray-300 mb-2">Bio</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                placeholder="Tell others about yourself..."
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Interests (select at least 3)</label>
              <div className="grid grid-cols-2 gap-2">
                {interestOptions.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => handleInterestToggle(interest)}
                    className={`px-4 py-2 rounded-lg transition ${
                      profile.interests.includes(interest)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={profile.interests.length < 3 || !profile.bio}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl text-white mb-4">Choose Your Avatar Color</h2>

            <p className="text-gray-400 mb-4">
              Pick a color for your character in the game. You can change this later!
            </p>

            <div className="grid grid-cols-5 gap-4">
              {['#00ff00', '#ff0000', '#0000ff', '#ffff00', '#ff00ff',
                '#00ffff', '#ff8800', '#8800ff', '#00ff88', '#ff0088'].map((color) => (
                <button
                  key={color}
                  onClick={() => setProfile({ ...profile, avatarColor: color })}
                  className={`w-16 h-16 rounded-lg transition ${
                    profile.avatarColor === color ? 'ring-4 ring-white' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <div className="mt-8 p-6 bg-gray-700 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Safety Reminder</h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>✓ Never share personal information too quickly</li>
                <li>✓ Report any inappropriate behavior</li>
                <li>✓ Meet in public places if you decide to meet in person</li>
                <li>✓ Trust your instincts - block anyone who makes you uncomfortable</li>
              </ul>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setStep(2)}
                className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Start Your Adventure!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
