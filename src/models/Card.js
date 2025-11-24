"use strict";

const DEFAULT_EASE_FACTOR = 2.5;

class Card {
  constructor({
    id,
    title,
    filePath,
    deckName,
    question = "",
    answer = "",
    tags = [],
    created = new Date(),
    lastReviewed = null,
    nextReview = null,
    reviewInterval = 0,
    easeFactor = DEFAULT_EASE_FACTOR,
    repetitionCount = 0,
    difficulty = null
  } = {}) {
    this.id = id;
    this.title = title;
    this.filePath = filePath;
    this.deckName = deckName;
    this.question = question;
    this.answer = answer;
    this.tags = Array.isArray(tags) ? tags : [];

    this.created = created instanceof Date ? created : created ? new Date(created) : new Date();
    this.lastReviewed = lastReviewed instanceof Date ? lastReviewed : lastReviewed ? new Date(lastReviewed) : null;
    this.nextReview = nextReview instanceof Date ? nextReview : nextReview ? new Date(nextReview) : null;

    this.reviewInterval = reviewInterval || 0;
    this.easeFactor = easeFactor || DEFAULT_EASE_FACTOR;
    this.repetitionCount = repetitionCount || 0;
    this.difficulty = difficulty;
  }

  static fromParsedMarkdown(parsed) {
    if (!parsed) return new Card();

    const {
      id,
      title,
      filePath,
      deckName,
      question,
      answer,
      tags,
      created,
      lastReviewed,
      nextReview,
      reviewInterval,
      easeFactor,
      repetitionCount,
      difficulty
    } = parsed;

    return new Card({
      id,
      title,
      filePath,
      deckName,
      question,
      answer,
      tags,
      created,
      lastReviewed,
      nextReview,
      reviewInterval,
      easeFactor,
      repetitionCount,
      difficulty
    });
  }

  serialize() {
    // Lazy-require to avoid circular deps before writer exists
    const {serializeCard} = require("../store/writer");
    return serializeCard(this);
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      filePath: this.filePath,
      deckName: this.deckName,
      question: this.question,
      answer: this.answer,
      tags: this.tags,
      created: this.created,
      lastReviewed: this.lastReviewed,
      nextReview: this.nextReview,
      reviewInterval: this.reviewInterval,
      easeFactor: this.easeFactor,
      repetitionCount: this.repetitionCount,
      difficulty: this.difficulty
    };
  }
}

module.exports = Card;
