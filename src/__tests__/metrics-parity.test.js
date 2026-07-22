import { describe, it, expect } from 'vitest';
import {
  calculateRawWpm,
  calculateNetWpm,
  calculateAccuracy,
  summarizeTest,
} from '../lib/typing-metrics.js';

/* ============================================
   The EXACT formulas from the original inline
   script (index.html pre-refactor):

     const rawWPM = Math.round(state.totalChars / 5 / timeMin);
     const netWPM = Math.round(state.correctChars / 5 / timeMin);
     const accuracy = state.totalChars > 0
       ? Math.round((state.correctChars / state.totalChars) * 100)
       : 0;
   ============================================ */
const oldRawWpm = (totalChars, timeMin) => Math.round(totalChars / 5 / timeMin);
const oldNetWpm = (correctChars, timeMin) => Math.round(correctChars / 5 / timeMin);
const oldAccuracy = (correctChars, totalChars) =>
  totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;

const CASES = [
  // [totalChars, correctChars, elapsedSec]
  [100, 100, 60],
  [100, 92, 60],
  [250, 240, 60],
  [37, 30, 12.4],
  [500, 431, 120],
  [55, 55, 15],
  [1000, 873, 300],
  [3, 1, 2.2],
  [88, 70, 33.33],
  [421, 399, 97.6],
];

describe('typing-metrics parity with the original inline formulas', () => {
  it.each(CASES)('rawWPM parity for totalChars=%i elapsed=%fs', (total, _correct, sec) => {
    expect(calculateRawWpm(total, sec)).toBe(oldRawWpm(total, sec / 60));
  });

  it.each(CASES)('netWPM parity for correctChars=%i (case %#)', (_total, correct, sec) => {
    expect(calculateNetWpm(correct, sec)).toBe(oldNetWpm(correct, sec / 60));
  });

  it.each(CASES)('accuracy parity (case %#)', (total, correct) => {
    expect(calculateAccuracy(correct, total)).toBe(oldAccuracy(correct, total));
  });

  it('matches on the zero-chars edge case', () => {
    expect(calculateRawWpm(0, 60)).toBe(0);
    expect(calculateNetWpm(0, 60)).toBe(0);
    expect(calculateAccuracy(0, 0)).toBe(oldAccuracy(0, 0));
  });

  it('summarizeTest produces the same numbers the old endTest computed', () => {
    for (const [total, correct, sec] of CASES) {
      const summary = summarizeTest({
        totalChars: total,
        correctChars: correct,
        elapsedSec: sec,
        errors: total - correct,
      });
      expect(summary.rawWpm).toBe(oldRawWpm(total, sec / 60));
      expect(summary.netWpm).toBe(oldNetWpm(correct, sec / 60));
      expect(summary.accuracy).toBe(oldAccuracy(correct, total));
      expect(summary.errors).toBe(total - correct);
    }
  });
});
