'use client';

import React, { useState } from 'react';
import styles from './UnitConverterModal.module.css';
import { UNIT_CATEGORIES, convertUnits } from '@/utils/unitConverter';

interface UnitConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertResult: (val: string) => void;
}

export const UnitConverterModal: React.FC<UnitConverterModalProps> = ({
  isOpen,
  onClose,
  onInsertResult,
}) => {
  const [selectedCatId, setSelectedCatId] = useState<string>('length');
  const activeCat = UNIT_CATEGORIES.find((c) => c.id === selectedCatId) || UNIT_CATEGORIES[0];

  const [fromUnitId, setFromUnitId] = useState<string>(activeCat.units[0]?.id || '');
  const [toUnitId, setToUnitId] = useState<string>(activeCat.units[1]?.id || activeCat.units[0]?.id || '');
  const [inputValue, setInputValue] = useState<string>('1');

  if (!isOpen) return null;

  const numVal = parseFloat(inputValue) || 0;
  const converted = convertUnits(numVal, fromUnitId, toUnitId, selectedCatId);

  const handleCategoryChange = (catId: string) => {
    setSelectedCatId(catId);
    const newCat = UNIT_CATEGORIES.find((c) => c.id === catId);
    if (newCat && newCat.units.length > 0) {
      setFromUnitId(newCat.units[0].id);
      setToUnitId(newCat.units[1] ? newCat.units[1].id : newCat.units[0].id);
    }
  };

  const handleSwap = () => {
    const temp = fromUnitId;
    setFromUnitId(toUnitId);
    setToUnitId(temp);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 3 21 3 21 8"></polyline>
              <line x1="4" y1="20" x2="21" y2="3"></line>
              <polyline points="21 16 21 21 16 21"></polyline>
              <line x1="15" y1="15" x2="21" y2="21"></line>
              <line x1="4" y1="4" x2="9" y2="9"></line>
            </svg>
            <h3>Unit Converter</h3>
          </div>
          <button type="button" onClick={onClose} className={styles.closeBtn}>✕</button>
        </div>

        {/* Category Tabs */}
        <div className={styles.catTabs}>
          {UNIT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryChange(cat.id)}
              className={`${styles.catTab} ${selectedCatId === cat.id ? styles.activeTab : ''}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className={styles.converterBody}>
          {/* From field */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>From</label>
            <div className={styles.inputRow}>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className={styles.inputField}
                placeholder="0"
              />
              <select
                value={fromUnitId}
                onChange={(e) => setFromUnitId(e.target.value)}
                className={styles.selectField}
              >
                {activeCat.units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.swapRow}>
            <button type="button" onClick={handleSwap} className={styles.swapBtn} title="Swap units">
              ⇅ Swap
            </button>
          </div>

          {/* To field */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>To</label>
            <div className={styles.inputRow}>
              <div className={styles.resultField}>{converted}</div>
              <select
                value={toUnitId}
                onChange={(e) => setToUnitId(e.target.value)}
                className={styles.selectField}
              >
                {activeCat.units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            onClick={() => {
              onInsertResult(`${converted}`);
              onClose();
            }}
            className={styles.insertBtn}
          >
            Use in Calculator
          </button>
        </div>
      </div>
    </div>
  );
};
