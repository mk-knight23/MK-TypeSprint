/**
 * Minimal focus trap for modal dialogs (WCAG 2.4.3 focus order, 2.1.2 no
 * keyboard trap-out). Keeps Tab focus cycling inside a container while it is
 * open. Pure DOM, no dependencies. The Tab-wrap resolver (wrapFocus) is pure
 * and unit-tested; the activate/deactivate pair manages the live listener.
 */

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Focusable descendants of a container, in DOM order.
 * @param {Element | null} container
 * @returns {Element[]}
 */
export function getFocusable(container) {
  if (!container || typeof container.querySelectorAll !== 'function') return [];
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR));
}

/**
 * Pure Tab-wrap resolver. Given a trap's focusable elements, the currently
 * focused element and the Tab direction, returns the element that should
 * receive focus to keep focus inside the trap — or null when the browser's
 * default Tab behavior is already correct.
 * @param {Element[]} focusables
 * @param {Element | null} current
 * @param {boolean} shiftKey
 * @returns {Element | null}
 */
export function wrapFocus(focusables, current, shiftKey) {
  if (!focusables || focusables.length === 0) return null;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const idx = focusables.indexOf(current);
  if (idx === -1) return shiftKey ? last : first; // focus wandered outside
  if (shiftKey && current === first) return last;
  if (!shiftKey && current === last) return first;
  return null;
}

let trapHandler = null;

/**
 * Start trapping Tab focus inside `container`. Idempotent — replaces any
 * previously active trap.
 * @param {Element} container
 */
export function activateFocusTrap(container) {
  deactivateFocusTrap();
  trapHandler = (e) => {
    if (e.key !== 'Tab') return;
    const target = wrapFocus(
      getFocusable(container),
      document.activeElement,
      e.shiftKey
    );
    if (target) {
      e.preventDefault();
      target.focus();
    }
  };
  document.addEventListener('keydown', trapHandler, true);
}

/** Stop trapping. Safe to call when no trap is active. */
export function deactivateFocusTrap() {
  if (trapHandler) {
    document.removeEventListener('keydown', trapHandler, true);
    trapHandler = null;
  }
}
