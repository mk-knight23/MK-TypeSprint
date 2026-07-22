import { describe, it, expect, beforeEach } from 'vitest';
import { getCurrentWeakKeys, WEAK_KEY_COUNT, MIN_KEY_SAMPLES } from '../practice.js';
import { write, STORAGE_KEYS } from '../lib/storage.js';

function stat(hits, misses) {
  const total = hits + misses;
  return { hits, misses, total, accuracy: Math.round((hits / total) * 100) };
}

beforeEach(() => {
  localStorage.clear();
});

describe('getCurrentWeakKeys', () => {
  it('returns the lowest-accuracy letter keys from the persisted aggregate', () => {
    write(STORAGE_KEYS.PER_KEY, {
      e: stat(9, 1), // 90%
      r: stat(5, 5), // 50%
      t: stat(3, 7), // 30%
      a: stat(10, 0), // 100%
    });
    expect(getCurrentWeakKeys()).toEqual(['t', 'r', 'e']);
  });

  it('caps the list at WEAK_KEY_COUNT keys', () => {
    write(STORAGE_KEYS.PER_KEY, {
      a: stat(1, 9),
      b: stat(2, 8),
      c: stat(3, 7),
      d: stat(4, 6),
      e: stat(5, 5),
    });
    expect(getCurrentWeakKeys()).toHaveLength(WEAK_KEY_COUNT);
  });

  it('ignores keys below the minimum sample count', () => {
    write(STORAGE_KEYS.PER_KEY, {
      z: stat(0, MIN_KEY_SAMPLES - 1), // too few samples
      e: stat(6, 4),
    });
    expect(getCurrentWeakKeys()).toEqual(['e']);
  });

  it('ignores non-letter keys (punctuation, digits, space)', () => {
    write(STORAGE_KEYS.PER_KEY, {
      ';': stat(0, 10),
      '7': stat(0, 10),
      ' ': stat(0, 10),
      n: stat(5, 5),
    });
    expect(getCurrentWeakKeys()).toEqual(['n']);
  });

  it('returns an empty list when there is no per-key data', () => {
    expect(getCurrentWeakKeys()).toEqual([]);
  });

  it('never suggests keys with perfect accuracy', () => {
    write(STORAGE_KEYS.PER_KEY, {
      a: stat(10, 0),
      b: stat(20, 0),
      c: stat(9, 1),
    });
    expect(getCurrentWeakKeys()).toEqual(['c']);
  });
});
