import {Card} from "./Card.js";

export interface DeckInit {
  name?: string;
  path?: string;
  cards?: Card[];
  lastStudied?: Date | null;
}

/**
 * Statistics summary for a deck's cards.
 */
export interface DeckStats {
  /** Total cards in deck */
  totalCards: number;
  /** Cards due for review today */
  dueCards: number;
  /** Cards never studied (rep=0, no lastReviewed) */
  newCards: number;
  /** Cards with 1-2 successful reviews */
  learningCards: number;
  /** Cards with 3+ successful reviews */
  matureCards: number;
}

/**
 * Collection of flashcards with metadata and filtering methods.
 */
export class Deck {
  name?: string;
  path?: string;
  cards: Card[];
  lastStudied: Date | null;

  constructor({name, path, cards = [], lastStudied = null}: DeckInit = {}) {
    this.name = name;
    this.path = path;
    this.cards = Array.isArray(cards) ? cards : [];
    this.lastStudied = lastStudied;
  }

  get totalCards(): number {
    return this.cards.length;
  }

  getDueCards(referenceDate: Date = new Date()): Card[] {
    const today = new Date(referenceDate);
    today.setHours(0, 0, 0, 0);

    return this.cards.filter(card => {
      if (!card || !card.nextReview) return false;
      const next =
        card.nextReview instanceof Date
          ? card.nextReview
          : new Date(card.nextReview);
      return next <= today;
    });
  }

  getNewCards(): Card[] {
    return this.cards.filter(card => {
      if (!card) return false;
      const repetitions = card.repetitionCount || 0;
      return repetitions === 0 && !card.lastReviewed;
    });
  }

  getLearningCards(): Card[] {
    return this.cards.filter(card => {
      if (!card) return false;
      const repetitions = card.repetitionCount || 0;
      return repetitions > 0 && repetitions < 3;
    });
  }

  getMatureCards(): Card[] {
    return this.cards.filter(card => {
      if (!card) return false;
      const repetitions = card.repetitionCount || 0;
      return repetitions >= 3;
    });
  }

  /**
   * Calculates statistics for this deck (total, due, new, learning, mature).
   * @returns Statistics object with card counts by category
   */
  getStats(): DeckStats {
    const totalCards = this.totalCards;
    const dueCards = this.getDueCards().length;
    const newCards = this.getNewCards().length;
    const learningCards = this.getLearningCards().length;
    const matureCards = this.getMatureCards().length;

    return {
      totalCards,
      dueCards,
      newCards,
      learningCards,
      matureCards
    };
  }
}

export default Deck;
