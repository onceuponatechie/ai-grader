import type { Exam, ExamStatus } from '@/types';
import { TIMEZONE } from './clock';

// ────────────────────────────────────────────────────────────────────
// Pluralisation
// ────────────────────────────────────────────────────────────────────

export function plural(n: number, singular: string, pluralForm?: string): string {
  return n === 1 ? singular : (pluralForm ?? singular + 's');
}

export function withCount(
  n: number,
  singular: string,
  pluralForm?: string,
): string {
  return `${n.toLocaleString('en-US')} ${plural(n, singular, pluralForm)}`;
}

// ────────────────────────────────────────────────────────────────────
// Greeting
// ────────────────────────────────────────────────────────────────────

export function greetingFor(date: Date): string {
  // Use Lagos hour so the greeting matches the user's time of day, not UTC.
  const hour = parseInt(
    new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: TIMEZONE,
    }).format(date),
    10,
  );
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// ────────────────────────────────────────────────────────────────────
// Dates and times
// ────────────────────────────────────────────────────────────────────

export function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: TIMEZONE,
  }).format(date);
}

export function formatTimeOfDay(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: TIMEZONE,
  })
    .format(date)
    .replace(/\s/g, ' ');
}

/**
 * Whole-number minutes between two dates. Always non-negative.
 * Used for "47 minutes left".
 */
export function minutesBetween(later: Date, earlier: Date): number {
  return Math.max(0, Math.floor((later.getTime() - earlier.getTime()) / 60_000));
}

export function formatMinutesLeft(minutes: number): string {
  if (minutes <= 0) return 'Ending now';
  if (minutes < 60) return `${minutes} ${plural(minutes, 'minute')} left`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  if (rem === 0) return `${hours} ${plural(hours, 'hour')} left`;
  return `${hours}h ${rem}m left`;
}

/**
 * Human-friendly relative time. We bucket aggressively because the
 * teacher only cares about rough recency, not exact deltas.
 */
export function relativeTime(date: Date, now: Date): string {
  const diffMs = now.getTime() - date.getTime();
  const future = diffMs < 0;
  const abs = Math.abs(diffMs);

  const minutes = Math.floor(abs / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  let phrase: string;
  if (minutes < 1) phrase = 'just now';
  else if (minutes < 60) phrase = `${minutes} ${plural(minutes, 'minute')}`;
  else if (hours < 24) phrase = `${hours} ${plural(hours, 'hour')}`;
  else if (days === 1) phrase = future ? 'tomorrow' : 'yesterday';
  else if (days < 7) phrase = `${days} days`;
  else if (days < 14) phrase = '1 week';
  else if (days < 30) phrase = `${weeks} weeks`;
  else if (months === 1) phrase = '1 month';
  else phrase = `${months} months`;

  if (phrase === 'just now' || phrase === 'tomorrow' || phrase === 'yesterday') {
    return phrase;
  }
  return future ? `in ${phrase}` : `${phrase} ago`;
}

// ────────────────────────────────────────────────────────────────────
// Exam status — translated into language teachers actually use
// ────────────────────────────────────────────────────────────────────

export type StatusTone = 'live' | 'attention' | 'ready' | 'neutral' | 'muted';

export function statusLabel(exam: Exam, now: Date): string {
  switch (exam.status) {
    case 'draft':
      return 'Draft';
    case 'scheduled':
      return 'Scheduled';
    case 'live':
      return 'Live now';
    case 'grading':
      return 'Grading in progress';
    case 'ready_to_publish':
      return 'Ready to publish';
    case 'published':
      return exam.published_at
        ? `Published ${relativeTime(new Date(exam.published_at), now)}`
        : 'Published';
    case 'archived':
      return 'Archived';
  }
}

export function statusTone(status: ExamStatus): StatusTone {
  switch (status) {
    case 'live':
      return 'live';
    case 'grading':
      return 'attention';
    case 'ready_to_publish':
      return 'ready';
    case 'published':
      return 'muted';
    case 'scheduled':
    case 'draft':
    case 'archived':
    default:
      return 'neutral';
  }
}

export function examDateLine(exam: Exam, now: Date): string {
  const start = new Date(exam.start_time);
  if (exam.status === 'published' && exam.published_at) {
    return relativeTime(new Date(exam.published_at), now);
  }
  if (exam.status === 'live') {
    return `Started ${formatTimeOfDay(start)}`;
  }
  return formatLongDate(start);
}
