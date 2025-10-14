import { describe, it, expect } from 'vitest';
import { formatDate, formatNumber, truncate } from './utils';

describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('should format a Date object', () => {
      const date = new Date('2024-01-01T00:00:00.000Z');
      expect(formatDate(date)).toBe('January 1, 2024');
    });

    it('should format a date string', () => {
      const dateString = '2024-01-01';
      expect(formatDate(dateString)).toBe('January 1, 2024');
    });

    it('should handle invalid date strings gracefully', () => {
      const dateString = 'not a date';
      expect(formatDate(dateString)).toBe('Invalid Date');
    });

    it('should throw an error for null input', () => {
        // @ts-ignore
        expect(() => formatDate(null)).toThrow();
    });

    it('should throw an error for undefined input', () => {
        // @ts-ignore
        expect(() => formatDate(undefined)).toThrow();
    });
  });

  describe('formatNumber', () => {
    it('should format a number with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
    });

    it('should not add commas to a small number', () => {
      expect(formatNumber(100)).toBe('100');
    });

    it('should format a large number', () => {
      expect(formatNumber(1234567)).toBe('1,234,567');
    });

    it('should handle zero', () => {
        expect(formatNumber(0)).toBe('0');
    });

    it('should handle negative numbers', () => {
        expect(formatNumber(-5000)).toBe('-5,000');
    });

    it('should handle decimal numbers', () => {
        expect(formatNumber(1234.56)).toBe('1,234.56');
    });
  });

  describe('truncate', () => {
    it('should not truncate text shorter than maxLength', () => {
      const text = 'Hello';
      expect(truncate(text, 10)).toBe('Hello');
    });

    it('should not truncate text equal to maxLength', () => {
        const text = 'Hello';
        expect(truncate(text, 5)).toBe('Hello');
    });

    it('should truncate text longer than maxLength', () => {
      const text = 'Hello, world!';
      expect(truncate(text, 5)).toBe('Hello...');
    });

    it('should handle an empty string', () => {
      expect(truncate('', 10)).toBe('');
    });

    it('should handle a maxLength of 0', () => {
      const text = 'Hello, world!';
      expect(truncate(text, 0)).toBe('...');
    });

    it('should throw an error for null input', () => {
        // @ts-ignore
        expect(() => truncate(null, 5)).toThrow();
    });

    it('should throw an error for undefined input', () => {
        // @ts-ignore
        expect(() => truncate(undefined, 5)).toThrow();
    });
  });
});
