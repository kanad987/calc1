'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import styles from './MathQuestPage.module.css';
import { MascotBuddy } from './MascotBuddy';
import { Confetti } from './Confetti';
import { generateGrade3Problem, Grade3QuizProblem } from '@/utils/mathEngine';
import { audioFeedback } from '@/utils/audioFeedback';
import { KidTheme } from './Calculator';

type QuizCategory = 'all' | 'multiplication' | 'division' | 'addition' | 'subtraction';
type DifficultyLevel = 'easy' | 'medium' | 'boss';

const DEFAULT_PROBLEM: Grade3QuizProblem = {
  id: 'default-grade3-prob',
  question: '7 × 8 = ?',
  answer: 56,
  options: [48, 54, 56, 64],
  category: 'multiplication',
  hint: 'Think of 7 groups of 8 (or 8 × 7)',
  badge: '✖️ Times Master',
};

export const MathQuestPage: React.FC = () => {
  const [theme, setTheme] = useState<KidTheme>('rainbow');
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState<boolean>(true);
  const [starsCount, setStarsCount] = useState<number>(10);
  const [mascotMessage, setMascotMessage] = useState<string>('Welcome to the Math Quest Arena! 🏆');
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  // Filters & State
  const [category, setCategory] = useState<QuizCategory>('all');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [currentProblem, setCurrentProblem] = useState<Grade3QuizProblem>(DEFAULT_PROBLEM);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [sessionStars, setSessionStars] = useState<number>(0);

  // Initialize from LocalStorage
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

      const savedBestStreak = localStorage.getItem('calc_best_streak');
      if (savedBestStreak) {
        setBestStreak(parseInt(savedBestStreak, 10) || 0);
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

  const addStars = useCallback((count: number) => {
    setStarsCount((prev) => {
      const updated = prev + count;
      try {
        localStorage.setItem('calc_stars', `${updated}`);
      } catch {}
      return updated;
    });
  }, []);

  const handleThemeChange = (newTheme: KidTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    audioFeedback.playBubble(500);
    try {
      localStorage.setItem('calc_kid_theme', newTheme);
    } catch {}
  };

  const toggleSound = () => {
    const nextVal = !isSoundEnabled;
    setIsSoundEnabled(nextVal);
    audioFeedback.soundEnabled = nextVal;
    try {
      localStorage.setItem('calc_sound', `${nextVal}`);
    } catch {}
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
    } catch {}
  };

  // Generate difficulty-adjusted questions
  const loadNewProblem = useCallback((targetCat?: QuizCategory) => {
    const activeCat = targetCat ?? category;
    const forced = activeCat === 'all' ? undefined : activeCat;
    const prob = generateGrade3Problem(forced);

    // Apply difficulty modifiers if Boss mode
    if (difficulty === 'boss' && prob.category === 'multiplication') {
      const a = Math.floor(Math.random() * 4) + 11; // 11 to 14
      const b = Math.floor(Math.random() * 8) + 6;  // 6 to 13
      const answer = a * b;
      const wrongs = new Set<number>();
      while (wrongs.size < 3) {
        const fake = answer + (Math.floor(Math.random() * 6) + 1) * (Math.random() > 0.5 ? 1 : -1);
        if (fake > 0 && fake !== answer) wrongs.add(fake);
      }
      prob.question = `${a} × ${b}`;
      prob.answer = answer;
      prob.options = [answer, ...Array.from(wrongs)].sort(() => Math.random() - 0.5);
      prob.badge = '🐉 Boss Dragon Math';
      prob.hint = `Break it down: (${a} × 10) + (${a} × ${b - 10})`;
    }

    setCurrentProblem(prob);
    setSelectedAnswer(null);
    setIsAnswered(false);

    // Read problem if speech enabled
    audioFeedback.speakMath(`What is ${prob.question}`);
  }, [category, difficulty]);

  useEffect(() => {
    loadNewProblem();
  }, [loadNewProblem]);

  const handleSelectAnswer = (chosen: number) => {
    if (isAnswered) return;
    setSelectedAnswer(chosen);
    setIsAnswered(true);

    const isCorrect = chosen === currentProblem.answer;

    if (isCorrect) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > bestStreak) {
        setBestStreak(nextStreak);
        try {
          localStorage.setItem('calc_best_streak', `${nextStreak}`);
        } catch {}
      }

      const starsWon = difficulty === 'boss' ? 5 : (nextStreak >= 3 ? 3 : 2);
      setSessionStars((prev) => prev + starsWon);
      addStars(starsWon);

      audioFeedback.playFanfare();
      setShowConfetti(true);

      const cheeringQuotes = [
        `Phenomenal! +${starsWon} Stars earned! ⭐`,
        'Streak is ON FIRE! Keep hopping! 🔥',
        'Math Champion alert! That is 100% right! 🏆',
        'Brilliant calculation! You crushed it! 🌟',
      ];
      setMascotMessage(cheeringQuotes[Math.floor(Math.random() * cheeringQuotes.length)]);
      audioFeedback.speakMath(`Correct! ${currentProblem.question} equals ${currentProblem.answer}`);
    } else {
      setStreak(0);
      audioFeedback.playError();
      setMascotMessage(`Oopsie! Don't worry, you'll nail the next one! 🤗`);
      audioFeedback.speakMath(`Nice try! The correct answer is ${currentProblem.answer}`);
    }
  };

  const handleNextQuestion = () => {
    audioFeedback.playBubble();
    loadNewProblem();
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
                <h1>Kids Math Quest</h1>
                <span>Solve Challenges & Level Up ⭐</span>
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

        {/* Mascot Companion Buddy */}
        <MascotBuddy message={mascotMessage} starsCount={starsCount} theme={theme} />

        {/* Filter Bar (Categories & Difficulty) */}
        <div className={styles.filterRow}>
          <div className={styles.categoryTabs}>
            {(['all', 'multiplication', 'division', 'addition', 'subtraction'] as QuizCategory[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setCategory(cat);
                  loadNewProblem(cat);
                  audioFeedback.playBubble();
                }}
                className={`${styles.catBtn} ${category === cat ? styles.catBtnActive : ''}`}
              >
                {cat === 'all' && '🎲 Mixed Adventure'}
                {cat === 'multiplication' && '✖️ Multiplication'}
                {cat === 'division' && '➗ Division'}
                {cat === 'addition' && '➕ Addition'}
                {cat === 'subtraction' && '➖ Subtraction'}
              </button>
            ))}
          </div>

          <div className={styles.diffBar}>
            <span className={styles.diffLabel}>Challenge Level:</span>
            <div className={styles.diffButtons}>
              <button
                type="button"
                onClick={() => {
                  setDifficulty('easy');
                  audioFeedback.playBubble();
                }}
                className={`${styles.diffBtn} ${difficulty === 'easy' ? styles.diffBtnActive : ''}`}
              >
                🌱 Easy
              </button>
              <button
                type="button"
                onClick={() => {
                  setDifficulty('medium');
                  audioFeedback.playBubble();
                }}
                className={`${styles.diffBtn} ${difficulty === 'medium' ? styles.diffBtnActive : ''}`}
              >
                ⚡ Medium
              </button>
              <button
                type="button"
                onClick={() => {
                  setDifficulty('boss');
                  audioFeedback.playBoing();
                }}
                className={`${styles.diffBtn} ${difficulty === 'boss' ? styles.diffBtnActive : ''}`}
              >
                🐉 Boss Level (+5⭐)
              </button>
            </div>
          </div>
        </div>

        {/* Scoreboard */}
        <div className={styles.scoreboard}>
          <div className={styles.scoreCard}>
            <span className={styles.scoreIcon}>⭐</span>
            <div className={styles.scoreInfo}>
              <span className={styles.scoreTitle}>Stars Today</span>
              <span className={styles.scoreNum}>{sessionStars}</span>
            </div>
          </div>

          <div className={styles.scoreCard}>
            <span className={styles.scoreIcon}>🔥</span>
            <div className={styles.scoreInfo}>
              <span className={styles.scoreTitle}>Current Streak</span>
              <span className={styles.scoreNum}>{streak}</span>
            </div>
          </div>

          <div className={styles.scoreCard}>
            <span className={styles.scoreIcon}>🏅</span>
            <div className={styles.scoreInfo}>
              <span className={styles.scoreTitle}>Best Record</span>
              <span className={styles.scoreNum}>{bestStreak}</span>
            </div>
          </div>
        </div>

        {/* Quest Arena Stage */}
        <section className={styles.questArena}>
          <div className={styles.badgePill}>{currentProblem.badge}</div>

          <div className={styles.promptRow}>
            <span>What is</span>
            <strong className={styles.equationText}>{currentProblem.question}</strong>
            <span>?</span>
          </div>

          {/* Options Grid */}
          <div className={styles.optionsGrid}>
            {currentProblem.options.map((opt) => {
              const isSelected = selectedAnswer === opt;
              const isCorrectAnswer = opt === currentProblem.answer;

              let btnClass = styles.optionBtn;
              if (isAnswered) {
                if (isCorrectAnswer) {
                  btnClass = `${styles.optionBtn} ${styles.correctOption}`;
                } else if (isSelected) {
                  btnClass = `${styles.optionBtn} ${styles.wrongOption}`;
                }
              }

              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleSelectAnswer(opt)}
                  disabled={isAnswered}
                  className={btnClass}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Feedback & Next Button */}
          {isAnswered && (
            <div className={styles.feedbackBox}>
              {selectedAnswer === currentProblem.answer ? (
                <div className={`${styles.feedbackBanner} ${styles.successBanner}`}>
                  <span className={styles.feedbackEmoji}>🌟🎉</span>
                  <div>
                    <h4 className={styles.feedbackTitle}>Superstar! That is correct!</h4>
                    <p className={styles.feedbackDesc}>
                      +{difficulty === 'boss' ? '5' : (streak >= 3 ? '3' : '2')} Stars earned!{' '}
                      {streak >= 3 && '🔥 Streak Bonus Active!'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className={`${styles.feedbackBanner} ${styles.failureBanner}`}>
                  <span className={styles.feedbackEmoji}>💡</span>
                  <div>
                    <h4 className={styles.feedbackTitle}>
                      Nice try! The answer is {currentProblem.answer}
                    </h4>
                    <p className={styles.feedbackDesc}>{currentProblem.hint}</p>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleNextQuestion}
                className={styles.nextBtn}
              >
                Next Problem ➔
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
