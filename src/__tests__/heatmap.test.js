import { describe, it, expect, beforeEach } from 'vitest';
import {
  mergePerKeyStats,
  normalizeKey,
  loadPerKeyStats,
  recordSessionPerKey,
  QWERTY_ROWS,
} from '../heatmap.js';
import { STORAGE_KEYS } from '../lib/storage.js';

beforeEach(() => {
  localStorage.clear();
});

describe('normalizeKey', () => {
  it('lowercases letters and keeps punctuation/space', () => {
    expect(normalizeKey('E')).toBe('e');
    expect(normalizeKey(';')).toBe(';');
    expect(normalizeKey(' ')).toBe(' ');
  });

  it('rejects multi-char and non-string keys', () => {
    expect(normalizeKey('ab')).toBeNull();
    expect(normalizeKey('')).toBeNull();
    expect(normalizeKey(42)).toBeNull();
  });
});

describe('mergePerKeyStats', () => {
  it('merges hits/misses/totals and recomputes accuracy', () => {
    const aggregate = { e: { hits: 8, misses: 2, total: 10, accuracy: 80 } };
    const session = { e: { hits: 9, misses: 1, total: 10, accuracy: 90 } };
    const merged = mergePerKeyStats(aggregate, session);
    expect(merged.e).toEqual({ hits: 17, misses: 3, total: 20, accuracy: 85 });
  });

  it('folds uppercase session keys into lowercase aggregate keys', () => {
    const merged = mergePerKeyStats(
      { e: { hits: 1, misses: 0, total: 1, accuracy: 100 } },
      { E: { hits: 0, misses: 1, total: 1, accuracy: 0 } }
    );
    expect(merged.e).toEqual({ hits: 1, misses: 1, total: 2, accuracy: 50 });
  });

  it('does not mutate its inputs', () => {
    const aggregate = { a: { hits: 1, misses: 0, total: 1, accuracy: 100 } };
    const session = { a: { hits: 0, misses: 1, total: 1, accuracy: 0 } };
    mergePerKeyStats(aggregate, session);
    expect(aggregate.a).toEqual({ hits: 1, misses: 0, total: 1, accuracy: 100 });
    expect(session.a).toEqual({ hits: 0, misses: 1, total: 1, accuracy: 0 });
  });
});

describe('recordSessionPerKey / loadPerKeyStats', () => {
  it('persists the aggregate under the versioned perKey key', () => {
    recordSessionPerKey({ t: { hits: 4, misses: 1, total: 5, accuracy: 80 } });
    const raw = localStorage.getItem('typesprint:v1:' + STORAGE_KEYS.PER_KEY);
    expect(JSON.parse(raw).t.total).toBe(5);
  });

  it('accumulates across multiple sessions', () => {
    recordSessionPerKey({ t: { hits: 4, misses: 1, total: 5, accuracy: 80 } });
    recordSessionPerKey({ t: { hits: 5, misses: 0, total: 5, accuracy: 100 } });
    const stats = loadPerKeyStats();
    expect(stats.t).toEqual({ hits: 9, misses: 1, total: 10, accuracy: 90 });
  });

  it('returns an empty object for missing or corrupt stored data', () => {
    expect(loadPerKeyStats()).toEqual({});
    localStorage.setItem('typesprint:v1:' + STORAGE_KEYS.PER_KEY, JSON.stringify([1, 2]));
    expect(loadPerKeyStats()).toEqual({});
  });
});

describe('QWERTY layout', () => {
  it('covers all 26 letters plus digits and space', () => {
    const keys = QWERTY_ROWS.flat();
    for (const letter of 'abcdefghijklmnopqrstuvwxyz') expect(keys).toContain(letter);
    for (const digit of '1234567890') expect(keys).toContain(digit);
    expect(keys).toContain(' ');
  });
});
