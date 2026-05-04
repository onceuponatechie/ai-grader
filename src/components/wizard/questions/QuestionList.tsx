import { Pencil, Trash2 } from 'lucide-react';
import type { DraftQuestion } from '@/types/draft';
import { QUESTION_TYPE_META } from './icons';
import { withCount } from '@/lib/format';

type Props = {
  questions: DraftQuestion[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export function QuestionList({ questions, onEdit, onDelete }: Props) {
  if (questions.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-border bg-surface px-5 py-8 text-center">
        <p className="text-[14px] text-ink-secondary">
          No questions yet. Add one below — or pull from your question bank
          on the right.
        </p>
      </div>
    );
  }

  return (
    <ol className="space-y-2">
      {questions.map((q, idx) => {
        const meta = QUESTION_TYPE_META[q.type];
        const Icon = meta.icon;
        const firstLine = (q.content || 'Untitled question').split('\n')[0];

        return (
          <li
            key={q.id}
            className="group rounded-card border border-border-subtle bg-surface p-4 shadow-soft transition-shadow hover:shadow-lift"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-hairline text-[12px] font-semibold text-ink">
                {idx + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Icon
                    size={13}
                    strokeWidth={1.75}
                    className="text-ink-tertiary"
                    aria-hidden
                  />
                  <span className="label-caps">{meta.label}</span>
                  <span className="text-[12px] text-ink-tertiary">
                    · {withCount(q.marks, 'mark')}
                  </span>
                  {q.saved_to_bank && (
                    <span className="text-[11px] uppercase tracking-wider text-ink-tertiary">
                      · saved
                    </span>
                  )}
                </div>
                <p className="mt-1.5 line-clamp-2 text-[14px] leading-snug text-ink">
                  {firstLine}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                <button
                  type="button"
                  onClick={() => onEdit(q.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-control text-ink-secondary hover:bg-hairline hover:text-ink"
                  aria-label="Edit question"
                >
                  <Pencil size={14} strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(q.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-control text-ink-secondary hover:bg-[#FBE8E4] hover:text-problem"
                  aria-label="Delete question"
                >
                  <Trash2 size={14} strokeWidth={1.75} />
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
