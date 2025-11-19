'use client';

import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import MainScene from '@/game/scenes/MainScene';
import EncounterModal from './EncounterModal';

export default function GameCanvas() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const [encounterModalOpen, setEncounterModalOpen] = useState(false);
  const [encounteredUser, setEncounteredUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !gameRef.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: 'game-container',
        backgroundColor: '#2d2d2d',
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { x: 0, y: 0 },
            debug: false,
          },
        },
        scene: [MainScene],
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        pixelArt: true,
      };

      gameRef.current = new Phaser.Game(config);
    }

    // Listen for encounter events from the game scene
    const handleEncounter = (event: CustomEvent) => {
      setEncounteredUser(event.detail.user);
      setEncounterModalOpen(true);
    };

    window.addEventListener('encounter-triggered', handleEncounter as EventListener);

    return () => {
      window.removeEventListener('encounter-triggered', handleEncounter as EventListener);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  const handleAcceptEncounter = () => {
    setEncounterModalOpen(false);
    // Show success message or navigate to chat
    alert(`Matched with ${encounteredUser?.display_name}! Check your matches.`);
  };

  const handleRejectEncounter = () => {
    setEncounterModalOpen(false);
    setEncounteredUser(null);
  };

  const handleCloseEncounter = () => {
    setEncounterModalOpen(false);
    setEncounteredUser(null);
  };

  return (
    <>
      <div id="game-container" className="w-full h-screen flex items-center justify-center bg-gray-900">
        {/* Phaser will inject the canvas here */}
      </div>

      {/* Encounter Modal */}
      <EncounterModal
        isOpen={encounterModalOpen}
        user={encounteredUser}
        onAccept={handleAcceptEncounter}
        onReject={handleRejectEncounter}
        onClose={handleCloseEncounter}
      />
    </>
  );
}
