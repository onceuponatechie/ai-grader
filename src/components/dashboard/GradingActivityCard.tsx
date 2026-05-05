import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Exam } from '@/types';
import { withCount } from '@/lib/format';
import { Skeleton } from '@/components/Skeleton';
import { cn } from '@/lib/cn';

type Props = {
  exams: Exam[];
};

export function GradingActivityCard({ exams }: Props) {
  // Show exams currently being graded, plus those that finished grading
  // but still have flagged scripts the teacher hasn't reviewed.
  const inGrading = exams.filter((e) => e.status === 'grading');
  const readyWithFlags = exams.filter(
    (e) => e.status === 'ready_to_publish' && e.scripts_pending_review > 0,
  );
  const visible = [...inGrading, ...readyWithFlags];

  const totalToReview = visible.reduce(
    (sum, e) => sum + e.scripts_pending_review,
    0,
  );

  return (
    <article className="flex h-full flex-col rounded-card border border-border-subtle bg-surface p-6 shadow-soft">
      <header>
        <span className="label-caps">AI grading progress</span>
      </header>

      {visible.length === 0 ? (
        <div className="mt-4 flex flex-1 items-center">
          <p className="text-[14px] leading-relaxed text-ink-secondary">
            Nothing is being graded right now. When students submit, scripts
            will start appearing here.
          </p>
        </div>
      ) : (
        <ul className="mt-5 space-y-5">
          {visible.map((exam) => (
            <GradingRow key={exam.id} exam={exam} />
          ))}
        </ul>
      )}

      {totalToReview > 0 && (
        <div className="mt-auto pt-6">
          <Link
            to={
              visible.length === 1
                ? `/exams/${visible[0].id}/grading`
                : '/exams?filter=needs_review'
            }
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink hover:underline"
          >
            Review flagged scripts
            <ArrowRight size={14} strokeWidth={2} />
          </Link>
        </div>
      )}
    </article>
  );
}

function GradingRow({ exam }: { exam: Exam }) {
  const total = exam.students_submitted;
  const graded = exam.scripts_graded;
  const remaining = Math.max(0, total - graded);
  const flagged = exam.scripts_pending_review;
  const percent = total === 0 ? 0 : Math.round((graded / total) * 100);

  // ETA: rough — about 5 seconds per remaining script, capped sensibly.
  // Only shown when grading is still in progress.
  const etaMinutes =
    exam.status === 'grading' && remaining > 0
      ? Math.max(1, Math.round((remaining * 5) / 60))
      : null;

  const statusLine =
    exam.status === 'grading'
      ? `Grading ${graded.toLocaleString('en-US')} of ${total.toLocaleString('en-US')} scripts.${
          flagged > 0
            ? ` ${withCount(flagged, 'needs your review', 'need your review')}.`
            : ''
        }`
      : `All ${withCount(total, 'script')} graded.${
          flagged > 0
            ? ` ${withCount(flagged, 'flagged for your review')}.`
            : ''
        }`;

  return (
    <li>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="truncate text-[14px] font-medium text-ink">
          {exam.title}
        </h3>
        <span className="shrink-0 text-[12px] tabular-nums text-ink-tertiary">
          {percent}%
        </span>
      </div>
      <p className="mt-1 text-[13px] leading-snug text-ink-secondary">
        {statusLine}
      </p>
      <ProgressBar percent={percent} />
      {etaMinutes !== null && (
        <p className="mt-2 text-[12px] text-ink-tertiary">
          About {withCount(etaMinutes, 'minute')} left
        </p>
      )}
    </li>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-hairline"
    >
      <div
        className={cn(
          'h-full rounded-full bg-ink transition-[width] duration-500',
          percent === 100 && 'bg-positive',
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export function GradingActivityCardSkeleton() {
  return (
    <article className="flex h-full flex-col rounded-card border border-border-subtle bg-surface p-6 shadow-soft">
      <Skeleton className="h-3 w-36" />
      <div className="mt-5 space-y-5">
        {[0, 1].map((i) => (
          <div key={i}>
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="mt-2 h-3 w-3/4" />
            <Skeleton className="mt-3 h-1.5 w-full" />
          </div>
        ))}
      </div>
    </article>
  );
}
