import fs from "fs";
import path from "path";
import Deck, {DeckStats} from "../models/Deck.js";
import Card from "../models/Card.js";
import {parseMarkdownCard} from "./parser.js";
import {startOfToday, isDue} from "../utils/dates.js";
import {logger} from "../utils/logger.js";
import {validateDeckName, validateCardContent, ValidationError} from "../utils/validation.js";

const fsp = fs.promises;

export class CardStore {
  baseDir: string;
  decks: Map<string, Deck>;

  constructor(baseDir: string) {
    this.baseDir = baseDir;
    this.decks = new Map();
  }

  async loadDecks(): Promise<void> {
    this.decks.clear();

    let entries: fs.Dirent[];
    try {
      entries = await fsp.readdir(this.baseDir, {withFileTypes: true});
    } catch (err) {
      logger.error('Failed to read base directory', err as Error, {
        baseDir: this.baseDir,
        function: 'CardStore.loadDecks'
      });
      return;
    }

    logger.info(`Loading decks from ${this.baseDir}`, { count: entries.length });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const deckName = entry.name;
      const deckPath = path.join(this.baseDir, deckName);
      try {
        const deck = await this.loadDeckFromPath(deckName, deckPath);
        this.decks.set(deckName, deck);
      } catch (err) {
        logger.error(`Failed to load deck: ${deckName}`, err as Error, {
          deckName,
          deckPath,
          function: 'CardStore.loadDecks'
        });
        // Continue loading other decks
      }
    }
  }

  async reload(): Promise<void> {
    await this.loadDecks();
  }

  private async loadDeckFromPath(name: string, dirPath: string): Promise<Deck> {
    let files: fs.Dirent[];
    try {
      files = await fsp.readdir(dirPath, {withFileTypes: true});
    } catch (err) {
      logger.warn(`Failed to read deck directory: ${name}`, {
        error: err instanceof Error ? err.message : 'Unknown error',
        dirPath,
        function: 'CardStore.loadDeckFromPath'
      });
      return new Deck({name, path: dirPath, cards: []});
    }

    const cards: Card[] = [];

    for (const file of files) {
      if (!file.isFile()) continue;
      if (!file.name.endsWith(".md")) continue;

      const filePath = path.join(dirPath, file.name);
      let content: string;
      try {
        content = await fsp.readFile(filePath, "utf8");
      } catch (err) {
        logger.warn(`Failed to read card file: ${file.name}`, {
          error: err instanceof Error ? err.message : 'Unknown error',
          filePath,
          function: 'CardStore.loadDeckFromPath'
        });
        continue;
      }

      const parsed = parseMarkdownCard(filePath, content);
      parsed.deckName = name;
      const card = Card.fromParsedMarkdown(parsed);
      cards.push(card);
    }

    logger.debug(`Loaded deck: ${name}`, { cardCount: cards.length, dirPath });
    return new Deck({name, path: dirPath, cards});
  }

  private getAllCards(): Card[] {
    const result: Card[] = [];
    for (const deck of this.decks.values()) {
      result.push(...deck.cards);
    }
    return result;
  }

  getDueCards(deckName?: string): Card[] {
    const today = startOfToday();
    const sourceCards = deckName
      ? this.decks.get(deckName)?.cards || []
      : this.getAllCards();

    const due = sourceCards.filter(card => isDue(card.nextReview, today));

    return due.sort((a, b) => {
      if (!a.nextReview && !b.nextReview) return 0;
      if (!a.nextReview) return 1;
      if (!b.nextReview) return -1;
      return a.nextReview.getTime() - b.nextReview.getTime();
    });
  }

  getNewCards(deckName?: string): Card[] {
    const sourceCards = deckName
      ? this.decks.get(deckName)?.cards || []
      : this.getAllCards();

    return sourceCards.filter(card => {
      const repetitions = card.repetitionCount || 0;
      return repetitions === 0 && !card.lastReviewed;
    });
  }

  async saveCard(card: Card): Promise<void> {
    // Validate card content
    try {
      validateCardContent(card.question, 'Card question');
      validateCardContent(card.answer, 'Card answer');
    } catch (err) {
      if (err instanceof ValidationError) {
        logger.error('Card validation failed', err, {
          function: 'CardStore.saveCard',
          cardId: card.id
        });
        throw err;
      }
      throw err;
    }

    let filePath = card.filePath;

    if (!filePath) {
      const deckName = card.deckName;
      const title = card.title || card.id || "card";
      if (!deckName) {
        throw new Error("Card must have deckName when filePath is missing");
      }

      // Validate deck name
      try {
        validateDeckName(deckName);
      } catch (err) {
        if (err instanceof ValidationError) {
          logger.error('Deck name validation failed', err, {
            function: 'CardStore.saveCard',
            deckName
          });
          throw err;
        }
        throw err;
      }

      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const deckDir = path.join(this.baseDir, deckName);
      filePath = path.join(deckDir, `${slug || "card"}.md`);
      card.filePath = filePath;
    }

    // Validate path is within baseDir (prevent path traversal)
    const normalizedPath = path.resolve(filePath);
    const normalizedBase = path.resolve(this.baseDir);
    if (!normalizedPath.startsWith(normalizedBase + path.sep) && normalizedPath !== normalizedBase) {
      logger.error('Path traversal attempt detected', undefined, {
        filePath,
        normalizedPath,
        baseDir: this.baseDir,
        function: 'CardStore.saveCard'
      });
      throw new Error("Invalid file path: outside base directory");
    }

    const dir = path.dirname(filePath);
    await fsp.mkdir(dir, {recursive: true});

    const markdown = await card.serialize();
    await fsp.writeFile(filePath, markdown, "utf8");

    const deckName = card.deckName || path.basename(path.dirname(filePath));
    card.deckName = deckName;

    let deck = this.decks.get(deckName);
    if (!deck) {
      deck = new Deck({name: deckName, path: path.dirname(filePath), cards: []});
      this.decks.set(deckName, deck);
    }

    const index = deck.cards.findIndex(existing => {
      if (card.id && existing.id) return card.id === existing.id;
      if (card.filePath && existing.filePath) return card.filePath === existing.filePath;
      return false;
    });

    if (index >= 0) {
      deck.cards[index] = card;
    } else {
      deck.cards.push(card);
    }
    
    // Update deck lastStudied timestamp
    deck.lastStudied = new Date();
  }

  getStats(deckName?: string): DeckStats {
    if (deckName) {
      const deck = this.decks.get(deckName);
      return deck ? deck.getStats() : {totalCards: 0, dueCards: 0, newCards: 0, learningCards: 0, matureCards: 0};
    }

    let totalCards = 0;
    let dueCards = 0;
    let newCards = 0;
    let learningCards = 0;
    let matureCards = 0;

    for (const deck of this.decks.values()) {
      const stats = deck.getStats();
      totalCards += stats.totalCards;
      dueCards += stats.dueCards;
      newCards += stats.newCards;
      learningCards += stats.learningCards;
      matureCards += stats.matureCards;
    }

    return {totalCards, dueCards, newCards, learningCards, matureCards};
  }
}

export default CardStore;
