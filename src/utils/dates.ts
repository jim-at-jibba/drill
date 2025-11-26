function pad(num: number): string {
  return num < 10 ? "0" + num : String(num);
}

/**
 * Formats date as YYYY-MM-DD string.
 * @param date - Date object or ISO string
 * @returns Formatted date string, or empty string if date is falsy
 */
export function formatDate(date: Date | string): string {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  return `${year}-${month}-${day}`;
}

/**
 * Returns current date with time set to 00:00:00.000 (local timezone).
 * Used as reference point for due date comparisons.
 * @returns Today's date at midnight
 */
export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Adds days to a date. Handles DST transitions correctly by operating on milliseconds.
 * @param date - Base date (Date object or ISO string)
 * @param days - Number of days to add (can be negative)
 * @returns New date object
 */
export function addDays(date: Date | string, days: number): Date {
  const d = date instanceof Date ? date : new Date(date);
  return new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
}

/**
 * Checks if card is due for review (nextReview <= referenceDate, comparing dates only).
 * Time components are ignored for comparison.
 * @param nextReview - Scheduled review date (null/undefined = not due)
 * @param referenceDate - Reference date for comparison (defaults to now)
 * @returns True if card should be reviewed
 */
export function isDue(nextReview: Date | string | null, referenceDate: Date = new Date()): boolean {
  if (!nextReview) return false;
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);
  const next = nextReview instanceof Date ? nextReview : new Date(nextReview);
  const n = new Date(next);
  n.setHours(0, 0, 0, 0);
  return n <= today;
}

/**
 * Calculates next review date from card frontmatter.
 * Priority: 1) next_review field, 2) last_reviewed + review_interval.
 * @param frontmatter - Parsed frontmatter object with review fields
 * @param referenceDate - Fallback base date if last_reviewed missing
 * @returns Calculated next review date, or null if insufficient data
 */
export function calculateNextReview(frontmatter: any = {}, referenceDate: Date = new Date()): Date | null {
  if (!frontmatter) return null;

  if (frontmatter.next_review) {
    return new Date(frontmatter.next_review as string);
  }

  const interval =
    typeof frontmatter.review_interval === "number"
      ? frontmatter.review_interval
      : parseInt(frontmatter.review_interval || 0, 10) || 0;

  const base = frontmatter.last_reviewed
    ? new Date(frontmatter.last_reviewed as string)
    : referenceDate;

  if (!base || !interval) return null;

  return addDays(base, interval);
}
