import {Card} from "./Card.js";

export interface DeckInit {
  name?: string;
  path?: string;
  cards?: Card[];
}

export interface DeckStats {
  totalCards: number;
  dueCards: number;
  newCards: number;
  learningCards: number;
  matureCards: number;
}

export class Deck {
  name?: string;
  path?: string;
  cards: Card[];

  constructor({name, path, cards = []}: DeckInit = {}) {
    this.name = name;
    this.path = path;
    this.cards = Array.isArray(cards) ? cards : [];
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
