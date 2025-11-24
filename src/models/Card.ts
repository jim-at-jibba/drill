export interface CardInit {
  id?: string;
  title?: string;
  filePath?: string;
  deckName?: string;
  question?: string;
  answer?: string;
  tags?: string[];
  created?: Date | string;
  lastReviewed?: Date | string | null;
  nextReview?: Date | string | null;
  reviewInterval?: number;
  easeFactor?: number;
  repetitionCount?: number;
  difficulty?: number | null;
}

export interface ParsedMarkdownCard extends CardInit {}

const DEFAULT_EASE_FACTOR = 2.5;

export class Card {
  id?: string;
  title?: string;
  filePath?: string;
  deckName?: string;
  question: string;
  answer: string;
  tags: string[];
  created: Date;
  lastReviewed: Date | null;
  nextReview: Date | null;
  reviewInterval: number;
  easeFactor: number;
  repetitionCount: number;
  difficulty: number | null;

  constructor(init: CardInit = {}) {
    const {
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
    } = init;

    this.id = id;
    this.title = title;
    this.filePath = filePath;
    this.deckName = deckName;
    this.question = question;
    this.answer = answer;
    this.tags = Array.isArray(tags) ? tags : [];

    this.created = created instanceof Date ? created : new Date(created);
    this.lastReviewed = lastReviewed
      ? lastReviewed instanceof Date
        ? lastReviewed
        : new Date(lastReviewed)
      : null;
    this.nextReview = nextReview
      ? nextReview instanceof Date
        ? nextReview
        : new Date(nextReview)
      : null;

    this.reviewInterval = reviewInterval || 0;
    this.easeFactor = easeFactor || DEFAULT_EASE_FACTOR;
    this.repetitionCount = repetitionCount || 0;
    this.difficulty = difficulty;
  }

  static fromParsedMarkdown(parsed?: ParsedMarkdownCard): Card {
    if (!parsed) return new Card();
    return new Card(parsed);
  }

  serialize(): string {
    // Lazy import to avoid circular deps
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const {serializeCard}: {serializeCard: (card: Card) => string} = require("../store/writer");
    return serializeCard(this);
  }
}

export default Card;
