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
});
