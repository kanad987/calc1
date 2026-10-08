'use client';

import React, { useState } from 'react';
import styles from './Display.module.css';
import { AngleMode } from '@/utils/mathEngine';

interface DisplayProps {
  expression: string;
  result: string;
  preview: string;
  hasMemory: boolean;
  angleMode: AngleMode;
  isScientific: boolean;
  onToggleAngleMode: () => void;
  error?: string | null;
}

export const Display: React.FC<DisplayProps> = ({
  expression,
  result,
  preview,
  hasMemory,
  angleMode,
  isScientific,
  onToggleAngleMode,
  error,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = result || preview || expression || '0';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div className={styles.displayContainer}>
      <div className={styles.statusRow}>
        <div className={styles.indicators}>
          {hasMemory && <span className={styles.badge}>M</span>}
          {isScientific && (
            <button
              onClick={onToggleAngleMode}
              className={`${styles.badge} ${styles.badgeInteractive}`}
              title="Click to toggle DEG / RAD"
              type="button"
            >
              {angleMode}
            </button>
          )}
        </div>

        <button
          onClick={handleCopy}
          className={styles.copyBtn}
          title="Copy result to clipboard"
          type="button"
        >
          {copied ? (
            <span className={styles.copiedText}>✓ Copied</span>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          )}
        </button>
      </div>

      <div className={styles.expressionRow} title={expression || '0'}>
        <span>{expression || '\u00A0'}</span>
      </div>

      <div className={`${styles.resultRow} ${error ? styles.errorResult : ''}`}>
        {error ? (
          <span className={styles.errorText}>{error}</span>
        ) : (
          <>
            <span className={styles.mainResult}>{result || expression || '0'}</span>
            {!result && preview && preview !== expression && (
              <span className={styles.livePreview}>= {preview}</span>
            )}
          </>
        )}
      </div>
    </div>
  );
};
