import { describe, it, expect } from 'vitest';
import {
  computeInputDelta,
  extractKeystroke,
  isTimedMode,
  WORD_MODE_TARGET,
} from '../session.js';

describe('computeInputDelta — parity with original inline logic', () => {
  it('counts a correct char', () => {
    expect(computeInputDelta('c', 'cat')).toEqual({
      totalChars: 1,
      correctChars: 1,
      errors: 0,
    });
    expect(computeInputDelta('cat', 'cat')).toEqual({
      totalChars: 1,
      correctChars: 1,
      errors: 0,
    });
  });

  it('counts a wrong char as an error', () => {
    expect(computeInputDelta('x', 'cat')).toEqual({
      totalChars: 1,
      correctChars: 0,
      errors: 1,
    });
    expect(computeInputDelta('cx', 'cat')).toEqual({
      totalChars: 1,
      correctChars: 0,
      errors: 1,
    });
  });

  it('counts only totalChars when typed is longer than the target', () => {
    expect(computeInputDelta('cats', 'cat')).toEqual({
      totalChars: 1,
      correctChars: 0,
      errors: 0,
    });
  });

  it('preserves the original quirk: empty typed counts as correct', () => {
    // Original: typed[-1] === target[-1] → undefined === undefined → correct.
    expect(computeInputDelta('', 'cat')).toEqual({
      totalChars: 1,
      correctChars: 1,
      errors: 0,
    });
  });
});

describe('extractKeystroke', () => {
  it('records a forward correct keystroke keyed by the target char', () => {
    expect(extractKeystroke('ca', 'cat', 1)).toEqual({
      key: 'a',
      correct: true,
    });
  });

  it('records a forward incorrect keystroke keyed by the target char', () => {
    expect(extractKeystroke('cx', 'cat', 1)).toEqual({
      key: 'a',
      correct: false,
    });
  });

  it('ignores backspaces', () => {
    expect(extractKeystroke('c', 'cat', 2)).toBeNull();
    expect(extractKeystroke('', 'cat', 1)).toBeNull();
  });

  it('ignores typing past the end of the target', () => {
    expect(extractKeystroke('cats', 'cat', 3)).toBeNull();
  });
});

describe('mode transitions', () => {
  it('time, code and quotes are timed; word is not', () => {
    expect(isTimedMode('time')).toBe(true);
    expect(isTimedMode('code')).toBe(true);
    expect(isTimedMode('quotes')).toBe(true);
    expect(isTimedMode('word')).toBe(false);
  });

  it('word mode target is 20 words, matching the original constant', () => {
    expect(WORD_MODE_TARGET).toBe(20);
  });
});
