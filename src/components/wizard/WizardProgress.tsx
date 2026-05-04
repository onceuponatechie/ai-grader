import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

export type WizardStepKey = 'details' | 'questions' | 'students' | 'review';

const STEPS: { key: WizardStepKey; label: string }[] = [
  { key: 'details', label: 'Details' },
  { key: 'questions', label: 'Questions' },
  { key: 'students', label: 'Students' },
  { key: 'review', label: 'Review' },
];

type Props = {
  current: WizardStepKey;
  draftId: string | null;
  /** Highest step the user has reached. Limits forward jumping. */
  furthestReached: WizardStepKey;
};

export function WizardProgress({ current, draftId, furthestReached }: Props) {
  const navigate = useNavigate();

  const currentIdx = STEPS.findIndex((s) => s.key === current);
  const reachedIdx = STEPS.findIndex((s) => s.key === furthestReached);

  function go(stepKey: WizardStepKey, idx: number) {
    if (idx > reachedIdx) return;
    if (stepKey === 'details') {
      navigate('/exams/new/details');
    } else if (draftId) {
      navigate(`/exams/new/${draftId}/${stepKey}`);
    }
  }

  return (
    <nav
      aria-label="Wizard progress"
      className="rounded-card border border-border-subtle bg-surface px-5 py-4 shadow-soft"
    >
      <ol className="flex items-center">
        {STEPS.map((step, idx) => {
          const isCurrent = idx === currentIdx;
          const isComplete = idx < currentIdx;
          const isReachable = idx <= reachedIdx;

          return (
            <li
              key={step.key}
              className={cn('flex items-center', idx < STEPS.length - 1 && 'flex-1')}
            >
              <button
                type="button"
                onClick={() => go(step.key, idx)}
                disabled={!isReachable || isCurrent}
                className={cn(
                  'group flex items-center gap-2.5 rounded-control px-1.5 py-1 text-left transition-colors',
                  isReachable && !isCurrent && 'hover:bg-hairline',
                  !isReachable && 'cursor-default',
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors',
                    isCurrent && 'bg-ink text-white',
                    isComplete && 'bg-ink text-white',
                    !isCurrent && !isComplete && 'bg-hairline text-ink-tertiary',
                  )}
                  aria-hidden
                >
                  {isComplete ? (
                    <Check size={12} strokeWidth={2.5} />
                  ) : (
                    idx + 1
                  )}
                </span>
                <span
                  className={cn(
                    'text-[13px] font-medium transition-colors',
                    isCurrent ? 'text-ink' : 'text-ink-secondary',
                    !isReachable && 'text-ink-tertiary',
                  )}
                >
                  {step.label}
                </span>
              </button>

              {idx < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className={cn(
                    'mx-3 h-px flex-1 transition-colors',
                    isComplete ? 'bg-ink/40' : 'bg-border-subtle',
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
