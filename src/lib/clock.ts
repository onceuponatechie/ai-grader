/**
 * Anchored "now" for the prototype so every relative phrase
 * ("47 minutes left", "Published 2 weeks ago") stays stable
 * regardless of when the demo is opened.
 *
 * Anchored to Monday 2026-05-04, 9:43 AM Africa/Lagos (08:43 UTC):
 * - Live mid-term started 9:00 AM Lagos, ends 10:30 AM Lagos
 * - Time-left on dashboard reads as 47 minutes
 * - SS2 quiz happened last Thursday, now mid-grading
 * - SS1 test was published 14 days ago → "2 weeks ago"
 *
 * In production, swap this for `new Date()`.
 */
const DEMO_NOW = new Date('2026-05-04T08:43:00.000Z');

export function now(): Date {
  return DEMO_NOW;
}

/** Africa/Lagos for all human-facing times (school is in Lagos). */
export const TIMEZONE = 'Africa/Lagos';
