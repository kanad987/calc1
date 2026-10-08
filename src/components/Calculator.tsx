'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './Calculator.module.css';
import { Display } from './Display';
import { Keypad } from './Keypad';
import { HistoryDrawer, HistoryItem } from './HistoryDrawer';
import { UnitConverterModal } from './UnitConverterModal';
import { evaluateMathExpression, AngleMode, formatNumber } from '@/utils/mathEngine';
import { audioFeedback } from '@/utils/audioFeedback';

export const Calculator: React.FC = () => {
  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [preview, setPreview] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [isScientific, setIsScientific] = useState<boolean>(false);
  const [angleMode, setAngleMode] = useState<AngleMode>('DEG');
  const [memory, setMemory] = useState<number | null>(null);
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isConverterOpen, setIsConverterOpen] = useState<boolean>(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [theme, setTheme] = useState<'dark' | 'light' | 'cyberpunk'>('dark');
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('calc_history');
      if (savedHistory) setHistory(JSON.parse(savedHistory));

      const savedTheme = localStorage.getItem('calc_theme') as 'dark' | 'light' | 'cyberpunk';
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
      }

      const savedSound = localStorage.getItem('calc_sound');
      if (savedSound !== null) {
        const soundOn = savedSound === 'true';
        setIsSoundEnabled(soundOn);
        audioFeedback.soundEnabled = soundOn;
      }
    } catch {
      // safe fallback
    }
  }, []);

  // Update Theme
  const handleThemeChange = (newTheme: 'dark' | 'light' | 'cyberpunk') => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    try {
      localStorage.setItem('calc_theme', newTheme);
    } catch {
      // safe fallback
    }
  };

  // Toggle Sound
  const toggleSound = () => {
    const nextVal = !isSoundEnabled;
    setIsSoundEnabled(nextVal);
    audioFeedback.soundEnabled = nextVal;
    try {
      localStorage.setItem('calc_sound', `${nextVal}`);
    } catch {
      // safe fallback
    }
  };

  // Live expression preview
  useEffect(() => {
    if (!expression || expression.trim() === '') {
      setPreview('');
      setError(null);
      return;
    }

    // Attempt live evaluation if ends in a number, parenthesis, or constant
    const validEnding = /[0-9)πe!]$/.test(expression);
    if (validEnding) {
      const evalRes = evaluateMathExpression(expression, angleMode);
      if (evalRes.success && evalRes.formatted) {
        setPreview(evalRes.formatted);
        setError(null);
      }
    }
  }, [expression, angleMode]);

  // Handle number or operator inputs
  const handleInput = useCallback((char: string) => {
    setError(null);
    audioFeedback.playClick();

    setExpression((prev) => {
      // If we previously had a calculated final result and type an operator, continue with that result
      if (result && ['+', '−', '×', '÷', '%', '^'].includes(char)) {
        setResult('');
        return result + char;
      }
      // If previous had result and type number/function, start fresh
      if (result) {
        setResult('');
        return char;
      }

      // Avoid consecutive duplicate operators
      const ops = ['+', '−', '×', '÷', '%', '^'];
      const lastChar = prev.slice(-1);
      if (ops.includes(lastChar) && ops.includes(char)) {
        return prev.slice(0, -1) + char;
      }

      return prev + char;
    });
  }, [result]);

  // Clear display
  const handleClear = useCallback(() => {
    audioFeedback.playClear();
    setExpression('');
    setResult('');
    setPreview('');
    setError(null);
  }, []);

  // Backspace single character
  const handleBackspace = useCallback(() => {
    audioFeedback.playClick(400);
    setError(null);
    if (result) {
      setResult('');
      return;
    }

    setExpression((prev) => {
      // If ends with function like "sin(", "cos(", "sqrt(", delete whole function
      const fnMatches = ['sin(', 'cos(', 'tan(', 'asin(', 'acos(', 'atan(', 'sqrt(', 'cbrt(', 'log(', 'ln(', 'abs(', 'exp(', '1/('];
      for (const fn of fnMatches) {
        if (prev.endsWith(fn)) {
          return prev.slice(0, -fn.length);
        }
      }
      return prev.slice(0, -1);
    });
  }, [result]);

  // Equals / Calculate
  const handleCalculate = useCallback(() => {
    if (!expression && !result) return;
    const targetExpr = expression || result;

    const evalRes = evaluateMathExpression(targetExpr, angleMode);
    if (evalRes.success && evalRes.formatted) {
      audioFeedback.playEquals();
      setResult(evalRes.formatted);
      setPreview('');
      setError(null);

      // Add to History
      const newHistoryItem: HistoryItem = {
        id: `${Date.now()}-${Math.random()}`,
        expression: targetExpr,
        result: evalRes.formatted,
        timestamp: Date.now(),
      };
      setHistory((prev) => {
        const updated = [newHistoryItem, ...prev.slice(0, 49)];
        try {
          localStorage.setItem('calc_history', JSON.stringify(updated));
        } catch {
          // safe fallback
        }
        return updated;
      });
    } else {
      audioFeedback.playError();
      setError(evalRes.error || 'Syntax Error');
    }
  }, [expression, result, angleMode]);

  // Toggle positive/negative
  const handleToggleSign = useCallback(() => {
    audioFeedback.playClick();
    if (result) {
      const num = parseFloat(result.replace(/,/g, ''));
      if (!isNaN(num)) {
        setResult(formatNumber(-num));
      }
      return;
    }

    setExpression((prev) => {
      if (!prev) return '-';
      if (prev.startsWith('-')) return prev.slice(1);
      return '-' + prev;
    });
  }, [result]);

  // Memory Actions
  const handleMemory = useCallback((action: 'MC' | 'MR' | 'M+' | 'M-' | 'MS') => {
    audioFeedback.playClick(700);
    const currentVal = parseFloat((result || preview || expression || '0').replace(/,/g, '')) || 0;

    switch (action) {
      case 'MC':
        setMemory(null);
        break;
      case 'MR':
        if (memory !== null) {
          handleInput(`${memory}`);
        }
        break;
      case 'MS':
        setMemory(currentVal);
        break;
      case 'M+':
        setMemory((prev) => (prev !== null ? prev + currentVal : currentVal));
        break;
      case 'M-':
        setMemory((prev) => (prev !== null ? prev - currentVal : -currentVal));
        break;
    }
  }, [result, preview, expression, memory, handleInput]);

  // Handle select from history
  const handleSelectHistory = (item: HistoryItem) => {
    setExpression(item.expression);
    setResult(item.result);
    setIsHistoryOpen(false);
  };

  // Clear history
  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('calc_history');
    } catch {
      // safe fallback
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isConverterOpen) return;

      const key = e.key;
      setActiveKey(key);
      setTimeout(() => setActiveKey(null), 150);

      if ((key >= '0' && key <= '9') || key === '.') {
        e.preventDefault();
        handleInput(key);
      } else if (key === '+' || key === '-') {
        e.preventDefault();
        handleInput(key === '-' ? '−' : '+');
      } else if (key === '*') {
        e.preventDefault();
        handleInput('×');
      } else if (key === '/') {
        e.preventDefault();
        handleInput('÷');
      } else if (key === '(' || key === ')' || key === '%') {
        e.preventDefault();
        handleInput(key);
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleCalculate();
      } else if (key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput, handleCalculate, handleBackspace, handleClear, isConverterOpen]);

  return (
    <div className={styles.appWrapper}>
      {/* Background Animated Atmosphere */}
      <div className="bg-ambient">
        <div className="ambient-orb orb-1"></div>
        <div className="ambient-orb orb-2"></div>
        <div className="ambient-orb orb-3"></div>
      </div>

      <main className={styles.calculatorCard}>
        {/* Top Navbar Toolbar */}
        <header className={styles.toolbar}>
          <div className={styles.brandTitle}>
            <div className={styles.brandLogo}>
              <span>∑</span>
            </div>
            <div className={styles.brandText}>
              <h1 className={styles.appName}>QuantumCalc</h1>
              <span className={styles.appBadge}>v2.1 • TypeScript</span>
            </div>
          </div>

          <div className={styles.toolActions}>
            {/* Sound Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              className={`${styles.toolBtn} ${isSoundEnabled ? styles.toolBtnActive : ''}`}
              title={isSoundEnabled ? 'Mute audio feedback' : 'Enable audio clicks'}
              aria-label="Toggle Sound"
            >
              {isSoundEnabled ? '🔊' : '🔇'}
            </button>

            {/* Unit Converter Button */}
            <button
              type="button"
              onClick={() => setIsConverterOpen(true)}
              className={styles.toolBtn}
              title="Unit Converter"
              aria-label="Open Unit Converter"
            >
              🔄
            </button>

            {/* History Drawer Toggle */}
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className={styles.toolBtn}
              title="Calculation History"
              aria-label="Open History"
            >
              🕒
              {history.length > 0 && (
                <span className={styles.historyCounter}>{history.length}</span>
              )}
            </button>

            {/* Theme Selector */}
            <select
              value={theme}
              onChange={(e) => handleThemeChange(e.target.value as 'dark' | 'light' | 'cyberpunk')}
              className={styles.themeSelect}
              aria-label="Select Theme"
            >
              <option value="dark">🌙 Dark</option>
              <option value="light">☀️ Light</option>
              <option value="cyberpunk">⚡ Cyber</option>
            </select>
          </div>
        </header>

        {/* Mode Switcher */}
        <div className={styles.modeTabs}>
          <button
            type="button"
            onClick={() => setIsScientific(false)}
            className={`${styles.modeTab} ${!isScientific ? styles.activeModeTab : ''}`}
          >
            Standard
          </button>
          <button
            type="button"
            onClick={() => setIsScientific(true)}
            className={`${styles.modeTab} ${isScientific ? styles.activeModeTab : ''}`}
          >
            Scientific
          </button>
        </div>

        {/* Calculator Display */}
        <Display
          expression={expression}
          result={result}
          preview={preview}
          hasMemory={memory !== null}
          angleMode={angleMode}
          isScientific={isScientific}
          onToggleAngleMode={() => setAngleMode((prev) => (prev === 'DEG' ? 'RAD' : 'DEG'))}
          error={error}
        />

        {/* Calculator Keypad */}
        <Keypad
          onInput={handleInput}
          onClear={handleClear}
          onBackspace={handleBackspace}
          onCalculate={handleCalculate}
          onToggleSign={handleToggleSign}
          onMemory={handleMemory}
          isScientific={isScientific}
          activeKey={activeKey}
        />

        {/* Quick Keyboard Hint Footer */}
        <footer className={styles.footerHints}>
          <div className={styles.hintItem}>
            <span className="key-badge">0-9</span> Num
          </div>
          <div className={styles.hintItem}>
            <span className="key-badge">+-*/</span> Ops
          </div>
          <div className={styles.hintItem}>
            <span className="key-badge">Enter</span> =
          </div>
          <div className={styles.hintItem}>
            <span className="key-badge">Esc</span> Clear
          </div>
        </footer>
      </main>

      {/* History Slide-out Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        history={history}
        onClose={() => setIsHistoryOpen(false)}
        onSelect={handleSelectHistory}
        onClear={handleClearHistory}
      />

      {/* Unit Converter Modal */}
      <UnitConverterModal
        isOpen={isConverterOpen}
        onClose={() => setIsConverterOpen(false)}
        onInsertResult={(val) => {
          handleInput(val);
        }}
      />
    </div>
  );
};
