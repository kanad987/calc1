'use client';

import React from 'react';
import styles from './HistoryDrawer.module.css';
import { audioFeedback } from '@/utils/audioFeedback';

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

interface HistoryDrawerProps {
  isOpen: boolean;
  history: HistoryItem[];
  onClose: () => void;
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  history,
  onClose,
  onSelect,
  onClear,
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <aside
        className={styles.drawer}
        onClick={(e) => e.stopPropagation()}
        aria-label="My Math Adventure Log"
      >
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <span className={styles.titleIcon}>📜</span>
            <div>
              <h3>Math Adventure Log</h3>
              <p className={styles.subtitle}>Your past math discoveries</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            {history.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  audioFeedback.playClear();
                  onClear();
                }}
                className={styles.clearBtn}
                title="Clear log"
              >
                Clear Log 🧹
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className={styles.closeBtn}
              title="Close log"
            >
              ✕
            </button>
          </div>
        </div>

        <div className={styles.content}>
          {history.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>⭐</div>
              <p className={styles.emptyTitle}>No discoveries yet!</p>
              <p className={styles.emptySubtitle}>Calculate numbers and your solved equations will appear here with stars!</p>
            </div>
          ) : (
            <div className={styles.list}>
              {history.map((item) => (
                <div
                  key={item.id}
                  className={styles.item}
                  onClick={() => {
                    audioFeedback.playBubble();
                    onSelect(item);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && onSelect(item)}
                >
                  <div className={styles.starBadge}>⭐</div>
                  <div className={styles.itemContent}>
                    <div className={styles.itemExpr}>{item.expression} =</div>
                    <div className={styles.itemResult}>{item.result}</div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      audioFeedback.speakMath(`${item.expression} equals ${item.result}`);
                    }}
                    className={styles.speakBtn}
                    title="Speak equation aloud"
                  >
                    🗣️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
