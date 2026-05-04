import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Exam } from '@/types';
import { now } from '@/lib/clock';
import {
  formatMinutesLeft,
  formatTimeOfDay,
  minutesBetween,
  withCount,
} from '@/lib/format';
import { Skeleton } from '@/components/Skeleton';
import { PulseDot } from './PulseDot';

type Props = {
  exam: Exam;
  otherLiveCount?: number;
};

export function LiveExamCard({ exam, otherLiveCount = 0 }: Props) {
  const start = new Date(exam.start_time);
  const end = new Date(exam.end_time);
  const minutesLeft = minutesBetween(end, now());

  const yetToStart = Math.max(
    0,
    exam.total_students_invited - exam.students_writing - exam.students_submitted,
  );

  return (
    <article className="flex h-full flex-col rounded-card border border-border-subtle bg-surface p-6 shadow-soft">
      <header className="flex items-center gap-2">
        <PulseDot label="Live" />
        <span className="label-caps">Currently live</span>
      </header>

      <h2 className="mt-4 text-[22px] font-semibold tracking-tight text-ink">
        {exam.title}
      </h2>

      <p className="mt-1.5 text-[13px] text-ink-secondary">
        Started {formatTimeOfDay(start)}
        <span className="mx-2 text-ink-tertiary">·</span>
        Ends {formatTimeOfDay(end)}
        <span className="mx-2 text-ink-tertiary">·</span>
        <span className="font-medium text-ink">{formatMinutesLeft(minutesLeft)}</span>
      </p>

      <dl className="mt-6 grid grid-cols-3 gap-4 rounded-control border border-border-subtle bg-canvas p-4">
        <Stat label="Writing now" value={exam.students_writing} />
        <Stat label="Submitted" value={exam.students_submitted} />
        <Stat label="Yet to start" value={yetToStart} />
      </dl>

      <div className="mt-auto flex items-center justify-between pt-6">
        <Link
          to={`/exams/${exam.id}/live`}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink hover:underline"
        >
          Monitor live
          <ArrowRight size={14} strokeWidth={2} />
        </Link>
        {otherLiveCount > 0 && (
          <Link
            to="/exams?filter=live"
            className="text-[13px] text-ink-secondary hover:text-ink"
          >
            View {withCount(otherLiveCount, 'more live exam')}
          </Link>
        )}
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-[26px] font-semibold leading-none tracking-tight text-ink">
        {value}
      </div>
      <div className="mt-2 text-[12px] text-ink-secondary">{label}</div>
    </div>
  );
}

export function LiveExamCardSkeleton() {
  return (
    <article className="flex h-full flex-col rounded-card border border-border-subtle bg-surface p-6 shadow-soft">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="mt-4 h-7 w-3/4" />
      <Skeleton className="mt-3 h-3 w-2/3" />
      <div className="mt-6 grid grid-cols-3 gap-4 rounded-control border border-border-subtle bg-canvas p-4">
        <Skeleton className="h-9 w-12" />
        <Skeleton className="h-9 w-12" />
        <Skeleton className="h-9 w-12" />
      </div>
      <Skeleton className="mt-6 h-4 w-28" />
    </article>
  );
}

/**
 * Shown in the live slot when nothing is currently in progress. Keeps
 * the dashboard rhythm intact instead of leaving an empty column.
 */
export function NoLiveExamCard() {
  return (
    <article className="flex h-full flex-col items-start justify-center rounded-card border border-dashed border-border bg-surface p-6 text-left shadow-soft">
      <span className="label-caps">No exam live right now</span>
      <p className="mt-2 max-w-md text-[14px] leading-relaxed text-ink-secondary">
        When an exam is in progress, you'll see who's writing, who has finished,
        and how much time is left here.
      </p>
    </article>
  );
}
