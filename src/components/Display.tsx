'use client';

import React, { useState } from 'react';
import styles from './Display.module.css';
import { audioFeedback } from '@/utils/audioFeedback';
import { numberToWords } from '@/utils/mathEngine';

interface DisplayProps {
  expression: string;
  result: string;
  preview: string;
  error?: string | null;
  remainderMode: boolean;
  onToggleRemainderMode: () => void;
  onOpenVisualizer: () => void;
  remainderResult?: {
    quotient: number;
    remainder: number;
    text: string;
  };
}

export const Display: React.FC<DisplayProps> = ({
  expression,
  result,
  preview,
  error,
  remainderMode,
  onToggleRemainderMode,
  onOpenVisualizer,
  remainderResult,
}) => {
  const [copied, setCopied] = useState(false);

  const displayVal = result || preview || expression || '0';
  const cleanVal = parseInt(displayVal.replace(/,/g, ''), 10);
  const wordSpelling = !isNaN(cleanVal) && cleanVal >= 0 && cleanVal < 1000000 ? numberToWords(cleanVal) : '';

  const handleCopy = () => {
    const textToCopy = result || preview || expression || '0';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      audioFeedback.playBubble(660);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const handleSpeak = () => {
    let textToSpeak = '';
    if (result) {
      textToSpeak = `${expression} equals ${result}`;
    } else if (preview) {
      textToSpeak = `${expression} equals ${preview}`;
    } else if (expression) {
      textToSpeak = expression;
    } else {
      textToSpeak = 'Zero';
    }
    audioFeedback.speakMath(textToSpeak);
  };

  return (
    <div className={styles.displayContainer}>
      {/* Top Helper Bar */}
      <div className={styles.topBar}>
        <div className={styles.leftPills}>
          {/* Remainder Division Toggle */}
          <button
            type="button"
            onClick={() => {
              onToggleRemainderMode();
              audioFeedback.playBoing();
            }}
            className={`${styles.modePill} ${remainderMode ? styles.modePillActive : ''}`}
            title="Toggle Grade 3 Remainder Mode (e.g. 17 ÷ 5 = 3 R 2)"
          >
            <span>➗ Remainder</span>
            <strong>{remainderMode ? 'ON (R)' : 'OFF'}</strong>
          </button>

          {/* Visual Math Drawer Launcher */}
          <button
            type="button"
            onClick={() => {
              onOpenVisualizer();
              audioFeedback.playBubble();
            }}
            className={styles.visualizerBtn}
            title="View Visual Counters, Arrays & Place Value!"
          >
            <span>👀 See Blocks</span>
          </button>
        </div>

        <div className={styles.rightActions}>
          {/* Speak Button */}
          <button
            type="button"
            onClick={handleSpeak}
            className={styles.actionBtn}
            title="Listen to this equation out loud! 🗣️"
            aria-label="Speak equation"
          >
            🗣️
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className={styles.actionBtn}
            title="Copy answer"
            aria-label="Copy result"
          >
            {copied ? <span className={styles.copiedIcon}>✓</span> : '📋'}
          </button>
        </div>
      </div>

      {/* Expression Row */}
      <div className={styles.expressionRow} title={expression || '0'}>
        <span>{expression || '\u00A0'}</span>
      </div>

      {/* Main Result & Live Preview */}
      <div className={`${styles.resultRow} ${error ? styles.errorResult : ''}`}>
        {error ? (
          <div className={styles.errorContainer}>
            <span className={styles.errorEmoji}>🙈</span>
            <span className={styles.errorText}>{error}</span>
          </div>
        ) : (
          <>
            <div className={styles.resultValueWrap}>
              <span className={styles.mainResult}>{result || expression || '0'}</span>
              {!result && preview && preview !== expression && (
                <span className={styles.livePreview}>= {preview}</span>
              )}
            </div>

            {/* If there's a remainder calculation, highlight it in Grade 3 style! */}
            {remainderResult && remainderResult.remainder > 0 && (
              <div className={styles.remainderBadge} title="Grade 3 Quotient & Remainder">
                <span>Remainder:</span>
                <strong>{remainderResult.remainder}</strong>
              </div>
            )}
          </>
        )}
      </div>

      {/* Word Spelling for Grade 3 Reading Practice */}
      {wordSpelling && !error && (
        <div className={styles.wordRow} title={`Word form: ${wordSpelling}`}>
          <span className={styles.wordPrefix}>In words:</span>
          <span className={styles.wordText}>&ldquo;{wordSpelling}&rdquo;</span>
        </div>
      )}
    </div>
  );
};
