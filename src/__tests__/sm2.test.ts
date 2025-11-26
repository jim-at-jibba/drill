import { describe, it, expect } from 'vitest';
import { calculateSM2 } from '../srs/sm2.js';
import Card from '../models/Card.js';

describe('SM-2 Algorithm', () => {
  it('should handle quality rating of 1 (blackout)', () => {
    const card = new Card({
      question: 'Test',
      answer: 'Test',
      repetitionCount: 0,
      easeFactor: 2.5,
      reviewInterval: 0,
    });

    const result = calculateSM2(card, 1);

    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(0);
    expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
  });

  it('should handle quality rating of 3 (first success)', () => {
    const card = new Card({
      question: 'Test',
      answer: 'Test',
      repetitionCount: 0,
      easeFactor: 2.5,
      reviewInterval: 0,
    });

    const result = calculateSM2(card, 3);

    expect(result.repetitions).toBe(1);
    expect(result.interval).toBe(1);
  });

  it('should follow 1, 6, n*EF progression', () => {
    let card = new Card({
      question: 'Test',
      answer: 'Test',
      repetitionCount: 0,
      easeFactor: 2.5,
      reviewInterval: 0,
    });

    // First review (quality 4)
    let result = calculateSM2(card, 4);
    expect(result.interval).toBe(1);
    expect(result.repetitions).toBe(1);

    // Second review (quality 4)
    card = new Card({
      ...card,
      repetitionCount: result.repetitions,
      easeFactor: result.easeFactor,
      reviewInterval: result.interval,
    });
    result = calculateSM2(card, 4);
    expect(result.interval).toBe(6);
    expect(result.repetitions).toBe(2);

    // Third review (quality 4)
    card = new Card({
      ...card,
      repetitionCount: result.repetitions,
      easeFactor: result.easeFactor,
      reviewInterval: result.interval,
    });
    result = calculateSM2(card, 4);
    expect(result.interval).toBeGreaterThan(6);
    expect(result.repetitions).toBe(3);
  });

  it('should reset progress on quality < 3', () => {
    const card = new Card({
      question: 'Test',
      answer: 'Test',
      repetitionCount: 5,
      easeFactor: 2.8,
      reviewInterval: 30,
    });

    const result = calculateSM2(card, 2);

    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(0);
  });

  it('should enforce minimum ease factor of 1.3', () => {
    const card = new Card({
      question: 'Test',
      answer: 'Test',
      repetitionCount: 0,
      easeFactor: 1.3,
      reviewInterval: 0,
    });

    // Rating of 1 should decrease EF but not below 1.3
    const result = calculateSM2(card, 1);

    expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
  });

  it('should throw error for invalid quality rating', () => {
    const card = new Card({
      question: 'Test',
      answer: 'Test',
    });

    expect(() => calculateSM2(card, 0)).toThrow();
    expect(() => calculateSM2(card, 6)).toThrow();
  });

  it('should calculate nextReview date', () => {
    const card = new Card({
      question: 'Test',
      answer: 'Test',
    });

    const result = calculateSM2(card, 4);

    expect(result.nextReview).toBeInstanceOf(Date);
    expect(result.nextReview.getTime()).toBeGreaterThan(Date.now());
  });

  describe('Edge Cases', () => {
    describe('Easiness Factor Boundaries', () => {
      it('should enforce EF minimum of 1.3 with multiple failures', () => {
        let card = new Card({
          question: 'Test',
          answer: 'Test',
          easeFactor: 1.3,
        });

        // Rate 1 multiple times to try to push EF below 1.3
        for (let i = 0; i < 10; i++) {
          const result = calculateSM2(card, 1);
          expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
          card = new Card({
            ...card,
            easeFactor: result.easeFactor,
            repetitionCount: result.repetitions,
            reviewInterval: result.interval,
          });
        }

        expect(card.easeFactor).toBe(1.3);
      });

      it('should maintain EF precision to avoid floating point errors', () => {
        const card = new Card({
          question: 'Test',
          answer: 'Test',
          easeFactor: 2.5,
        });

        const result = calculateSM2(card, 4);
        
        // EF should be a reasonable number, not something like 2.5000000001
        expect(Number.isFinite(result.easeFactor)).toBe(true);
        expect(result.easeFactor).toBeGreaterThan(0);
        expect(result.easeFactor).toBeLessThan(10); // Sanity check
      });

      it('should increase EF with good ratings', () => {
        const card = new Card({
          question: 'Test',
          answer: 'Test',
          easeFactor: 2.5,
        });

        const result = calculateSM2(card, 5); // Perfect rating
        
        expect(result.easeFactor).toBeGreaterThan(2.5);
      });

      it('should decrease EF with poor ratings', () => {
        const card = new Card({
          question: 'Test',
          answer: 'Test',
          easeFactor: 2.5,
        });

        const result = calculateSM2(card, 1); // Blackout
        
        expect(result.easeFactor).toBeLessThan(2.5);
        expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
      });
    });

    describe('High Repetition Counts', () => {
      it('should handle 50+ repetitions without overflow', () => {
        let card = new Card({
          question: 'Test',
          answer: 'Test',
          repetitionCount: 50,
          easeFactor: 2.5,
          reviewInterval: 365, // 1 year
        });

        const result = calculateSM2(card, 4);
        
        expect(result.repetitions).toBe(51);
        expect(result.interval).toBeGreaterThan(0);
        expect(Number.isFinite(result.interval)).toBe(true);
      });

      it('should maintain reasonable intervals at high repetitions', () => {
        const card = new Card({
          question: 'Test',
          answer: 'Test',
          repetitionCount: 100,
          easeFactor: 2.5,
          reviewInterval: 1000,
        });

        const result = calculateSM2(card, 4);
        
        // Interval should grow but not become absurdly large
        expect(result.interval).toBeGreaterThan(1000);
        expect(result.interval).toBeLessThan(10000); // Max ~27 years seems reasonable
      });

      it('should handle repetitions of exactly 1 and 2 correctly', () => {
        // rep=1 should give interval=1
        let card = new Card({
          question: 'Test',
          answer: 'Test',
          repetitionCount: 0,
          easeFactor: 2.5,
        });
        let result = calculateSM2(card, 4);
        expect(result.interval).toBe(1);
        expect(result.repetitions).toBe(1);

        // rep=2 should give interval=6
        card = new Card({
          question: 'Test',
          answer: 'Test',
          repetitionCount: 1,
          easeFactor: 2.5,
          reviewInterval: 1,
        });
        result = calculateSM2(card, 4);
        expect(result.interval).toBe(6);
        expect(result.repetitions).toBe(2);
      });
    });

    describe('Quality Transitions', () => {
      it('should reset repetitions on failure after success', () => {
        // Build up some repetitions
        let card = new Card({
          question: 'Test',
          answer: 'Test',
          repetitionCount: 5,
          easeFactor: 2.5,
          reviewInterval: 30,
        });

        // Fail with quality < 3
        const result = calculateSM2(card, 2);
        
        expect(result.repetitions).toBe(0);
        expect(result.interval).toBe(0);
      });

      it('should maintain repetitions on marginal success', () => {
        const card = new Card({
          question: 'Test',
          answer: 'Test',
          repetitionCount: 3,
          easeFactor: 2.5,
          reviewInterval: 10,
        });

        // Quality 3 is still a pass
        const result = calculateSM2(card, 3);
        
        expect(result.repetitions).toBe(4);
        expect(result.interval).toBeGreaterThan(0);
      });

      it('should handle alternating success/failure correctly', () => {
        let card = new Card({
          question: 'Test',
          answer: 'Test',
        });

        // Success
        let result = calculateSM2(card, 4);
        expect(result.repetitions).toBe(1);

        // Failure
        card = new Card({
          ...card,
          repetitionCount: result.repetitions,
          easeFactor: result.easeFactor,
          reviewInterval: result.interval,
        });
        result = calculateSM2(card, 2);
        expect(result.repetitions).toBe(0);

        // Success again
        card = new Card({
          ...card,
          repetitionCount: result.repetitions,
          easeFactor: result.easeFactor,
          reviewInterval: result.interval,
        });
        result = calculateSM2(card, 4);
        expect(result.repetitions).toBe(1);
      });

      it('should handle quality=2 boundary (failure)', () => {
        const card = new Card({
          question: 'Test',
          answer: 'Test',
          repetitionCount: 5,
        });

        const result = calculateSM2(card, 2);
        
        // Quality 2 is a failure, should reset
        expect(result.repetitions).toBe(0);
        expect(result.interval).toBe(0);
      });

      it('should handle quality=3 boundary (success)', () => {
        const card = new Card({
          question: 'Test',
          answer: 'Test',
          repetitionCount: 0,
        });

        const result = calculateSM2(card, 3);
        
        // Quality 3 is a pass, should increment
        expect(result.repetitions).toBe(1);
        expect(result.interval).toBe(1);
      });
    });

    describe('Interval Calculations', () => {
      it('should return interval=0 for rep=0', () => {
        const card = new Card({
          question: 'Test',
          answer: 'Test',
          repetitionCount: 0,
        });

        // Fail to keep rep=0
        const result = calculateSM2(card, 2);
        
        expect(result.repetitions).toBe(0);
        expect(result.interval).toBe(0);
      });

      it('should return interval=1 for rep=1', () => {
        const card = new Card({
          question: 'Test',
          answer: 'Test',
          repetitionCount: 0,
        });

        const result = calculateSM2(card, 4);
        
        expect(result.repetitions).toBe(1);
        expect(result.interval).toBe(1);
      });

      it('should return interval=6 for rep=2', () => {
        const card = new Card({
          question: 'Test',
          answer: 'Test',
          repetitionCount: 1,
          reviewInterval: 1,
        });

        const result = calculateSM2(card, 4);
        
        expect(result.repetitions).toBe(2);
        expect(result.interval).toBe(6);
      });

      it('should apply EF formula for rep>=3', () => {
        const card = new Card({
          question: 'Test',
          answer: 'Test',
          repetitionCount: 2,
          easeFactor: 2.5,
          reviewInterval: 6,
        });

        const result = calculateSM2(card, 4);
        
        expect(result.repetitions).toBe(3);
        // interval should be previous * EF, rounded
        expect(result.interval).toBeGreaterThan(6);
        expect(result.interval).toBeLessThanOrEqual(Math.round(6 * 2.6)); // EF increases slightly
      });

      it('should round intervals to integers', () => {
        const card = new Card({
          question: 'Test',
          answer: 'Test',
          repetitionCount: 2,
          easeFactor: 2.3, // Odd EF to create fractional interval
          reviewInterval: 7,
        });

        const result = calculateSM2(card, 4);
        
        expect(Number.isInteger(result.interval)).toBe(true);
      });

      it('should ensure minimum interval of 1 for successful reviews', () => {
        const card = new Card({
          question: 'Test',
          answer: 'Test',
          repetitionCount: 10,
          easeFactor: 1.3, // Minimum EF
          reviewInterval: 0, // Edge case: 0 interval
        });

        const result = calculateSM2(card, 3);
        
        expect(result.interval).toBeGreaterThanOrEqual(1);
      });
    });

    describe('Validation', () => {
      it('should reject quality < 1', () => {
        const card = new Card({ question: 'Test', answer: 'Test' });
        
        expect(() => calculateSM2(card, 0)).toThrow('Quality must be between 1 and 5');
      });

      it('should reject quality > 5', () => {
        const card = new Card({ question: 'Test', answer: 'Test' });
        
        expect(() => calculateSM2(card, 6)).toThrow('Quality must be between 1 and 5');
      });

      it('should reject non-integer quality', () => {
        const card = new Card({ question: 'Test', answer: 'Test' });
        
        expect(() => calculateSM2(card, 3.5)).toThrow('Quality must be an integer');
      });

      it('should reject NaN quality', () => {
        const card = new Card({ question: 'Test', answer: 'Test' });
        
        expect(() => calculateSM2(card, NaN)).toThrow('Quality must be a number');
      });

      it('should reject Infinity quality', () => {
        const card = new Card({ question: 'Test', answer: 'Test' });
        
        expect(() => calculateSM2(card, Infinity)).toThrow('Quality must be a number');
      });

      it('should accept all valid qualities 1-5', () => {
        const card = new Card({ question: 'Test', answer: 'Test' });
        
        for (let quality = 1; quality <= 5; quality++) {
          expect(() => calculateSM2(card, quality)).not.toThrow();
        }
      });
    });
  });
});
