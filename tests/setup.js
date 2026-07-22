import '@testing-library/jest-dom';

if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map();
  const api = {
    get length() {
      return store.size;
    },
    key(i) {
      return Array.from(store.keys())[i] ?? null;
    },
    getItem(k) {
      return store.has(k) ? store.get(k) : null;
    },
    setItem(k, v) {
      store.set(String(k), String(v));
    },
    removeItem(k) {
      store.delete(k);
    },
    clear() {
      store.clear();
    },
  };
  Object.defineProperty(globalThis, 'localStorage', {
    value: api,
    writable: false,
    configurable: true,
  });
}

// jsdom does not implement matchMedia — the theme module needs it.
if (typeof window !== 'undefined' && typeof window.matchMedia === 'undefined') {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false;
    },
  });
}

// jsdom logs "Not implemented" for scrollTo/scrollIntoView — stub them.
if (typeof window !== 'undefined') {
  window.scrollTo = () => {};
  if (typeof Element !== 'undefined') {
    Element.prototype.scrollIntoView = Element.prototype.scrollIntoView || (() => {});
  }
}
