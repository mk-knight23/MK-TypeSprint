import { describe, it, expect } from 'vitest';

describe('Keyboard Practice', () => {
  it('should have document body', () => {
    expect(document.body).toBeInTheDocument();
  });
});
