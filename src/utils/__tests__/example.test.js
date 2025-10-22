/**
 * Example Test Suite
 *
 * Dit is een voorbeeld test om te verifiëren dat:
 * 1. Vitest correct werkt
 * 2. Coverage reporting werkt
 * 3. Codecov upload werkt
 *
 * Deze test kan later worden verwijderd zodra echte tests zijn geschreven.
 */

import { describe, it, expect } from 'vitest';

describe('Example Test Suite', () => {
  it('should pass a basic test', () => {
    expect(true).toBe(true);
  });

  it('should perform simple math', () => {
    expect(1 + 1).toBe(2);
    expect(5 * 3).toBe(15);
  });

  it('should handle string operations', () => {
    const greeting = 'Gedichtgevel';
    expect(greeting).toContain('dicht');
    expect(greeting.length).toBe(12);
  });

  it('should work with arrays', () => {
    const authors = ['Rutger Kopland', 'Ida Gerhardt', 'Remco Campert'];
    expect(authors).toHaveLength(3);
    expect(authors[0]).toBe('Rutger Kopland');
  });

  it('should handle objects', () => {
    const poem = {
      title: 'Test Poem',
      author: 'Test Author',
      lines: ['Line 1', 'Line 2'],
    };

    expect(poem).toHaveProperty('title');
    expect(poem.lines).toHaveLength(2);
  });

  it('should handle async operations', async () => {
    const promise = Promise.resolve('success');
    await expect(promise).resolves.toBe('success');
  });
});

// Voorbeeld van een utility function om coverage te testen
export function exampleUtility(input) {
  if (!input) {
    return 'empty';
  }
  if (typeof input === 'number') {
    return input * 2;
  }
  return input.toUpperCase();
}

describe('Example Utility Function', () => {
  it('should handle empty input', () => {
    expect(exampleUtility(null)).toBe('empty');
    expect(exampleUtility(undefined)).toBe('empty');
    expect(exampleUtility('')).toBe('empty');
  });

  it('should double numbers', () => {
    expect(exampleUtility(5)).toBe(10);
    expect(exampleUtility(100)).toBe(200);
  });

  it('should uppercase strings', () => {
    expect(exampleUtility('hello')).toBe('HELLO');
    expect(exampleUtility('gedicht')).toBe('GEDICHT');
  });
});
