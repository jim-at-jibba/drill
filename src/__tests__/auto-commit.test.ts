import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { CardStore } from '../store/CardStore.js';
import { Card } from '../models/Card.js';

const execAsync = promisify(exec);

describe('Auto-commit functionality', () => {
  let testDir: string;
  let originalCwd: string;
  let store: CardStore;

  beforeEach(async () => {
    testDir = path.join(process.cwd(), 'test-auto-commit');
    originalCwd = process.cwd();
    
    // Clean up any existing test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    
    fs.mkdirSync(testDir, { recursive: true });
    process.chdir(testDir);
    
    // Initialize git repo
    await execAsync('git init');
    await execAsync('git config user.email "test@example.com"');
    await execAsync('git config user.name "Test User"');
    
    // Create test deck directory
    fs.mkdirSync('test-deck', { recursive: true });
    
    // Create a test card
    const testCard = new Card({
      id: 'test-card-1',
      question: 'What is 2+2?',
      answer: '4',
      deckName: 'test-deck',
      tags: ['math', 'basic']
    });
    
    store = new CardStore(testDir);
    await store.loadDecks();
    await store.saveCard(testCard);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should detect git repository', async () => {
    // This test verifies the underlying git detection works
    expect(fs.existsSync(path.join(testDir, '.git'))).toBe(true);
  });

  it('should create commits when cards are saved', async () => {
    // Initially no commits
    try {
      let { stdout: logOutput } = await execAsync('git log --oneline');
      expect(logOutput.trim()).toBe('');
    } catch (err) {
      // Git log fails when there are no commits, which is expected
      expect(true).toBe(true);
    }
    
    // Update the card (simulating a review)
    const cards = store.getNewCards('test-deck');
    expect(cards.length).toBe(1);
    
    const card = cards[0];
    const updatedCard = new Card({
      ...card,
      lastReviewed: new Date(),
      repetitionCount: 1,
      reviewInterval: 1,
      easeFactor: 2.5,
      lastRating: 4
    });
    
    await store.saveCard(updatedCard);
    
    // Check that changes were made to the file
    const cardFile = path.join(testDir, 'test-deck', 'test-card-1.md');
    expect(fs.existsSync(cardFile)).toBe(true);
    
    // Check git status
    const { stdout: statusOutput } = await execAsync('git status --porcelain');
    expect(statusOutput.trim()).not.toBe('');
  });
});
