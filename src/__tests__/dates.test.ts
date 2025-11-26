import { describe, it, expect } from 'vitest';
import { startOfToday, addDays, isDue, calculateNextReview, formatDate } from '../utils/dates.js';

describe('Date Utilities', () => {
  describe('startOfToday', () => {
    it('should return today at 00:00:00.000', () => {
      const result = startOfToday();
      const now = new Date();
      
      expect(result.getFullYear()).toBe(now.getFullYear());
      expect(result.getMonth()).toBe(now.getMonth());
      expect(result.getDate()).toBe(now.getDate());
    });

    it('should have hours/minutes/seconds/ms all zero', () => {
      const result = startOfToday();
      
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    it('should use local timezone', () => {
      const result = startOfToday();
      const expected = new Date();
      expected.setHours(0, 0, 0, 0);
      
      expect(result.getTime()).toBe(expected.getTime());
    });
  });

  describe('addDays', () => {
    it('should add positive days correctly', () => {
      const base = new Date('2024-01-15T12:00:00.000Z');
      const result = addDays(base, 5);
      
      expect(result.toISOString()).toBe('2024-01-20T12:00:00.000Z');
    });

    it('should handle zero days', () => {
      const base = new Date('2024-01-15T12:00:00.000Z');
      const result = addDays(base, 0);
      
      expect(result.getTime()).toBe(base.getTime());
    });

    it('should subtract days with negative input', () => {
      const base = new Date('2024-01-15T12:00:00.000Z');
      const result = addDays(base, -5);
      
      expect(result.toISOString()).toBe('2024-01-10T12:00:00.000Z');
    });

    it('should preserve time of day', () => {
      const base = new Date('2024-01-15T14:30:45.123Z');
      const result = addDays(base, 3);
      
      expect(result.toISOString()).toBe('2024-01-18T14:30:45.123Z');
    });

    it('should handle month boundaries', () => {
      const base = new Date('2024-01-30T00:00:00.000Z');
      const result = addDays(base, 5);
      
      expect(result.toISOString()).toBe('2024-02-04T00:00:00.000Z');
    });

    it('should handle year boundaries', () => {
      const base = new Date('2023-12-30T00:00:00.000Z');
      const result = addDays(base, 5);
      
      expect(result.toISOString()).toBe('2024-01-04T00:00:00.000Z');
    });

    it('should accept string dates', () => {
      const result = addDays('2024-01-15T12:00:00.000Z', 3);
      
      expect(result.toISOString()).toBe('2024-01-18T12:00:00.000Z');
    });
  });

  describe('isDue', () => {
    it('should return false for null nextReview', () => {
      const today = new Date('2024-01-15T12:00:00.000Z');
      const result = isDue(null, today);
      
      expect(result).toBe(false);
    });

    it('should return true for past dates', () => {
      const nextReview = new Date('2024-01-10T00:00:00.000Z');
      const today = new Date('2024-01-15T12:00:00.000Z');
      const result = isDue(nextReview, today);
      
      expect(result).toBe(true);
    });

    it('should return true for today', () => {
      const nextReview = new Date('2024-01-15T08:00:00.000Z');
      const today = new Date('2024-01-15T18:00:00.000Z');
      const result = isDue(nextReview, today);
      
      expect(result).toBe(true);
    });

    it('should return false for future dates', () => {
      const nextReview = new Date('2024-01-20T00:00:00.000Z');
      const today = new Date('2024-01-15T12:00:00.000Z');
      const result = isDue(nextReview, today);
      
      expect(result).toBe(false);
    });

    it('should handle same-day comparison correctly', () => {
      // Same day, different times should be considered due
      const nextReview = new Date('2024-01-15T23:59:59.999Z');
      const today = new Date('2024-01-15T00:00:00.000Z');
      const result = isDue(nextReview, today);
      
      expect(result).toBe(true);
    });

    it('should accept string dates', () => {
      const nextReview = '2024-01-10T00:00:00.000Z';
      const today = new Date('2024-01-15T12:00:00.000Z');
      const result = isDue(nextReview, today);
      
      expect(result).toBe(true);
    });

    it('should ignore time component in comparison', () => {
      // nextReview at 23:59 on day X should be due on day X at 00:01
      const nextReview = new Date('2024-01-15T23:59:00.000Z');
      const today = new Date('2024-01-15T00:01:00.000Z');
      const result = isDue(nextReview, today);
      
      expect(result).toBe(true);
    });
  });

  describe('calculateNextReview', () => {
    it('should parse next_review field', () => {
      const frontmatter = {
        next_review: '2024-01-20T00:00:00.000Z'
      };
      const result = calculateNextReview(frontmatter);
      
      expect(result).not.toBeNull();
      expect(result?.toISOString()).toBe('2024-01-20T00:00:00.000Z');
    });

    it('should calculate from last_reviewed + interval', () => {
      const frontmatter = {
        last_reviewed: '2024-01-10T00:00:00.000Z',
        review_interval: 5
      };
      const result = calculateNextReview(frontmatter);
      
      expect(result).not.toBeNull();
      expect(result?.toISOString()).toBe('2024-01-15T00:00:00.000Z');
    });

    it('should return null if no review data', () => {
      const frontmatter = {};
      const result = calculateNextReview(frontmatter);
      
      expect(result).toBeNull();
    });

    it('should handle null frontmatter', () => {
      const result = calculateNextReview(null);
      
      expect(result).toBeNull();
    });

    it('should handle undefined frontmatter', () => {
      const result = calculateNextReview(undefined);
      
      expect(result).toBeNull();
    });

    it('should handle malformed dates gracefully', () => {
      const frontmatter = {
        last_reviewed: 'invalid-date',
        review_interval: 5
      };
      
      // Should create a Date object (which will be Invalid Date)
      // but not throw an error
      expect(() => calculateNextReview(frontmatter)).not.toThrow();
    });

    it('should prefer next_review over calculated', () => {
      const frontmatter = {
        next_review: '2024-01-25T00:00:00.000Z',
        last_reviewed: '2024-01-10T00:00:00.000Z',
        review_interval: 5 // Would calculate to Jan 15
      };
      const result = calculateNextReview(frontmatter);
      
      expect(result).not.toBeNull();
      // Should use next_review (Jan 25), not calculated (Jan 15)
      expect(result?.toISOString()).toBe('2024-01-25T00:00:00.000Z');
    });

    it('should handle string review_interval', () => {
      const frontmatter = {
        last_reviewed: '2024-01-10T00:00:00.000Z',
        review_interval: '5' // String instead of number
      };
      const result = calculateNextReview(frontmatter);
      
      expect(result).not.toBeNull();
      expect(result?.toISOString()).toBe('2024-01-15T00:00:00.000Z');
    });

    it('should return null if interval is 0', () => {
      const frontmatter = {
        last_reviewed: '2024-01-10T00:00:00.000Z',
        review_interval: 0
      };
      const result = calculateNextReview(frontmatter);
      
      expect(result).toBeNull();
    });

    it('should use referenceDate when no last_reviewed', () => {
      const frontmatter = {
        review_interval: 5
      };
      const referenceDate = new Date('2024-01-10T12:00:00.000Z');
      const result = calculateNextReview(frontmatter, referenceDate);
      
      expect(result).not.toBeNull();
      expect(result?.toISOString()).toBe('2024-01-15T12:00:00.000Z');
    });
  });

  describe('formatDate', () => {
    it('should format Date object correctly', () => {
      const date = new Date('2024-01-15T12:00:00.000Z');
      const result = formatDate(date);
      
      // Format is YYYY-MM-DD
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(result).toContain('2024');
      expect(result).toContain('01');
      expect(result).toContain('15');
    });

    it('should format string date correctly', () => {
      const result = formatDate('2024-01-15T12:00:00.000Z');
      
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should return empty string for null/undefined', () => {
      expect(formatDate(null as any)).toBe('');
      expect(formatDate(undefined as any)).toBe('');
    });

    it('should pad single digit months and days', () => {
      const date = new Date('2024-03-05T00:00:00.000Z');
      const result = formatDate(date);
      
      expect(result).toContain('03');
      expect(result).toContain('05');
    });
  });
});
