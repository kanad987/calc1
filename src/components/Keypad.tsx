'use client';

import React from 'react';
import styles from './Keypad.module.css';

interface KeypadProps {
  onInput: (char: string) => void;
  onClear: () => void;
  onBackspace: () => void;
  onCalculate: () => void;
  onToggleSign: () => void;
  onMemory: (action: 'MC' | 'MR' | 'M+' | 'M-' | 'MS') => void;
  isScientific: boolean;
  activeKey?: string | null;
}

export const Keypad: React.FC<KeypadProps> = ({
  onInput,
  onClear,
  onBackspace,
  onCalculate,
  onToggleSign,
  onMemory,
  isScientific,
  activeKey,
}) => {
  const isKeyActive = (key: string) => activeKey === key;

  return (
    <div className={styles.keypadContainer}>
      {/* Memory Bar */}
      <div className={styles.memoryBar}>
        <button type="button" onClick={() => onMemory('MC')} className={styles.memBtn} title="Memory Clear">MC</button>
        <button type="button" onClick={() => onMemory('MR')} className={styles.memBtn} title="Memory Recall">MR</button>
        <button type="button" onClick={() => onMemory('M+')} className={styles.memBtn} title="Memory Add">M+</button>
        <button type="button" onClick={() => onMemory('M-')} className={styles.memBtn} title="Memory Subtract">M-</button>
        <button type="button" onClick={() => onMemory('MS')} className={styles.memBtn} title="Memory Store">MS</button>
      </div>

      <div className={`${styles.mainGrid} ${isScientific ? styles.scientificGrid : ''}`}>
        {/* Scientific Section */}
        {isScientific && (
          <div className={styles.sciSection}>
            <button type="button" onClick={() => onInput('sin(')} className={styles.sciBtn}>sin</button>
            <button type="button" onClick={() => onInput('cos(')} className={styles.sciBtn}>cos</button>
            <button type="button" onClick={() => onInput('tan(')} className={styles.sciBtn}>tan</button>
            <button type="button" onClick={() => onInput('asin(')} className={styles.sciBtn}>sin⁻¹</button>
            <button type="button" onClick={() => onInput('acos(')} className={styles.sciBtn}>cos⁻¹</button>
            <button type="button" onClick={() => onInput('atan(')} className={styles.sciBtn}>tan⁻¹</button>

            <button type="button" onClick={() => onInput('ln(')} className={styles.sciBtn}>ln</button>
            <button type="button" onClick={() => onInput('log(')} className={styles.sciBtn}>log</button>
            <button type="button" onClick={() => onInput('^')} className={styles.sciBtn}>xʸ</button>
            <button type="button" onClick={() => onInput('^2')} className={styles.sciBtn}>x²</button>
            <button type="button" onClick={() => onInput('^3')} className={styles.sciBtn}>x³</button>
            <button type="button" onClick={() => onInput('sqrt(')} className={styles.sciBtn}>√x</button>

            <button type="button" onClick={() => onInput('cbrt(')} className={styles.sciBtn}>∛x</button>
            <button type="button" onClick={() => onInput('!')} className={styles.sciBtn}>n!</button>
            <button type="button" onClick={() => onInput('π')} className={styles.sciBtn}>π</button>
            <button type="button" onClick={() => onInput('e')} className={styles.sciBtn}>e</button>
            <button type="button" onClick={() => onInput('abs(')} className={styles.sciBtn}>|x|</button>
            <button type="button" onClick={() => onInput('exp(')} className={styles.sciBtn}>eˣ</button>
          </div>
        )}

        {/* Standard Section */}
        <div className={styles.standardSection}>
          {/* Row 1 */}
          <button
            type="button"
            onClick={onClear}
            className={`${styles.btn} ${styles.actionBtn} ${isKeyActive('Escape') || isKeyActive('c') ? styles.activeKey : ''}`}
            title="Clear (Escape / C)"
          >
            AC
          </button>
          <button
            type="button"
            onClick={onBackspace}
            className={`${styles.btn} ${styles.fnBtn} ${isKeyActive('Backspace') ? styles.activeKey : ''}`}
            title="Backspace (Backspace)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
              <line x1="18" y1="9" x2="12" y2="15"></line>
              <line x1="12" y1="9" x2="18" y2="15"></line>
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onInput('(')}
            className={`${styles.btn} ${styles.fnBtn} ${isKeyActive('(') ? styles.activeKey : ''}`}
          >
            (
          </button>
          <button
            type="button"
            onClick={() => onInput(')')}
            className={`${styles.btn} ${styles.fnBtn} ${isKeyActive(')') ? styles.activeKey : ''}`}
          >
            )
          </button>
          <button
            type="button"
            onClick={() => onInput('÷')}
            className={`${styles.btn} ${styles.opBtn} ${isKeyActive('/') || isKeyActive('÷') ? styles.activeKey : ''}`}
          >
            ÷
          </button>

          {/* Row 2 */}
          <button
            type="button"
            onClick={() => onInput('7')}
            className={`${styles.btn} ${styles.numBtn} ${isKeyActive('7') ? styles.activeKey : ''}`}
          >
            7
          </button>
          <button
            type="button"
            onClick={() => onInput('8')}
            className={`${styles.btn} ${styles.numBtn} ${isKeyActive('8') ? styles.activeKey : ''}`}
          >
            8
          </button>
          <button
            type="button"
            onClick={() => onInput('9')}
            className={`${styles.btn} ${styles.numBtn} ${isKeyActive('9') ? styles.activeKey : ''}`}
          >
            9
          </button>
          <button
            type="button"
            onClick={() => onInput('%')}
            className={`${styles.btn} ${styles.fnBtn} ${isKeyActive('%') ? styles.activeKey : ''}`}
          >
            %
          </button>
          <button
            type="button"
            onClick={() => onInput('×')}
            className={`${styles.btn} ${styles.opBtn} ${isKeyActive('*') || isKeyActive('×') ? styles.activeKey : ''}`}
          >
            ×
          </button>

          {/* Row 3 */}
          <button
            type="button"
            onClick={() => onInput('4')}
            className={`${styles.btn} ${styles.numBtn} ${isKeyActive('4') ? styles.activeKey : ''}`}
          >
            4
          </button>
          <button
            type="button"
            onClick={() => onInput('5')}
            className={`${styles.btn} ${styles.numBtn} ${isKeyActive('5') ? styles.activeKey : ''}`}
          >
            5
          </button>
          <button
            type="button"
            onClick={() => onInput('6')}
            className={`${styles.btn} ${styles.numBtn} ${isKeyActive('6') ? styles.activeKey : ''}`}
          >
            6
          </button>
          <button
            type="button"
            onClick={() => onInput('1/(')}
            className={`${styles.btn} ${styles.fnBtn}`}
            title="Reciprocal 1/x"
          >
            ⅟x
          </button>
          <button
            type="button"
            onClick={() => onInput('−')}
            className={`${styles.btn} ${styles.opBtn} ${isKeyActive('-') || isKeyActive('−') ? styles.activeKey : ''}`}
          >
            −
          </button>

          {/* Row 4 */}
          <button
            type="button"
            onClick={() => onInput('1')}
            className={`${styles.btn} ${styles.numBtn} ${isKeyActive('1') ? styles.activeKey : ''}`}
          >
            1
          </button>
          <button
            type="button"
            onClick={() => onInput('2')}
            className={`${styles.btn} ${styles.numBtn} ${isKeyActive('2') ? styles.activeKey : ''}`}
          >
            2
          </button>
          <button
            type="button"
            onClick={() => onInput('3')}
            className={`${styles.btn} ${styles.numBtn} ${isKeyActive('3') ? styles.activeKey : ''}`}
          >
            3
          </button>
          <button
            type="button"
            onClick={() => onInput('sqrt(')}
            className={`${styles.btn} ${styles.fnBtn}`}
          >
            √
          </button>
          <button
            type="button"
            onClick={() => onInput('+')}
            className={`${styles.btn} ${styles.opBtn} ${isKeyActive('+') ? styles.activeKey : ''}`}
          >
            +
          </button>

          {/* Row 5 */}
          <button
            type="button"
            onClick={onToggleSign}
            className={`${styles.btn} ${styles.fnBtn}`}
            title="Toggle Positive/Negative"
          >
            ±
          </button>
          <button
            type="button"
            onClick={() => onInput('0')}
            className={`${styles.btn} ${styles.numBtn} ${isKeyActive('0') ? styles.activeKey : ''}`}
          >
            0
          </button>
          <button
            type="button"
            onClick={() => onInput('.')}
            className={`${styles.btn} ${styles.numBtn} ${isKeyActive('.') ? styles.activeKey : ''}`}
          >
            .
          </button>
          <button
            type="button"
            onClick={onCalculate}
            className={`${styles.btn} ${styles.equalsBtn} ${isKeyActive('Enter') || isKeyActive('=') ? styles.activeKey : ''}`}
            title="Calculate (Enter / =)"
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
};
