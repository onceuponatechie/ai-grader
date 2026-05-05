import type {
  ExamSession,
  GradedResponse,
  Question,
  SessionStatus,
} from '@/types';
import { now } from '@/lib/clock';
import { formatTimeOfDay, minutesBetween } from '@/lib/format';

// ────────────────────────────────────────────────────────────────────
// Live monitoring
// ────────────────────────────────────────────────────────────────────

export type LiveStatusKey =
  | 'writing'
  | 'submitted'
  | 'not_started'
  | 'auto_submitted'
  | 'connection_issue';

export type LiveStatusInfo = {
  key: LiveStatusKey;
  label: string;
  tone: 'live' | 'positive' | 'attention' | 'problem' | 'muted';
};

export function liveStatusFor(s: ExamSession): LiveStatusInfo {
  switch (s.status) {
    case 'writing':
      return { key: 'writing', label: 'Writing', tone: 'live' };
    case 'submitted':
      return { key: 'submitted', label: 'Submitted', tone: 'positive' };
    case 'auto_submitted':
      return { key: 'auto_submitted', label: 'Auto-submitted', tone: 'attention' };
    case 'needs_retake':
      return { key: 'connection_issue', label: 'Connection issue', tone: 'problem' };
    case 'not_started':
    default:
      return { key: 'not_started', label: 'Not started', tone: 'muted' };
  }
}

export function timestampOrDash(iso: string | null): string {
  if (!iso) return '—';
  return formatTimeOfDay(new Date(iso));
}

export function formatRemaining(seconds: number | null): string {
  if (seconds === null || seconds === undefined) return '—';
  if (seconds <= 0) return 'No time left';
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min left`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h left` : `${h}h ${m}m left`;
}

/** Whether a session has any operational issue worth surfacing. */
export function hasIssue(s: ExamSession): boolean {
  return s.flagged_for_review || s.status === 'needs_retake' || s.status === 'auto_submitted';
}

export const LIVE_FILTER_KEYS = [
  'all',
  'writing',
  'submitted',
  'not_started',
  'has_issues',
] as const;
export type LiveFilterKey = (typeof LIVE_FILTER_KEYS)[number];

export function filterLabel(key: LiveFilterKey): string {
  switch (key) {
    case 'all':
      return 'All';
    case 'writing':
      return 'Writing';
    case 'submitted':
      return 'Submitted';
    case 'not_started':
      return 'Not started';
    case 'has_issues':
      return 'Has issues';
  }
}

export function matchesFilter(s: ExamSession, f: LiveFilterKey): boolean {
  if (f === 'all') return true;
  if (f === 'has_issues') return hasIssue(s);
  if (f === 'submitted') {
    return s.status === 'submitted' || s.status === 'auto_submitted';
  }
  return s.status === f;
}

export function liveCounts(sessions: ExamSession[]) {
  return {
    writing: sessions.filter((s) => s.status === 'writing').length,
    submitted: sessions.filter(
      (s) => s.status === 'submitted' || s.status === 'auto_submitted',
    ).length,
    not_started: sessions.filter((s) => s.status === 'not_started').length,
    issues: sessions.filter(hasIssue).length,
  };
}

/**
 * Plain-English inline note explaining a session's situation. Returns null
 * when nothing extra needs saying beyond the status label.
 */
export function statusNote(s: ExamSession): string | null {
  if (s.status === 'needs_retake') {
    if (s.flag_reason) return s.flag_reason;
    return 'Lost their connection. They can rejoin to continue from where they stopped.';
  }
  if (s.status === 'auto_submitted') {
    return 'Time ran out. Their answers were saved automatically.';
  }
  if (s.flagged_for_review && s.flag_reason) return s.flag_reason;
  return null;
}

// ────────────────────────────────────────────────────────────────────
// Grading review
// ────────────────────────────────────────────────────────────────────

export type FlaggedScriptInfo = {
  session: ExamSession;
  flaggedCount: number;
  totalQuestions: number;
  scoreSoFar: number;
  totalMarks: number;
  reason: string;
};

/**
 * Given a list of sessions for one exam and ALL graded responses,
 * pick out the sessions where at least one response needs review and
 * derive a teacher-friendly summary.
 */
export function flaggedScriptsFor(
  sessions: ExamSession[],
  responses: GradedResponse[],
  questions: Question[],
): FlaggedScriptInfo[] {
  const responsesBySession = groupBy(responses, (r) => r.session_id);
  const totalMarks = questions.reduce((s, q) => s + q.marks, 0);

  const out: FlaggedScriptInfo[] = [];
  for (const session of sessions) {
    const r = responsesBySession.get(session.id) ?? [];
    const flaggedResponses = r.filter((x) => x.needs_review);
    if (flaggedResponses.length === 0) continue;
    out.push({
      session,
      flaggedCount: flaggedResponses.length,
      totalQuestions: questions.length,
      scoreSoFar: r.reduce((s, x) => s + (x.manual_score ?? x.ai_score), 0),
      totalMarks,
      reason: summariseReason(flaggedResponses, questions),
    });
  }
  return out;
}

function summariseReason(
  flagged: GradedResponse[],
  questions: Question[],
): string {
  // Prefer the explicit review_reason if a single flag exists.
  if (flagged.length === 1 && flagged[0].review_reason) {
    return flagged[0].review_reason;
  }

  // Otherwise group by type of issue.
  const handwritingCount = flagged.filter((r) => {
    const q = questions.find((q) => q.id === r.question_id);
    return q?.type === 'handwritten';
  }).length;

  const lowConfidenceCount = flagged.filter(
    (r) => r.ai_confidence === 'low',
  ).length;

  if (handwritingCount === flagged.length && handwritingCount > 0) {
    return `AI couldn't read ${handwritingCount} handwritten ${
      handwritingCount === 1 ? 'answer' : 'answers'
    } clearly.`;
  }
  if (lowConfidenceCount === flagged.length) {
    const qs = flagged
      .map((r) => questionNumber(r.question_id, questions))
      .filter((n): n is number => n !== null)
      .sort((a, b) => a - b);
    if (qs.length > 0) {
      return `AI's confidence was low on ${qs.length === 1 ? 'question' : 'questions'} ${formatList(qs)}.`;
    }
  }

  return `${flagged.length} ${flagged.length === 1 ? 'answer needs' : 'answers need'} your review.`;
}

function questionNumber(qid: string, questions: Question[]): number | null {
  const idx = questions.findIndex((q) => q.id === qid);
  return idx === -1 ? null : idx + 1;
}

function formatList(nums: number[]): string {
  if (nums.length === 1) return String(nums[0]);
  if (nums.length === 2) return `${nums[0]} and ${nums[1]}`;
  return `${nums.slice(0, -1).join(', ')} and ${nums[nums.length - 1]}`;
}

// ────────────────────────────────────────────────────────────────────
// Per-session totals
// ────────────────────────────────────────────────────────────────────

export function sessionTotals(
  responses: GradedResponse[],
  questions: Question[],
) {
  const totalMarks = questions.reduce((s, q) => s + q.marks, 0);
  const score = responses.reduce(
    (s, r) => s + (r.manual_score ?? r.ai_score),
    0,
  );
  const flagged = responses.filter((r) => r.needs_review).length;
  const confirmed = responses.length - flagged;
  return { totalMarks, score, flagged, confirmed, percent: totalMarks === 0 ? 0 : Math.round((score / totalMarks) * 100) };
}

// ────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────

function groupBy<T, K>(items: T[], key: (t: T) => K): Map<K, T[]> {
  const m = new Map<K, T[]>();
  for (const item of items) {
    const k = key(item);
    const arr = m.get(k);
    if (arr) arr.push(item);
    else m.set(k, [item]);
  }
  return m;
}

export function statusForFilter(s: SessionStatus): SessionStatus {
  return s;
}

/** Live-time-left for the cohort, derived from exam end_time. */
export function liveMinutesLeft(endIso: string): number {
  return minutesBetween(new Date(endIso), now());
}
