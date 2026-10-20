'use client';

import React, { useState } from 'react';
import styles from './MascotBuddy.module.css';

export type MascotId = 'rex' | 'sparky' | 'coco' | 'barnaby';

interface MascotBuddyProps {
  message: string;
  starsCount: number;
  theme?: string;
}

interface MascotData {
  id: MascotId;
  name: string;
  emoji: string;
  title: string;
  color: string;
}

const THEME_MASCOTS: Record<string, MascotData> = {
  rainbow: { id: 'sparky', name: 'Sparky', emoji: '🤖', title: 'Robo Buddy', color: '#6366f1' },
  space: { id: 'sparky', name: 'Cosmo', emoji: '🚀', title: 'Space Explorer', color: '#a855f7' },
  candy: { id: 'barnaby', name: 'Barnaby', emoji: '🐰', title: 'Candy Bunny', color: '#ec4899' },
  dino: { id: 'rex', name: 'Rex', emoji: '🦖', title: 'Math Dino', color: '#10b981' },
  jungle: { id: 'coco', name: 'Coco', emoji: '🐒', title: 'Jungle Explorer', color: '#f59e0b' },
  bunny: { id: 'barnaby', name: 'Barnaby', emoji: '🐰', title: 'Bunny Hopper', color: '#f43f5e' },
};

const ALL_MASCOTS: MascotData[] = [
  { id: 'barnaby', name: 'Barnaby', emoji: '🐰', title: 'Bunny Hopper', color: '#f43f5e' },
  { id: 'rex', name: 'Rex', emoji: '🦖', title: 'Math Dino', color: '#10b981' },
  { id: 'sparky', name: 'Sparky', emoji: '🤖', title: 'Robo Buddy', color: '#3b82f6' },
  { id: 'coco', name: 'Coco', emoji: '🐒', title: 'Jungle Explorer', color: '#f59e0b' },
];

export const MascotBuddy: React.FC<MascotBuddyProps> = ({ message, starsCount, theme = 'rainbow' }) => {
  const [customIndex, setCustomIndex] = useState<number | null>(null);

  // When theme changes, default to theme mascot unless user explicitly switched
  const currentMascot = customIndex !== null 
    ? ALL_MASCOTS[customIndex % ALL_MASCOTS.length] 
    : (THEME_MASCOTS[theme] || ALL_MASCOTS[0]);

  const handleNextMascot = () => {
    setCustomIndex((prev) => {
      const next = prev === null ? 1 : prev + 1;
      return next % ALL_MASCOTS.length;
    });
  };

  return (
    <div className={styles.mascotContainer}>
      <button
        type="button"
        onClick={handleNextMascot}
        className={styles.mascotButton}
        title={`Click to switch buddy! (Currently: ${currentMascot.name})`}
        aria-label="Switch mascot buddy"
      >
        <span className={styles.mascotAvatar}>{currentMascot.emoji}</span>
        <span className={styles.switchHint}>🔄</span>
      </button>

      <div className={styles.speechBubble}>
        <div className={styles.buddyHeader}>
          <span className={styles.buddyName} style={{ color: currentMascot.color }}>
            {currentMascot.name}
          </span>
          <div className={styles.starsBadge} title="Total Stars Earned">
            <span>⭐</span>
            <strong>{starsCount}</strong>
          </div>
        </div>
        <p className={styles.bubbleText}>{message || "Let's do some awesome 3rd Grade math! 🚀"}</p>
      </div>
    </div>
  );
};
