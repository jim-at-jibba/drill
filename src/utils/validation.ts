/**
 * Input validation utilities
 */

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validates that a string is not empty or only whitespace
 */
export function validateNonEmpty(value: string, fieldName: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new ValidationError(`${fieldName} cannot be empty`);
  }
  return trimmed;
}

/**
 * Validates deck name:
 * - Non-empty
 * - No path separators (/, \)
 * - No path traversal attempts (..)
 * - Max 255 chars (filesystem limit)
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
 * Validates card front/back content:
 * - Non-empty
 * - Max length to prevent memory issues
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
 * Validates SM-2 quality rating (1-5)
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
 * Validates date is valid and not too far in past/future
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
 * Validates interval (days between reviews)
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
 * Validates easiness factor (SM-2 algorithm)
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
 * Validates repetition count
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
