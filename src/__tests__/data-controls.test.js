import { describe, it, expect } from 'vitest';
import { validateImportPayload } from '../data-controls.js';

describe('validateImportPayload', () => {
  it('accepts a well-formed exportAll payload', () => {
    const payload = {
      version: 1,
      data: {
        history: [{ wpm: 60 }],
        stats: { tests: 3, bestWPM: 60 },
        theme: 'dark',
      },
    };
    expect(validateImportPayload(payload)).toEqual({ ok: true });
  });

  it('accepts a payload with an empty data section', () => {
    expect(validateImportPayload({ version: 1, data: {} })).toEqual({ ok: true });
  });

  it('rejects non-objects', () => {
    expect(validateImportPayload(null).ok).toBe(false);
    expect(validateImportPayload('hi').ok).toBe(false);
    expect(validateImportPayload([1]).ok).toBe(false);
  });

  it('rejects wrong or missing versions', () => {
    expect(validateImportPayload({ version: 2, data: {} }).ok).toBe(false);
    expect(validateImportPayload({ data: {} }).ok).toBe(false);
  });

  it('rejects a missing or invalid data section', () => {
    expect(validateImportPayload({ version: 1 }).ok).toBe(false);
    expect(validateImportPayload({ version: 1, data: [1] }).ok).toBe(false);
  });

  it('rejects malformed history or stats shapes', () => {
    expect(validateImportPayload({ version: 1, data: { history: 'nope' } }).ok).toBe(false);
    expect(validateImportPayload({ version: 1, data: { stats: 5 } }).ok).toBe(false);
  });
});
