import { useCallback, useEffect, useRef, useState } from 'react';
import type { DraftExam } from '@/types/draft';
import { newDraftExam } from '@/types/draft';
import {
  getActiveDraftId,
  loadDraft,
  saveDraft,
  setActiveDraftId,
} from '@/lib/draft-store';

type UseDraftResult = {
  draft: DraftExam;
  update: (partial: Partial<DraftExam>) => void;
  replace: (draft: DraftExam) => void;
};

/**
 * Hook for reading/writing a single draft exam.
 *
 * Pass a known id (Steps 2-4) and we hydrate from storage.
 * Pass undefined (Step 1) and we resume the active draft, or start a new one.
 */
export function useDraftExam(id: string | undefined): UseDraftResult {
  const [draft, setDraft] = useState<DraftExam>(() => {
    if (id) {
      const loaded = loadDraft(id);
      if (loaded) return loaded;
    }
    const activeId = getActiveDraftId();
    if (activeId) {
      const loaded = loadDraft(activeId);
      if (loaded) return loaded;
    }
    return newDraftExam();
  });

  // Keep a ref so update() is stable.
  const draftRef = useRef(draft);
  draftRef.current = draft;

  // Auto-save on every change.
  useEffect(() => {
    saveDraft(draft);
  }, [draft]);

  // Mark active when this draft is touched.
  useEffect(() => {
    setActiveDraftId(draft.id);
  }, [draft.id]);

  const update = useCallback((partial: Partial<DraftExam>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
  }, []);

  const replace = useCallback((next: DraftExam) => {
    setDraft(next);
  }, []);

  return { draft, update, replace };
}
