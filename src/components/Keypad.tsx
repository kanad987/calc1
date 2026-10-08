'use client';

import React from 'react';
import styles from './Keypad.module.css';

interface KeypadProps {
  onInput: (char: string) => void;
  onClear: () => void;
  onBackspace: () => void;
  onCalculate: () => void;
  onToggleSign: () => void;
  activeKey?: string | null;
}

export const Keypad: React.FC<KeypadProps> = ({
  onInput,
  onClear,
  onBackspace,
  onCalculate,
  onToggleSign,
  activeKey,
}) => {
  const isKeyActive = (key: string) => activeKey === key;

  return (
    <div className={styles.keypadContainer}>
      <div className={styles.grid}>
        {/* ROW 1 */}
        <button
          type="button"
          onClick={onClear}
          className={`${styles.keyBtn} ${styles.clearBtn} ${isKeyActive('Escape') || isKeyActive('c') ? styles.activeKey : ''}`}
          title="Clear all (Esc / C)"
        >
          <span className={styles.btnIcon}>🧹</span>
          <span className={styles.btnLabel}>AC</span>
        </button>

        <button
          type="button"
          onClick={onBackspace}
          className={`${styles.keyBtn} ${styles.backspaceBtn} ${isKeyActive('Backspace') ? styles.activeKey : ''}`}
          title="Delete last number (Backspace)"
        >
          <span className={styles.btnLabel}>⌫</span>
        </button>

        <button
          type="button"
          onClick={() => onInput('(')}
          className={`${styles.keyBtn} ${styles.parenBtn} ${isKeyActive('(') ? styles.activeKey : ''}`}
          title="Open bracket"
        >
          <span className={styles.btnLabel}>(</span>
        </button>

        <button
          type="button"
          onClick={() => onInput(')')}
          className={`${styles.keyBtn} ${styles.parenBtn} ${isKeyActive(')') ? styles.activeKey : ''}`}
          title="Close bracket"
        >
          <span className={styles.btnLabel}>)</span>
        </button>

        <button
          type="button"
          onClick={() => onInput('÷')}
          className={`${styles.keyBtn} ${styles.opBtn} ${styles.divideBtn} ${isKeyActive('/') || isKeyActive('÷') ? styles.activeKey : ''}`}
          title="Divide (÷)"
        >
          <span className={styles.btnLabel}>÷</span>
        </button>

        {/* ROW 2 */}
        <button
          type="button"
          onClick={() => onInput('7')}
          className={`${styles.keyBtn} ${styles.numBtn} ${isKeyActive('7') ? styles.activeKey : ''}`}
        >
          <span className={styles.btnLabel}>7</span>
        </button>

        <button
          type="button"
          onClick={() => onInput('8')}
          className={`${styles.keyBtn} ${styles.numBtn} ${isKeyActive('8') ? styles.activeKey : ''}`}
        >
          <span className={styles.btnLabel}>8</span>
        </button>

        <button
          type="button"
          onClick={() => onInput('9')}
          className={`${styles.keyBtn} ${styles.numBtn} ${isKeyActive('9') ? styles.activeKey : ''}`}
        >
          <span className={styles.btnLabel}>9</span>
        </button>

        <button
          type="button"
          onClick={() => onInput(' R ')}
          className={`${styles.keyBtn} ${styles.remainderBtn}`}
          title="Grade 3 Remainder Division (e.g. 17 R 5)"
        >
          <span className={styles.remainderPill}>Rem</span>
          <span className={styles.btnLabel}>R</span>
        </button>

        <button
          type="button"
          onClick={() => onInput('×')}
          className={`${styles.keyBtn} ${styles.opBtn} ${styles.multiplyBtn} ${isKeyActive('*') || isKeyActive('×') ? styles.activeKey : ''}`}
          title="Multiply (×)"
        >
          <span className={styles.btnLabel}>×</span>
        </button>

        {/* ROW 3 */}
        <button
          type="button"
          onClick={() => onInput('4')}
          className={`${styles.keyBtn} ${styles.numBtn} ${isKeyActive('4') ? styles.activeKey : ''}`}
        >
          <span className={styles.btnLabel}>4</span>
        </button>

        <button
          type="button"
          onClick={() => onInput('5')}
          className={`${styles.keyBtn} ${styles.numBtn} ${isKeyActive('5') ? styles.activeKey : ''}`}
        >
          <span className={styles.btnLabel}>5</span>
        </button>

        <button
          type="button"
          onClick={() => onInput('6')}
          className={`${styles.keyBtn} ${styles.numBtn} ${isKeyActive('6') ? styles.activeKey : ''}`}
        >
          <span className={styles.btnLabel}>6</span>
        </button>

        <button
          type="button"
          onClick={() => onInput('%')}
          className={`${styles.keyBtn} ${styles.parenBtn} ${isKeyActive('%') ? styles.activeKey : ''}`}
          title="Percent (%)"
        >
          <span className={styles.btnLabel}>%</span>
        </button>

        <button
          type="button"
          onClick={() => onInput('−')}
          className={`${styles.keyBtn} ${styles.opBtn} ${styles.minusBtn} ${isKeyActive('-') || isKeyActive('−') ? styles.activeKey : ''}`}
          title="Minus (−)"
        >
          <span className={styles.btnLabel}>−</span>
        </button>

        {/* ROW 4 */}
        <button
          type="button"
          onClick={() => onInput('1')}
          className={`${styles.keyBtn} ${styles.numBtn} ${isKeyActive('1') ? styles.activeKey : ''}`}
        >
          <span className={styles.btnLabel}>1</span>
        </button>

        <button
          type="button"
          onClick={() => onInput('2')}
          className={`${styles.keyBtn} ${styles.numBtn} ${isKeyActive('2') ? styles.activeKey : ''}`}
        >
          <span className={styles.btnLabel}>2</span>
        </button>

        <button
          type="button"
          onClick={() => onInput('3')}
          className={`${styles.keyBtn} ${styles.numBtn} ${isKeyActive('3') ? styles.activeKey : ''}`}
        >
          <span className={styles.btnLabel}>3</span>
        </button>

        <button
          type="button"
          onClick={onToggleSign}
          className={`${styles.keyBtn} ${styles.parenBtn}`}
          title="Positive / Negative (±)"
        >
          <span className={styles.btnLabel}>±</span>
        </button>

        <button
          type="button"
          onClick={() => onInput('+')}
          className={`${styles.keyBtn} ${styles.opBtn} ${styles.plusBtn} ${isKeyActive('+') ? styles.activeKey : ''}`}
          title="Plus (+)"
        >
          <span className={styles.btnLabel}>+</span>
        </button>

        {/* ROW 5 */}
        <button
          type="button"
          onClick={() => onInput('0')}
          className={`${styles.keyBtn} ${styles.numBtn} ${styles.zeroBtn} ${isKeyActive('0') ? styles.activeKey : ''}`}
        >
          <span className={styles.btnLabel}>0</span>
        </button>

        <button
          type="button"
          onClick={() => onInput('.')}
          className={`${styles.keyBtn} ${styles.numBtn} ${isKeyActive('.') ? styles.activeKey : ''}`}
          title="Decimal dot"
        >
          <span className={styles.btnLabel}>.</span>
        </button>

        <button
          type="button"
          onClick={onCalculate}
          className={`${styles.keyBtn} ${styles.equalsBtn} ${isKeyActive('Enter') || isKeyActive('=') ? styles.activeKey : ''}`}
          title="Equals! Get answer & earn stars ⭐"
        >
          <span className={styles.starIcon}>⭐</span>
          <span className={styles.btnLabel}>=</span>
        </button>
      </div>
    </div>
  );
};
