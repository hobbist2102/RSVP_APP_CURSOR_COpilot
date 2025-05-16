/**
 * Date Utilities
 * Centralized functions for date formatting and manipulation
 */
import { format, formatDistance, isValid, parseISO, differenceInDays } from 'date-fns';

/**
 * Standard date formats used throughout the application
 */
export const DATE_FORMATS = {
  // Display formats
  FULL_DATE: 'MMMM do, yyyy',           // December 25th, 2025
  SHORT_DATE: 'MMM d, yyyy',            // Dec 25, 2025
  DAY_MONTH: 'MMMM d',                  // December 25
  YEAR_MONTH: 'MMMM yyyy',              // December 2025
  WEEKDAY_DATE: 'EEEE, MMMM do, yyyy',  // Friday, December 25th, 2025
  
  // Form input formats
  INPUT_DATE: 'yyyy-MM-dd',             // 2025-12-25 (HTML date input format)
  
  // Database formats
  ISO_DATE: 'yyyy-MM-dd',               // 2025-12-25
  
  // Time formats
  TIME_12H: 'h:mm a',                   // 3:30 PM
  TIME_24H: 'HH:mm',                    // 15:30
  
  // Combined formats
  DATE_TIME_12H: 'MMM d, yyyy h:mm a',  // Dec 25, 2025 3:30 PM
  DATE_TIME_24H: 'MMM d, yyyy HH:mm',   // Dec 25, 2025 15:30
};

/**
 * Safely formats a date with fallback for invalid dates
 * @param date - Date object, ISO string, or timestamp
 * @param formatString - Format string from date-fns
 * @param fallback - Value to return if date is invalid
 */
export function formatDate(
  date: Date | string | number | null | undefined,
  formatString: string = DATE_FORMATS.FULL_DATE,
  fallback: string = 'Invalid date'
): string {
  if (!date) return fallback;
  
  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
  
  if (!isValid(dateObj)) return fallback;
  
  return format(dateObj, formatString);
}

/**
 * Formats a date for input in HTML date inputs
 * @param date - Date object, ISO string, or timestamp
 */
export function formatForDateInput(
  date: Date | string | number | null | undefined
): string {
  return formatDate(date, DATE_FORMATS.INPUT_DATE, '');
}

/**
 * Formats a date/time for displaying in the UI
 * @param date - Date object, ISO string, or timestamp 
 * @param includeTime - Whether to include time in the formatted output
 * @param use24Hour - Whether to use 24 hour format for time
 */
export function formatDateForDisplay(
  date: Date | string | number | null | undefined,
  includeTime: boolean = false,
  use24Hour: boolean = false
): string {
  if (!date) return '';
  
  const format = includeTime 
    ? (use24Hour ? DATE_FORMATS.DATE_TIME_24H : DATE_FORMATS.DATE_TIME_12H)
    : DATE_FORMATS.FULL_DATE;
  
  return formatDate(date, format);
}

/**
 * Returns a relative time string (e.g., "2 days ago", "in 3 months")
 * @param date - Date object, ISO string, or timestamp to compare to now
 */
export function getRelativeTimeFromNow(
  date: Date | string | number | null | undefined
): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
  
  if (!isValid(dateObj)) return '';
  
  return formatDistance(dateObj, new Date(), { addSuffix: true });
}

/**
 * Gets remaining days between the given date and now
 * @param date - Future date to compare with now
 * @returns Number of days remaining (negative if date is in the past)
 */
export function getDaysRemaining(
  date: Date | string | number | null | undefined
): number {
  if (!date) return 0;
  
  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
  
  if (!isValid(dateObj)) return 0;
  
  return differenceInDays(dateObj, new Date());
}

/**
 * Gets an appropriate class name based on days remaining until the date
 * @param date - Date to check
 * @returns CSS class name for styling based on urgency
 */
export function getDateUrgencyClass(
  date: Date | string | number | null | undefined
): string {
  const daysRemaining = getDaysRemaining(date);
  
  if (daysRemaining < 0) return 'text-muted-foreground'; // Past date
  if (daysRemaining <= 7) return 'text-destructive';     // Urgent (< 1 week)
  if (daysRemaining <= 30) return 'text-warning';        // Soon (< 1 month)
  return 'text-primary';                                // Plenty of time
}