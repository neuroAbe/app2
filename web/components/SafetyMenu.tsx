'use client';

import { useState } from 'react';

interface SafetyMenuProps {
  targetUserId?: string;
  targetUsername?: string;
  onClose: () => void;
}

export default function SafetyMenu({ targetUserId, targetUsername, onClose }: SafetyMenuProps) {
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBlock = async () => {
    if (!targetUserId) return;

    const confirmed = confirm(`Are you sure you want to block ${targetUsername}? You won't see each other in the game.`);
    if (!confirmed) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/safety/block', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blockedUserId: targetUserId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to block user');
      }

      alert(`${targetUsername} has been blocked.`);
      onClose();
    } catch (error: any) {
      console.error('Error blocking user:', error);
      alert(error.message || 'Failed to block user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId || !reportReason) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/safety/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportedUserId: targetUserId,
          reason: reportReason,
          description: reportDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit report');
      }

      alert('Report submitted. Our moderation team will review it shortly.');
      onClose();
    } catch (error: any) {
      console.error('Error reporting user:', error);
      alert(error.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Safety Options</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {!showReportForm ? (
          <div className="space-y-4">
            <p className="text-gray-300">
              {targetUsername ? `Actions for ${targetUsername}` : 'Safety & Privacy'}
            </p>

            {targetUserId && (
              <>
                <button
                  onClick={() => setShowReportForm(true)}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  disabled={isSubmitting}
                >
                  🚨 Report User
                </button>

                <button
                  onClick={handleBlock}
                  className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                  disabled={isSubmitting}
                >
                  🚫 Block User
                </button>
              </>
            )}

            <div className="pt-4 border-t border-gray-700">
              <h3 className="text-white font-semibold mb-2">Safety Tips</h3>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• Never share personal information too quickly</li>
                <li>• Report inappropriate behavior immediately</li>
                <li>• Trust your instincts</li>
                <li>• Meet in public if you decide to meet</li>
              </ul>
            </div>

            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleReport} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Reason for Report</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="">Select a reason...</option>
                <option value="harassment">Harassment or Bullying</option>
                <option value="inappropriate_content">Inappropriate Content</option>
                <option value="spam">Spam or Scam</option>
                <option value="fake_profile">Fake Profile</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Additional Details (Optional)</label>
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 h-24"
                placeholder="Provide any additional context..."
              />
            </div>

            <div className="bg-red-900 bg-opacity-30 border border-red-700 rounded-lg p-3">
              <p className="text-red-200 text-sm">
                False reports may result in action against your account. Please only report genuine safety concerns.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setShowReportForm(false)}
                className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
                disabled={isSubmitting}
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                disabled={isSubmitting || !reportReason}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
