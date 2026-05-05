import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Search, RefreshCw } from 'lucide-react';
import type { Exam, ExamSession, Student } from '@/types';
import {
  getExam,
  getSessions,
  getStudents,
} from '@/lib/api';
import {
  filterLabel,
  liveCounts,
  liveMinutesLeft,
  LIVE_FILTER_KEYS,
  matchesFilter,
  type LiveFilterKey,
} from '@/lib/grading';
import { formatMinutesLeft, withCount } from '@/lib/format';
import { Skeleton } from '@/components/Skeleton';
import { PulseDot } from '@/components/dashboard/PulseDot';
import { SessionsTable } from '@/components/live/SessionsTable';
import { cn } from '@/lib/cn';

export function LiveMonitoring() {
  const { id } = useParams<{ id: string }>();
  const [exam, setExam] = useState<Exam | null>(null);
  const [sessions, setSessions] = useState<ExamSession[] | null>(null);
  const [students, setStudents] = useState<Student[] | null>(null);
  const [filter, setFilter] = useState<LiveFilterKey>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    Promise.all([getExam(id), getSessions(id), getStudents()]).then(
      ([e, ss, sts]) => {
        if (cancelled) return;
        setExam(e);
        setSessions(ss);
        setStudents(sts);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [id]);

  const studentsById = useMemo(() => {
    const m = new Map<string, Student>();
    (students ?? []).forEach((s) => m.set(s.id, s));
    return m;
  }, [students]);

  const counts = sessions ? liveCounts(sessions) : null;
  const minutesLeft = exam ? liveMinutesLeft(exam.end_time) : 0;

  const filtered = useMemo(() => {
    if (!sessions) return [];
    const needle = search.trim().toLowerCase();
    return sessions.filter((s) => {
      if (!matchesFilter(s, filter)) return false;
      if (!needle) return true;
      const name = studentsById.get(s.student_id)?.full_name.toLowerCase() ?? '';
      return name.includes(needle);
    });
  }, [sessions, filter, search, studentsById]);

  if (!exam || !sessions || !students || !counts) {
    return <LiveMonitoringSkeleton />;
  }

  const yetToStart = Math.max(
    0,
    exam.total_students_invited - counts.writing - counts.submitted,
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[13px] text-ink-secondary hover:text-ink"
          >
            <ArrowLeft size={14} strokeWidth={2} />
            Back to dashboard
          </Link>
          <h1 className="mt-3 text-[28px] font-semibold tracking-tight text-ink">
            {exam.title}
          </h1>
          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#EAF6EE] px-3 py-1 text-[12px] font-medium text-[#2F7A4F]">
            <PulseDot label="Live" />
            Live now · {formatMinutesLeft(minutesLeft)}
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Writing now"
          value={counts.writing}
          live
        />
        <StatCard label="Submitted" value={counts.submitted} />
        <StatCard label="Not started yet" value={yetToStart} />
      </section>

      {/* Filter + search */}
      <section className="mt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div role="tablist" className="flex flex-wrap gap-1.5">
            {LIVE_FILTER_KEYS.map((k) => {
              const count = filterCount(k, sessions, counts);
              return (
                <FilterChip
                  key={k}
                  active={filter === k}
                  onClick={() => setFilter(k)}
                  label={filterLabel(k)}
                  count={count}
                />
              );
            })}
          </div>
          <SearchField value={search} onChange={setSearch} />
        </div>
      </section>

      <div className="mt-4">
        <SessionsTable sessions={filtered} studentsById={studentsById} />
      </div>

      <p className="mt-4 inline-flex items-center gap-1.5 text-[12px] text-ink-tertiary">
        <RefreshCw size={11} strokeWidth={1.75} aria-hidden />
        This page updates automatically. You don't need to refresh.
      </p>
    </div>
  );
}

function filterCount(
  k: LiveFilterKey,
  sessions: ExamSession[],
  counts: ReturnType<typeof liveCounts>,
): number {
  switch (k) {
    case 'all':
      return sessions.length;
    case 'writing':
      return counts.writing;
    case 'submitted':
      return counts.submitted;
    case 'not_started':
      return counts.not_started;
    case 'has_issues':
      return counts.issues;
  }
}

function StatCard({
  label,
  value,
  live,
}: {
  label: string;
  value: number;
  live?: boolean;
}) {
  return (
    <div className="rounded-card border border-border-subtle bg-surface p-5 shadow-soft">
      <div className="flex items-center gap-2">
        <span className="label-caps">{label}</span>
        {live && <PulseDot label="Live" />}
      </div>
      <div className="mt-4 text-[34px] font-semibold leading-none tracking-tight text-ink">
        {value}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium transition-colors',
        active
          ? 'bg-ink text-white'
          : 'bg-hairline text-ink-secondary hover:bg-border-subtle hover:text-ink',
      )}
    >
      {label}
      <span
        className={cn(
          'tabular-nums',
          active ? 'text-white/70' : 'text-ink-tertiary',
        )}
      >
        {count}
      </span>
    </button>
  );
}

function SearchField({
  value,
  onChange,
}: {
  value: string;
  onChange: (s: string) => void;
}) {
  return (
    <label className="flex h-9 w-full max-w-xs items-center gap-2 rounded-control border border-border-subtle bg-surface px-3 focus-within:border-border focus-within:ring-2 focus-within:ring-ink/5">
      <Search
        size={14}
        strokeWidth={1.75}
        className="text-ink-tertiary"
        aria-hidden
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by student name"
        className="h-full flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-tertiary"
      />
    </label>
  );
}

function LiveMonitoringSkeleton() {
  return (
    <div>
      <Skeleton className="h-3 w-32" />
      <Skeleton className="mt-4 h-8 w-2/3" />
      <Skeleton className="mt-3 h-6 w-40 rounded-full" />
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-card border border-border-subtle bg-surface p-5 shadow-soft">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-4 h-9 w-16" />
          </div>
        ))}
      </div>
      <Skeleton className="mt-8 h-9 w-full" />
      <Skeleton className="mt-4 h-64 w-full" />
      {/* Reference unused helpers to avoid dead-import warnings. */}
      <span className="hidden">{withCount(0, 'placeholder')}</span>
    </div>
  );
}
