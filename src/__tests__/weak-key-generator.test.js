import { describe, it, expect } from 'vitest';
import {
  getWeakKeyWord,
  generateWeakKeyText,
  wordBanks,
  WEAK_POOL_PROBABILITY,
} from '../content.js';

/** mulberry32 — tiny deterministic PRNG for seeded tests. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const WEAK = ['z', 'q'];
const wordHasWeakKey = (word) => WEAK.some((k) => word.includes(k));

describe('getWeakKeyWord', () => {
  it('always returns a word from the requested bank', () => {
    const rng = mulberry32(1);
    for (let i = 0; i < 50; i++) {
      expect(wordBanks.hard).toContain(getWeakKeyWord(WEAK, 'hard', rng));
    }
  });

  it('falls back to the full bank when no word contains a weak key', () => {
    const rng = mulberry32(2);
    // No easy word contains "0" — pool is empty, full bank must be used.
    const word = getWeakKeyWord(['0'], 'easy', rng);
    expect(wordBanks.easy).toContain(word);
  });

  it('falls back to the full bank for an empty weak-key list', () => {
    const word = getWeakKeyWord([], 'medium', mulberry32(3));
    expect(wordBanks.medium).toContain(word);
  });
});

describe('generateWeakKeyText — deterministic, elevated weak-key frequency', () => {
  it('is fully deterministic for the same seed', () => {
    const a = generateWeakKeyText(WEAK, {
      difficulty: 'hard',
      wordCount: 30,
      rng: mulberry32(42),
    });
    const b = generateWeakKeyText(WEAK, {
      difficulty: 'hard',
      wordCount: 30,
      rng: mulberry32(42),
    });
    expect(a).toBe(b);
    expect(a.split(' ')).toHaveLength(30);
  });

  it('contains weak keys at elevated frequency vs the baseline bank rate', () => {
    const bank = wordBanks.hard;
    const baselineRate = bank.filter(wordHasWeakKey).length / bank.length;

    const words = generateWeakKeyText(WEAK, {
      difficulty: 'hard',
      wordCount: 200,
      rng: mulberry32(7),
    }).split(' ');
    const generatedRate = words.filter(wordHasWeakKey).length / words.length;

    // ~WEAK_POOL_PROBABILITY of picks come from the weak pool, so the rate
    // must sit far above the bank's natural rate.
    expect(generatedRate).toBeGreaterThan(baselineRate * 2);
    expect(generatedRate).toBeGreaterThanOrEqual(WEAK_POOL_PROBABILITY - 0.15);
  });

  it('boosts single seeded weak keys in the medium bank too', () => {
    const weak = ['x'];
    const bank = wordBanks.medium;
    const baselineRate =
      bank.filter((w) => w.includes('x')).length / bank.length;
    const words = generateWeakKeyText(weak, {
      difficulty: 'medium',
      wordCount: 200,
      rng: mulberry32(11),
    }).split(' ');
    const generatedRate =
      words.filter((w) => w.includes('x')).length / words.length;
    expect(generatedRate).toBeGreaterThan(baselineRate);
    expect(generatedRate).toBeGreaterThan(0.5);
  });
});
