import YAML from "yaml";
import {formatDate} from "../utils/dates";
import {Card} from "../models/Card";

export function serializeCard(card: Card): string {
  const frontmatter = {
    tags: card.tags || [],
    created: card.created ? formatDate(card.created) : null,
    last_reviewed: card.lastReviewed ? formatDate(card.lastReviewed) : null,
    review_interval: card.reviewInterval || 0,
    easeFactor: card.easeFactor || 2.5,
    repetitionCount: card.repetitionCount || 0,
    difficulty: card.difficulty != null ? card.difficulty : null
  };

  const yaml = YAML.stringify(frontmatter);

  const title = card.title || "";
  const question = card.question || "";
  const answer = card.answer || "";

  const body = `# ${title}\n\n## Question\n\n${question}\n\n## Answer\n\n${answer}\n`;

  const markdown = `---\n${yaml}---\n\n${body}`;

  return markdown;
}
