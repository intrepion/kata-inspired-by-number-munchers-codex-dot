import { describe, expect, it } from 'vitest';
import { matches, numeric, expression, ruleFor } from '../src/math';
describe('mathematical rule contracts', () => {
  it('recognizes positive multiples and factors without reversing the relation', () => {
    expect(matches(numeric(12), {mode:'multiples',target:3})).toBe(true);
    expect(matches(numeric(7), {mode:'multiples',target:3})).toBe(false);
    expect(matches(numeric(3), {mode:'factors',target:12})).toBe(true);
    expect(matches(numeric(24), {mode:'factors',target:12})).toBe(false);
  });
  it('excludes one, zero, negatives and squares from primes', () => {
    for (const value of [-1,0,1,4,9,49]) expect(matches(numeric(value),ruleFor('primes',1))).toBe(false);
    for (const value of [2,3,17,47]) expect(matches(numeric(value),ruleFor('primes',1))).toBe(true);
  });
  it('uses arithmetic equality and not-equality rather than less-than', () => {
    for (const seed of [expression(3,'×',2),expression(12,'÷',2),expression(9,'−',3),expression(2,'+',4)]) {
      expect(matches(seed,{mode:'equality',target:6})).toBe(true);
      expect(matches(seed,{mode:'inequality',target:6})).toBe(false);
    }
    expect(matches(expression(7,'+',2),{mode:'inequality',target:6})).toBe(true);
  });
});
