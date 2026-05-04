import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { Exam } from '@/types';
import { now } from '@/lib/clock';
import { examDateLine } from '@/lib/format';
import { Skeleton } from '@/components/Skeleton';
import { ExamStatusBadge } from './ExamStatusBadge';

type Props = {
  exams: Exam[];
};

export function RecentExamsList({ exams }: Props) {
  // Sort: live first, then grading, then ready, then by start date desc.
  const order: Record<string, number> = {
    live: 0,
    grading: 1,
    ready_to_publish: 2,
    scheduled: 3,
    draft: 4,
    published: 5,
    archived: 6,
  };
  const sorted = [...exams].sort((a, b) => {
    const byStatus = order[a.status] - order[b.status];
    if (byStatus !== 0) return byStatus;
    return new Date(b.start_time).getTime() - new Date(a.start_time).getTime();
  });

  return (
    <section>
      <header className="mb-4 flex items-baseline justify-between">
        <h2 className="text-[16px] font-semibold tracking-tight text-ink">
          Your exams
        </h2>
        <Link
          to="/exams"
          className="text-[13px] text-ink-secondary hover:text-ink"
        >
          View all
        </Link>
      </header>

      <div className="overflow-hidden rounded-card border border-border-subtle bg-surface shadow-soft">
        <ul className="divide-y divide-border-subtle">
          {sorted.map((exam) => (
            <li key={exam.id}>
              <Link
                to={`/exams/${exam.id}`}
                className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-canvas"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="truncate text-[14px] font-medium text-ink">
                      {exam.title}
                    </h3>
                  </div>
                  <p className="mt-1 text-[13px] text-ink-secondary">
                    {exam.subject}
                    <span className="mx-2 text-ink-tertiary">·</span>
                    {examDateLine(exam, now())}
                  </p>
                </div>

                <ExamStatusBadge exam={exam} />

                <ChevronRight
                  size={16}
                  strokeWidth={1.75}
                  className="shrink-0 text-ink-tertiary transition-colors group-hover:text-ink-secondary"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function RecentExamsListSkeleton() {
  return (
    <section>
      <header className="mb-4 flex items-baseline justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-16" />
      </header>
      <div className="overflow-hidden rounded-card border border-border-subtle bg-surface shadow-soft">
        <ul className="divide-y divide-border-subtle">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="flex items-center gap-4 px-5 py-4">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
