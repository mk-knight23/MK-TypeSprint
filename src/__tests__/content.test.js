import { describe, it, expect } from 'vitest';
import {
  wordBanks,
  codeSnippets,
  quotes,
  getRandomWord,
  getCodeSnippet,
  getQuote,
  getNextText,
} from '../content.js';

/** Deterministic rng — returns values from a fixed sequence, then repeats. */
function seededRng(seq) {
  let i = 0;
  return () => seq[i++ % seq.length];
}

describe('content banks', () => {
  it('has non-empty word banks for every difficulty', () => {
    expect(wordBanks.easy.length).toBeGreaterThan(50);
    expect(wordBanks.medium.length).toBeGreaterThan(50);
    expect(wordBanks.hard.length).toBeGreaterThan(50);
  });

  it('has snippets for all four languages and quotes', () => {
    for (const lang of ['javascript', 'python', 'typescript', 'sql']) {
      expect(codeSnippets[lang].length).toBeGreaterThan(0);
    }
    expect(quotes.length).toBeGreaterThan(0);
  });
});

describe('getRandomWord', () => {
  it('returns a word from the selected difficulty bank', () => {
    const word = getRandomWord('hard', seededRng([0]));
    expect(word).toBe(wordBanks.hard[0]);
    expect(wordBanks.hard).toContain(word);
  });

  it('is deterministic for a seeded rng', () => {
    const a = getRandomWord('easy', seededRng([0.5]));
    const b = getRandomWord('easy', seededRng([0.5]));
    expect(a).toBe(b);
  });

  it('falls back to medium for unknown difficulty', () => {
    const word = getRandomWord('nonsense', seededRng([0]));
    expect(word).toBe(wordBanks.medium[0]);
  });
});

describe('getCodeSnippet', () => {
  it('returns a snippet from the selected language', () => {
    const snippet = getCodeSnippet('python', seededRng([0]));
    expect(snippet).toBe(codeSnippets.python[0]);
  });

  it('falls back to javascript for unknown language', () => {
    const snippet = getCodeSnippet('cobol', seededRng([0]));
    expect(snippet).toBe(codeSnippets.javascript[0]);
  });
});

describe('getQuote', () => {
  it('returns a quote from the bank', () => {
    expect(getQuote(seededRng([0]))).toBe(quotes[0]);
  });
});

describe('getNextText', () => {
  it('routes code mode to the code snippet generator', () => {
    const text = getNextText(
      { mode: 'code', difficulty: 'medium', codeLanguage: 'sql' },
      seededRng([0])
    );
    expect(text).toBe(codeSnippets.sql[0]);
  });

  it('routes quotes mode to the quote generator', () => {
    const text = getNextText(
      { mode: 'quotes', difficulty: 'medium', codeLanguage: 'sql' },
      seededRng([0])
    );
    expect(text).toBe(quotes[0]);
  });

  it('routes word and time modes to the word bank', () => {
    for (const mode of ['word', 'time']) {
      const text = getNextText(
        { mode, difficulty: 'easy', codeLanguage: 'sql' },
        seededRng([0])
      );
      expect(text).toBe(wordBanks.easy[0]);
    }
  });
});
