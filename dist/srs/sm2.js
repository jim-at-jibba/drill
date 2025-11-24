import { addDays } from "../utils/dates.js";
export const QUALITY_RATINGS = {
    1: "Blackout",
    2: "Wrong",
    3: "Hard",
    4: "Good",
    5: "Easy"
};
export function calculateSM2(card, quality1to5) {
    if (quality1to5 < 1 || quality1to5 > 5) {
        throw new Error("Quality must be between 1 and 5");
    }
    const quality = quality1to5 === 1 ? 0 : quality1to5; // map 1->0, 2-5 stay 2-5
    let repetitions = card.repetitionCount || 0;
    let easeFactor = card.easeFactor || 2.5;
    let interval = card.reviewInterval || 0;
    const diff = 5 - quality;
    easeFactor = easeFactor + (0.1 - diff * (0.08 + diff * 0.02));
    if (easeFactor < 1.3)
        easeFactor = 1.3;
    if (quality < 3) {
        repetitions = 0;
        interval = 0;
    }
    else {
        repetitions += 1;
    }
    if (repetitions === 0) {
        interval = 0;
    }
    else if (repetitions === 1) {
        interval = 1;
    }
    else if (repetitions === 2) {
        interval = 6;
    }
    else {
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
