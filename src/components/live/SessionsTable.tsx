import { useMemo, useState } from 'react';
import { Flag, ChevronDown, ChevronUp } from 'lucide-react';
import type { ExamSession, Student } from '@/types';
import {
  formatRemaining,
  hasIssue,
  liveStatusFor,
  statusNote,
  timestampOrDash,
} from '@/lib/grading';
import { cn } from '@/lib/cn';
import { StatusDot } from './StatusDot';

type Props = {
  sessions: ExamSession[];
  studentsById: Map<string, Student>;
};

type SortKey = 'name' | 'status' | 'started_at' | 'submitted_at';
type SortDir = 'asc' | 'desc';

export function SessionsTable({ sessions, studentsById }: Props) {
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: 'name',
    dir: 'asc',
  });

  const sorted = useMemo(() => {
    const arr = [...sessions];
    arr.sort((a, b) => cmp(a, b, sort.key, studentsById));
    return sort.dir === 'asc' ? arr : arr.reverse();
  }, [sessions, sort, studentsById]);

  function toggle(key: SortKey) {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' },
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-border bg-surface p-10 text-center">
        <p className="text-[14px] text-ink-secondary">
          Nothing to show with this filter. Try another.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-card border border-border-subtle bg-surface shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-canvas">
            <tr className="border-b border-border-subtle">
              <Th sortable sort={sort} sortKey="name" onClick={() => toggle('name')}>
                Student
              </Th>
              <Th sortable sort={sort} sortKey="status" onClick={() => toggle('status')}>
                Status
              </Th>
              <Th sortable sort={sort} sortKey="started_at" onClick={() => toggle('started_at')}>
                Started
              </Th>
              <Th sortable sort={sort} sortKey="submitted_at" onClick={() => toggle('submitted_at')}>
                Submitted
              </Th>
              <Th>Time left</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {sorted.map((s) => {
              const student = studentsById.get(s.student_id);
              const status = liveStatusFor(s);
              const note = statusNote(s);
              const issue = hasIssue(s);

              return (
                <tr
                  key={s.id}
                  className={cn(
                    'transition-colors hover:bg-canvas',
                    issue && 'bg-[#FBE8E4]/15',
                  )}
                >
                  <td className="px-5 py-3 align-top">
                    <div className="flex items-center gap-2">
                      {issue && (
                        <Flag
                          size={12}
                          strokeWidth={1.75}
                          className="shrink-0 text-problem"
                          aria-label="Flagged"
                        />
                      )}
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-medium text-ink">
                          {student?.full_name ?? 'Unknown student'}
                        </div>
                        {student?.student_number && (
                          <div className="truncate text-[12px] text-ink-tertiary">
                            {student.student_number}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 align-top">
                    <StatusDot status={status} />
                    {note && (
                      <p className="mt-1 max-w-md text-[12px] leading-snug text-ink-secondary">
                        {note}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3 align-top text-ink-secondary tabular-nums">
                    {timestampOrDash(s.started_at)}
                  </td>
                  <td className="px-5 py-3 align-top text-ink-secondary tabular-nums">
                    {timestampOrDash(s.submitted_at)}
                  </td>
                  <td className="px-5 py-3 align-top text-ink-secondary tabular-nums">
                    {s.status === 'writing'
                      ? formatRemaining(s.time_remaining_seconds)
                      : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({
  children,
  sortable,
  sort,
  sortKey,
  onClick,
}: {
  children: React.ReactNode;
  sortable?: boolean;
  sort?: { key: SortKey; dir: SortDir };
  sortKey?: SortKey;
  onClick?: () => void;
}) {
  const active = sortable && sort?.key === sortKey;

  return (
    <th
      scope="col"
      className="whitespace-nowrap px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-ink-tertiary"
    >
      {sortable ? (
        <button
          type="button"
          onClick={onClick}
          className="inline-flex items-center gap-1 hover:text-ink-secondary"
        >
          {children}
          {active && sort && (sort.dir === 'asc' ? (
            <ChevronUp size={11} strokeWidth={1.75} />
          ) : (
            <ChevronDown size={11} strokeWidth={1.75} />
          ))}
        </button>
      ) : (
        <span>{children}</span>
      )}
    </th>
  );
}

function cmp(
  a: ExamSession,
  b: ExamSession,
  key: SortKey,
  byId: Map<string, Student>,
): number {
  if (key === 'name') {
    const an = byId.get(a.student_id)?.full_name ?? '';
    const bn = byId.get(b.student_id)?.full_name ?? '';
    return an.localeCompare(bn);
  }
  if (key === 'status') {
    return a.status.localeCompare(b.status);
  }
  if (key === 'started_at') {
    return (a.started_at ?? '').localeCompare(b.started_at ?? '');
  }
  return (a.submitted_at ?? '').localeCompare(b.submitted_at ?? '');
}
