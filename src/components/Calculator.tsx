'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './Calculator.module.css';
import { Display } from './Display';
import { Keypad } from './Keypad';
import { HistoryDrawer, HistoryItem } from './HistoryDrawer';
import { UnitConverterModal } from './UnitConverterModal';
import { VisualMathDrawer } from './VisualMathDrawer';
import { TimesTableModal } from './TimesTableModal';
import { MathQuestModal } from './MathQuestModal';
import { MascotBuddy } from './MascotBuddy';
import { Confetti } from './Confetti';
import { evaluateMathExpression, formatNumber } from '@/utils/mathEngine';
import { audioFeedback } from '@/utils/audioFeedback';

export type KidTheme = 'rainbow' | 'space' | 'candy' | 'dino';

export const Calculator: React.FC = () => {
  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [preview, setPreview] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [remainderMode, setRemainderMode] = useState<boolean>(true); // Grade 3 default!
  const [remainderResult, setRemainderResult] = useState<{ quotient: number; remainder: number; text: string } | undefined>(undefined);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isConverterOpen, setIsConverterOpen] = useState<boolean>(false);
  const [isVisualizerOpen, setIsVisualizerOpen] = useState<boolean>(false);
  const [isTimesTableOpen, setIsTimesTableOpen] = useState<boolean>(false);
  const [isQuestOpen, setIsQuestOpen] = useState<boolean>(false);

  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState<boolean>(true);
  const [theme, setTheme] = useState<KidTheme>('rainbow');
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [starsCount, setStarsCount] = useState<number>(10);
  const [mascotMessage, setMascotMessage] = useState<string>('Welcome, Grade 3 Math Superstar! 🌟');
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('calc_history');
      if (savedHistory) setHistory(JSON.parse(savedHistory));

      const savedTheme = localStorage.getItem('calc_kid_theme') as KidTheme;
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
      } else {
        document.documentElement.setAttribute('data-theme', 'rainbow');
      }

      const savedStars = localStorage.getItem('calc_stars');
      if (savedStars) {
        setStarsCount(parseInt(savedStars, 10));
      }

      const savedSound = localStorage.getItem('calc_sound');
      if (savedSound !== null) {
        const soundOn = savedSound === 'true';
        setIsSoundEnabled(soundOn);
        audioFeedback.soundEnabled = soundOn;
      }

      const savedSpeech = localStorage.getItem('calc_speech');
      if (savedSpeech !== null) {
        const speechOn = savedSpeech === 'true';
        setIsSpeechEnabled(speechOn);
        audioFeedback.speechEnabled = speechOn;
      }
    } catch {
      // safe fallback
    }
  }, []);

  // Update Theme
  const handleThemeChange = (newTheme: KidTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    audioFeedback.playBubble(500);
    try {
      localStorage.setItem('calc_kid_theme', newTheme);
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

  // Toggle Speech
  const toggleSpeech = () => {
    const nextVal = !isSpeechEnabled;
    setIsSpeechEnabled(nextVal);
    audioFeedback.speechEnabled = nextVal;
    if (nextVal) {
      audioFeedback.speakMath('Voice feedback turned on!');
    }
    try {
      localStorage.setItem('calc_speech', `${nextVal}`);
    } catch {
      // safe fallback
    }
  };

  // Add stars reward
  const addStars = useCallback((count: number) => {
    setStarsCount((prev) => {
      const updated = prev + count;
      try {
        localStorage.setItem('calc_stars', `${updated}`);
      } catch {
        // safe fallback
      }
      return updated;
    });
  }, []);

  const triggerCelebration = useCallback(() => {
    setShowConfetti(true);
  }, []);

  // Live expression preview
  useEffect(() => {
    if (!expression || expression.trim() === '') {
      setPreview('');
      setRemainderResult(undefined);
      setError(null);
      return;
    }

    const validEnding = /[0-9)πe!]$/.test(expression.trim());
    if (validEnding) {
      const evalRes = evaluateMathExpression(expression, 'DEG', remainderMode);
      if (evalRes.success && evalRes.formatted) {
        setPreview(evalRes.formatted);
        setRemainderResult(evalRes.remainderResult);
        setError(null);
      }
    }
  }, [expression, remainderMode]);

  // Handle number or operator inputs
  const handleInput = useCallback((char: string) => {
    setError(null);

    // Audio feedback differentiation
    if (['+', '−', '×', '÷', '%'].includes(char.trim())) {
      audioFeedback.playBoing();
      const mascotQuotes = [
        'Awesome operation! 🚀',
        'Keep going, superstar! ⭐',
        'Math power activated! 💥',
        'You are doing great! 🌟',
      ];
      setMascotMessage(mascotQuotes[Math.floor(Math.random() * mascotQuotes.length)]);
    } else {
      audioFeedback.playBubble();
    }

    setExpression((prev) => {
      // If we previously had a calculated final result and type an operator, continue with that result
      if (result && ['+', '−', '×', '÷', '%'].includes(char.trim())) {
        const cleanBase = result.includes('R') ? result.split(' ')[0] : result;
        setResult('');
        return cleanBase + char;
      }
      // If previous had result and type number, start fresh
      if (result) {
        setResult('');
        return char;
      }

      // Avoid consecutive duplicate operators
      const ops = ['+', '−', '×', '÷', '%'];
      const lastChar = prev.slice(-1);
      if (ops.includes(lastChar) && ops.includes(char.trim())) {
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
    setRemainderResult(undefined);
    setError(null);
    setMascotMessage('Clean chalkboard! Ready for a new puzzle! 🧹');
  }, []);

  // Backspace single character
  const handleBackspace = useCallback(() => {
    audioFeedback.playBubble(380);
    setError(null);
    if (result) {
      setResult('');
      return;
    }

    setExpression((prev) => {
      if (prev.endsWith(' R ')) {
        return prev.slice(0, -3);
      }
      return prev.slice(0, -1);
    });
  }, [result]);

  // Equals / Calculate
  const handleCalculate = useCallback(() => {
    if (!expression && !result) return;
    const targetExpr = expression || result;

    const evalRes = evaluateMathExpression(targetExpr, 'DEG', remainderMode);
    if (evalRes.success && evalRes.formatted) {
      audioFeedback.playFanfare();
      triggerCelebration();
      setResult(evalRes.formatted);
      setRemainderResult(evalRes.remainderResult);
      setPreview('');
      setError(null);

      // Award a star for calculating!
      addStars(1);

      const victoryMessages = [
        'Brilliant! +1 Star earned! ⭐',
        'Awesome answer! You rock! 🎸',
        'Grade 3 Champion! 🏆',
        'Math wizardry at work! 🧙‍♂️',
      ];
      setMascotMessage(victoryMessages[Math.floor(Math.random() * victoryMessages.length)]);

      // Read aloud if speech enabled
      audioFeedback.speakMath(`${targetExpr} equals ${evalRes.formatted}`);

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
      setError(evalRes.error || 'Oops! Check your numbers 😊');
      setMascotMessage('Oopsie! Check your numbers and try again! 🤗');
    }
  }, [expression, result, remainderMode, addStars, triggerCelebration]);

  // Toggle positive/negative
  const handleToggleSign = useCallback(() => {
    audioFeedback.playBubble(460);
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

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isConverterOpen || isTimesTableOpen || isQuestOpen || isVisualizerOpen) return;

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
      } else if (key === 'r' || key === 'R') {
        e.preventDefault();
        handleInput(' R ');
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
  }, [handleInput, handleCalculate, handleBackspace, handleClear, isConverterOpen, isTimesTableOpen, isQuestOpen, isVisualizerOpen]);

  return (
    <div className={styles.appWrapper}>
      {/* Background Animated Atmosphere */}
      <div className="bg-ambient">
        <div className="ambient-orb orb-1"></div>
        <div className="ambient-orb orb-2"></div>
        <div className="ambient-orb orb-3"></div>
      </div>

      {/* Confetti Celebration */}
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

      <main className={styles.calculatorCard}>
        {/* Top Navbar Toolbar */}
        <header className={styles.toolbar}>
          <div className={styles.brandTitle}>
            <div className={styles.brandLogo} title="Grade 3 Math Explorer">
              <span>🌟</span>
            </div>
            <div className={styles.brandText}>
              <h1 className={styles.appName}>MathStars</h1>
              <span className={styles.appBadge}>Grade 3 Explorer • Age 8–9</span>
            </div>
          </div>

          <div className={styles.toolActions}>
            {/* Sound Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              className={`${styles.toolBtn} ${isSoundEnabled ? styles.toolBtnActive : ''}`}
              title={isSoundEnabled ? 'Turn off sound clicks' : 'Turn on fun audio'}
              aria-label="Toggle Sound"
            >
              {isSoundEnabled ? '🔊' : '🔇'}
            </button>

            {/* Voice Readout Toggle */}
            <button
              type="button"
              onClick={toggleSpeech}
              className={`${styles.toolBtn} ${isSpeechEnabled ? styles.toolBtnActive : ''}`}
              title={isSpeechEnabled ? 'Turn off speaking voice' : 'Turn on speaking voice'}
              aria-label="Toggle Voice Readout"
            >
              {isSpeechEnabled ? '🗣️' : '🤫'}
            </button>

            {/* History Drawer Toggle */}
            <button
              type="button"
              onClick={() => {
                audioFeedback.playBubble();
                setIsHistoryOpen(true);
              }}
              className={styles.toolBtn}
              title="My Math Adventure Log 📜"
              aria-label="Open History Log"
            >
              📜
              {history.length > 0 && (
                <span className={styles.historyCounter}>{history.length}</span>
              )}
            </button>

            {/* Kid Theme Selector */}
            <select
              value={theme}
              onChange={(e) => handleThemeChange(e.target.value as KidTheme)}
              className={styles.themeSelect}
              aria-label="Select Kid Theme"
            >
              <option value="rainbow">🌈 Rainbow</option>
              <option value="space">🚀 Space</option>
              <option value="candy">🍭 Candy</option>
              <option value="dino">🦕 Dino</option>
            </select>
          </div>
        </header>

        {/* Mascot Companion Buddy */}
        <MascotBuddy message={mascotMessage} starsCount={starsCount} />

        {/* Grade 3 Kid Mode Nav Tabs */}
        <nav className={styles.kidTabs} aria-label="Math Activity Modes">
          <button
            type="button"
            className={`${styles.tabBtn} ${styles.tabBtnActive}`}
            title="Calculator mode"
          >
            🔢 Calculator
          </button>
          <button
            type="button"
            onClick={() => {
              audioFeedback.playBubble();
              setIsTimesTableOpen(true);
            }}
            className={styles.tabBtn}
            title="Practice 1× to 12× Times Tables!"
          >
            ✖️ Times Tables
          </button>
          <button
            type="button"
            onClick={() => {
              audioFeedback.playFanfare();
              setIsQuestOpen(true);
            }}
            className={`${styles.tabBtn} ${styles.questTab}`}
            title="Play Math Quest & Earn Stars!"
          >
            🏆 Math Quest
          </button>
          <button
            type="button"
            onClick={() => {
              audioFeedback.playBubble();
              setIsConverterOpen(true);
            }}
            className={styles.tabBtn}
            title="Explore Real Measurements!"
          >
            📏 Measurements
          </button>
        </nav>

        {/* Calculator Display */}
        <Display
          expression={expression}
          result={result}
          preview={preview}
          error={error}
          remainderMode={remainderMode}
          onToggleRemainderMode={() => setRemainderMode((prev) => !prev)}
          onOpenVisualizer={() => setIsVisualizerOpen(true)}
          remainderResult={remainderResult}
        />

        {/* Calculator Keypad */}
        <Keypad
          onInput={handleInput}
          onClear={handleClear}
          onBackspace={handleBackspace}
          onCalculate={handleCalculate}
          onToggleSign={handleToggleSign}
          activeKey={activeKey}
        />

        {/* Quick Helper Banner */}
        <footer className={styles.kidFooter}>
          <div className={styles.footerHint}>
            <span>💡 <strong>Tip:</strong> Tap <strong>&ldquo;See Blocks 👀&rdquo;</strong> to count with stars or see place values!</span>
          </div>
        </footer>
      </main>

      {/* History Slide-out Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        history={history}
        onClose={() => setIsHistoryOpen(false)}
        onSelect={(item) => {
          setExpression(item.expression);
          setResult(item.result);
          setIsHistoryOpen(false);
        }}
        onClear={() => {
          setHistory([]);
          try {
            localStorage.removeItem('calc_history');
          } catch {
            // safe fallback
          }
        }}
      />

      {/* Visual Math & Place Value Drawer */}
      <VisualMathDrawer
        isOpen={isVisualizerOpen}
        onClose={() => setIsVisualizerOpen(false)}
        expression={expression}
        result={result}
      />

      {/* Times Table Modal */}
      <TimesTableModal
        isOpen={isTimesTableOpen}
        onClose={() => setIsTimesTableOpen(false)}
        onUseCalculation={(expr) => {
          setExpression(expr);
          setResult('');
          handleCalculate();
        }}
      />

      {/* Math Quest Mini Game Modal */}
      <MathQuestModal
        isOpen={isQuestOpen}
        onClose={() => setIsQuestOpen(false)}
        onEarnStars={addStars}
        triggerCelebration={triggerCelebration}
      />

      {/* Measurement Explorer Modal */}
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
