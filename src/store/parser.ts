import path from "path";
import matter from "gray-matter";
import {calculateNextReview} from "../utils/dates.js";
import {ParsedMarkdownCard} from "../models/Card.js";
import {logger} from "../utils/logger.js";

export function parseMarkdownCard(filePath: string, content: string): ParsedMarkdownCard {
  try {
    const {data: frontmatter = {}, content: bodyContent = ""} = matter(content || "");

    const titleMatch = bodyContent.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : "Untitled";

    const questionMatch = bodyContent.match(/##\s+Question\s*\n([\s\S]*?)(?=^##\s+|\Z)/m);
    const question = questionMatch ? questionMatch[1].trim() : "";

    const answerMatch = bodyContent.match(/##\s+Answer\s*\n([\s\S]*?)$/m);
    const answer = answerMatch ? answerMatch[1].trim() : "";

    const created = frontmatter.created ? new Date(frontmatter.created as string) : new Date();
    const lastReviewed = frontmatter.last_reviewed
      ? new Date(frontmatter.last_reviewed as string)
      : null;
    const reviewInterval = (frontmatter.review_interval as number) || 0;
    const easeFactor = (frontmatter.easeFactor as number) || 2.5;
    const repetitionCount = (frontmatter.repetitionCount as number) || 0;

    // Support both lastRating (new) and difficulty (deprecated)
    const lastRatingValue = (frontmatter as any).lastRating ?? (frontmatter as any).difficulty;
    const lastRating =
      typeof lastRatingValue === "number"
        ? lastRatingValue
        : lastRatingValue != null
        ? parseInt(String(lastRatingValue), 10)
        : null;

    const nextReview = calculateNextReview(frontmatter as any) || null;

    return {
      id: path.basename(filePath, ".md"),
      filePath,
      title,
      question,
      answer,
      tags: (frontmatter.tags as string[]) || [],
      created,
      lastReviewed,
      nextReview,
      reviewInterval,
      easeFactor,
      repetitionCount,
      lastRating,
      difficulty: lastRating  // backward compat
    };
  } catch (err) {
    logger.warn(`Failed to parse card: ${path.basename(filePath)}`, {
      error: err instanceof Error ? err.message : 'Unknown error',
      filePath,
      function: 'parseMarkdownCard'
    });
    // Return minimal valid card on parse error
    return {
      id: path.basename(filePath, ".md"),
      filePath,
      title: "Parse Error",
      question: "Failed to parse card",
      answer: "",
      tags: [],
      created: new Date(),
      lastReviewed: null,
      nextReview: null,
      reviewInterval: 0,
      easeFactor: 2.5,
      repetitionCount: 0,
      lastRating: null,
      difficulty: null
    };
  }
}
