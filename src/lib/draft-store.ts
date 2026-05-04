import type { DraftExam } from '@/types/draft';

/**
 * localStorage-backed draft store. Auto-save writes here on every change
 * so closing the tab and coming back lands the teacher where she left off.
 *
 * In production, replace with API calls (POST /exams/draft, PATCH ...).
 */

const DRAFT_PREFIX = 'marka.draft.';
const ACTIVE_KEY = 'marka.activeDraftId';

export function loadDraft(id: string): DraftExam | null {
  try {
    const raw = localStorage.getItem(DRAFT_PREFIX + id);
    if (!raw) return null;
    return JSON.parse(raw) as DraftExam;
  } catch {
    return null;
  }
}

export function saveDraft(draft: DraftExam): void {
  const next = { ...draft, updated_at: new Date().toISOString() };
  try {
    localStorage.setItem(DRAFT_PREFIX + draft.id, JSON.stringify(next));
    localStorage.setItem(ACTIVE_KEY, draft.id);
  } catch {
    // Storage quota or disabled — silently fail in prototype.
  }
}

export function getActiveDraftId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
}

export function setActiveDraftId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_KEY, id);
  } catch {
    // ignore
  }
}

export function clearDraft(id: string): void {
  try {
    localStorage.removeItem(DRAFT_PREFIX + id);
    if (getActiveDraftId() === id) {
      localStorage.removeItem(ACTIVE_KEY);
    }
  } catch {
    // ignore
  }
}
