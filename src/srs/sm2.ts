import {addDays} from "../utils/dates.js";
import Card from "../models/Card.js";
import {validateQuality} from "../utils/validation.js";

export const QUALITY_RATINGS: Record<number, string> = {
  1: "Blackout",
  2: "Wrong",
  3: "Hard",
  4: "Good",
  5: "Easy"
};

/**
 * Result of SM-2 algorithm calculation for scheduling next card review.
 */
export interface SM2Result {
  /** Days until next review (0 = review today) */
  interval: number;
  /** Total successful reviews for this card (resets to 0 on failure) */
  repetitions: number;
  /** Difficulty multiplier (range 1.3+, default 2.5) affecting future intervals */
  easeFactor: number;
  /** Absolute date/time when card should be reviewed next */
  nextReview: Date;
}

/**
 * Implements SM-2 spaced repetition algorithm to calculate next review schedule.
 * Algorithm: quality < 3 resets progress, quality >= 3 advances with increasing intervals.
 * 
 * Interval schedule:
 * - rep=0 (failed/new): 0 days (review today)
 * - rep=1: 1 day
 * - rep=2: 6 days
 * - rep>=3: previous interval * easeFactor
 * 
 * @param card - Card with current SRS state (repetitionCount, easeFactor, reviewInterval)
 * @param quality1to5 - User rating (1=Blackout, 2=Wrong, 3=Hard, 4=Good, 5=Easy)
 * @returns New SRS state to apply to card
 * @throws {ValidationError} Invalid quality rating (must be 1-5 integer)
 */
export function calculateSM2(card: Card, quality1to5: number): SM2Result {
  // Validate quality rating
  validateQuality(quality1to5);

  const quality = quality1to5 === 1 ? 0 : quality1to5; // map 1->0, 2-5 stay 2-5

  let repetitions = card.repetitionCount || 0;
  let easeFactor = card.easeFactor || 2.5;
  let interval = card.reviewInterval || 0;

  const diff = 5 - quality;
  easeFactor = easeFactor + (0.1 - diff * (0.08 + diff * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  if (quality < 3) {
    repetitions = 0;
    interval = 0;
  } else {
    repetitions += 1;
  }

  if (repetitions === 0) {
    interval = 0;
  } else if (repetitions === 1) {
    interval = 1;
  } else if (repetitions === 2) {
    interval = 6;
  } else {
    interval = Math.round(interval * easeFactor) || 1;
  }

  const baseDate = new Date();
  const nextReview = addDays(baseDate, interval);

  return {
    interval,
    repetitions,
    easeFactor,
    nextReview
  };
}
