

/********converting time to seconds*******************/

type TimeUnit = 
  | 'second'
  | 'minute'
  | 'hour'
  | 'half a day'
  | 'day'
  | 'midweek'
  | 'week'
  | 'bi-week'
  | 'month'
  | '1/3 year'
  | 'mid-year'
  | 'yearly';

// Precomputed constants
const SECONDS_IN_MINUTE = 60;
const SECONDS_IN_HOUR = 60 * SECONDS_IN_MINUTE;  // 3600
const SECONDS_IN_DAY = 24 * SECONDS_IN_HOUR;     // 86400
const SECONDS_IN_WEEK = 7 * SECONDS_IN_DAY;      // 604800

// Gregorian calendar calculations (accounts for leap years)
const AVG_GREGORIAN_YEAR_DAYS = 365.2425;        // Average days per year
const SECONDS_IN_YEAR = AVG_GREGORIAN_YEAR_DAYS * SECONDS_IN_DAY;  // 31,556,952

// Conversion dictionary
const conversions: Record<TimeUnit, number> = {
  'second': 1,
  'minute': SECONDS_IN_MINUTE,
  'hour': SECONDS_IN_HOUR,
  'half a day': 0.5 * SECONDS_IN_DAY,      // 43,200
  'day': SECONDS_IN_DAY,                   // 86,400
  'midweek': 3.5 * SECONDS_IN_DAY,         // 302,400
  'week': SECONDS_IN_WEEK,                 // 604,800
  'bi-week': 2 * SECONDS_IN_WEEK,          // 1,209,600
  'month': 30 * SECONDS_IN_DAY,            // 2,592,000
  '1/3 year': SECONDS_IN_YEAR / 3,         // 10,518,984
  'mid-year': SECONDS_IN_YEAR / 2,         // 15,778,476
  'yearly': SECONDS_IN_YEAR                // 31,556,952
};

function convertToSeconds(unit: TimeUnit): number {
  return conversions[unit];
}


/******** End of converting time to seconds*******************/