'use client';

import React, { useState } from 'react';
import styles from './TimesTableModal.module.css';
import { audioFeedback } from '@/utils/audioFeedback';

interface TimesTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseCalculation?: (expr: string) => void;
}

export const TimesTableModal: React.FC<TimesTableModalProps> = ({
  isOpen,
  onClose,
  onUseCalculation,
}) => {
  const [selectedTable, setSelectedTable] = useState<number>(3); // Default 3 for Grade 3!
  const [hideAnswers, setHideAnswers] = useState<boolean>(false);
  const [revealedRows, setRevealedRows] = useState<Record<number, boolean>>({});

  if (!isOpen) return null;

  const handleSelectTable = (num: number) => {
    setSelectedTable(num);
    setRevealedRows({});
    audioFeedback.playBubble(440 + num * 20);
  };

  const handleToggleHide = () => {
    setHideAnswers((prev) => !prev);
    setRevealedRows({});
    audioFeedback.playBoing();
  };

  const handleRowClick = (multiplier: number, answer: number) => {
    if (hideAnswers) {
      setRevealedRows((prev) => ({ ...prev, [multiplier]: true }));
      audioFeedback.playBubble(600);
    }
    audioFeedback.speakMath(`${selectedTable} times ${multiplier} equals ${answer}`);
  };

  const handleInsertExpr = (multiplier: number) => {
    if (onUseCalculation) {
      onUseCalculation(`${selectedTable} × ${multiplier}`);
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <aside className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <span className={styles.titleIcon}>✖️</span>
            <div>
              <h3 className={styles.title}>3rd Grade Times Tables (1–12)</h3>
              <p className={styles.subtitle}>Click any row to hear it spoken out loud!</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className={styles.closeBtn} title="Close">
            ✕
          </button>
        </div>

        {/* Number Selector Bar (1 to 12) */}
        <div className={styles.selectorBar}>
          <span className={styles.selectorLabel}>Pick a Table:</span>
          <div className={styles.tableButtons}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => handleSelectTable(n)}
                className={`${styles.tableBtn} ${selectedTable === n ? styles.tableBtnActive : ''}`}
              >
                {n}×
              </button>
            ))}
          </div>
        </div>

        {/* Practice Mode Controls */}
        <div className={styles.toolbar}>
          <div className={styles.currentTableBanner}>
            <span className={styles.bannerEmoji}>🌟</span>
            <span>Mastering the <strong>{selectedTable}&times;</strong> Table</span>
          </div>

          <button
            type="button"
            onClick={handleToggleHide}
            className={`${styles.practiceToggle} ${hideAnswers ? styles.practiceActive : ''}`}
          >
            {hideAnswers ? '👀 Show All Answers' : '🙈 Hide & Quiz Me'}
          </button>
        </div>

        {/* Times Table Rows */}
        <div className={styles.tableContent}>
          <div className={styles.tableGrid}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((mult) => {
              const answer = selectedTable * mult;
              const isRevealed = revealedRows[mult] || !hideAnswers;

              return (
                <div
                  key={mult}
                  className={styles.rowCard}
                  onClick={() => handleRowClick(mult, answer)}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.rowEquation}>
                    <span className={styles.eqFactor}>{selectedTable}</span>
                    <span className={styles.eqSymbol}>&times;</span>
                    <span className={styles.eqFactor}>{mult}</span>
                    <span className={styles.eqSymbol}>=</span>
                  </div>

                  <div className={styles.rowAnswerArea}>
                    {isRevealed ? (
                      <span className={styles.answerText}>{answer}</span>
                    ) : (
                      <span className={styles.tapToReveal}>Tap to reveal ❓</span>
                    )}
                  </div>

                  <div className={styles.rowActions}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        audioFeedback.speakMath(`${selectedTable} times ${mult} equals ${answer}`);
                      }}
                      className={styles.speakBtn}
                      title="Speak row aloud"
                    >
                      🗣️
                    </button>
                    {onUseCalculation && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInsertExpr(mult);
                        }}
                        className={styles.insertBtn}
                        title="Calculate in main calculator"
                      >
                        Calculator ➕
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </div>
  );
};
