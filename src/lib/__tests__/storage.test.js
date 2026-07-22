import { describe, it, expect, beforeEach } from 'vitest';
import { read, write, remove, clearAll, exportAll, importAll, STORAGE_KEYS } from '../storage.js';

beforeEach(() => {
  if (typeof localStorage !== 'undefined') localStorage.clear();
});

describe('storage read/write', () => {
  it('round-trips a value', () => {
    expect(write('demo', { a: 1, b: [1, 2, 3] })).toBe(true);
    expect(read('demo')).toEqual({ a: 1, b: [1, 2, 3] });
  });
  it('returns fallback when missing', () => {
    expect(read('missing', { default: true })).toEqual({ default: true });
  });
  it('falls back to legacy unversioned key', () => {
    localStorage.setItem('legacy-key', JSON.stringify({ legacy: true }));
    expect(read('legacy-key', null)).toEqual({ legacy: true });
  });
  it('returns fallback on corrupt JSON', () => {
    localStorage.setItem('typesprint:v1:corrupt', '{oops');
    expect(read('corrupt', 'fallback')).toBe('fallback');
  });
  it('remove clears the value', () => {
    write('gone', 'here');
    remove('gone');
    expect(read('gone', null)).toBeNull();
  });
});

describe('storage export/import', () => {
  it('exports only namespaced entries and re-imports them', () => {
    write('stats', { tests: 3 });
    write('history', [{ wpm: 55 }]);
    localStorage.setItem('unrelated', 'x');

    const dump = exportAll();
    expect(dump.version).toBe(1);
    expect(dump.data.stats).toEqual({ tests: 3 });
    expect(dump.data.history).toEqual([{ wpm: 55 }]);
    expect(dump.data.unrelated).toBeUndefined();

    clearAll();
    expect(read('stats', null)).toBeNull();
    expect(importAll(dump)).toBe(true);
    expect(read('stats', null)).toEqual({ tests: 3 });
  });
  it('rejects mismatched version', () => {
    expect(importAll({ version: 999, data: {} })).toBe(false);
  });
  it('rejects malformed payload', () => {
    expect(importAll(null)).toBe(false);
    expect(importAll({ version: 1 })).toBe(false);
  });
});

describe('storage keys', () => {
  it('exposes canonical keys', () => {
    expect(STORAGE_KEYS.STATS).toBe('stats');
    expect(STORAGE_KEYS.HISTORY).toBe('history');
  });
});
