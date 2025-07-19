import { format, parseISO, differenceInDays, formatDistanceToNow } from "date-fns";

// Standard date formats
export const DATE_FORMATS = {
  FULL_DATE: 'MMMM do, yyyy',           // December 25th, 2025
  SHORT_DATE: 'MMM d, yyyy',            // Dec 25, 2025
  DAY_MONTH: 'MMMM d',                  // December 25
  YEAR_MONTH: 'MMMM yyyy',              // December 2025
  WEEKDAY_DATE: 'EEEE, MMMM do, yyyy',  // Friday, December 25th, 2025
  INPUT_DATE: 'yyyy-MM-dd',             // 2025-12-25 (HTML date input format)
  TIME_12H: 'h:mm a',                   // 3:30 PM
  TIME_24H: 'HH:mm',                    // 15:30
  DATE_TIME_12H: 'MMM d, yyyy h:mm a',  // Dec 25, 2025 3:30 PM
  DATE_TIME_24H: 'MMM d, yyyy HH:mm',   // Dec 25, 2025 15:30
};

// Format any date for display with specified format
export function formatDate(date: string | Date | null | undefined, formatString: string = DATE_FORMATS.FULL_DATE): string {
  if (!date) return 'No date set';
  
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return format(parsedDate, formatString);
  } catch (error) {
    
    return 'Invalid date';
  }
}

// Format date for general display
export function formatDateForDisplay(date: string | Date | null | undefined): string {
  return formatDate(date, DATE_FORMATS.FULL_DATE);
}

// Format date and time for display
export function formatDateTimeForDisplay(date: string | Date | null | undefined): string {
  return formatDate(date, DATE_FORMATS.DATE_TIME_12H);
}

// Format for HTML date input fields
export function formatForDateInput(date: string | Date | null | undefined): string {
  return formatDate(date, DATE_FORMATS.INPUT_DATE);
}

// Get relative time from now
export function getRelativeTimeFromNow(date: string | Date | null | undefined): string {
  if (!date) return '';
  
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(parsedDate, { addSuffix: true });
  } catch (error) {
    
    return '';
  }
}

// Calculate days difference between a date and today
export function getDaysDifference(dateString: string | null | undefined): number {
  if (!dateString) return 0;
  
  try {
    const eventDate = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    const today = new Date();
    return differenceInDays(eventDate, today);
  } catch (error) {
    
    return 0;
  }
}