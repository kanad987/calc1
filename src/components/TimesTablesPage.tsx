'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import styles from './TimesTablesPage.module.css';
import { MascotBuddy } from './MascotBuddy';
import { Confetti } from './Confetti';
import { audioFeedback } from '@/utils/audioFeedback';
import { KidTheme } from './Calculator';

type TableMode = 'explorer' | 'matrix' | 'flashcards' | 'speed';

export const TimesTablesPage: React.FC = () => {
  const [theme, setTheme] = useState<KidTheme>('rainbow');
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState<boolean>(true);
  const [starsCount, setStarsCount] = useState<number>(10);
  const [mascotMessage, setMascotMessage] = useState<string>('Welcome to Times Tables Arena! ✖️');
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  // Active sub-mode
  const [mode, setMode] = useState<TableMode>('explorer');

  // Mode 1: Explorer state
  const [selectedTable, setSelectedTable] = useState<number>(3);
  const [hideAnswers, setHideAnswers] = useState<boolean>(false);
  const [revealedRows, setRevealedRows] = useState<Record<number, boolean>>({});

  // Mode 2: Matrix state
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  // Mode 3: Flashcard state
  const [quizCard, setQuizCard] = useState<{ a: number; b: number; options: number[] }>({
    a: 3,
    b: 4,
    options: [12, 10, 15, 14],
  });
  const [quizScore, setQuizScore] = useState<number>(0);

  // Mode 4: Speed challenge state
  const [isSpeedRunning, setIsSpeedRunning] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [speedScore, setSpeedScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [speedCard, setSpeedCard] = useState<{ a: number; b: number; options: number[] }>({
    a: 2,
    b: 5,
    options: [10, 8, 12, 15],
  });

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('calc_kid_theme') as KidTheme;
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
      }

      const savedStars = localStorage.getItem('calc_stars');
      if (savedStars) {
        setStarsCount(parseInt(savedStars, 10) || 10);
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

      const savedHigh = localStorage.getItem('calc_speed_highscore');
      if (savedHigh) {
        setHighScore(parseInt(savedHigh, 10) || 0);
      }
    } catch {
      // safe fallback
    }
  }, []);

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

  const toggleSpeech = () => {
    const nextVal = !isSpeechEnabled;
    setIsSpeechEnabled(nextVal);
    audioFeedback.speechEnabled = nextVal;
    if (nextVal) {
      audioFeedback.speakMath('Voice speech enabled!');
    }
    try {
      localStorage.setItem('calc_speech', `${nextVal}`);
    } catch {
      // safe fallback
    }
  };

  // Helper to generate flashcard options
  const generateFlashcard = useCallback((customTable?: number) => {
    const a = customTable || Math.floor(Math.random() * 12) + 1;
    const b = Math.floor(Math.random() * 12) + 1;
    const correct = a * b;

    const wrongs = new Set<number>();
    while (wrongs.size < 3) {
      const offset = (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1);
      const fake = correct + offset;
      if (fake > 0 && fake !== correct) {
        wrongs.add(fake);
      }
    }

    const options = [correct, ...Array.from(wrongs)].sort(() => Math.random() - 0.5);
    return { a, b, options };
  }, []);

  // Initialize flashcard
  useEffect(() => {
    setQuizCard(generateFlashcard(selectedTable));
  }, [generateFlashcard, selectedTable]);

  // Flashcard answer handler
  const handleAnswerQuiz = (selectedAnswer: number) => {
    const correct = quizCard.a * quizCard.b;
    if (selectedAnswer === correct) {
      audioFeedback.playFanfare();
      setShowConfetti(true);
      addStars(1);
      setQuizScore((prev) => prev + 1);
      setMascotMessage('Fantastic! That is 100% correct! ⭐ +1 Star!');
      audioFeedback.speakMath(`${quizCard.a} times ${quizCard.b} is indeed ${correct}!`);
      setTimeout(() => {
        setQuizCard(generateFlashcard());
      }, 700);
    } else {
      audioFeedback.playBoing();
      setMascotMessage(`Almost! Try again: what is ${quizCard.a} times ${quizCard.b}? 🤗`);
    }
  };

  // Speed Challenge Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSpeedRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isSpeedRunning && timeLeft === 0) {
      setIsSpeedRunning(false);
      audioFeedback.playFanfare();
      setShowConfetti(true);
      if (speedScore > highScore) {
        setHighScore(speedScore);
        try {
          localStorage.setItem('calc_speed_highscore', `${speedScore}`);
        } catch {}
        setMascotMessage(`🎉 New High Score: ${speedScore}! You are a Multiplication Master! 🏆`);
      } else {
        setMascotMessage(`Time's up! Great job solving ${speedScore} equations! 🌟`);
      }
    }
    return () => clearInterval(interval);
  }, [isSpeedRunning, timeLeft, speedScore, highScore]);

  const startSpeedChallenge = () => {
    setSpeedScore(0);
    setTimeLeft(60);
    setIsSpeedRunning(true);
    setSpeedCard(generateFlashcard());
    audioFeedback.playBubble(600);
    setMascotMessage('GO! Solve as many as you can before the clock runs out! ⏱️');
  };

  const handleSpeedAnswer = (ans: number) => {
    if (!isSpeedRunning) return;
    const correct = speedCard.a * speedCard.b;
    if (ans === correct) {
      audioFeedback.playBubble(650);
      setSpeedScore((prev) => prev + 1);
      addStars(1);
      setSpeedCard(generateFlashcard());
    } else {
      audioFeedback.playBoing();
      setSpeedCard(generateFlashcard());
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Background ambient orbs */}
      <div className="bg-ambient">
        <div className="ambient-orb orb-1"></div>
        <div className="ambient-orb orb-2"></div>
        <div className="ambient-orb orb-3"></div>
      </div>

      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

      <main className={styles.pageCard}>
        {/* Navigation & Header */}
        <header className={styles.topHeader}>
          <div className={styles.brandNav}>
            <Link href="/" className={styles.backBtn} title="Return to Main Calculator">
              ⬅️ <span>Calculator</span>
            </Link>

            <div className={styles.titleArea}>
              <div className={styles.themeLogo}>
                <span>
                  {theme === 'rainbow' && '🌈'}
                  {theme === 'space' && '🚀'}
                  {theme === 'candy' && '🍭'}
                  {theme === 'dino' && '🦕'}
                  {theme === 'jungle' && '🌴'}
                  {theme === 'bunny' && '🐰'}
                </span>
              </div>
              <div className={styles.titleText}>
                <h1>Times Tables Arena</h1>
                <span>Grade 3 Multiplication Academy ✖️</span>
              </div>
            </div>
          </div>

          <div className={styles.headerControls}>
            <button
              type="button"
              onClick={toggleSound}
              className={`${styles.actionBtn} ${isSoundEnabled ? styles.actionBtnActive : ''}`}
              title={isSoundEnabled ? 'Turn off sounds' : 'Turn on sounds'}
              aria-label="Toggle sound"
            >
              {isSoundEnabled ? '🔊' : '🔇'}
            </button>
            <button
              type="button"
              onClick={toggleSpeech}
              className={`${styles.actionBtn} ${isSpeechEnabled ? styles.actionBtnActive : ''}`}
              title={isSpeechEnabled ? 'Turn off voice readout' : 'Turn on voice readout'}
              aria-label="Toggle voice"
            >
              {isSpeechEnabled ? '🗣️' : '🤫'}
            </button>
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
              <option value="jungle">🌴 Jungle</option>
              <option value="bunny">🐰 Bunny</option>
            </select>
          </div>
        </header>

        {/* Mascot companion */}
        <MascotBuddy message={mascotMessage} starsCount={starsCount} theme={theme} />

        {/* Mode Selector Tabs */}
        <nav className={styles.modeTabs} aria-label="Times Table Activities">
          <button
            type="button"
            onClick={() => {
              setMode('explorer');
              audioFeedback.playBubble();
            }}
            className={`${styles.tabBtn} ${mode === 'explorer' ? styles.tabBtnActive : ''}`}
          >
            📋 Table Explorer
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('matrix');
              audioFeedback.playBubble();
            }}
            className={`${styles.tabBtn} ${mode === 'matrix' ? styles.tabBtnActive : ''}`}
          >
            🔢 12×12 Matrix
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('flashcards');
              audioFeedback.playBubble();
            }}
            className={`${styles.tabBtn} ${mode === 'flashcards' ? styles.tabBtnActive : ''}`}
          >
            🃏 Flashcards Quiz
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('speed');
              audioFeedback.playBubble();
            }}
            className={`${styles.tabBtn} ${mode === 'speed' ? styles.tabBtnActive : ''}`}
          >
            ⚡ Speed Challenge
          </button>
        </nav>

        {/* ========================================================
            Mode 1: Table Explorer (1-12 Pickers + Rows)
            ======================================================== */}
        {mode === 'explorer' && (
          <section className={styles.explorerSection}>
            <div className={styles.numberPickerBar}>
              <span className={styles.pickerLabel}>Choose Table:</span>
              <div className={styles.pickerGrid}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => {
                      setSelectedTable(n);
                      setRevealedRows({});
                      audioFeedback.playBubble(440 + n * 20);
                    }}
                    className={`${styles.numberBtn} ${selectedTable === n ? styles.numberBtnActive : ''}`}
                  >
                    {n}×
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.explorerToolbar}>
              <div className={styles.tableBanner}>
                <span>🌟</span>
                <span>
                  Practicing the <strong>{selectedTable}×</strong> multiplication table
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setHideAnswers((prev) => !prev);
                  setRevealedRows({});
                  audioFeedback.playBoing();
                }}
                className={styles.quizToggleBtn}
              >
                {hideAnswers ? '👀 Show All Answers' : '🙈 Hide & Quiz Me'}
              </button>
            </div>

            <div className={styles.rowsGrid}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((multiplier) => {
                const answer = selectedTable * multiplier;
                const isRevealed = revealedRows[multiplier] || !hideAnswers;

                return (
                  <div
                    key={multiplier}
                    className={styles.rowCard}
                    onClick={() => {
                      if (hideAnswers) {
                        setRevealedRows((prev) => ({ ...prev, [multiplier]: true }));
                        audioFeedback.playBubble(600);
                      }
                      audioFeedback.speakMath(`${selectedTable} times ${multiplier} equals ${answer}`);
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className={styles.rowEquation}>
                      <span>{selectedTable}</span>
                      <span>×</span>
                      <span>{multiplier}</span>
                      <span>=</span>
                    </div>

                    <div>
                      {isRevealed ? (
                        <span className={styles.rowAnswer}>{answer}</span>
                      ) : (
                        <span className={styles.hiddenAnswer}>Tap to reveal ❓</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        audioFeedback.speakMath(`${selectedTable} times ${multiplier} equals ${answer}`);
                      }}
                      className={styles.speakSmallBtn}
                      title="Speak row out loud"
                      aria-label="Speak row out loud"
                    >
                      🗣️
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ========================================================
            Mode 2: 12x12 Multiplication Matrix
            ======================================================== */}
        {mode === 'matrix' && (
          <section className={styles.matrixSection}>
            <div className={styles.matrixPrompt}>
              <span>
                Hover or tap any square to see row × column factors!
              </span>
              {hoveredRow && hoveredCol ? (
                <span style={{ color: 'var(--text-accent)', fontWeight: 900 }}>
                  {hoveredRow} × {hoveredCol} = {hoveredRow * hoveredCol}
                </span>
              ) : (
                <span>12×12 Chart</span>
              )}
            </div>

            <div className={styles.matrixTableWrap}>
              <table className={styles.matrixTable}>
                <thead>
                  <tr>
                    <th className={`${styles.matrixHeaderCell} ${styles.matrixCornerCell}`}>×</th>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((col) => (
                      <th
                        key={col}
                        className={`${styles.matrixHeaderCell} ${hoveredCol === col ? styles.matrixCellActive : ''}`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 12 }, (_, r) => r + 1).map((row) => (
                    <tr key={row}>
                      <th className={`${styles.matrixHeaderCell} ${hoveredRow === row ? styles.matrixCellActive : ''}`}>
                        {row}
                      </th>
                      {Array.from({ length: 12 }, (_, c) => c + 1).map((col) => {
                        const product = row * col;
                        const isMatch = hoveredRow === row && hoveredCol === col;
                        const isCrosshair = hoveredRow === row || hoveredCol === col;

                        return (
                          <td
                            key={col}
                            className={`${styles.matrixCell} ${isCrosshair ? styles.matrixCellHighlighted : ''} ${isMatch ? styles.matrixCellActive : ''}`}
                            onMouseEnter={() => {
                              setHoveredRow(row);
                              setHoveredCol(col);
                            }}
                            onClick={() => {
                              audioFeedback.playBubble(400 + product * 2);
                              audioFeedback.speakMath(`${row} times ${col} equals ${product}`);
                            }}
                            title={`${row} × ${col} = ${product}`}
                          >
                            {product}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ========================================================
            Mode 3: Flashcards Quiz
            ======================================================== */}
        {mode === 'flashcards' && (
          <section className={styles.quizCardContainer}>
            <div className={styles.scoreBanner}>
              <span>⭐ Solved Correctly:</span>
              <strong style={{ color: '#f59e0b', fontSize: '1.4rem' }}>{quizScore}</strong>
            </div>

            <div className={styles.flashcard}>
              <div className={styles.quizQuestion}>
                {quizCard.a} × {quizCard.b} = ?
              </div>
              <p className={styles.quizHint}>Tap the correct answer to score a star! ⭐</p>
            </div>

            <div className={styles.optionsGrid}>
              {quizCard.options.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleAnswerQuiz(opt)}
                  className={styles.optionBtn}
                >
                  {opt}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================
            Mode 4: Speed Challenge (60s Timer)
            ======================================================== */}
        {mode === 'speed' && (
          <section className={styles.speedContainer}>
            <div className={styles.scoreBanner}>
              <span>🏆 High Score: <strong>{highScore}</strong></span>
              <span>⚡ Current Score: <strong style={{ color: '#10b981' }}>{speedScore}</strong></span>
            </div>

            {!isSpeedRunning ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: 460 }}>
                  Ready for a 60-second math sprint? Test your quick multiplication reflexes and see how many questions you can answer before the timer hits zero!
                </p>
                <button
                  type="button"
                  onClick={startSpeedChallenge}
                  className={styles.startChallengeBtn}
                >
                  🚀 Start 60s Challenge!
                </button>
              </div>
            ) : (
              <>
                <div className={styles.timerRing}>
                  {timeLeft}s
                </div>

                <div className={styles.speedQuestion}>
                  {speedCard.a} × {speedCard.b} = ?
                </div>

                <div className={styles.optionsGrid}>
                  {speedCard.options.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSpeedAnswer(opt)}
                      className={styles.optionBtn}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </>
            )}
          </section>
        )}
      </main>
    </div>
  );
};
