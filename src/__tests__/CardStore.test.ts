import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CardStore } from '../store/CardStore.js';
import Card from '../models/Card.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('CardStore', () => {
  let tempDir: string;
  let store: CardStore;

  beforeEach(async () => {
    // Create temp directory for tests
    tempDir = path.join(os.tmpdir(), `drill-test-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });
    store = new CardStore(tempDir);
  });

  afterEach(() => {
    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('getDueCards', () => {
    it('should return cards with nextReview in the past or today', async () => {
      const deckDir = path.join(tempDir, 'test-deck');
      fs.mkdirSync(deckDir);

      // Create a due card
      const dueCard = `---
created: 2024-01-01T00:00:00.000Z
last_reviewed: 2024-01-01T00:00:00.000Z
next_review: 2024-01-01T00:00:00.000Z
review_interval: 1
easeFactor: 2.5
repetitionCount: 1
---

# Due Card

## Question

Test?

## Answer

Yes
`;

      fs.writeFileSync(path.join(deckDir, 'due.md'), dueCard);

      await store.loadDecks();
      const due = store.getDueCards();

      expect(due.length).toBeGreaterThan(0);
    });

    it('should not return cards with future nextReview', async () => {
      const deckDir = path.join(tempDir, 'test-deck');
      fs.mkdirSync(deckDir);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);

      const futureCard = `---
created: 2024-01-01T00:00:00.000Z
last_reviewed: 2024-01-01T00:00:00.000Z
next_review: ${futureDate.toISOString()}
review_interval: 10
easeFactor: 2.5
repetitionCount: 1
---

# Future Card

## Question

Test?

## Answer

Yes
`;

      fs.writeFileSync(path.join(deckDir, 'future.md'), futureCard);

      await store.loadDecks();
      const due = store.getDueCards();

      expect(due.length).toBe(0);
    });

    it('should filter by deck name', async () => {
      const deck1 = path.join(tempDir, 'deck1');
      const deck2 = path.join(tempDir, 'deck2');
      fs.mkdirSync(deck1);
      fs.mkdirSync(deck2);

      const card = `---
created: 2024-01-01T00:00:00.000Z
next_review: 2024-01-01T00:00:00.000Z
---

# Card

## Question

Test?

## Answer

Yes
`;

      fs.writeFileSync(path.join(deck1, 'card.md'), card);
      fs.writeFileSync(path.join(deck2, 'card.md'), card);

      await store.loadDecks();

      const deck1Due = store.getDueCards('deck1');
      const deck2Due = store.getDueCards('deck2');

      expect(deck1Due.length).toBe(1);
      expect(deck2Due.length).toBe(1);
      expect(deck1Due[0].deckName).toBe('deck1');
    });
  });

  describe('getNewCards', () => {
    it('should return cards with repetitionCount 0 and no lastReviewed', async () => {
      const deckDir = path.join(tempDir, 'test-deck');
      fs.mkdirSync(deckDir);

      const newCard = `---
created: 2024-01-01T00:00:00.000Z
repetitionCount: 0
---

# New Card

## Question

Test?

## Answer

Yes
`;

      fs.writeFileSync(path.join(deckDir, 'new.md'), newCard);

      await store.loadDecks();
      const newCards = store.getNewCards();

      expect(newCards.length).toBe(1);
    });

    it('should not return reviewed cards', async () => {
      const deckDir = path.join(tempDir, 'test-deck');
      fs.mkdirSync(deckDir);

      const reviewedCard = `---
created: 2024-01-01T00:00:00.000Z
last_reviewed: 2024-01-02T00:00:00.000Z
repetitionCount: 1
---

# Reviewed Card

## Question

Test?

## Answer

Yes
`;

      fs.writeFileSync(path.join(deckDir, 'reviewed.md'), reviewedCard);

      await store.loadDecks();
      const newCards = store.getNewCards();

      expect(newCards.length).toBe(0);
    });
  });

  describe('saveCard', () => {
    it('should save card to filesystem', async () => {
      const deckDir = path.join(tempDir, 'test-deck');
      fs.mkdirSync(deckDir);

      const card = new Card({
        title: 'Test Card',
        deckName: 'test-deck',
        question: 'Question?',
        answer: 'Answer!',
        repetitionCount: 1,
        easeFactor: 2.5,
      });

      await store.saveCard(card);

      const files = fs.readdirSync(deckDir);
      expect(files.length).toBeGreaterThan(0);
    });

    it('should update existing card in cache', async () => {
      const deckDir = path.join(tempDir, 'test-deck');
      fs.mkdirSync(deckDir);

      const card = new Card({
        id: 'test-card',
        filePath: path.join(deckDir, 'test-card.md'),
        title: 'Test Card',
        deckName: 'test-deck',
        question: 'Question?',
        answer: 'Answer!',
      });

      await store.saveCard(card);
      await store.loadDecks();

      const deck = store.decks.get('test-deck');
      expect(deck?.cards.length).toBe(1);

      // Update card
      card.repetitionCount = 5;
      await store.saveCard(card);

      const updatedDeck = store.decks.get('test-deck');
      expect(updatedDeck?.cards.length).toBe(1);
      expect(updatedDeck?.cards[0].repetitionCount).toBe(5);
    });
  });

  describe('reload', () => {
    it('should reload decks from filesystem', async () => {
      await store.loadDecks();
      expect(store.decks.size).toBe(0);

      // Add deck after initial load
      const deckDir = path.join(tempDir, 'new-deck');
      fs.mkdirSync(deckDir);

      const card = `---
created: 2024-01-01T00:00:00.000Z
---

# Card

## Question

Test?

## Answer

Yes
`;

      fs.writeFileSync(path.join(deckDir, 'card.md'), card);

      await store.reload();

      expect(store.decks.size).toBe(1);
      expect(store.decks.has('new-deck')).toBe(true);
    });
  });
});
