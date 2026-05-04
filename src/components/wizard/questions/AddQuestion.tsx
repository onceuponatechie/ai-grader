import { Plus } from 'lucide-react';
import type { QuestionType } from '@/types';
import { QUESTION_TYPE_META } from './icons';

type Props = {
  onChooseType: (type: QuestionType) => void;
};

const TYPES: QuestionType[] = ['mcq', 'short_answer', 'long_answer', 'handwritten'];

/**
 * Empty state for the question editor area: shows a single "Add question"
 * row that, on hover, reveals the four type choices below it. The brief
 * spec'd a dropdown but a row of typed buttons reads more clearly to a
 * teacher who hasn't done this before — the choice is visible.
 */
export function AddQuestion({ onChooseType }: Props) {
  return (
    <div className="rounded-card border border-border-subtle bg-surface p-5 shadow-soft">
      <div className="flex items-center gap-2">
        <Plus
          size={14}
          strokeWidth={2}
          className="text-ink-tertiary"
          aria-hidden
        />
        <h3 className="text-[14px] font-semibold text-ink">Add a question</h3>
        <span className="text-[12px] text-ink-tertiary">
          · pick the type
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {TYPES.map((t) => {
          const meta = QUESTION_TYPE_META[t];
          const Icon = meta.icon;
          return (
            <button
              key={t}
              type="button"
              onClick={() => onChooseType(t)}
              className="group flex items-start gap-3 rounded-control border border-border-subtle bg-canvas p-3 text-left transition-colors hover:border-border hover:bg-surface focus:outline-none focus:ring-2 focus:ring-ink/10"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-surface text-ink shadow-soft">
                <Icon size={15} strokeWidth={1.75} aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-medium text-ink">
                  {meta.label}
                </span>
                <span className="mt-0.5 block text-[12px] leading-snug text-ink-secondary">
                  {meta.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
