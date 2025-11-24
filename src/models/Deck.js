"use strict";

class Deck {
  constructor({name, path, cards = []} = {}) {
    this.name = name;
    this.path = path;
    this.cards = Array.isArray(cards) ? cards : [];
  }

  get totalCards() {
    return this.cards.length;
  }

  getDueCards(referenceDate = new Date()) {
    const today = new Date(referenceDate);
    today.setHours(0, 0, 0, 0);

    return this.cards.filter(card => {
      if (!card || !card.nextReview) return false;
      const next = card.nextReview instanceof Date ? card.nextReview : new Date(card.nextReview);
      return next <= today;
    });
  }

  getNewCards() {
    return this.cards.filter(card => {
      if (!card) return false;
      const repetitions = card.repetitionCount || 0;
      return repetitions === 0 && !card.lastReviewed;
    });
  }

  getLearningCards() {
    return this.cards.filter(card => {
      if (!card) return false;
      const repetitions = card.repetitionCount || 0;
      return repetitions > 0 && repetitions < 3;
    });
  }

  getMatureCards() {
    return this.cards.filter(card => {
      if (!card) return false;
      const repetitions = card.repetitionCount || 0;
      return repetitions >= 3;
    });
  }

  getStats() {
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

module.exports = Deck;
