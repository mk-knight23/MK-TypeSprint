import { describe, it, expect } from 'vitest';
import {
  calculateRawWpm,
  calculateNetWpm,
  calculateAccuracy,
  calculateConsistency,
  calculatePerKeyStats,
  findWeakestKeys,
  summarizeTest,
} from '../typing-metrics.js';

describe('calculateRawWpm', () => {
  it('returns 0 for zero or negative time', () => {
    expect(calculateRawWpm(100, 0)).toBe(0);
    expect(calculateRawWpm(100, -1)).toBe(0);
  });
  it('returns 0 for zero chars', () => {
    expect(calculateRawWpm(0, 60)).toBe(0);
  });
  it('calculates canonical WPM', () => {
    // 300 chars in 60 seconds = 60 words (300/5) in 1 min = 60 wpm
    expect(calculateRawWpm(300, 60)).toBe(60);
    // 150 chars in 30 seconds = 30 words in 0.5 min = 60 wpm
    expect(calculateRawWpm(150, 30)).toBe(60);
  });
  it('rounds to nearest int', () => {
    // 100 chars in 60s = 20 wpm; 103 chars = 20.6 = 21
    expect(calculateRawWpm(103, 60)).toBe(21);
  });
});

describe('calculateNetWpm', () => {
  it('uses correct chars only', () => {
    // 250 correct / 60s = 50 wpm
    expect(calculateNetWpm(250, 60)).toBe(50);
  });
  it('returns 0 with no correct chars', () => {
    expect(calculateNetWpm(0, 30)).toBe(0);
  });
});

describe('calculateAccuracy', () => {
  it('returns 100 when all correct', () => {
    expect(calculateAccuracy(100, 100)).toBe(100);
  });
  it('returns 0 when no total', () => {
    expect(calculateAccuracy(0, 0)).toBe(0);
  });
  it('rounds correctly', () => {
    expect(calculateAccuracy(85, 100)).toBe(85);
    expect(calculateAccuracy(87, 100)).toBe(87);
    // 2/3 = 66.67 -> 67
    expect(calculateAccuracy(2, 3)).toBe(67);
  });
  it('caps correct chars to total', () => {
    expect(calculateAccuracy(200, 100)).toBe(100);
  });
  it('handles negative correct chars', () => {
    expect(calculateAccuracy(-5, 100)).toBe(0);
  });
});

describe('calculateConsistency', () => {
  it('returns 0 with insufficient data', () => {
    expect(calculateConsistency([])).toBe(0);
    expect(calculateConsistency([100])).toBe(0);
  });
  it('returns 100 for perfectly steady rhythm', () => {
    expect(calculateConsistency([100, 100, 100, 100])).toBe(100);
  });
  it('reduces score for high variance', () => {
    const consistent = calculateConsistency([100, 100, 100, 100]);
    const chaotic = calculateConsistency([50, 500, 50, 500]);
    expect(consistent).toBeGreaterThan(chaotic);
    expect(chaotic).toBeLessThan(50);
  });
  it('ignores non-finite intervals', () => {
    expect(calculateConsistency([100, NaN, 100, Infinity, 100])).toBe(100);
  });
});

describe('calculatePerKeyStats', () => {
  it('returns empty for no data', () => {
    expect(calculatePerKeyStats([])).toEqual({});
  });
  it('tallies hits and misses per key', () => {
    const stats = calculatePerKeyStats([
      { key: 'a', correct: true },
      { key: 'a', correct: true },
      { key: 'a', correct: false },
      { key: 'b', correct: true },
    ]);
    expect(stats.a).toEqual({ hits: 2, misses: 1, total: 3, accuracy: 67 });
    expect(stats.b).toEqual({ hits: 1, misses: 0, total: 1, accuracy: 100 });
  });
  it('ignores malformed entries', () => {
    const stats = calculatePerKeyStats([
      { key: 'a', correct: true },
      null,
      { correct: true },
      { key: 42, correct: true },
    ]);
    expect(Object.keys(stats)).toEqual(['a']);
  });
});

describe('findWeakestKeys', () => {
  it('returns weakest by accuracy above sample threshold', () => {
    const perKey = {
      a: { hits: 8, misses: 2, total: 10, accuracy: 80 },
      b: { hits: 5, misses: 5, total: 10, accuracy: 50 },
      c: { hits: 1, misses: 0, total: 1, accuracy: 100 },
      d: { hits: 7, misses: 3, total: 10, accuracy: 70 },
    };
    const weakest = findWeakestKeys(perKey, { topN: 2, minSamples: 3 });
    expect(weakest.map(k => k.key)).toEqual(['b', 'd']);
  });
  it('excludes keys below minSamples', () => {
    const perKey = { z: { hits: 0, misses: 1, total: 1, accuracy: 0 } };
    expect(findWeakestKeys(perKey, { minSamples: 5 })).toEqual([]);
  });
  it('handles null input', () => {
    expect(findWeakestKeys(null)).toEqual([]);
  });
});

describe('summarizeTest end-to-end', () => {
  it('produces a coherent summary', () => {
    const result = summarizeTest({
      totalChars: 250,
      correctChars: 230,
      elapsedSec: 60,
      errors: 20,
      intervalsMs: [120, 130, 125, 118, 122],
      keystrokes: [
        { key: 't', correct: true },
        { key: 'h', correct: true },
        { key: 'e', correct: false },
      ],
    });
    expect(result.rawWpm).toBe(50);
    expect(result.netWpm).toBe(46);
    expect(result.accuracy).toBe(92);
    expect(result.consistency).toBeGreaterThan(85);
    expect(Object.keys(result.perKey).sort()).toEqual(['e', 'h', 't']);
    expect(result.errors).toBe(20);
  });
  it('survives empty input', () => {
    const r = summarizeTest({});
    expect(r.rawWpm).toBe(0);
    expect(r.netWpm).toBe(0);
    expect(r.accuracy).toBe(0);
    expect(r.errors).toBe(0);
  });
});
