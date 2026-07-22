import { describe, it, expect, beforeEach } from 'vitest';
import { getFocusable, wrapFocus } from '../focus-trap.js';

describe('getFocusable', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('collects focusable descendants in DOM order and skips disabled/[-1]', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <a href="#one">a</a>
      <button>b</button>
      <button disabled>disabled</button>
      <input />
      <input disabled />
      <span tabindex="0">span</span>
      <div tabindex="-1">skip</div>
    `;
    document.body.appendChild(container);
    const tags = getFocusable(container).map(
      (nodeEl) => nodeEl.tagName.toLowerCase() + (nodeEl.disabled ? ':off' : '')
    );
    expect(tags).toEqual(['a', 'button', 'input', 'span']);
  });

  it('returns an empty array for missing/invalid containers', () => {
    expect(getFocusable(null)).toEqual([]);
    expect(getFocusable(undefined)).toEqual([]);
  });
});

describe('wrapFocus — pure Tab-wrap resolver', () => {
  const A = 'A';
  const B = 'B';
  const C = 'C';

  it('returns null when the browser default Tab is already correct', () => {
    expect(wrapFocus([A, B, C], A, false)).toBeNull(); // forward from first
    expect(wrapFocus([A, B, C], B, false)).toBeNull(); // forward from middle
    expect(wrapFocus([A, B, C], C, true)).toBeNull(); // backward from last
  });

  it('wraps forward Tab off the last element to the first', () => {
    expect(wrapFocus([A, B, C], C, false)).toBe(A);
  });

  it('wraps backward Shift+Tab off the first element to the last', () => {
    expect(wrapFocus([A, B, C], A, true)).toBe(C);
  });

  it('pulls focus back in when it has wandered outside the trap', () => {
    expect(wrapFocus([A, B, C], 'OUTSIDE', false)).toBe(A);
    expect(wrapFocus([A, B, C], 'OUTSIDE', true)).toBe(C);
  });

  it('returns null when there is nothing focusable', () => {
    expect(wrapFocus([], A, false)).toBeNull();
    expect(wrapFocus(null, A, false)).toBeNull();
  });
});
