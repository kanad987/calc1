'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './MathQuestModal.module.css';
import { generateGrade3Problem, Grade3QuizProblem } from '@/utils/mathEngine';
import { audioFeedback } from '@/utils/audioFeedback';

interface MathQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEarnStars: (count: number) => void;
  triggerCelebration: () => void;
}

type QuizCategory = 'all' | 'multiplication' | 'division' | 'addition' | 'subtraction';

const DEFAULT_PROBLEM: Grade3QuizProblem = {
  id: 'default-grade3-prob',
  question: '7 × 8 = ?',
  answer: 56,
  options: [48, 54, 56, 64],
  category: 'multiplication',
  hint: 'Think of 7 groups of 8 (or 8 × 7)',
  badge: '✖️ Times Master',
};

export const MathQuestModal: React.FC<MathQuestModalProps> = ({
  isOpen,
  onClose,
  onEarnStars,
  triggerCelebration,
}) => {
  const [category, setCategory] = useState<QuizCategory>('all');
  const [currentProblem, setCurrentProblem] = useState<Grade3QuizProblem>(DEFAULT_PROBLEM);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [sessionStars, setSessionStars] = useState<number>(0);

  const loadNewProblem = useCallback((targetCat?: QuizCategory) => {
    const activeCat = targetCat ?? category;
    const forced = activeCat === 'all' ? undefined : activeCat;
    const prob = generateGrade3Problem(forced);
    setCurrentProblem(prob);
    setSelectedAnswer(null);
    setIsAnswered(false);
  }, [category]);

  useEffect(() => {
    if (isOpen) {
      queueMicrotask(() => {
        loadNewProblem();
      });
    }
  }, [isOpen, loadNewProblem]);

  if (!isOpen || !currentProblem) return null;

  const handleSelectAnswer = (chosen: number) => {
    if (isAnswered) return;
    setSelectedAnswer(chosen);
    setIsAnswered(true);

    const isCorrect = chosen === currentProblem.answer;

    if (isCorrect) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > bestStreak) setBestStreak(nextStreak);
      
      const starsWon = nextStreak >= 3 ? 3 : 2;
      setSessionStars((prev) => prev + starsWon);
      onEarnStars(starsWon);
      
      audioFeedback.playFanfare();
      triggerCelebration();
    } else {
      setStreak(0);
      audioFeedback.playError();
    }
  };

  const handleNextQuestion = () => {
    audioFeedback.playBubble();
    loadNewProblem();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <aside className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <span className={styles.titleIcon}>🏆</span>
            <div>
              <h3 className={styles.title}>Grade 3 Math Quest</h3>
              <p className={styles.subtitle}>Solve puzzles, build streaks, and earn stars!</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className={styles.closeBtn} title="Close">
            ✕
          </button>
        </div>

        {/* Category Tabs */}
        <div className={styles.categoryBar}>
          {(['all', 'multiplication', 'division', 'addition', 'subtraction'] as QuizCategory[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setCategory(cat);
                loadNewProblem(cat);
                audioFeedback.playBubble();
              }}
              className={`${styles.catTab} ${category === cat ? styles.catTabActive : ''}`}
            >
              {cat === 'all' && '🎲 Mix'}
              {cat === 'multiplication' && '✖️ Times'}
              {cat === 'division' && '➗ Divide'}
              {cat === 'addition' && '➕ Add'}
              {cat === 'subtraction' && '➖ Minus'}
            </button>
          ))}
        </div>

        {/* Quest Scoreboard */}
        <div className={styles.scoreboard}>
          <div className={styles.scoreItem}>
            <span className={styles.scoreIcon}>⭐</span>
            <div className={styles.scoreText}>
              <span className={styles.scoreLabel}>Stars Today</span>
              <strong className={styles.scoreValue}>{sessionStars}</strong>
            </div>
          </div>

          <div className={styles.scoreItem}>
            <span className={styles.scoreIcon}>🔥</span>
            <div className={styles.scoreText}>
              <span className={styles.scoreLabel}>Current Streak</span>
              <strong className={styles.scoreValue}>{streak}</strong>
            </div>
          </div>

          <div className={styles.scoreItem}>
            <span className={styles.scoreIcon}>🏅</span>
            <div className={styles.scoreText}>
              <span className={styles.scoreLabel}>Best Streak</span>
              <strong className={styles.scoreValue}>{bestStreak}</strong>
            </div>
          </div>
        </div>

        {/* Question Area */}
        <div className={styles.questionContainer}>
          <div className={styles.questionBadge}>{currentProblem.badge}</div>
          <div className={styles.questionPrompt}>
            <span>What is</span>
            <strong className={styles.questionEquation}>{currentProblem.question}</strong>
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

          {/* Result Feedback Banner */}
          {isAnswered && (
            <div className={styles.feedbackBanner}>
              {selectedAnswer === currentProblem.answer ? (
                <div className={styles.feedbackSuccess}>
                  <span className={styles.feedbackEmoji}>🌟🎉</span>
                  <div>
                    <strong>Superstar! That is correct!</strong>
                    <p>+2 Stars earned! {streak >= 3 && '🔥 Streak Bonus +1!'}</p>
                  </div>
                </div>
              ) : (
                <div className={styles.feedbackFailure}>
                  <span className={styles.feedbackEmoji}>💡</span>
                  <div>
                    <strong>Nice try! The answer is {currentProblem.answer}</strong>
                    <p>{currentProblem.hint}</p>
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
        </div>
      </aside>
    </div>
  );
};
