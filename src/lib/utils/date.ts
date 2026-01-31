/**
 * Date Utilities
 *
 * Utilities for date formatting and manipulation throughout the app.
 * Uses date-fns for all date operations.
 */

import {
  format,
  isToday as dateFnsIsToday,
  isTomorrow,
  isYesterday,
  addDays,
  subDays,
  startOfDay,
  parseISO,
} from 'date-fns';

/**
 * Format date for display (e.g., "Wed, Jan 31")
 */
export function formatDateForDisplay(date: Date): string {
  return format(date, 'EEE, MMM d');
}

/**
 * Format date for API requests (YYYY-MM-DD)
 */
export function formatDateForApi(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Format time for display (e.g., "14:30")
 */
export function formatTimeForDisplay(date: Date): string {
  return format(date, 'HH:mm');
}

/**
 * Format full date and time (e.g., "Wed, Jan 31 at 14:30")
 */
export function formatDateTimeForDisplay(date: Date): string {
  return format(date, "EEE, MMM d 'at' HH:mm");
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  return dateFnsIsToday(date);
}

/**
 * Check if a date is tomorrow
 */
export function isTomorrowDate(date: Date): boolean {
  return isTomorrow(date);
}

/**
 * Check if a date is yesterday
 */
export function isYesterdayDate(date: Date): boolean {
  return isYesterday(date);
}

/**
 * Get a range of dates centered around a date
 * @param centerDate - The center date
 * @param daysAround - Number of days before and after (default 7)
 * @returns Array of dates
 */
export function getDateRange(centerDate: Date, daysAround = 7): Date[] {
  const dates: Date[] = [];
  const center = startOfDay(centerDate);

  for (let i = -daysAround; i <= daysAround; i++) {
    dates.push(addDays(center, i));
  }

  return dates;
}

/**
 * Get next day
 */
export function getNextDay(date: Date): Date {
  return addDays(date, 1);
}

/**
 * Get previous day
 */
export function getPreviousDay(date: Date): Date {
  return subDays(date, 1);
}

/**
 * Parse API date string to Date object
 * @param dateString - ISO date string from API
 */
export function parseApiDate(dateString: string): Date {
  return parseISO(dateString);
}

/**
 * Get relative day label (Today, Tomorrow, Yesterday, or formatted date)
 */
export function getRelativeDayLabel(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isTomorrowDate(date)) return 'Tomorrow';
  if (isYesterdayDate(date)) return 'Yesterday';
  return formatDateForDisplay(date);
}

/**
 * Get short day label (e.g., "Mon 31")
 */
export function getShortDayLabel(date: Date): string {
  if (isToday(date)) return 'Today';
  return format(date, 'EEE d');
}

/**
 * Get current date at start of day
 */
export function getTodayAtStartOfDay(): Date {
  return startOfDay(new Date());
}
