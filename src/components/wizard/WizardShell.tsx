import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { SoftNote } from '@/components/forms';
import {
  WizardProgress,
  type WizardStepKey,
} from './WizardProgress';

type ShellProps = {
  current: WizardStepKey;
  draftId: string | null;
  furthestReached: WizardStepKey;
  children: ReactNode;
  /** When set, renders narrow centered column. When false, renders full width. */
  narrow?: boolean;
};

export function WizardShell({
  current,
  draftId,
  furthestReached,
  children,
  narrow = true,
}: ShellProps) {
  return (
    <div>
      <WizardProgress
        current={current}
        draftId={draftId}
        furthestReached={furthestReached}
      />
      <div
        className={cn(
          'mt-8',
          narrow && 'mx-auto max-w-2xl',
        )}
      >
        {children}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Footer — back / continue / save-as-draft
// ────────────────────────────────────────────────────────────────────

type FooterProps = {
  /** Where "Back" navigates, or null to hide. */
  backHref: string | null;
  /** Continue button text — usually "Continue to {next} →". */
  continueLabel: string;
  /** Continue handler. Optional — if not provided, button renders as a Link. */
  onContinue?: () => void;
  /** When true, primary button is the publish action (different label). */
  primaryAsPublish?: boolean;
  /** Disabled state with a soft helper note. */
  disabledReason?: string | null;
  /** Optional left-side annotation, e.g. "12 questions • 50 marks total". */
  leftAnnotation?: ReactNode;
};

export function WizardFooter({
  backHref,
  continueLabel,
  onContinue,
  disabledReason,
  leftAnnotation,
}: FooterProps) {
  const disabled = Boolean(disabledReason);

  return (
    <div className="mt-10 border-t border-border-subtle pt-6">
      {leftAnnotation && (
        <div className="mb-4 text-[13px] text-ink-secondary">
          {leftAnnotation}
        </div>
      )}
      <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {backHref ? (
            <Link
              to={backHref}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-secondary hover:text-ink"
            >
              <ArrowLeft size={14} strokeWidth={2} />
              Back
            </Link>
          ) : (
            <span />
          )}
          <Link
            to="/exams"
            className="text-[13px] text-ink-secondary hover:text-ink"
          >
            Save as draft
          </Link>
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <button
            type="button"
            disabled={disabled}
            onClick={onContinue}
            className={cn(
              'inline-flex h-11 items-center justify-center gap-2 rounded-control px-5 text-[14px] font-medium shadow-soft transition-colors',
              disabled
                ? 'cursor-not-allowed bg-hairline text-ink-tertiary'
                : 'bg-ink text-white hover:bg-[#1F1F1F]',
            )}
          >
            {continueLabel}
            {!disabled && <ArrowRight size={14} strokeWidth={2} />}
          </button>
          {disabledReason && <SoftNote>{disabledReason}</SoftNote>}
        </div>
      </div>
    </div>
  );
}
