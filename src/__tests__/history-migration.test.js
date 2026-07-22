import { describe, it, expect, beforeEach } from 'vitest';
import { migrateLegacyData, loadPersistedData, getHistory, getStats, LEGACY_KEYS } from '../history.js';
import { read, STORAGE_KEYS } from '../lib/storage.js';

const SAMPLE_HISTORY = [
  {
    date: '2026-07-01T10:00:00.000Z',
    wpm: 72,
    rawWPM: 78,
    accuracy: 95,
    time: 60,
    errors: 4,
    mode: 'word',
    difficulty: 'medium',
  },
];
const SAMPLE_STATS = { tests: 12, bestWPM: 84 };

beforeEach(() => {
  localStorage.clear();
});

describe('migrateLegacyData', () => {
  it('copies legacy typingHistory and typingStats into namespaced keys', () => {
    localStorage.setItem(LEGACY_KEYS.HISTORY, JSON.stringify(SAMPLE_HISTORY));
    localStorage.setItem(LEGACY_KEYS.STATS, JSON.stringify(SAMPLE_STATS));

    migrateLegacyData();

    expect(read(STORAGE_KEYS.HISTORY, null)).toEqual(SAMPLE_HISTORY);
    expect(read(STORAGE_KEYS.STATS, null)).toEqual(SAMPLE_STATS);
  });

  it('migrates the legacy raw theme string', () => {
    localStorage.setItem(LEGACY_KEYS.THEME, 'dark');
    migrateLegacyData();
    expect(read(STORAGE_KEYS.THEME, null)).toBe('dark');
  });

  it('is non-destructive: legacy keys remain after migration', () => {
    localStorage.setItem(LEGACY_KEYS.HISTORY, JSON.stringify(SAMPLE_HISTORY));
    migrateLegacyData();
    expect(localStorage.getItem(LEGACY_KEYS.HISTORY)).not.toBeNull();
  });

  it('never overwrites existing namespaced data', () => {
    localStorage.setItem(LEGACY_KEYS.STATS, JSON.stringify({ tests: 1, bestWPM: 10 }));
    // Namespaced value already present (written by the new storage layer).
    localStorage.setItem(
      'typesprint:v1:' + STORAGE_KEYS.STATS,
      JSON.stringify(SAMPLE_STATS)
    );

    migrateLegacyData();

    expect(read(STORAGE_KEYS.STATS, null)).toEqual(SAMPLE_STATS);
  });

  it('is idempotent across repeated startups', () => {
    localStorage.setItem(LEGACY_KEYS.HISTORY, JSON.stringify(SAMPLE_HISTORY));
    migrateLegacyData();
    migrateLegacyData();
    expect(read(STORAGE_KEYS.HISTORY, null)).toEqual(SAMPLE_HISTORY);
  });

  it('ignores malformed legacy JSON instead of crashing', () => {
    localStorage.setItem(LEGACY_KEYS.HISTORY, '{not json');
    localStorage.setItem(LEGACY_KEYS.THEME, 'neon');
    expect(() => migrateLegacyData()).not.toThrow();
    expect(read(STORAGE_KEYS.HISTORY, null)).toBeNull();
    expect(read(STORAGE_KEYS.THEME, null)).toBeNull();
  });
});

describe('loadPersistedData', () => {
  it('loads migrated history and stats into module state', () => {
    localStorage.setItem(LEGACY_KEYS.HISTORY, JSON.stringify(SAMPLE_HISTORY));
    localStorage.setItem(LEGACY_KEYS.STATS, JSON.stringify(SAMPLE_STATS));
    migrateLegacyData();
    loadPersistedData();
    expect(getHistory()).toEqual(SAMPLE_HISTORY);
    expect(getStats()).toEqual(SAMPLE_STATS);
  });

  it('falls back to defaults when nothing is stored', () => {
    loadPersistedData();
    expect(getHistory()).toEqual([]);
    expect(getStats()).toEqual({ tests: 0, bestWPM: 0 });
  });

  it('falls back to defaults for corrupt stored shapes', () => {
    localStorage.setItem('typesprint:v1:' + STORAGE_KEYS.HISTORY, JSON.stringify('nope'));
    localStorage.setItem('typesprint:v1:' + STORAGE_KEYS.STATS, JSON.stringify(null));
    loadPersistedData();
    expect(getHistory()).toEqual([]);
    expect(getStats()).toEqual({ tests: 0, bestWPM: 0 });
  });
});
