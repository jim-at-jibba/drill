/**
 * Input validation utilities for flashcard data.
 */

/**
 * Custom error for validation failures. Includes optional context for debugging.
 */
export class ValidationError extends Error {
  public context?: Record<string, any>;
  
  /**
   * @param message - Human-readable error description
   * @param context - Additional data about validation failure (field values, constraints, etc.)
   */
  constructor(message: string, context?: Record<string, any>) {
    super(message);
    this.name = 'ValidationError';
    this.context = context;
  }
}

/**
 * Validates that a string is not empty or only whitespace.
 * @param value - String to validate
 * @param fieldName - Field name for error messages
 * @returns Trimmed string
 * @throws {ValidationError} Value is empty or whitespace-only
 */
export function validateNonEmpty(value: string, fieldName: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new ValidationError(`${fieldName} cannot be empty`);
  }
  return trimmed;
}

/**
 * Validates deck name for safe filesystem use.
 * Rules: non-empty, no path separators (/, \), no "..", max 255 chars.
 * @param name - Deck name to validate
 * @returns Trimmed deck name
 * @throws {ValidationError} Name violates safety/length constraints
 */
export function validateDeckName(name: string): string {
  const trimmed = validateNonEmpty(name, 'Deck name');
  
  if (trimmed.includes('/') || trimmed.includes('\\')) {
    throw new ValidationError('Deck name cannot contain path separators');
  }
  
  if (trimmed.includes('..')) {
    throw new ValidationError('Deck name cannot contain ".."');
  }
  
  if (trimmed.length > 255) {
    throw new ValidationError('Deck name must be 255 characters or less');
  }
  
  return trimmed;
}

/**
 * Validates card question/answer content (non-empty, max 10KB).
 * @param content - Card content to validate
 * @param fieldName - Field name for error messages ('Card question', 'Card answer', etc.)
 * @returns Trimmed content
 * @throws {ValidationError} Content is empty or exceeds 10000 characters
 */
export function validateCardContent(content: string, fieldName: string): string {
  const trimmed = validateNonEmpty(content, fieldName);
  
  const MAX_LENGTH = 10000; // 10KB per field
  if (trimmed.length > MAX_LENGTH) {
    throw new ValidationError(`${fieldName} must be ${MAX_LENGTH} characters or less`);
  }
  
  return trimmed;
}

/**
 * Validates SM-2 quality rating (1=Blackout, 2=Wrong, 3=Hard, 4=Good, 5=Easy).
 * @param quality - User rating to validate
 * @returns Validated quality rating
 * @throws {ValidationError} Not a finite integer between 1-5
 */
export function validateQuality(quality: number): number {
  if (!Number.isFinite(quality)) {
    throw new ValidationError('Quality must be a number');
  }
  
  if (!Number.isInteger(quality)) {
    throw new ValidationError('Quality must be an integer');
  }
  
  if (quality < 1 || quality > 5) {
    throw new ValidationError('Quality must be between 1 and 5');
  }
  
  return quality;
}

/**
 * Validates date is valid and within reasonable range (2000 to 100 years from now).
 * @param date - Date to validate
 * @param fieldName - Field name for error messages
 * @returns Validated date
 * @throws {ValidationError} Date is invalid or outside acceptable range
 */
export function validateDate(date: Date, fieldName: string): Date {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new ValidationError(`${fieldName} must be a valid date`);
  }
  
  // Sanity check: not before year 2000, not more than 100 years in future
  const minDate = new Date('2000-01-01');
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 100);
  
  if (date < minDate || date > maxDate) {
    throw new ValidationError(`${fieldName} must be between 2000 and 100 years from now`);
  }
  
  return date;
}

/**
 * Validates review interval (1 to 3650 days / 10 years).
 * @param interval - Days between reviews
 * @returns Validated interval
 * @throws {ValidationError} Not finite or outside 1-3650 range
 */
export function validateInterval(interval: number): number {
  if (!Number.isFinite(interval)) {
    throw new ValidationError('Interval must be a number');
  }
  
  if (interval < 1) {
    throw new ValidationError('Interval must be at least 1 day');
  }
  
  // Max 10 years
  if (interval > 3650) {
    throw new ValidationError('Interval cannot exceed 10 years (3650 days)');
  }
  
  return interval;
}

/**
 * Validates SM-2 easiness factor (minimum 1.3 per algorithm spec).
 * @param ef - Easiness factor to validate
 * @returns Validated easiness factor
 * @throws {ValidationError} Not finite or below 1.3
 */
export function validateEasinessFactor(ef: number): number {
  if (!Number.isFinite(ef)) {
    throw new ValidationError('Easiness factor must be a number');
  }
  
  if (ef < 1.3) {
    throw new ValidationError('Easiness factor cannot be less than 1.3');
  }
  
  return ef;
}

/**
 * Validates repetition count (non-negative integer).
 * @param count - Repetition count to validate
 * @returns Validated count
 * @throws {ValidationError} Not a finite non-negative integer
 */
export function validateRepetitionCount(count: number): number {
  if (!Number.isFinite(count)) {
    throw new ValidationError('Repetition count must be a number');
  }
  
  if (!Number.isInteger(count)) {
    throw new ValidationError('Repetition count must be an integer');
  }
  
  if (count < 0) {
    throw new ValidationError('Repetition count cannot be negative');
  }
  
  return count;
}
