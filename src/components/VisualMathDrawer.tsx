'use client';

import React, { useState } from 'react';
import styles from './VisualMathDrawer.module.css';
import { getPlaceValueBreakdown } from '@/utils/mathEngine';

interface VisualMathDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  expression: string;
  result: string;
}

type CounterIcon = '⭐' | '🍎' | '🚀' | '🧁';

export const VisualMathDrawer: React.FC<VisualMathDrawerProps> = ({
  isOpen,
  onClose,
  expression,
  result,
}) => {
  const [selectedIcon, setSelectedIcon] = useState<CounterIcon>('⭐');

  if (!isOpen) return null;

  // Determine current number or expression structure
  const currentNumStr = result || expression || '0';
  const cleanNum = parseInt(currentNumStr.replace(/,/g, ''), 10);
  const placeValues = !isNaN(cleanNum) ? getPlaceValueBreakdown(cleanNum) : null;

  // Parse multiplication: e.g. "4 × 3" or "4 * 3"
  const multMatch = expression.match(/^(\d+)\s*(?:×|\*)\s*(\d+)$/);
  const multA = multMatch ? parseInt(multMatch[1], 10) : null;
  const multB = multMatch ? parseInt(multMatch[2], 10) : null;

  // Parse division: e.g. "12 ÷ 3"
  const divMatch = expression.match(/^(\d+)\s*(?:÷|\/)\s*(\d+)$/);
  const divA = divMatch ? parseInt(divMatch[1], 10) : null;
  const divB = divMatch ? parseInt(divMatch[2], 10) : null;

  // Parse addition: e.g. "5 + 4"
  const addMatch = expression.match(/^(\d+)\s*\+\s*(\d+)$/);
  const addA = addMatch ? parseInt(addMatch[1], 10) : null;
  const addB = addMatch ? parseInt(addMatch[2], 10) : null;

  const icons: CounterIcon[] = ['⭐', '🍎', '🚀', '🧁'];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <aside className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <span className={styles.titleEmoji}>👀</span>
            <div>
              <h3 className={styles.title}>Visual Math & Place Value</h3>
              <p className={styles.subtitle}>See math in real life! (Grade 3 Helper)</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className={styles.closeBtn} title="Close">
            ✕
          </button>
        </div>

        {/* Counter Icon Selector */}
        <div className={styles.iconSelectorBar}>
          <span className={styles.iconBarLabel}>Choose your counters:</span>
          <div className={styles.iconButtons}>
            {icons.map((ic) => (
              <button
                key={ic}
                type="button"
                onClick={() => setSelectedIcon(ic)}
                className={`${styles.iconBtn} ${selectedIcon === ic ? styles.iconBtnActive : ''}`}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.content}>
          {/* MULTIPLICATION ARRAY VISUALIZER (GRADE 3 HERO STANDARD) */}
          {multA !== null && multB !== null && multA <= 12 && multB <= 12 && (
            <div className={styles.card}>
              <h4 className={styles.cardTitle}>
                ✖️ Multiplication Array: {multA} × {multB} = {multA * multB}
              </h4>
              <p className={styles.cardExplainer}>
                {multA} rows of {multB} items each!
              </p>
              <div className={styles.arrayGrid}>
                {Array.from({ length: multA }).map((_, rIdx) => (
                  <div key={rIdx} className={styles.arrayRow}>
                    <span className={styles.rowLabel}>Row {rIdx + 1}:</span>
                    <div className={styles.rowItems}>
                      {Array.from({ length: multB }).map((_, cIdx) => (
                        <span key={cIdx} className={styles.arrayItem}>
                          {selectedIcon}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DIVISION FAIR SHARING VISUALIZER */}
          {divA !== null && divB !== null && divB > 0 && divA <= 48 && (
            <div className={styles.card}>
              <h4 className={styles.cardTitle}>
                ➗ Fair Sharing: {divA} ÷ {divB}
              </h4>
              <p className={styles.cardExplainer}>
                Sharing {divA} {selectedIcon} equally into {divB} groups!
              </p>
              <div className={styles.divisionGroups}>
                {Array.from({ length: divB }).map((_, gIdx) => {
                  const share = Math.floor(divA / divB);
                  return (
                    <div key={gIdx} className={styles.groupBasket}>
                      <span className={styles.groupLabel}>Group {gIdx + 1}</span>
                      <div className={styles.basketItems}>
                        {Array.from({ length: share }).map((_, iIdx) => (
                          <span key={iIdx} className={styles.arrayItem}>
                            {selectedIcon}
                          </span>
                        ))}
                      </div>
                      <span className={styles.basketCount}>{share}</span>
                    </div>
                  );
                })}
              </div>
              {divA % divB !== 0 && (
                <div className={styles.remainderNotice}>
                  <span>Leftover (Remainder):</span>
                  <strong>{divA % divB} {selectedIcon}</strong>
                </div>
              )}
            </div>
          )}

          {/* ADDITION GROUPS VISUALIZER */}
          {addA !== null && addB !== null && addA <= 25 && addB <= 25 && (
            <div className={styles.card}>
              <h4 className={styles.cardTitle}>
                ➕ Putting Groups Together: {addA} + {addB} = {addA + addB}
              </h4>
              <div className={styles.addVisualBox}>
                <div className={styles.addSet}>
                  <span className={styles.setTag}>First {addA}:</span>
                  <div className={styles.setIcons}>
                    {Array.from({ length: addA }).map((_, idx) => (
                      <span key={idx} className={styles.arrayItem}>{selectedIcon}</span>
                    ))}
                  </div>
                </div>
                <div className={styles.plusSymbol}>+</div>
                <div className={styles.addSet}>
                  <span className={styles.setTag}>Then {addB}:</span>
                  <div className={styles.setIcons}>
                    {Array.from({ length: addB }).map((_, idx) => (
                      <span key={idx} className={styles.arrayItem}>{selectedIcon}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PLACE VALUE BLOCKS (ONES, TENS, HUNDREDS, THOUSANDS) */}
          {placeValues && cleanNum > 0 && cleanNum < 100000 && (
            <div className={styles.card}>
              <h4 className={styles.cardTitle}>
                📦 Place Value for Number: {cleanNum}
              </h4>
              <div className={styles.wordsBanner}>
                <span>Spoken in words:</span>
                <strong>&ldquo;{placeValues.wordForm}&rdquo;</strong>
              </div>

              <div className={styles.placeValueGrid}>
                {placeValues.thousands > 0 && (
                  <div className={`${styles.pvColumn} ${styles.colThousands}`}>
                    <span className={styles.pvHeader}>Thousands</span>
                    <span className={styles.pvValue}>{placeValues.thousands}</span>
                    <span className={styles.pvExpanded}>{placeValues.thousands * 1000}</span>
                  </div>
                )}
                <div className={`${styles.pvColumn} ${styles.colHundreds}`}>
                  <span className={styles.pvHeader}>Hundreds</span>
                  <span className={styles.pvValue}>{placeValues.hundreds}</span>
                  <span className={styles.pvExpanded}>{placeValues.hundreds * 100}</span>
                </div>
                <div className={`${styles.pvColumn} ${styles.colTens}`}>
                  <span className={styles.pvHeader}>Tens</span>
                  <span className={styles.pvValue}>{placeValues.tens}</span>
                  <span className={styles.pvExpanded}>{placeValues.tens * 10}</span>
                </div>
                <div className={`${styles.pvColumn} ${styles.colOnes}`}>
                  <span className={styles.pvHeader}>Ones</span>
                  <span className={styles.pvValue}>{placeValues.ones}</span>
                  <span className={styles.pvExpanded}>{placeValues.ones}</span>
                </div>
              </div>

              <div className={styles.expandedFormBox}>
                <span>Expanded Form:</span>
                <code>{placeValues.expandedForm}</code>
              </div>
            </div>
          )}

          {/* GENERAL COUNTER IF SINGLE NUMBER < 50 */}
          {!multMatch && !divMatch && !addMatch && cleanNum > 0 && cleanNum <= 50 && (
            <div className={styles.card}>
              <h4 className={styles.cardTitle}>Counting {cleanNum} Items:</h4>
              <div className={styles.simpleCounterGrid}>
                {Array.from({ length: cleanNum }).map((_, idx) => (
                  <span key={idx} className={styles.countedItem} title={`Item ${idx + 1}`}>
                    {selectedIcon}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
