export interface UnitCategory {
  id: string;
  name: string;
  emoji: string;
  units: { id: string; name: string; toBase: (val: number) => number; fromBase: (val: number) => number }[];
  funFact: string;
}

export const UNIT_CATEGORIES: UnitCategory[] = [
  {
    id: 'length',
    name: 'Length & Height',
    emoji: '📏',
    funFact: '1 Meter = 100 Centimeters! (About the height of a guitar or big dog! 🎸)',
    units: [
      { id: 'cm', name: 'Centimeters (cm)', toBase: (v) => v / 100, fromBase: (v) => v * 100 },
      { id: 'm', name: 'Meters (m)', toBase: (v) => v, fromBase: (v) => v },
      { id: 'km', name: 'Kilometers (km)', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: 'in', name: 'Inches (in)', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
      { id: 'ft', name: 'Feet (ft)', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
    ],
  },
  {
    id: 'mass',
    name: 'Weight',
    emoji: '⚖️',
    funFact: '1 Kilogram = 1,000 Grams! (About the weight of a tasty pineapple! 🍍)',
    units: [
      { id: 'g', name: 'Grams (g)', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: 'kg', name: 'Kilograms (kg)', toBase: (v) => v, fromBase: (v) => v },
      { id: 'oz', name: 'Ounces (oz)', toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },
      { id: 'lb', name: 'Pounds (lbs)', toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592 },
    ],
  },
  {
    id: 'liquid',
    name: 'Liquid & Cups',
    emoji: '🥛',
    funFact: '1 Liter = 1,000 Milliliters! (Fills about 4 full juice cups! 🧃)',
    units: [
      { id: 'ml', name: 'Milliliters (mL)', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: 'l', name: 'Liters (L)', toBase: (v) => v, fromBase: (v) => v },
      { id: 'cup', name: 'Cups (cup)', toBase: (v) => v * 0.24, fromBase: (v) => v / 0.24 },
    ],
  },
  {
    id: 'time',
    name: 'Time',
    emoji: '⏰',
    funFact: '1 Hour = 60 Minutes = 3,600 Seconds! ⏱️',
    units: [
      { id: 'sec', name: 'Seconds (s)', toBase: (v) => v / 60, fromBase: (v) => v * 60 },
      { id: 'min', name: 'Minutes (min)', toBase: (v) => v, fromBase: (v) => v },
      { id: 'hr', name: 'Hours (hr)', toBase: (v) => v * 60, fromBase: (v) => v / 60 },
      { id: 'day', name: 'Days (day)', toBase: (v) => v * 1440, fromBase: (v) => v / 1440 },
    ],
  },
];

export function convertUnits(val: number, fromUnitId: string, toUnitId: string, categoryId: string): number {
  if (isNaN(val)) return 0;
  const category = UNIT_CATEGORIES.find((c) => c.id === categoryId);
  if (!category) return val;

  const fromUnit = category.units.find((u) => u.id === fromUnitId);
  const toUnit = category.units.find((u) => u.id === toUnitId);

  if (!fromUnit || !toUnit) return val;

  const baseVal = fromUnit.toBase(val);
  const convertedVal = toUnit.fromBase(baseVal);

  return Number(Math.round(Number(convertedVal + 'e4')) + 'e-4');
}
