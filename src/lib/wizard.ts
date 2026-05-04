import type { DraftExam } from '@/types/draft';
import type { WizardStepKey } from '@/components/wizard/WizardProgress';

/**
 * Inspect a draft to figure out what step the teacher has progressed to.
 * Used by the progress indicator to gate forward navigation.
 */
export function furthestStep(draft: DraftExam): WizardStepKey {
  if (draft.parsed_students.length > 0) return 'review';
  if (draft.questions.length > 0) return 'students';
  if (draft.title.trim() && draft.start_date && draft.start_time) {
    return 'questions';
  }
  return 'details';
}

export function detailsAreComplete(draft: DraftExam): boolean {
  return Boolean(
    draft.title.trim() &&
      draft.subject.trim() &&
      draft.class_name.trim() &&
      draft.start_date &&
      draft.start_time &&
      draft.duration_value > 0,
  );
}

export function detailsMissingMessage(draft: DraftExam): string | null {
  const missing: string[] = [];
  if (!draft.title.trim()) missing.push('a title');
  if (!draft.subject.trim()) missing.push('a subject');
  if (!draft.class_name.trim()) missing.push('a class');
  if (!draft.start_date || !draft.start_time) missing.push('a start time');
  if (missing.length === 0) return null;
  if (missing.length === 1) return `We need ${missing[0]} to continue.`;
  if (missing.length === 2)
    return `We need ${missing[0]} and ${missing[1]} to continue.`;
  return `We need ${missing.slice(0, -1).join(', ')}, and ${missing[missing.length - 1]} to continue.`;
}

export function totalMarks(draft: DraftExam): number {
  return draft.questions.reduce((sum, q) => sum + (q.marks || 0), 0);
}

export function durationInMinutes(draft: DraftExam): number {
  return draft.duration_unit === 'hours'
    ? draft.duration_value * 60
    : draft.duration_value;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  if (rem === 0) return `${hours} hour${hours === 1 ? '' : 's'}`;
  return `${hours}h ${rem}m`;
}
