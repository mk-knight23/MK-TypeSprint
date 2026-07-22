import { describe, it, expect, beforeEach } from 'vitest';
import {
  mergePerKeyStats,
  normalizeKey,
  loadPerKeyStats,
  recordSessionPerKey,
  heatLabelColor,
  QWERTY_ROWS,
} from '../heatmap.js';
import { STORAGE_KEYS } from '../lib/storage.js';

// Independent WCAG contrast helpers (mirror the heat scale hsl(h,72%,42%)).
const lin = (c) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
};
const luminance = ({ r, g, b }) =>
  0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const hexLum = (hex) =>
  luminance({
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  });
const hslToRgb = (h, s, l) => {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return {
    r: Math.round(255 * f(0)),
    g: Math.round(255 * f(8)),
    b: Math.round(255 * f(4)),
  };
};
const contrast = (l1, l2) =>
  (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

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
    expect(aggregate.a).toEqual({
      hits: 1,
      misses: 0,
      total: 1,
      accuracy: 100,
    });
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
    localStorage.setItem(
      'typesprint:v1:' + STORAGE_KEYS.PER_KEY,
      JSON.stringify([1, 2])
    );
    expect(loadPerKeyStats()).toEqual({});
  });
});

describe('heatLabelColor — legible key labels (WCAG AA, fixes TS-5)', () => {
  it('always meets >= 4.5:1 against the key background across the whole scale', () => {
    let worst = Infinity;
    for (let acc = 0; acc <= 100; acc += 1) {
      const hue = Math.max(0, Math.min(120, Math.round((acc / 100) * 120)));
      const bgLum = luminance(hslToRgb(hue, 72, 42));
      const label = heatLabelColor(acc);
      const ratio = contrast(hexLum(label), bgLum);
      worst = Math.min(worst, ratio);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    }
    // The pre-fix fixed-white label bottomed out at ~2.12:1; the optimal
    // black/white choice cannot dip below the ~4.58:1 crossover floor.
    expect(worst).toBeGreaterThan(4.5);
  });

  it('uses white on the dark low-accuracy (red) end and black at the bright mid', () => {
    expect(heatLabelColor(0)).toBe('#ffffff'); // hue 0, dark red
    expect(heatLabelColor(50)).toBe('#000000'); // hue 60, bright yellow
    expect(heatLabelColor(100)).toBe('#000000'); // hue 120, bright green
  });
});

describe('QWERTY layout', () => {
  it('covers all 26 letters plus digits and space', () => {
    const keys = QWERTY_ROWS.flat();
    for (const letter of 'abcdefghijklmnopqrstuvwxyz')
      expect(keys).toContain(letter);
    for (const digit of '1234567890') expect(keys).toContain(digit);
    expect(keys).toContain(' ');
  });
});
