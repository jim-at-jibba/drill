import path from "path";
import matter from "gray-matter";
import { calculateNextReview } from "../utils/dates.js";
export function parseMarkdownCard(filePath, content) {
    const { data: frontmatter = {}, content: bodyContent = "" } = matter(content || "");
    const titleMatch = bodyContent.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : "Untitled";
    const questionMatch = bodyContent.match(/##\s+Question\s*\n([\s\S]*?)(?=^##\s+|\Z)/m);
    const question = questionMatch ? questionMatch[1].trim() : "";
    const answerMatch = bodyContent.match(/##\s+Answer\s*\n([\s\S]*?)$/m);
    const answer = answerMatch ? answerMatch[1].trim() : "";
    const created = frontmatter.created ? new Date(frontmatter.created) : new Date();
    const lastReviewed = frontmatter.last_reviewed
        ? new Date(frontmatter.last_reviewed)
        : null;
    const reviewInterval = frontmatter.review_interval || 0;
    const easeFactor = frontmatter.easeFactor || 2.5;
    const repetitionCount = frontmatter.repetitionCount || 0;
    const difficultyValue = frontmatter.difficulty;
    const difficulty = typeof difficultyValue === "number"
        ? difficultyValue
        : difficultyValue != null
            ? parseInt(String(difficultyValue), 10)
            : null;
    const nextReview = calculateNextReview(frontmatter) || null;
    return {
        id: path.basename(filePath, ".md"),
        filePath,
        title,
        question,
        answer,
        tags: frontmatter.tags || [],
        created,
        lastReviewed,
        nextReview,
        reviewInterval,
        easeFactor,
        repetitionCount,
        difficulty
    };
}
