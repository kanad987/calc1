'use client';

import React, { useState } from 'react';
import styles from './MascotBuddy.module.css';

export type MascotId = 'pip' | 'rex' | 'sparky' | 'coco';

interface MascotBuddyProps {
  message: string;
  starsCount: number;
}

interface MascotData {
  id: MascotId;
  name: string;
  emoji: string;
  title: string;
  color: string;
}

const MASCOTS: MascotData[] = [
  { id: 'pip', name: 'Pip', emoji: '🐱', title: 'Cosmic Cat', color: '#ec4899' },
  { id: 'rex', name: 'Rex', emoji: '🦖', title: 'Math Dino', color: '#10b981' },
  { id: 'sparky', name: 'Sparky', emoji: '🤖', title: 'Robo Buddy', color: '#3b82f6' },
  { id: 'coco', name: 'Coco', emoji: '🐒', title: 'Jungle Explorer', color: '#f59e0b' },
];

export const MascotBuddy: React.FC<MascotBuddyProps> = ({ message, starsCount }) => {
  const [mascotIndex, setMascotIndex] = useState<number>(0);
  const currentMascot = MASCOTS[mascotIndex];

  const handleNextMascot = () => {
    setMascotIndex((prev) => (prev + 1) % MASCOTS.length);
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
