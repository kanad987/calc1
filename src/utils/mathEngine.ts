// Mathematical Expression Evaluator with Grade 3 Kids features (Remainder division, Place values, Word conversion, Quiz generator)

export type AngleMode = 'DEG' | 'RAD';

export interface EvaluationResult {
  success: boolean;
  value?: number;
  formatted?: string;
  error?: string;
  remainderResult?: {
    quotient: number;
    remainder: number;
    text: string;
  };
}

// Factorial helper
export function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n > 170) return Infinity;
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

// Convert expression tokens to clean evaluation string
export function evaluateMathExpression(
  expr: string,
  angleMode: AngleMode = 'DEG',
  enableRemainderDivision: boolean = false
): EvaluationResult {
  try {
    if (!expr || expr.trim() === '') {
      return { success: true, value: 0, formatted: '0' };
    }

    // Check for Grade 3 Remainder Division: e.g. "17 ÷ 5" or "17 / 5" or "17 R 5"
    const simpleDivisionMatch = expr.trim().match(/^(\d+)\s*(?:÷|\/|R)\s*(\d+)$/i);
    let remainderResult: { quotient: number; remainder: number; text: string } | undefined;

    if (simpleDivisionMatch) {
      const dividend = parseInt(simpleDivisionMatch[1], 10);
      const divisor = parseInt(simpleDivisionMatch[2], 10);
      if (divisor === 0) {
        return { success: false, error: 'Cannot divide by 0! 😮' };
      }
      const quotient = Math.floor(dividend / divisor);
      const remainder = dividend % divisor;
      const text = remainder === 0 ? `${quotient}` : `${quotient} R ${remainder}`;
      remainderResult = { quotient, remainder, text };

      // If user specifically pressed 'R' or enabled remainder division, return remainder text directly!
      if (enableRemainderDivision || expr.includes('R') || expr.includes('r')) {
        return {
          success: true,
          value: quotient,
          formatted: text,
          remainderResult,
        };
      }
    }

    let sanitized = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/π/g, `${Math.PI}`)
      .replace(/e(?![0-9a-zA-Z_])/g, `${Math.E}`);

    // Handle percentage
    sanitized = sanitized.replace(/(\d+(\.\d+)?)%/g, '($1 * 0.01)');

    // Handle factorial
    const factRegex = /(\d+(\.\d+)?|\([^()]+\))!/g;
    while (factRegex.test(sanitized)) {
      sanitized = sanitized.replace(factRegex, (match, p1) => {
        let val: number;
        if (p1.startsWith('(') && p1.endsWith(')')) {
          val = evaluateMathExpression(p1.slice(1, -1), angleMode).value || 0;
        } else {
          val = parseFloat(p1);
        }
        return `${factorial(val)}`;
      });
    }

    // Power operator ^ -> **
    sanitized = sanitized.replace(/\^/g, '**');

    const degToRad = (x: number) => (x * Math.PI) / 180;
    const radToDeg = (x: number) => (x * 180) / Math.PI;

    const context = {
      sin: (x: number) => {
        const val = angleMode === 'DEG' ? degToRad(x) : x;
        const res = Math.sin(val);
        return Math.abs(res) < 1e-15 ? 0 : res;
      },
      cos: (x: number) => {
        const val = angleMode === 'DEG' ? degToRad(x) : x;
        const res = Math.cos(val);
        return Math.abs(res) < 1e-15 ? 0 : res;
      },
      tan: (x: number) => {
        const val = angleMode === 'DEG' ? degToRad(x) : x;
        if (Math.abs(Math.cos(val)) < 1e-15) throw new Error('Undefined');
        const res = Math.tan(val);
        return Math.abs(res) < 1e-15 ? 0 : res;
      },
      asin: (x: number) => {
        const res = Math.asin(x);
        return angleMode === 'DEG' ? radToDeg(res) : res;
      },
      acos: (x: number) => {
        const res = Math.acos(x);
        return angleMode === 'DEG' ? radToDeg(res) : res;
      },
      atan: (x: number) => {
        const res = Math.atan(x);
        return angleMode === 'DEG' ? radToDeg(res) : res;
      },
      sqrt: (x: number) => {
        if (x < 0) throw new Error('Invalid Input');
        return Math.sqrt(x);
      },
      cbrt: (x: number) => Math.cbrt(x),
      log: (x: number) => {
        if (x <= 0) throw new Error('Invalid Input');
        return Math.log10(x);
      },
      ln: (x: number) => {
        if (x <= 0) throw new Error('Invalid Input');
        return Math.log(x);
      },
      abs: (x: number) => Math.abs(x),
      exp: (x: number) => Math.exp(x),
      PI: Math.PI,
      E: Math.E,
    };

    const executableExpr = sanitized
      .replace(/\bsin\(/g, 'context.sin(')
      .replace(/\bcos\(/g, 'context.cos(')
      .replace(/\btan\(/g, 'context.tan(')
      .replace(/\basin\(/g, 'context.asin(')
      .replace(/\bacos\(/g, 'context.acos(')
      .replace(/\batan\(/g, 'context.atan(')
      .replace(/\bsqrt\(/g, 'context.sqrt(')
      .replace(/\bcbrt\(/g, 'context.cbrt(')
      .replace(/\blog\(/g, 'context.log(')
      .replace(/\bln\(/g, 'context.ln(')
      .replace(/\babs\(/g, 'context.abs(')
      .replace(/\bexp\(/g, 'context.exp(');

    const fn = new Function('context', `"use strict"; return (${executableExpr});`);
    const rawVal = fn(context);

    if (rawVal === undefined || isNaN(rawVal)) {
      return { success: false, error: 'Oops! Check your numbers 😊' };
    }

    if (!isFinite(rawVal)) {
      return { success: false, error: 'Cannot divide by 0! 😮' };
    }

    const rounded = Number(Math.round(Number(rawVal + 'e12')) + 'e-12');
    const formatted = formatNumber(rounded);

    return {
      success: true,
      value: rounded,
      formatted,
      remainderResult,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Oops! Check your numbers 😊';
    return { success: false, error: errorMsg };
  }
}

export function formatNumber(num: number): string {
  if (isNaN(num)) return 'NaN';
  if (!isFinite(num)) return 'Infinity';

  const absNum = Math.abs(num);
  if ((absNum >= 1e12 || (absNum < 1e-6 && absNum > 0)) && absNum !== 0) {
    return num.toExponential(6).replace(/e\+?/, 'e');
  }

  const parts = num.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

// Grade 3 Place Value Decomposition (Thousands, Hundreds, Tens, Ones)
export interface PlaceValueInfo {
  thousands: number;
  hundreds: number;
  tens: number;
  ones: number;
  expandedForm: string;
  wordForm: string;
}

export function getPlaceValueBreakdown(val: number): PlaceValueInfo | null {
  if (isNaN(val) || !isFinite(val) || val < 0 || val > 99999 || !Number.isInteger(val)) {
    return null;
  }

  const thousands = Math.floor((val % 100000) / 1000);
  const hundreds = Math.floor((val % 1000) / 100);
  const tens = Math.floor((val % 100) / 10);
  const ones = val % 10;

  const parts: string[] = [];
  if (thousands > 0) parts.push(`${thousands * 1000}`);
  if (hundreds > 0) parts.push(`${hundreds * 100}`);
  if (tens > 0) parts.push(`${tens * 10}`);
  if (ones > 0 || parts.length === 0) parts.push(`${ones}`);

  const expandedForm = parts.join(' + ') || '0';
  const wordForm = numberToWords(val);

  return {
    thousands,
    hundreds,
    tens,
    ones,
    expandedForm,
    wordForm,
  };
}

// Convert numbers up to 999,999 to English words for Grade 3 reading practice
export function numberToWords(n: number): string {
  if (isNaN(n)) return '';
  if (n === 0) return 'zero';
  if (n < 0) return 'negative ' + numberToWords(-n);

  const onesNames = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  const teensNames = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tensNames = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  function helper(num: number): string {
    if (num === 0) return '';
    if (num < 10) return onesNames[num];
    if (num < 20) return teensNames[num - 10];
    if (num < 100) {
      const remainder = num % 10;
      return tensNames[Math.floor(num / 10)] + (remainder > 0 ? '-' + onesNames[remainder] : '');
    }
    const rem = num % 100;
    return onesNames[Math.floor(num / 100)] + ' hundred' + (rem > 0 ? ' ' + helper(rem) : '');
  }

  if (n >= 1000) {
    const thousandsPart = Math.floor(n / 1000);
    const rem = n % 1000;
    return helper(thousandsPart) + ' thousand' + (rem > 0 ? ' ' + helper(rem) : '');
  }

  return helper(n);
}

// Grade 3 Math Quiz Generator (Addition, Subtraction, Multiplication, Division)
export interface Grade3QuizProblem {
  id: string;
  category: 'addition' | 'subtraction' | 'multiplication' | 'division';
  question: string;
  answer: number;
  options: number[];
  hint: string;
  badge: string;
}

export function generateGrade3Problem(forcedCategory?: 'addition' | 'subtraction' | 'multiplication' | 'division'): Grade3QuizProblem {
  const categories: Array<'addition' | 'subtraction' | 'multiplication' | 'division'> = [
    'multiplication',
    'addition',
    'subtraction',
    'division',
  ];
  const cat = forcedCategory || categories[Math.floor(Math.random() * categories.length)];

  let question = '';
  let answer = 0;
  let hint = '';
  let badge = '⭐ Star Math';

  if (cat === 'multiplication') {
    // Grade 3 times tables 2 through 10
    const a = Math.floor(Math.random() * 9) + 2; // 2 to 10
    const b = Math.floor(Math.random() * 10) + 1; // 1 to 10
    answer = a * b;
    question = `${a} × ${b}`;
    hint = `Think of ${a} groups of ${b}!`;
    badge = '✖️ Times Table';
  } else if (cat === 'division') {
    // Grade 3 division facts
    const b = Math.floor(Math.random() * 8) + 2; // 2 to 9
    const ans = Math.floor(Math.random() * 10) + 1; // 1 to 10
    const a = b * ans;
    answer = ans;
    question = `${a} ÷ ${b}`;
    hint = `What times ${b} equals ${a}?`;
    badge = '➗ Fair Sharing';
  } else if (cat === 'subtraction') {
    // 2-digit to 3-digit subtraction
    const a = Math.floor(Math.random() * 400) + 100;
    const b = Math.floor(Math.random() * (a - 20)) + 15;
    answer = a - b;
    question = `${a} − ${b}`;
    hint = `Subtract the ones, then the tens!`;
    badge = '➖ Subtraction';
  } else {
    // Addition
    const a = Math.floor(Math.random() * 300) + 25;
    const b = Math.floor(Math.random() * 300) + 25;
    answer = a + b;
    question = `${a} + ${b}`;
    hint = `Add ones, then tens, then hundreds!`;
    badge = '➕ Addition';
  }

  // Generate 4 plausible options
  const optionSet = new Set<number>([answer]);
  while (optionSet.size < 4) {
    const offset = (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1) * (cat === 'multiplication' ? 2 : 10);
    const candidate = answer + offset;
    if (candidate > 0 && candidate !== answer) {
      optionSet.add(candidate);
    } else {
      optionSet.add(answer + optionSet.size * 2);
    }
  }

  const options = Array.from(optionSet).sort(() => Math.random() - 0.5);

  return {
    id: `${Date.now()}-${Math.random()}`,
    category: cat,
    question,
    answer,
    options,
    hint,
    badge,
  };
}
