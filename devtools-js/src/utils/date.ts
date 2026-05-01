/**
 * @fileoverview Comprehensive date utilities for developers
 * @version 1.0.0
 */

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/** Type for date input that can be Date object, timestamp, or ISO string */
export type DateInput = Date | number | string;

/** Type for date components */
export type DateComponents = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
};

/** Type for format string tokens */
export type FormatToken =
  | 'YYYY'
  | 'YY'
  | 'MMMM'
  | 'MMM'
  | 'MM'
  | 'M'
  | 'DDDD'
  | 'DDD'
  | 'DD'
  | 'D'
  | 'dddd'
  | 'ddd'
  | 'HH'
  | 'H'
  | 'hh'
  | 'h'
  | 'mm'
  | 'm'
  | 'ss'
  | 's'
  | 'SSS'
  | 'A'
  | 'a'
  | 'Z'
  | 'ZZ';

/** Type for locale object */
export type Locale = {
  months: string[];
  monthsShort: string[];
  weekdays: string[];
  weekdaysShort: string[];
  firstDayOfWeek: number;
};

// =============================================================================
// DEFAULT LOCALE (English)
// =============================================================================

const defaultLocale: Locale = {
  months: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  monthsShort: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ],
  weekdays: [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ],
  weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  firstDayOfWeek: 0, // Sunday
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if value is a valid Date object
 * @param date - Value to check
 * @returns True if valid Date
 */
function isValidDate(date: any): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Convert input to Date object
 * @param date - Input to convert
 * @returns Date object or null if invalid
 */
function toDate(date: DateInput): Date | null {
  if (date instanceof Date) {
    return isValidDate(date) ? date : null;
  }
  if (typeof date === 'number') {
    return new Date(date);
  }
  if (typeof date === 'string') {
    const parsed = new Date(date);
    return isValidDate(parsed) ? parsed : null;
  }
  return null;
}

/**
 * Normalize month value (0-11)
 * @param month - Month value
 * @returns Normalized month
 */
function normalizeMonth(month: number): number {
  return Math.max(0, Math.min(11, month));
}

/**
 * Days in each month for non-leap year
 */
const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/**
 * Get days in a specific month
 * @param year - Year
 * @param month - Month (0-11)
 * @returns Days in month
 */
function getDaysInMonthInternal(year: number, month: number): number {
  if (month === 1) { // February
    return isLeapYearInternal(year) ? 29 : 28;
  }
  return daysInMonths[month];
}

/**
 * Check if year is leap year (internal)
 * @param year - Year to check
 * @returns True if leap year
 */
function isLeapYearInternal(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// =============================================================================
// DATE CREATION
// =============================================================================

/**
 * Get current date as Date object
 * Useful for getting the current date/time.
 *
 * @returns Current date
 */
export function now(): Date {
  return new Date();
}

/**
 * Get current Unix timestamp in seconds
 * Useful for timestamps and time comparisons.
 *
 * @returns Current Unix timestamp
 */
export function unix(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Get current Unix timestamp in milliseconds
 * Useful for high-precision timestamps.
 *
 * @returns Current Unix timestamp in milliseconds
 */
export function unixMs(): number {
  return Date.now();
}

/**
 * Create date from components
 * Useful for constructing specific dates.
 *
 * @param year - Year (e.g., 2024)
 * @param month - Month (0-11, where 0 is January)
 * @param day - Day of month (1-31)
 * @param hour - Hour (0-23)
 * @param minute - Minute (0-59)
 * @param second - Second (0-59)
 * @param millisecond - Millisecond (0-999)
 * @returns Created date
 */
export function create(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  millisecond = 0
): Date {
  return new Date(year, month, day, hour, minute, second, millisecond);
}

/**
 * Create Date from Unix timestamp
 * Useful for converting Unix timestamps to Date objects.
 *
 * @param timestamp - Unix timestamp (seconds or milliseconds)
 * @returns Date from timestamp
 */
export function fromUnix(timestamp: number): Date {
  // Determine if timestamp is in seconds or milliseconds
  const isSeconds = timestamp < 1e11;
  return new Date(isSeconds ? timestamp * 1000 : timestamp);
}

/**
 * Create Date from ISO string
 * Useful for parsing ISO 8601 date strings.
 *
 * @param dateString - ISO date string
 * @returns Date from ISO string, or null if invalid
 */
export function fromIso(dateString: string): Date | null {
  const date = new Date(dateString);
  return isValidDate(date) ? date : null;
}

/**
 * Create Date from custom format
 * Useful for parsing dates in various formats.
 *
 * @param dateString - Date string to parse
 * @param format - Format pattern (e.g., 'YYYY-MM-DD')
 * @returns Date from format, or null if invalid
 */
export function fromFormat(dateString: string, format: string): Date | null {
  // Parse common format patterns
  const patterns: Record<string, RegExp> = {
    'YYYY-MM-DD': /^(\d{4})-(\d{2})-(\d{2})$/,
    'YYYY/MM/DD': /^(\d{4})\/(\d{2})\/(\d{2})$/,
    'MM/DD/YYYY': /^(\d{2})\/(\d{2})\/(\d{4})$/,
    'DD/MM/YYYY': /^(\d{2})\/(\d{2})\/(\d{4})$/,
    'YYYY-MM-DD HH:mm:ss': /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/,
    'YYYY-MM-DDTHH:mm:ss': /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/,
  };

  const pattern = patterns[format];
  if (!pattern) {
    console.warn(`Unsupported date format: ${format}`);
    return null;
  }

  const match = dateString.match(pattern);
  if (!match) return null;

  const [, ...parts] = match;
  const nums = parts.map(Number);

  // Handle different format types
  switch (format) {
    case 'YYYY-MM-DD':
    case 'YYYY/MM/DD':
      return create(nums[0], nums[1] - 1, nums[2]);
    case 'MM/DD/YYYY':
      return create(nums[2], nums[0] - 1, nums[1]);
    case 'DD/MM/YYYY':
      return create(nums[2], nums[1] - 1, nums[0]);
    case 'YYYY-MM-DD HH:mm:ss':
    case 'YYYY-MM-DDTHH:mm:ss':
      return create(nums[0], nums[1] - 1, nums[2], nums[3], nums[4], nums[5]);
    default:
      return null;
  }
}

/**
 * Create Date from date string (YYYY-MM-DD)
 * Useful for parsing date strings from databases.
 *
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date from string, or null if invalid
 */
export function fromDateString(dateString: string): Date | null {
  return fromFormat(dateString, 'YYYY-MM-DD');
}

/**
 * Create Date from time string (HH:mm:ss)
 * Useful for parsing time strings.
 *
 * @param timeString - Time string in HH:mm:ss format
 * @returns Date with time set, or null if invalid
 */
export function fromTimeString(timeString: string): Date | null {
  const match = timeString.match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return null;

  const [, hour, minute, second = 0] = match.map(Number);
  const date = new Date();
  return create(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hour,
    minute,
    second
  );
}

/**
 * Create Date from combined string
 * Useful for parsing datetime strings.
 *
 * @param dateTimeString - Date time string
 * @returns Date from string, or null if invalid
 */
export function fromDateTimeString(dateTimeString: string): Date | null {
  return fromFormat(dateTimeString, 'YYYY-MM-DD HH:mm:ss');
}

// =============================================================================
// DATE ADDITION/SUBTRACTION
// =============================================================================

/**
 * Add days to date
 * Useful for date arithmetic.
 *
 * @param date - Input date
 * @param days - Number of days to add
 * @returns New date with days added
 */
export function addDays(date: DateInput, days: number): Date | null {
  const d = toDate(date);
  if (!d) return null;
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Subtract days from date
 * Useful for date arithmetic.
 *
 * @param date - Input date
 * @param days - Number of days to subtract
 * @returns New date with days subtracted
 */
export function subDays(date: DateInput, days: number): Date | null {
  return addDays(date, -days);
}

/**
 * Add hours to date
 * Useful for time arithmetic.
 *
 * @param date - Input date
 * @param hours - Number of hours to add
 * @returns New date with hours added
 */
export function addHours(date: DateInput, hours: number): Date | null {
  const d = toDate(date);
  if (!d) return null;
  const result = new Date(d);
  result.setHours(result.getHours() + hours);
  return result;
}

/**
 * Subtract hours from date
 * Useful for time arithmetic.
 *
 * @param date - Input date
 * @param hours - Number of hours to subtract
 * @returns New date with hours subtracted
 */
export function subHours(date: DateInput, hours: number): Date | null {
  return addHours(date, -hours);
}

/**
 * Add minutes to date
 * Useful for time arithmetic.
 *
 * @param date - Input date
 * @param minutes - Number of minutes to add
 * @returns New date with minutes added
 */
export function addMinutes(date: DateInput, minutes: number): Date | null {
  const d = toDate(date);
  if (!d) return null;
  const result = new Date(d);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
}

/**
 * Subtract minutes from date
 * Useful for time arithmetic.
 *
 * @param date - Input date
 * @param minutes - Number of minutes to subtract
 * @returns New date with minutes subtracted
 */
export function subMinutes(date: DateInput, minutes: number): Date | null {
  return addMinutes(date, -minutes);
}

/**
 * Add seconds to date
 * Useful for precise time arithmetic.
 *
 * @param date - Input date
 * @param seconds - Number of seconds to add
 * @returns New date with seconds added
 */
export function addSeconds(date: DateInput, seconds: number): Date | null {
  const d = toDate(date);
  if (!d) return null;
  const result = new Date(d);
  result.setSeconds(result.getSeconds() + seconds);
  return result;
}

/**
 * Subtract seconds from date
 * Useful for precise time arithmetic.
 *
 * @param date - Input date
 * @param seconds - Number of seconds to subtract
 * @returns New date with seconds subtracted
 */
export function subSeconds(date: DateInput, seconds: number): Date | null {
  return addSeconds(date, -seconds);
}

/**
 * Add months to date
 * Handles month overflow (e.g., adding 1 month to Jan 31).
 *
 * @param date - Input date
 * @param months - Number of months to add
 * @returns New date with months added
 */
export function addMonths(date: DateInput, months: number): Date | null {
  const d = toDate(date);
  if (!d) return null;
  const result = new Date(d);
  const currentMonth = result.getMonth();
  result.setMonth(currentMonth + months);

  // Handle overflow
  if (result.getMonth() !== (currentMonth + months) % 12) {
    result.setDate(0); // Set to last day of previous month
  }

  return result;
}

/**
 * Subtract months from date
 * Handles month underflow.
 *
 * @param date - Input date
 * @param months - Number of months to subtract
 * @returns New date with months subtracted
 */
export function subMonths(date: DateInput, months: number): Date | null {
  return addMonths(date, -months);
}

/**
 * Add years to date
 * Useful for date arithmetic.
 *
 * @param date - Input date
 * @param years - Number of years to add
 * @returns New date with years added
 */
export function addYears(date: DateInput, years: number): Date | null {
  const d = toDate(date);
  if (!d) return null;
  const result = new Date(d);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

/**
 * Subtract years from date
 * Useful for date arithmetic.
 *
 * @param date - Input date
 * @param years - Number of years to subtract
 * @returns New date with years subtracted
 */
export function subYears(date: DateInput, years: number): Date | null {
  return addYears(date, -years);
}

// =============================================================================
// DATE START/END
// =============================================================================

/**
 * Set to beginning of day (00:00:00.000)
 * Useful for day-boundary calculations.
 *
 * @param date - Input date
 * @returns Date at start of day
 */
export function startOfDay(date: DateInput): Date | null {
  const d = toDate(date);
  if (!d) return null;
  return create(getYear(d), getMonth(d), getDay(d), 0, 0, 0, 0);
}

/**
 * Set to end of day (23:59:59.999)
 * Useful for day-boundary calculations.
 *
 * @param date - Input date
 * @returns Date at end of day
 */
export function endOfDay(date: DateInput): Date | null {
  const d = toDate(date);
  if (!d) return null;
  return create(getYear(d), getMonth(d), getDay(d), 23, 59, 59, 999);
}

/**
 * Set to start of week
 * Useful for week-boundary calculations.
 *
 * @param date - Input date
 * @param startDay - Day to consider as start of week (0 = Sunday, 1 = Monday)
 * @returns Date at start of week
 */
export function startOfWeek(date: DateInput, startDay = 0): Date | null {
  const d = toDate(date);
  if (!d) return null;
  const result = startOfDay(d);
  if (!result) return null;

  const day = getDayOfWeek(d);
  const diff = (day - startDay + 7) % 7;
  return subDays(result, diff);
}

/**
 * Set to end of week
 * Useful for week-boundary calculations.
 *
 * @param date - Input date
 * @param startDay - Day to consider as start of week (0 = Sunday, 1 = Monday)
 * @returns Date at end of week
 */
export function endOfWeek(date: DateInput, startDay = 0): Date | null {
  const d = toDate(date);
  if (!d) return null;
  const result = endOfDay(d);
  if (!result) return null;

  const day = getDayOfWeek(d);
  const diff = (startDay - day + 7) % 7;
  return addDays(result, diff);
}

/**
 * Set to start of month
 * Useful for month-boundary calculations.
 *
 * @param date - Input date
 * @returns Date at start of month
 */
export function startOfMonth(date: DateInput): Date | null {
  const d = toDate(date);
  if (!d) return null;
  return create(getYear(d), getMonth(d), 1, 0, 0, 0, 0);
}

/**
 * Set to end of month
 * Useful for month-boundary calculations.
 *
 * @param date - Input date
 * @returns Date at end of month
 */
export function endOfMonth(date: DateInput): Date | null {
  const d = toDate(date);
  if (!d) return null;
  const daysInMonth = getDaysInMonth(d);
  return create(getYear(d), getMonth(d), daysInMonth, 23, 59, 59, 999);
}

/**
 * Set to start of quarter
 * Useful for quarter-boundary calculations.
 *
 * @param date - Input date
 * @returns Date at start of quarter
 */
export function startOfQuarter(date: DateInput): Date | null {
  const d = toDate(date);
  if (!d) return null;
  const quarter = getQuarter(d);
  const startMonth = (quarter - 1) * 3;
  return create(getYear(d), startMonth, 1, 0, 0, 0, 0);
}

/**
 * Set to end of quarter
 * Useful for quarter-boundary calculations.
 *
 * @param date - Input date
 * @returns Date at end of quarter
 */
export function endOfQuarter(date: DateInput): Date | null {
  const d = toDate(date);
  if (!d) return null;
  const quarter = getQuarter(d);
  const endMonth = quarter * 3;
  return create(getYear(d), endMonth, 0, 23, 59, 59, 999);
}

/**
 * Set to start of year
 * Useful for year-boundary calculations.
 *
 * @param date - Input date
 * @returns Date at start of year
 */
export function startOfYear(date: DateInput): Date | null {
  const d = toDate(date);
  if (!d) return null;
  return create(getYear(d), 0, 1, 0, 0, 0, 0);
}

/**
 * Set to end of year
 * Useful for year-boundary calculations.
 *
 * @param date - Input date
 * @returns Date at end of year
 */
export function endOfYear(date: DateInput): Date | null {
  const d = toDate(date);
  if (!d) return null;
  return create(getYear(d), 11, 31, 23, 59, 59, 999);
}

// =============================================================================
// DATE COMPARISON
// =============================================================================

/**
 * Check if same day
 * Useful for date comparisons ignoring time.
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if same day
 */
export function isSameDay(date1: DateInput, date2: DateInput): boolean {
  const d1 = toDate(date1);
  const d2 = toDate(date2);
  if (!d1 || !d2) return false;
  return (
    getYear(d1) === getYear(d2) &&
    getMonth(d1) === getMonth(d2) &&
    getDay(d1) === getDay(d2)
  );
}

/**
 * Check if same month
 * Useful for date comparisons ignoring day and time.
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if same month
 */
export function isSameMonth(date1: DateInput, date2: DateInput): boolean {
  const d1 = toDate(date1);
  const d2 = toDate(date2);
  if (!d1 || !d2) return false;
  return getYear(d1) === getYear(d2) && getMonth(d1) === getMonth(d2);
}

/**
 * Check if same year
 * Useful for date comparisons ignoring month, day, and time.
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if same year
 */
export function isSameYear(date1: DateInput, date2: DateInput): boolean {
  const d1 = toDate(date1);
  const d2 = toDate(date2);
  if (!d1 || !d2) return false;
  return getYear(d1) === getYear(d2);
}

/**
 * Check if date1 is before date2
 * Useful for chronological comparisons.
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if date1 is before date2
 */
export function isBefore(date1: DateInput, date2: DateInput): boolean {
  const d1 = toDate(date1);
  const d2 = toDate(date2);
  if (!d1 || !d2) return false;
  return d1.getTime() < d2.getTime();
}

/**
 * Check if date1 is after date2
 * Useful for chronological comparisons.
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if date1 is after date2
 */
export function isAfter(date1: DateInput, date2: DateInput): boolean {
  const d1 = toDate(date1);
  const d2 = toDate(date2);
  if (!d1 || !d2) return false;
  return d1.getTime() > d2.getTime();
}

/**
 * Check if date is between start and end
 * Useful for range checks.
 *
 * @param date - Date to check
 * @param start - Start of range
 * @param end - End of range
 * @returns True if date is between start and end
 */
export function isBetween(
  date: DateInput,
  start: DateInput,
  end: DateInput
): boolean {
  const d = toDate(date);
  const s = toDate(start);
  const e = toDate(end);
  if (!d || !s || !e) return false;
  return d.getTime() >= s.getTime() && d.getTime() <= e.getTime();
}

/**
 * Check if date is today
 * Useful for date comparisons.
 *
 * @param date - Date to check
 * @returns True if date is today
 */
export function isToday(date: DateInput): boolean {
  const d = toDate(date);
  if (!d) return false;
  return isSameDay(d, now());
}

/**
 * Check if date is yesterday
 * Useful for relative date comparisons.
 *
 * @param date - Date to check
 * @returns True if date is yesterday
 */
export function isYesterday(date: DateInput): boolean {
  const d = toDate(date);
  if (!d) return false;
  const yesterday = subDays(now(), 1);
  if (!yesterday) return false;
  return isSameDay(d, yesterday);
}

/**
 * Check if date is tomorrow
 * Useful for relative date comparisons.
 *
 * @param date - Date to check
 * @returns True if date is tomorrow
 */
export function isTomorrow(date: DateInput): boolean {
  const d = toDate(date);
  if (!d) return false;
  const tomorrow = addDays(now(), 1);
  if (!tomorrow) return false;
  return isSameDay(d, tomorrow);
}

/**
 * Check if date is in the past
 * Useful for temporal comparisons.
 *
 * @param date - Date to check
 * @returns True if date is in the past
 */
export function isPast(date: DateInput): boolean {
  const d = toDate(date);
  if (!d) return false;
  return d.getTime() < now().getTime();
}

/**
 * Check if date is in the future
 * Useful for temporal comparisons.
 *
 * @param date - Date to check
 * @returns True if date is in the future
 */
export function isFuture(date: DateInput): boolean {
  const d = toDate(date);
  if (!d) return false;
  return d.getTime() > now().getTime();
}

/**
 * Check if leap year
 * Useful for date calculations.
 *
 * @param date - Date to check
 * @returns True if leap year
 */
export function isLeapYear(date: DateInput): boolean {
  const d = toDate(date);
  if (!d) return false;
  return isLeapYearInternal(getYear(d));
}

/**
 * Check if date is valid
 * Useful for input validation.
 *
 * @param date - Date to check
 * @returns True if valid date
 */
export function isValid(date: any): date is Date {
  return isValidDate(date);
}

// =============================================================================
// DATE DIFFERENCE
// =============================================================================

/**
 * Difference in milliseconds
 * Useful for precise time differences.
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Difference in milliseconds
 */
export function diffMs(date1: DateInput, date2: DateInput): number | null {
  const d1 = toDate(date1);
  const d2 = toDate(date2);
  if (!d1 || !d2) return null;
  return d2.getTime() - d1.getTime();
}

/**
 * Difference in seconds
 * Useful for time comparisons.
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Difference in seconds
 */
export function diffSeconds(date1: DateInput, date2: DateInput): number | null {
  const diff = diffMs(date1, date2);
  if (diff === null) return null;
  return Math.floor(diff / 1000);
}

/**
 * Difference in minutes
 * Useful for time comparisons.
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Difference in minutes
 */
export function diffMinutes(date1: DateInput, date2: DateInput): number | null {
  const diff = diffMs(date1, date2);
  if (diff === null) return null;
  return Math.floor(diff / (1000 * 60));
}

/**
 * Difference in hours
 * Useful for time comparisons.
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Difference in hours
 */
export function diffHours(date1: DateInput, date2: DateInput): number | null {
  const diff = diffMs(date1, date2);
  if (diff === null) return null;
  return Math.floor(diff / (1000 * 60 * 60));
}

/**
 * Difference in days
 * Useful for date comparisons.
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Difference in days
 */
export function diffDays(date1: DateInput, date2: DateInput): number | null {
  const d1 = toDate(date1);
  const d2 = toDate(date2);
  if (!d1 || !d2) return null;
  const start = startOfDay(d1);
  const end = startOfDay(d2);
  if (!start || !end) return null;
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Difference in weeks
 * Useful for date comparisons.
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Difference in weeks
 */
export function diffWeeks(date1: DateInput, date2: DateInput): number | null {
  const diff = diffDays(date1, date2);
  if (diff === null) return null;
  return Math.floor(diff / 7);
}

/**
 * Difference in months
 * Useful for date comparisons.
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Difference in months
 */
export function diffMonths(date1: DateInput, date2: DateInput): number | null {
  const d1 = toDate(date1);
  const d2 = toDate(date2);
  if (!d1 || !d2) return null;
  return (
    (getYear(d2) - getYear(d1)) * 12 + (getMonth(d2) - getMonth(d1))
  );
}

/**
 * Difference in years
 * Useful for date comparisons.
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Difference in years
 */
export function diffYears(date1: DateInput, date2: DateInput): number | null {
  const d1 = toDate(date1);
  const d2 = toDate(date2);
  if (!d1 || !d2) return null;
  return getYear(d2) - getYear(d1);
}

// =============================================================================
// DATE FORMATTING
// =============================================================================

/**
 * Format date with format string tokens
 * Useful for custom date formatting.
 *
 * @param date - Date to format
 * @param formatString - Format string with tokens (YYYY, MM, DD, HH, mm, ss, etc.)
 * @param locale - Locale to use (defaults to English)
 * @returns Formatted date string
 */
export function format(
  date: DateInput,
  formatString: string,
  locale: Locale = defaultLocale
): string {
  const d = toDate(date);
  if (!d) return 'Invalid Date';

  const replacements: Record<string, string | (() => string)> = {
    YYYY: () => String(getYear(d)).padStart(4, '0'),
    YY: () => String(getYear(d)).slice(-2),
    MMMM: () => locale.months[getMonth(d)],
    MMM: () => locale.monthsShort[getMonth(d)],
    MM: () => String(getMonth(d) + 1).padStart(2, '0'),
    M: () => String(getMonth(d) + 1),
    DDDD: () => locale.weekdays[getDayOfWeek(d)],
    DDD: () => locale.weekdaysShort[getDayOfWeek(d)],
    DD: () => String(getDay(d)).padStart(2, '0'),
    D: () => String(getDay(d)),
    HH: () => String(getHour(d)).padStart(2, '0'),
    H: () => String(getHour(d)),
    hh: () => {
      const h = getHour(d);
      return String(h > 12 ? h - 12 : h === 0 ? 12 : h).padStart(2, '0');
    },
    h: () => {
      const h = getHour(d);
      return String(h > 12 ? h - 12 : h === 0 ? 12 : h);
    },
    mm: () => String(getMinute(d)).padStart(2, '0'),
    m: () => String(getMinute(d)),
    ss: () => String(getSecond(d)).padStart(2, '0'),
    s: () => String(getSecond(d)),
    SSS: () => String(getMillisecond(d)).padStart(3, '0'),
    A: () => (getHour(d) >= 12 ? 'PM' : 'AM'),
    a: () => (getHour(d) >= 12 ? 'pm' : 'am'),
    Z: () => {
      const offset = d.getTimezoneOffset();
      const sign = offset <= 0 ? '+' : '-';
      const hours = Math.floor(Math.abs(offset) / 60);
      const minutes = Math.abs(offset) % 60;
      return `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    },
    ZZ: () => {
      const offset = d.getTimezoneOffset();
      const sign = offset <= 0 ? '+' : '-';
      const hours = Math.floor(Math.abs(offset) / 60);
      const minutes = Math.abs(offset) % 60;
      return `${sign}${String(hours).padStart(2, '0')}${String(minutes).padStart(2, '0')}`;
    },
  };

  let result = formatString;
  for (const [token, replacement] of Object.entries(replacements)) {
    const regex = new RegExp(token, 'g');
    result = result.replace(regex, typeof replacement === 'function' ? replacement() : replacement);
  }

  return result;
}

/**
 * Format as ISO string
 * Useful for API responses and storage.
 *
 * @param date - Date to format
 * @returns ISO formatted string
 */
export function formatIso(date: DateInput): string {
  const d = toDate(date);
  if (!d) return 'Invalid Date';
  return d.toISOString();
}

/**
 * Format as YYYY-MM-DD
 * Useful for database storage and APIs.
 *
 * @param date - Date to format
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDate(date: DateInput): string {
  return format(date, 'YYYY-MM-DD');
}

/**
 * Format as HH:mm:ss
 * Useful for time display.
 *
 * @param date - Date to format
 * @returns Time string in HH:mm:ss format
 */
export function formatTime(date: DateInput): string {
  return format(date, 'HH:mm:ss');
}

/**
 * Format as YYYY-MM-DD HH:mm:ss
 * Useful for datetime display and logging.
 *
 * @param date - Date to format
 * @returns DateTime string in YYYY-MM-DD HH:mm:ss format
 */
export function formatDateTime(date: DateInput): string {
  return format(date, 'YYYY-MM-DD HH:mm:ss');
}

/**
 * Format as relative time
 * Useful for displaying time differences.
 *
 * @param date - Date to format
 * @param referenceDate - Reference date (defaults to now)
 * @returns Relative time string (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelative(
  date: DateInput,
  referenceDate: DateInput = now()
): string {
  const d = toDate(date);
  const ref = toDate(referenceDate);
  if (!d || !ref) return 'Invalid Date';

  const diff = d.getTime() - ref.getTime();
  const absDiff = Math.abs(diff);

  const units: { value: number; name: string }[] = [
    { value: 1000, name: 'second' },
    { value: 60, name: 'minute' },
    { value: 60, name: 'hour' },
    { value: 24, name: 'day' },
    { value: 7, name: 'week' },
    { value: 30, name: 'month' },
    { value: 12, name: 'year' },
  ];

  let unitIndex = 0;
  let value = absDiff / 1000;

  while (unitIndex < units.length - 1 && value >= units[unitIndex].value) {
    value /= units[unitIndex].value;
    unitIndex++;
  }

  const unit = units[unitIndex];
  const intValue = Math.floor(value);
  const plural = intValue !== 1 ? 's' : '';

  if (diff > 0) {
    return `in ${intValue} ${unit.name}${plural}`;
  } else {
    return `${intValue} ${unit.name}${plural} ago`;
  }
}

/**
 * Format with locale
 * Useful for internationalization.
 *
 * @param date - Date to format
 * @param locale - Locale string or Locale object
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatLocale(
  date: DateInput,
  locale: string | Locale = 'en-US',
  options?: Intl.DateTimeFormatOptions
): string {
  const d = toDate(date);
  if (!d) return 'Invalid Date';

  const localeString = typeof locale === 'string' ? locale : 'en-US';
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };

  return d.toLocaleDateString(localeString, defaultOptions);
}

/**
 * Get "time ago" string
 * Useful for displaying relative time.
 *
 * @param date - Date to format
 * @param referenceDate - Reference date (defaults to now)
 * @returns Time ago string (e.g., "2 hours ago")
 */
export function timeAgo(
  date: DateInput,
  referenceDate: DateInput = now()
): string {
  const d = toDate(date);
  const ref = toDate(referenceDate);
  if (!d || !ref) return 'Invalid Date';

  const diff = ref.getTime() - d.getTime();
  const absDiff = Math.abs(diff);

  const units: { value: number; name: string }[] = [
    { value: 1000, name: 'second' },
    { value: 60, name: 'minute' },
    { value: 60, name: 'hour' },
    { value: 24, name: 'day' },
    { value: 7, name: 'week' },
    { value: 30, name: 'month' },
    { value: 12, name: 'year' },
  ];

  let unitIndex = 0;
  let value = absDiff / 1000;

  while (unitIndex < units.length - 1 && value >= units[unitIndex].value) {
    value /= units[unitIndex].value;
    unitIndex++;
  }

  const unit = units[unitIndex];
  const intValue = Math.floor(value);
  const plural = intValue !== 1 ? 's' : '';

  return `${intValue} ${unit.name}${plural} ago`;
}

/**
 * Get "time until" string
 * Useful for countdown displays.
 *
 * @param date - Date to format
 * @param referenceDate - Reference date (defaults to now)
 * @returns Time until string (e.g., "in 3 days")
 */
export function timeUntil(
  date: DateInput,
  referenceDate: DateInput = now()
): string {
  const d = toDate(date);
  const ref = toDate(referenceDate);
  if (!d || !ref) return 'Invalid Date';

  const diff = d.getTime() - ref.getTime();

  if (diff < 0) {
    return timeAgo(d, ref);
  }

  const absDiff = Math.abs(diff);

  const units: { value: number; name: string }[] = [
    { value: 1000, name: 'second' },
    { value: 60, name: 'minute' },
    { value: 60, name: 'hour' },
    { value: 24, name: 'day' },
    { value: 7, name: 'week' },
    { value: 30, name: 'month' },
    { value: 12, name: 'year' },
  ];

  let unitIndex = 0;
  let value = absDiff / 1000;

  while (unitIndex < units.length - 1 && value >= units[unitIndex].value) {
    value /= units[unitIndex].value;
    unitIndex++;
  }

  const unit = units[unitIndex];
  const intValue = Math.floor(value);
  const plural = intValue !== 1 ? 's' : '';

  return `in ${intValue} ${unit.name}${plural}`;
}

// =============================================================================
// DATE COMPONENTS
// =============================================================================

/**
 * Get year
 * Useful for extracting date components.
 *
 * @param date - Input date
 * @returns Year (e.g., 2024)
 */
export function getYear(date: DateInput): number {
  const d = toDate(date);
  if (!d) return NaN;
  return d.getFullYear();
}

/**
 * Get month
 * Useful for extracting date components.
 *
 * @param date - Input date
 * @returns Month (0-11, where 0 is January)
 */
export function getMonth(date: DateInput): number {
  const d = toDate(date);
  if (!d) return NaN;
  return d.getMonth();
}

/**
 * Get day of month
 * Useful for extracting date components.
 *
 * @param date - Input date
 * @returns Day of month (1-31)
 */
export function getDay(date: DateInput): number {
  const d = toDate(date);
  if (!d) return NaN;
  return d.getDate();
}

/**
 * Get day of week
 * Useful for extracting date components.
 *
 * @param date - Input date
 * @returns Day of week (0-6, where 0 is Sunday)
 */
export function getDayOfWeek(date: DateInput): number {
  const d = toDate(date);
  if (!d) return NaN;
  return d.getDay();
}

/**
 * Get day of year
 * Useful for extracting date components.
 *
 * @param date - Input date
 * @returns Day of year (1-366)
 */
export function getDayOfYear(date: DateInput): number {
  const d = toDate(date);
  if (!d) return NaN;
  const start = startOfYear(d);
  if (!start) return NaN;
  const diff = d.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Get hour
 * Useful for extracting time components.
 *
 * @param date - Input date
 * @returns Hour (0-23)
 */
export function getHour(date: DateInput): number {
  const d = toDate(date);
  if (!d) return NaN;
  return d.getHours();
}

/**
 * Get minute
 * Useful for extracting time components.
 *
 * @param date - Input date
 * @returns Minute (0-59)
 */
export function getMinute(date: DateInput): number {
  const d = toDate(date);
  if (!d) return NaN;
  return d.getMinutes();
}

/**
 * Get second
 * Useful for extracting time components.
 *
 * @param date - Input date
 * @returns Second (0-59)
 */
export function getSecond(date: DateInput): number {
  const d = toDate(date);
  if (!d) return NaN;
  return d.getSeconds();
}

/**
 * Get milliseconds
 * Useful for extracting time components.
 *
 * @param date - Input date
 * @returns Milliseconds (0-999)
 */
export function getMillisecond(date: DateInput): number {
  const d = toDate(date);
  if (!d) return NaN;
  return d.getMilliseconds();
}

/**
 * Get quarter
 * Useful for financial and reporting periods.
 *
 * @param date - Input date
 * @returns Quarter (1-4)
 */
export function getQuarter(date: DateInput): number {
  const d = toDate(date);
  if (!d) return NaN;
  return Math.floor(getMonth(d) / 3) + 1;
}

/**
 * Get ISO week number
 * Useful for week-based calculations.
 *
 * @param date - Input date
 * @returns ISO week number
 */
export function getWeek(date: DateInput): number {
  const d = toDate(date);
  if (!d) return NaN;

  // ISO 8601 week number calculation
  const target = new Date(d.getTime());
  const dayNr = d.getDay();
  const ThursdayNr = ((dayNr + 6) % 7) + 1;
  target.setDate(target.getDate() - ThursdayNr + 3);

  const firstThursday = new Date(target.getFullYear(), 0, 1);
  const gap = firstThursday.getDay() - 1;
  const prevThursday = gap <= 0 ? firstThursday : new Date(target.getFullYear(), 0, 1 - gap);

  let week = Math.floor((target.getTime() - prevThursday.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;

  // Adjust for years
  if (week <= 0) {
    return getWeek(new Date(target.getFullYear() - 1, 11, 31));
  }

  const yearEnd = new Date(target.getFullYear(), 11, 31);
  const weekEnd = endOfWeek(yearEnd, 1);
  if (!weekEnd) return 1;
  const nextThursday = addDays(weekEnd, 1);
  if (!nextThursday) return 1;
  if (d.getTime() > nextThursday.getTime()) {
    return 1;
  }

  return week;
}

/**
 * Get number of days in month
 * Useful for date validation and calendar generation.
 *
 * @param date - Input date
 * @returns Days in month
 */
export function getDaysInMonth(date: DateInput): number {
  const d = toDate(date);
  if (!d) return NaN;
  return getDaysInMonthInternal(getYear(d), getMonth(d));
}

/**
 * Get number of days in year
 * Useful for date calculations.
 *
 * @param date - Input date
 * @returns Days in year (365 or 366)
 */
export function getDaysInYear(date: DateInput): number {
  const d = toDate(date);
  if (!d) return NaN;
  return isLeapYear(d) ? 366 : 365;
}

/**
 * Convert to Unix timestamp
 * Useful for timestamps and storage.
 *
 * @param date - Input date
 * @returns Unix timestamp in seconds
 */
export function toUnixTimestamp(date: DateInput): number | null {
  const d = toDate(date);
  if (!d) return null;
  return Math.floor(d.getTime() / 1000);
}

// =============================================================================
// DATE SETTING
// =============================================================================

/**
 * Set year
 * Useful for date manipulation.
 *
 * @param date - Input date
 * @param year - Year to set
 * @returns Date with year set
 */
export function setYear(date: DateInput, year: number): Date | null {
  const d = toDate(date);
  if (!d) return null;
  const result = new Date(d);
  result.setFullYear(year);
  return result;
}

/**
 * Set month
 * Useful for date manipulation.
 *
 * @param date - Input date
 * @param month - Month to set (0-11)
 * @returns Date with month set
 */
export function setMonth(date: DateInput, month: number): Date | null {
  const d = toDate(date);
  if (!d) return null;
  const result = new Date(d);
  result.setMonth(normalizeMonth(month));
  return result;
}

/**
 * Set day
 * Useful for date manipulation.
 *
 * @param date - Input date
 * @param day - Day to set (1-31)
 * @returns Date with day set
 */
export function setDay(date: DateInput, day: number): Date | null {
  const d = toDate(date);
  if (!d) return null;
  const result = new Date(d);
  result.setDate(day);
  return result;
}

/**
 * Set hour
 * Useful for time manipulation.
 *
 * @param date - Input date
 * @param hour - Hour to set (0-23)
 * @returns Date with hour set
 */
export function setHour(date: DateInput, hour: number): Date | null {
  const d = toDate(date);
  if (!d) return null;
  const result = new Date(d);
  result.setHours(Math.max(0, Math.min(23, hour)));
  return result;
}

/**
 * Set minute
 * Useful for time manipulation.
 *
 * @param date - Input date
 * @param minute - Minute to set (0-59)
 * @returns Date with minute set
 */
export function setMinute(date: DateInput, minute: number): Date | null {
  const d = toDate(date);
  if (!d) return null;
  const result = new Date(d);
  result.setMinutes(Math.max(0, Math.min(59, minute)));
  return result;
}

/**
 * Set second
 * Useful for time manipulation.
 *
 * @param date - Input date
 * @param second - Second to set (0-59)
 * @returns Date with second set
 */
export function setSecond(date: DateInput, second: number): Date | null {
  const d = toDate(date);
  if (!d) return null;
  const result = new Date(d);
  result.setSeconds(Math.max(0, Math.min(59, second)));
  return result;
}

// =============================================================================
// ADDITIONAL UTILITY FUNCTIONS
// =============================================================================

/**
 * Get date components as an object
 * Useful for extracting all components at once.
 *
 * @param date - Input date
 * @returns Date components object
 */
export function getComponents(date: DateInput): DateComponents | null {
  const d = toDate(date);
  if (!d) return null;
  return {
    year: getYear(d),
    month: getMonth(d),
    day: getDay(d),
    hour: getHour(d),
    minute: getMinute(d),
    second: getSecond(d),
    millisecond: getMillisecond(d),
  };
}

/**
 * Get short month name
 * Useful for display.
 *
 * @param date - Input date
 * @param locale - Locale to use
 * @returns Short month name (e.g., "Jan")
 */
export function getShortMonthName(
  date: DateInput,
  locale: Locale = defaultLocale
): string {
  const d = toDate(date);
  if (!d) return '';
  return locale.monthsShort[getMonth(d)];
}

/**
 * Get full month name
 * Useful for display.
 *
 * @param date - Input date
 * @param locale - Locale to use
 * @returns Full month name (e.g., "January")
 */
export function getMonthName(
  date: DateInput,
  locale: Locale = defaultLocale
): string {
  const d = toDate(date);
  if (!d) return '';
  return locale.months[getMonth(d)];
}

/**
 * Get short weekday name
 * Useful for display.
 *
 * @param date - Input date
 * @param locale - Locale to use
 * @returns Short weekday name (e.g., "Mon")
 */
export function getShortWeekdayName(
  date: DateInput,
  locale: Locale = defaultLocale
): string {
  const d = toDate(date);
  if (!d) return '';
  return locale.weekdaysShort[getDayOfWeek(d)];
}

/**
 * Get full weekday name
 * Useful for display.
 *
 * @param date - Input date
 * @param locale - Locale to use
 * @returns Full weekday name (e.g., "Monday")
 */
export function getWeekdayName(
  date: DateInput,
  locale: Locale = defaultLocale
): string {
  const d = toDate(date);
  if (!d) return '';
  return locale.weekdays[getDayOfWeek(d)];
}

/**
 * Get week start and end dates
 * Useful for week-based queries.
 *
 * @param date - Input date
 * @param startDay - Day to consider as start of week (0 = Sunday)
 * @returns Object with start and end dates
 */
export function getWeekRange(
  date: DateInput,
  startDay = 0
): { start: Date; end: Date } | null {
  const d = toDate(date);
  if (!d) return null;
  return {
    start: startOfWeek(d, startDay)!,
    end: endOfWeek(d, startDay)!,
  };
}

/**
 * Get month start and end dates
 * Useful for month-based queries.
 *
 * @param date - Input date
 * @returns Object with start and end dates
 */
export function getMonthRange(date: DateInput): { start: Date; end: Date } | null {
  const d = toDate(date);
  if (!d) return null;
  return {
    start: startOfMonth(d)!,
    end: endOfMonth(d)!,
  };
}

/**
 * Get year start and end dates
 * Useful for year-based queries.
 *
 * @param date - Input date
 * @returns Object with start and end dates
 */
export function getYearRange(date: DateInput): { start: Date; end: Date } | null {
  const d = toDate(date);
  if (!d) return null;
  return {
    start: startOfYear(d)!,
    end: endOfYear(d)!,
  };
}

/**
 * Get decade start and end dates
 * Useful for decade-based queries.
 *
 * @param date - Input date
 * @returns Object with start and end dates
 */
export function getDecadeRange(date: DateInput): { start: Date; end: Date } | null {
  const d = toDate(date);
  if (!d) return null;
  const year = getYear(d);
  const decadeStart = Math.floor(year / 10) * 10;
  return {
    start: create(decadeStart, 0, 1, 0, 0, 0, 0),
    end: create(decadeStart + 9, 11, 31, 23, 59, 59, 999),
  };
}

/**
 * Clone a date
 * Useful for avoiding mutation.
 *
 * @param date - Input date
 * @returns Cloned date
 */
export function clone(date: DateInput): Date | null {
  const d = toDate(date);
  if (!d) return null;
  return new Date(d.getTime());
}

/**
 * Reset time to midnight
 * Useful for date-only comparisons.
 *
 * @param date - Input date
 * @returns Date with time reset to midnight
 */
export function resetTime(date: DateInput): Date | null {
  return startOfDay(date);
}

/**
 * Check if date is same or after
 * Useful for range checks.
 *
 * @param date - Date to check
 * @param reference - Reference date
 * @returns True if date is same or after reference
 */
export function isSameOrAfter(
  date: DateInput,
  reference: DateInput
): boolean {
  const d = toDate(date);
  const ref = toDate(reference);
  if (!d || !ref) return false;
  return d.getTime() >= ref.getTime();
}

/**
 * Check if date is same or before
 * Useful for range checks.
 *
 * @param date - Date to check
 * @param reference - Reference date
 * @returns True if date is same or before reference
 */
export function isSameOrBefore(
  date: DateInput,
  reference: DateInput
): boolean {
  const d = toDate(date);
  const ref = toDate(reference);
  if (!d || !ref) return false;
  return d.getTime() <= ref.getTime();
}

/**
 * Get timezone offset in hours
 * Useful for timezone calculations.
 *
 * @param date - Input date
 * @returns Timezone offset in hours
 */
export function getTimezoneOffset(date: DateInput): number | null {
  const d = toDate(date);
  if (!d) return null;
  return d.getTimezoneOffset() / -60;
}

/**
 * Convert UTC date to local date
 * Useful for timezone conversions.
 *
 * @param date - Input date
 * @returns Date converted to local timezone
 */
export function utcToLocal(date: DateInput): Date | null {
  const d = toDate(date);
  if (!d) return null;
  return new Date(d.getTime() + d.getTimezoneOffset() * 60 * 1000);
}

/**
 * Convert local date to UTC date
 * Useful for timezone conversions.
 *
 * @param date - Input date
 * @returns Date converted to UTC timezone
 */
export function localToUtc(date: DateInput): Date | null {
  const d = toDate(date);
  if (!d) return null;
  return new Date(d.getTime() - d.getTimezoneOffset() * 60 * 1000);
}
