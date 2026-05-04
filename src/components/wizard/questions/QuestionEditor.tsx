import { Plus, X, ImagePlus } from 'lucide-react';
import type { DraftQuestion } from '@/types/draft';
import type { McqOption } from '@/types';
import { Field, Input, Textarea, Toggle } from '@/components/forms';
import { QUESTION_TYPE_META } from './icons';
import { cn } from '@/lib/cn';

type Props = {
  question: DraftQuestion;
  onChange: (next: DraftQuestion) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditingExisting: boolean;
};

export function QuestionEditor({
  question,
  onChange,
  onSave,
  onCancel,
  isEditingExisting,
}: Props) {
  const meta = QUESTION_TYPE_META[question.type];
  const Icon = meta.icon;
  const canSave = question.content.trim().length > 0 && question.marks > 0;

  function updateField<K extends keyof DraftQuestion>(
    key: K,
    value: DraftQuestion[K],
  ) {
    onChange({ ...question, [key]: value });
  }

  return (
    <div className="rounded-card border border-border bg-surface p-5 shadow-lift">
      <header className="mb-5 flex items-center gap-2">
        <Icon size={15} strokeWidth={1.75} className="text-ink" aria-hidden />
        <h3 className="text-[14px] font-semibold text-ink">{meta.label}</h3>
        <span className="text-[12px] text-ink-tertiary">· {meta.description}</span>
      </header>

      <div className="space-y-5">
        <Field label="Question" htmlFor={`q-content-${question.id}`}>
          <Textarea
            id={`q-content-${question.id}`}
            rows={3}
            value={question.content}
            onChange={(e) => updateField('content', e.target.value)}
            placeholder={contentPlaceholder(question.type)}
          />
        </Field>

        {question.type === 'mcq' && (
          <McqEditorBody question={question} onChange={onChange} />
        )}

        {(question.type === 'short_answer' ||
          question.type === 'long_answer') && (
          <Field
            label="Expected answer"
            htmlFor={`q-expected-${question.id}`}
            helper="Marka uses this as a reference when grading. Cover the key points students need to mention."
          >
            <Textarea
              id={`q-expected-${question.id}`}
              rows={question.type === 'long_answer' ? 5 : 3}
              value={question.expected_answer ?? ''}
              onChange={(e) =>
                updateField('expected_answer', e.target.value)
              }
              placeholder={
                question.type === 'long_answer'
                  ? 'A model answer covering the points worth marks.'
                  : 'The answer or key terms a student should give.'
              }
            />
          </Field>
        )}

        {question.type === 'handwritten' && (
          <HandwrittenEditorBody question={question} onChange={onChange} />
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-[140px_1fr] sm:items-start">
          <Field label="Marks" htmlFor={`q-marks-${question.id}`}>
            <Input
              id={`q-marks-${question.id}`}
              type="number"
              min={1}
              max={50}
              value={question.marks || ''}
              onChange={(e) =>
                updateField('marks', Number(e.target.value) || 0)
              }
            />
          </Field>
          <div className="pt-1 sm:pt-7">
            <Toggle
              checked={question.saved_to_bank}
              onChange={(next) => updateField('saved_to_bank', next)}
              label="Save to my question bank"
              description="Reuse this question in future exams."
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-2 border-t border-border-subtle pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="h-9 rounded-control px-4 text-[13px] font-medium text-ink-secondary hover:bg-hairline hover:text-ink"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!canSave}
          onClick={onSave}
          className={cn(
            'h-9 rounded-control px-4 text-[13px] font-medium shadow-soft transition-colors',
            canSave
              ? 'bg-ink text-white hover:bg-[#1F1F1F]'
              : 'cursor-not-allowed bg-hairline text-ink-tertiary',
          )}
        >
          {isEditingExisting ? 'Save changes' : 'Add to exam'}
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// MCQ-specific body
// ────────────────────────────────────────────────────────────────────

function McqEditorBody({
  question,
  onChange,
}: {
  question: DraftQuestion;
  onChange: (next: DraftQuestion) => void;
}) {
  const options = question.mcq_options ?? [];

  function setOptions(next: McqOption[]) {
    onChange({ ...question, mcq_options: next });
  }

  function addOption() {
    if (options.length >= 5) return;
    const id = `${question.id}_${String.fromCharCode(97 + options.length)}_${Math.random().toString(36).slice(2, 4)}`;
    setOptions([...options, { id, text: '', is_correct: false }]);
  }

  function removeOption(id: string) {
    if (options.length <= 2) return;
    setOptions(options.filter((o) => o.id !== id));
  }

  function updateOption(id: string, partial: Partial<McqOption>) {
    setOptions(options.map((o) => (o.id === id ? { ...o, ...partial } : o)));
  }

  return (
    <Field
      label="Options"
      helper="Tick every correct option. You can have one or more correct answers."
    >
      <div className="space-y-2">
        {options.map((opt, idx) => (
          <div
            key={opt.id}
            className="flex items-center gap-2 rounded-control border border-border-subtle bg-canvas px-2 py-1.5 transition-colors focus-within:border-border"
          >
            <button
              type="button"
              role="checkbox"
              aria-checked={opt.is_correct}
              onClick={() =>
                updateOption(opt.id, { is_correct: !opt.is_correct })
              }
              className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors',
                opt.is_correct
                  ? 'border-positive bg-positive text-white'
                  : 'border-border bg-surface text-transparent hover:border-ink-secondary',
              )}
              aria-label={`Mark option ${String.fromCharCode(65 + idx)} correct`}
            >
              <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden>
                <path
                  d="M2.5 6.5l2.5 2.5L9.5 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <span className="w-5 shrink-0 text-center text-[12px] font-medium text-ink-tertiary">
              {String.fromCharCode(65 + idx)}
            </span>
            <input
              type="text"
              value={opt.text}
              onChange={(e) =>
                updateOption(opt.id, { text: e.target.value })
              }
              placeholder={`Option ${String.fromCharCode(65 + idx)}`}
              className="h-8 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-tertiary"
            />
            <button
              type="button"
              onClick={() => removeOption(opt.id)}
              disabled={options.length <= 2}
              className="flex h-7 w-7 items-center justify-center rounded-control text-ink-tertiary transition-colors hover:bg-hairline hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Remove option"
            >
              <X size={13} strokeWidth={1.75} />
            </button>
          </div>
        ))}

        {options.length < 5 && (
          <button
            type="button"
            onClick={addOption}
            className="inline-flex items-center gap-1.5 rounded-control px-2 py-1 text-[13px] text-ink-secondary hover:bg-hairline hover:text-ink"
          >
            <Plus size={13} strokeWidth={2} />
            Add option
          </button>
        )}
      </div>
    </Field>
  );
}

// ────────────────────────────────────────────────────────────────────
// Handwritten-specific body
// ────────────────────────────────────────────────────────────────────

function HandwrittenEditorBody({
  question,
  onChange,
}: {
  question: DraftQuestion;
  onChange: (next: DraftQuestion) => void;
}) {
  const hasImage = Boolean(question.reference_image_url);

  function pickReferenceImage() {
    // Mock: pretend an upload happened.
    onChange({
      ...question,
      reference_image_url: '/mock-images/reference/diagram-stub.png',
    });
  }

  function clearReferenceImage() {
    onChange({ ...question, reference_image_url: null });
  }

  return (
    <>
      <Field
        label="Reference image"
        optional
        helper="If the question refers to a diagram, upload it here so students can see it on their device."
      >
        {hasImage ? (
          <div className="flex items-center gap-3 rounded-control border border-border-subtle bg-canvas px-3 py-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-hairline text-ink-tertiary">
              <ImagePlus size={16} strokeWidth={1.75} />
            </div>
            <span className="flex-1 truncate text-[13px] text-ink">
              diagram-stub.png
            </span>
            <button
              type="button"
              onClick={clearReferenceImage}
              className="text-[12px] text-ink-secondary hover:text-ink"
            >
              Remove
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={pickReferenceImage}
            className="flex w-full items-center justify-center gap-2 rounded-control border border-dashed border-border bg-canvas px-3 py-3 text-[13px] text-ink-secondary hover:bg-surface hover:text-ink"
          >
            <ImagePlus size={14} strokeWidth={1.75} />
            Upload an image
          </button>
        )}
      </Field>

      <Field
        label="Grading rubric"
        htmlFor={`q-rubric-${question.id}`}
        helper="Tell Marka what to look for: correct labels, balanced equations, clear working, and so on."
      >
        <Textarea
          id={`q-rubric-${question.id}`}
          rows={4}
          value={question.rubric ?? ''}
          onChange={(e) => onChange({ ...question, rubric: e.target.value })}
          placeholder="e.g. 2 marks for the correct skeletal structure, 1 mark for labelling the double bond, 1 mark for showing all hydrogen atoms."
        />
      </Field>
    </>
  );
}

function contentPlaceholder(type: DraftQuestion['type']): string {
  switch (type) {
    case 'mcq':
      return 'e.g. Which of the following is an alkane?';
    case 'short_answer':
      return 'e.g. Define isomerism.';
    case 'long_answer':
      return 'e.g. Describe the laboratory preparation of ethyne, including the equation and how the gas is collected.';
    case 'handwritten':
      return 'e.g. Draw the structure of 2-methylbut-2-ene and label the position of the double bond.';
  }
}
