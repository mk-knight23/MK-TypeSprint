import { describe, it, expect, beforeEach } from 'vitest';
import {
  isEditableTarget,
  shouldStartOnSpace,
  shouldAbortOnEscape,
} from '../keyboard.js';

describe('isEditableTarget — editable-target shortcut guard', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('is true for input, textarea and select elements', () => {
    for (const tag of ['input', 'textarea', 'select']) {
      const node = document.createElement(tag);
      document.body.appendChild(node);
      expect(isEditableTarget(node)).toBe(true);
    }
  });

  it('is true for a contenteditable element and its descendants', () => {
    const editable = document.createElement('div');
    editable.setAttribute('contenteditable', 'true');
    const child = document.createElement('span');
    editable.appendChild(child);
    document.body.appendChild(editable);
    expect(isEditableTarget(editable)).toBe(true);
    expect(isEditableTarget(child)).toBe(true);
  });

  it('is false for contenteditable="false"', () => {
    const node = document.createElement('div');
    node.setAttribute('contenteditable', 'false');
    document.body.appendChild(node);
    expect(isEditableTarget(node)).toBe(false);
  });

  it('is false for non-editable elements, null, and non-elements', () => {
    const button = document.createElement('button');
    document.body.appendChild(button);
    expect(isEditableTarget(button)).toBe(false);
    expect(isEditableTarget(document.createElement('div'))).toBe(false);
    expect(isEditableTarget(null)).toBe(false);
    expect(isEditableTarget({})).toBe(false);
  });
});

describe('shouldStartOnSpace — global Space guard (WCAG 2.1.1)', () => {
  const body = document.body;
  const button = document.createElement('button');

  it('starts only when Space is pressed with focus on body and Start enabled', () => {
    expect(
      shouldStartOnSpace({
        key: ' ',
        activeElement: body,
        body,
        startDisabled: false,
      })
    ).toBe(true);
  });

  it('does NOT start when a control/input is focused', () => {
    expect(
      shouldStartOnSpace({
        key: ' ',
        activeElement: button,
        body,
        startDisabled: false,
      })
    ).toBe(false);
  });

  it('does NOT start when the Start button is disabled (test running)', () => {
    expect(
      shouldStartOnSpace({
        key: ' ',
        activeElement: body,
        body,
        startDisabled: true,
      })
    ).toBe(false);
  });

  it('does NOT start for a non-Space key', () => {
    expect(
      shouldStartOnSpace({
        key: 'a',
        activeElement: body,
        body,
        startDisabled: false,
      })
    ).toBe(false);
  });
});

describe('shouldAbortOnEscape — Esc aborts a running test (WCAG 2.1.2)', () => {
  it('aborts only when Escape is pressed while a test is running', () => {
    expect(shouldAbortOnEscape('Escape', true)).toBe(true);
    expect(shouldAbortOnEscape('Escape', false)).toBe(false);
    expect(shouldAbortOnEscape('a', true)).toBe(false);
    expect(shouldAbortOnEscape(' ', true)).toBe(false);
  });
});
