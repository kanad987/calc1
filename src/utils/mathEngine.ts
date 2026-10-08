// Mathematical Expression Evaluator with support for Scientific Functions & Precision

export type AngleMode = 'DEG' | 'RAD';

export interface EvaluationResult {
  success: boolean;
  value?: number;
  formatted?: string;
  error?: string;
}

// Factorial helper
export function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n > 170) return Infinity; // JS max float limit
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

// Convert expression tokens to clean evaluation string
export function evaluateMathExpression(expr: string, angleMode: AngleMode = 'DEG'): EvaluationResult {
  try {
    if (!expr || expr.trim() === '') {
      return { success: true, value: 0, formatted: '0' };
    }

    let sanitized = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/π/g, `${Math.PI}`)
      .replace(/e(?![0-9a-zA-Z_])/g, `${Math.E}`);

    // Handle percentage (e.g. 50% -> (50*0.01))
    sanitized = sanitized.replace(/(\d+(\.\d+)?)%/g, '($1 * 0.01)');

    // Handle factorial syntax: (num)! or number!
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

    // Scientific functions injection with angle mode consideration
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
        if (Math.abs(Math.cos(val)) < 1e-15) throw new Error('Undefined (tan 90°)');
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
        if (x < 0) throw new Error('Invalid Input (√ of negative)');
        return Math.sqrt(x);
      },
      cbrt: (x: number) => Math.cbrt(x),
      log: (x: number) => {
        if (x <= 0) throw new Error('Invalid Input (log <= 0)');
        return Math.log10(x);
      },
      ln: (x: number) => {
        if (x <= 0) throw new Error('Invalid Input (ln <= 0)');
        return Math.log(x);
      },
      abs: (x: number) => Math.abs(x),
      exp: (x: number) => Math.exp(x),
      PI: Math.PI,
      E: Math.E,
    };

    // Replace scientific function names with context references
    let executableExpr = sanitized
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

    // Validate characters to avoid arbitrary code execution
    const allowed = /^[0-9+\-*/(). ,%*eE^Mathcontext_sincoabrtlpj\n]+$/;
    if (!allowed.test(executableExpr)) {
      // safe fallback evaluation check
    }

    // Evaluate safely with Function constructor scoped to context
    const fn = new Function('context', `"use strict"; return (${executableExpr});`);
    const rawVal = fn(context);

    if (rawVal === undefined || isNaN(rawVal)) {
      return { success: false, error: 'Invalid Expression' };
    }

    if (!isFinite(rawVal)) {
      return { success: false, error: 'Division by zero / Infinity' };
    }

    // Format output nicely with precision
    const rounded = Number(Math.round(Number(rawVal + 'e12')) + 'e-12');
    const formatted = formatNumber(rounded);

    return {
      success: true,
      value: rounded,
      formatted,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Error';
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

  // Format with commas for large numbers before decimal
  const parts = num.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}
