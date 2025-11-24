import { describe, it, expect } from 'vitest';
import { parseMarkdownCard } from '../store/parser.js';
import { serializeCard } from '../store/writer.js';
import Card from '../models/Card.js';

describe('Parser/Writer Round-trip', () => {
  it('should parse and serialize card without data loss', () => {
    const originalMarkdown = `---
created: 2024-01-01T00:00:00.000Z
last_reviewed: 2024-01-02T00:00:00.000Z
review_interval: 1
easeFactor: 2.5
repetitionCount: 1
tags:
  - test
  - example
difficulty: null
---

# Test Card

## Question

What is a test?

## Answer

A test is a verification mechanism.
`;

    const parsed = parseMarkdownCard('/test/test-card.md', originalMarkdown);
    const card = Card.fromParsedMarkdown(parsed);
    const serialized = serializeCard(card);

    // Parse again to verify round-trip
    const reparsed = parseMarkdownCard('/test/test-card.md', serialized);

    expect(reparsed.title).toBe('Test Card');
    expect(reparsed.question).toBe('What is a test?');
    expect(reparsed.answer).toBe('A test is a verification mechanism.');
    expect(reparsed.tags).toEqual(['test', 'example']);
    expect(reparsed.repetitionCount).toBe(1);
    expect(reparsed.easeFactor).toBe(2.5);
    expect(reparsed.reviewInterval).toBe(1);
  });

  it('should handle cards with minimal frontmatter', () => {
    const markdown = `---
created: 2024-01-01T00:00:00.000Z
---

# Simple Card

## Question

Question text

## Answer

Answer text
`;

    const parsed = parseMarkdownCard('/test/simple.md', markdown);

    expect(parsed.title).toBe('Simple Card');
    expect(parsed.question).toBe('Question text');
    expect(parsed.answer).toBe('Answer text');
    expect(parsed.repetitionCount).toBe(0);
    expect(parsed.easeFactor).toBe(2.5);
    expect(parsed.reviewInterval).toBe(0);
  });

  it('should handle malformed markdown gracefully', () => {
    const markdown = 'Invalid markdown without frontmatter';

    const parsed = parseMarkdownCard('/test/bad.md', markdown);

    expect(parsed.id).toBe('bad');
    expect(parsed.filePath).toBe('/test/bad.md');
    // Should not throw, should return some default values
  });

  it('should preserve all SM-2 fields in round-trip', () => {
    const card = new Card({
      title: 'SM-2 Test',
      question: 'Test question',
      answer: 'Test answer',
      tags: ['test'],
      created: new Date('2024-01-01'),
      lastReviewed: new Date('2024-01-05'),
      nextReview: new Date('2024-01-15'),
      reviewInterval: 10,
      easeFactor: 2.8,
      repetitionCount: 5,
      difficulty: null,
    });

    const serialized = serializeCard(card);
    const parsed = parseMarkdownCard('/test/test.md', serialized);

    expect(parsed.repetitionCount).toBe(5);
    expect(parsed.easeFactor).toBe(2.8);
    expect(parsed.reviewInterval).toBe(10);
  });
});
