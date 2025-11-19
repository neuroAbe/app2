'use client';

import { useEffect, useState } from 'react';
import SafetyMenu from './SafetyMenu';

interface EncounteredUser {
  id: string;
  display_name: string;
  age: number;
  gender: string;
  bio: string;
  interests: string[];
  avatar_color: string;
  distance: number;
}

interface EncounterModalProps {
  isOpen: boolean;
  user: EncounteredUser | null;
  onAccept: () => void;
  onReject: () => void;
  onClose: () => void;
}

export default function EncounterModal({
  isOpen,
  user,
  onAccept,
  onReject,
  onClose,
}: EncounterModalProps) {
  const [showSafetyMenu, setShowSafetyMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !user) return null;

  const handleAccept = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          otherUserId: user.id,
          encounterLocation: 'starter_town',
        }),
      });

      if (response.ok) {
        onAccept();
      } else {
        alert('Failed to create match. Please try again.');
      }
    } catch (error) {
      console.error('Error creating match:', error);
      alert('Failed to create match. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = () => {
    onReject();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              ✨ Wild encounter!
            </h2>
            <p className="text-purple-100 text-sm mt-1">
              Someone is nearby ({Math.round(user.distance)}px away)
            </p>
          </div>

          {/* User Profile */}
          <div className="p-6">
            {/* Avatar */}
            <div className="flex flex-col items-center mb-4">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-3"
                style={{ backgroundColor: user.avatar_color }}
              >
                {user.display_name.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                {user.display_name}
              </h3>
              <p className="text-gray-600">
                {user.age} • {user.gender}
              </p>
            </div>

            {/* Bio */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                About
              </h4>
              <p className="text-gray-600 text-sm">{user.bio}</p>
            </div>

            {/* Interests */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Interests
              </h4>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest) => (
                  <span
                    key={interest}
                    className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleAccept}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Connecting...' : '💜 Say Hi!'}
              </button>
              <button
                onClick={handleReject}
                disabled={loading}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                👋 Maybe later
              </button>
              <button
                onClick={() => setShowSafetyMenu(true)}
                className="w-full text-red-600 text-sm hover:text-red-700 transition"
              >
                🛡️ Report or Block
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 text-2xl font-bold"
          >
            ×
          </button>
        </div>
      </div>

      {/* Safety Menu */}
      {showSafetyMenu && (
        <SafetyMenu
          userId={user.id}
          userName={user.display_name}
          onClose={() => setShowSafetyMenu(false)}
        />
      )}
    </>
  );
}
