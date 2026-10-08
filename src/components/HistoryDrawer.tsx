'use client';

import React from 'react';
import styles from './HistoryDrawer.module.css';

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
        aria-label="Calculation History"
      >
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <h3>Calculation History</h3>
          </div>
          <div className={styles.headerActions}>
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClear}
                className={styles.clearBtn}
                title="Clear all history"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className={styles.closeBtn}
              title="Close history"
            >
              ✕
            </button>
          </div>
        </div>

        <div className={styles.content}>
          {history.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>⌛</div>
              <p className={styles.emptyTitle}>No history yet</p>
              <p className={styles.emptySubtitle}>Your previous calculations will appear here</p>
            </div>
          ) : (
            <div className={styles.list}>
              {history.map((item) => (
                <div
                  key={item.id}
                  className={styles.item}
                  onClick={() => onSelect(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && onSelect(item)}
                >
                  <div className={styles.itemExpr}>{item.expression} =</div>
                  <div className={styles.itemResult}>{item.result}</div>
                  <div className={styles.itemTime}>
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
