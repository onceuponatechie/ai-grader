import { useMemo, useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import type { QuestionType } from '@/types';
import type { DraftQuestion } from '@/types/draft';
import { newDraftQuestion } from '@/types/draft';
import { useDraftExam } from '@/hooks/useDraftExam';
import { furthestStep, totalMarks } from '@/lib/wizard';
import { withCount } from '@/lib/format';
import {
  WizardShell,
  WizardFooter,
} from '@/components/wizard/WizardShell';
import { QuestionList } from '@/components/wizard/questions/QuestionList';
import { AddQuestion } from '@/components/wizard/questions/AddQuestion';
import { QuestionEditor } from '@/components/wizard/questions/QuestionEditor';
import { BankPanel } from '@/components/wizard/questions/BankPanel';

type EditorState =
  | { kind: 'idle' }
  | { kind: 'creating'; draft: DraftQuestion }
  | { kind: 'editing'; draft: DraftQuestion; existingId: string };

export function QuestionsStep() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { draft, update } = useDraftExam(params.id);

  // If params id doesn't match the loaded draft, we landed on a stale URL.
  // Resync the URL to the loaded draft (resume flow).
  if (params.id && params.id !== draft.id) {
    return <Navigate to={`/exams/new/${draft.id}/questions`} replace />;
  }

  const [editor, setEditor] = useState<EditorState>({ kind: 'idle' });

  const total = totalMarks(draft);
  const count = draft.questions.length;
  const annotation =
    count === 0
      ? 'No questions yet'
      : `${withCount(count, 'question')} · ${withCount(total, 'mark')} total`;

  const continueDisabled = count === 0 ? 'Add at least one question to continue.' : null;

  const alreadyAdded = useMemo(
    () => new Set(draft.questions.map((q) => q.id)),
    [draft.questions],
  );

  function chooseType(type: QuestionType) {
    setEditor({ kind: 'creating', draft: newDraftQuestion(type) });
  }

  function startEditing(id: string) {
    const q = draft.questions.find((q) => q.id === id);
    if (!q) return;
    setEditor({ kind: 'editing', draft: { ...q }, existingId: id });
  }

  function saveEditor() {
    if (editor.kind === 'idle') return;
    if (editor.kind === 'creating') {
      update({ questions: [...draft.questions, editor.draft] });
    } else {
      update({
        questions: draft.questions.map((q) =>
          q.id === editor.existingId ? editor.draft : q,
        ),
      });
    }
    setEditor({ kind: 'idle' });
  }

  function cancelEditor() {
    setEditor({ kind: 'idle' });
  }

  function deleteQuestion(id: string) {
    update({ questions: draft.questions.filter((q) => q.id !== id) });
    if (
      editor.kind === 'editing' &&
      editor.existingId === id
    ) {
      setEditor({ kind: 'idle' });
    }
  }

  function addFromBank(q: DraftQuestion) {
    update({ questions: [...draft.questions, q] });
  }

  return (
    <WizardShell
      current="questions"
      draftId={draft.id}
      furthestReached={furthestStep(draft)}
      narrow={false}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,_3fr)_minmax(0,_2fr)]">
        {/* ─────────── Left: list + editor ─────────── */}
        <div>
          <div className="mb-6">
            <h1 className="text-[24px] font-semibold tracking-tight text-ink">
              Add questions
            </h1>
            <p className="mt-1.5 text-[14px] leading-relaxed text-ink-secondary">
              Build your paper question by question, or pull from your bank
              on the right.
            </p>
          </div>

          <QuestionList
            questions={draft.questions}
            onEdit={startEditing}
            onDelete={deleteQuestion}
          />

          <div className="mt-6">
            {editor.kind === 'idle' ? (
              <AddQuestion onChooseType={chooseType} />
            ) : (
              <QuestionEditor
                question={editor.draft}
                onChange={(next) =>
                  setEditor((prev) =>
                    prev.kind === 'idle' ? prev : { ...prev, draft: next },
                  )
                }
                onSave={saveEditor}
                onCancel={cancelEditor}
                isEditingExisting={editor.kind === 'editing'}
              />
            )}
          </div>
        </div>

        {/* ─────────── Right: bank panel ─────────── */}
        <div className="lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-7rem)]">
          <BankPanel
            alreadyAdded={alreadyAdded}
            onAddDraft={addFromBank}
          />
        </div>
      </div>

      <WizardFooter
        backHref="/exams/new/details"
        continueLabel="Continue to students"
        onContinue={() => navigate(`/exams/new/${draft.id}/students`)}
        disabledReason={continueDisabled}
        leftAnnotation={annotation}
      />
    </WizardShell>
  );
}
