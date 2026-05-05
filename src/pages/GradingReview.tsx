import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Eye,
} from 'lucide-react';
import type {
  Exam,
  ExamSession,
  GradedResponse,
  Question,
  Student,
} from '@/types';
import {
  getExam,
  getQuestions,
  getSessions,
  getStudents,
} from '@/lib/api';
import { getAllResponses } from '@/lib/mock-extras';
import {
  flaggedScriptsFor,
  type FlaggedScriptInfo,
} from '@/lib/grading';
import { withCount } from '@/lib/format';
import { Skeleton } from '@/components/Skeleton';
import { cn } from '@/lib/cn';

export function GradingReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [sessions, setSessions] = useState<ExamSession[] | null>(null);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [students, setStudents] = useState<Student[] | null>(null);
  const [responses, setResponses] = useState<GradedResponse[] | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [reviewedSessionIds, setReviewedSessionIds] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    Promise.all([
      getExam(id),
      getSessions(id),
      getQuestions(id),
      getStudents(),
    ]).then(([e, ss, qs, sts]) => {
      if (cancelled) return;
      setExam(e);
      setSessions(ss);
      setQuestions(qs);
      setStudents(sts);
      // Use the synchronous full set — no API call delay needed.
      const r = getAllResponses().filter((x) =>
        ss.some((s) => s.id === x.session_id),
      );
      setResponses(r);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const studentsById = useMemo(() => {
    const m = new Map<string, Student>();
    (students ?? []).forEach((s) => m.set(s.id, s));
    return m;
  }, [students]);

  const flagged = useMemo<FlaggedScriptInfo[]>(() => {
    if (!sessions || !responses || !questions) return [];
    return flaggedScriptsFor(sessions, responses, questions);
  }, [sessions, responses, questions]);

  const allScripts = useMemo(() => {
    if (!sessions || !responses || !questions) return [];
    const totalMarks = questions.reduce((s, q) => s + q.marks, 0);
    return sessions
      .filter((s) => s.status === 'submitted' || s.status === 'auto_submitted')
      .map((session) => {
        const r = responses.filter((x) => x.session_id === session.id);
        const score = r.reduce(
          (s, x) => s + (x.manual_score ?? x.ai_score),
          0,
        );
        return { session, score, totalMarks };
      });
  }, [sessions, responses, questions]);

  if (!exam || !sessions || !questions || !students || !responses) {
    return <GradingReviewSkeleton />;
  }

  const cleanCount = exam.students_submitted - exam.scripts_pending_review;
  const averageScore = computeAverage(allScripts);
  const allFlaggedReviewed =
    flagged.length > 0 &&
    flagged.every((f) => reviewedSessionIds.has(f.session.id));

  const firstUnreviewed = flagged.find(
    (f) => !reviewedSessionIds.has(f.session.id),
  );

  return (
    <div>
      {/* Header */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-[13px] text-ink-secondary hover:text-ink"
      >
        <ArrowLeft size={14} strokeWidth={2} />
        Back to dashboard
      </Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-ink">
            {exam.title}
          </h1>
          <p className="mt-2 text-[14px] text-ink-secondary">
            Grading complete.{' '}
            <span className="font-medium text-ink">
              {withCount(exam.scripts_pending_review, 'script')} need your review.
            </span>
          </p>
        </div>
      </div>

      {/* Summary */}
      <section className="mt-8 rounded-card border border-border-subtle bg-surface p-6 shadow-soft">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-control bg-canvas text-ink">
              <Sparkles size={16} strokeWidth={1.75} aria-hidden />
            </div>
            <div>
              <h2 className="text-[16px] font-semibold text-ink">
                AI graded {withCount(exam.students_submitted, 'script')}.{' '}
                <span className="text-positive">{cleanCount} looked clean.</span>{' '}
                <span className="text-attention">
                  {exam.scripts_pending_review} need your eyes.
                </span>
              </h2>
              <p className="mt-2 text-[13px] text-ink-secondary">
                Average score so far:{' '}
                <span className="font-medium text-ink">
                  {averageScore} / {questions.reduce((s, q) => s + q.marks, 0)}
                </span>{' '}
                · This will update once you've finished reviewing.
              </p>
            </div>
          </div>
          {firstUnreviewed && (
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/exams/${exam.id}/grading/${firstUnreviewed.session.id}`,
                )
              }
              className="inline-flex h-11 items-center gap-2 rounded-control bg-ink px-5 text-[14px] font-medium text-white shadow-soft transition-colors hover:bg-[#1F1F1F]"
            >
              Start reviewing
              <ArrowRight size={14} strokeWidth={2} />
            </button>
          )}
        </div>
      </section>

      {/* Flagged list */}
      <section className="mt-8">
        <h2 className="mb-3 text-[16px] font-semibold tracking-tight text-ink">
          Scripts that need your review
        </h2>
        <div className="overflow-hidden rounded-card border border-border-subtle bg-surface shadow-soft">
          <ul className="divide-y divide-border-subtle">
            {flagged.map((f) => {
              const reviewed = reviewedSessionIds.has(f.session.id);
              return (
                <FlaggedRow
                  key={f.session.id}
                  info={f}
                  studentName={
                    studentsById.get(f.session.student_id)?.full_name ??
                    'Unknown student'
                  }
                  reviewed={reviewed}
                  examId={exam.id}
                />
              );
            })}
          </ul>
        </div>
      </section>

      {/* Spot-check section */}
      <section className="mt-10">
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-secondary hover:text-ink"
        >
          {showAll ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          View all {withCount(allScripts.length, 'script')}
          <span className="text-ink-tertiary">
            · spot-check anything else if you want to
          </span>
        </button>

        {showAll && (
          <div className="mt-4 overflow-hidden rounded-card border border-border-subtle bg-surface shadow-soft">
            <ul className="divide-y divide-border-subtle">
              {allScripts.map(({ session, score, totalMarks }) => {
                const name =
                  studentsById.get(session.student_id)?.full_name ??
                  'Unknown student';
                return (
                  <li
                    key={session.id}
                    className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-canvas"
                  >
                    <div className="flex-1 truncate text-[13px] text-ink">
                      {name}
                    </div>
                    <div className="tabular-nums text-[13px] text-ink-secondary">
                      {score} / {totalMarks}
                    </div>
                    <Link
                      to={`/exams/${exam.id}/grading/${session.id}`}
                      className="inline-flex items-center gap-1.5 rounded-control px-3 py-1.5 text-[12px] text-ink-secondary hover:bg-hairline hover:text-ink"
                    >
                      <Eye size={12} strokeWidth={1.75} />
                      View
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>

      {/* Footer CTA — publish */}
      <div className="mt-10 border-t border-border-subtle pt-6">
        <button
          type="button"
          disabled={!allFlaggedReviewed}
          onClick={() => navigate(`/exams/${exam.id}/publish`)}
          className={cn(
            'inline-flex h-11 items-center gap-2 rounded-control px-5 text-[14px] font-medium shadow-soft transition-colors',
            allFlaggedReviewed
              ? 'bg-ink text-white hover:bg-[#1F1F1F]'
              : 'cursor-not-allowed bg-hairline text-ink-tertiary',
          )}
        >
          {allFlaggedReviewed
            ? 'All scripts reviewed — go to publish results'
            : 'Finish reviewing flagged scripts to continue'}
          {allFlaggedReviewed && <ArrowRight size={14} strokeWidth={2} />}
        </button>
      </div>

      {/* Mark-as-reviewed handler is exposed via session hash for inter-page coordination. */}
      <ReviewSync onMarkReviewed={(id) =>
        setReviewedSessionIds((prev) => {
          const next = new Set(prev);
          next.add(id);
          return next;
        })
      } />
    </div>
  );
}

/**
 * Tiny component listening to "marka:review-saved" events. The per-script
 * review screen dispatches one when the teacher saves so we can update
 * which sessions appear "reviewed" without lifting state to a parent.
 */
function ReviewSync({
  onMarkReviewed,
}: {
  onMarkReviewed: (sessionId: string) => void;
}) {
  useEffect(() => {
    function handle(e: Event) {
      const detail = (e as CustomEvent<{ sessionId: string }>).detail;
      if (detail?.sessionId) onMarkReviewed(detail.sessionId);
    }
    window.addEventListener('marka:review-saved', handle);
    return () => window.removeEventListener('marka:review-saved', handle);
  }, [onMarkReviewed]);
  return null;
}

function FlaggedRow({
  info,
  studentName,
  reviewed,
  examId,
}: {
  info: FlaggedScriptInfo;
  studentName: string;
  reviewed: boolean;
  examId: string;
}) {
  return (
    <li className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-[14px] font-medium text-ink">
            {studentName}
          </h3>
          {reviewed ? (
            <span className="rounded-full bg-positive/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-positive">
              Reviewed
            </span>
          ) : (
            <span className="rounded-full bg-[#FBF1DE] px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-[#A66D11]">
              Review needed
            </span>
          )}
        </div>
        <p className="mt-1 max-w-xl text-[13px] leading-snug text-ink-secondary">
          {info.reason}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-[13px] tabular-nums text-ink">
            {info.scoreSoFar} / {info.totalMarks}
          </div>
          <div className="text-[12px] text-ink-tertiary">AI score so far</div>
        </div>
        <Link
          to={`/exams/${examId}/grading/${info.session.id}`}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-control border border-border bg-surface px-3 text-[13px] font-medium text-ink transition-colors hover:bg-canvas"
        >
          Review
          <ArrowRight size={13} strokeWidth={2} />
        </Link>
      </div>
    </li>
  );
}

function computeAverage(
  scripts: { score: number; totalMarks: number }[],
): number {
  if (scripts.length === 0) return 0;
  const total = scripts.reduce((sum, s) => sum + s.score, 0);
  return Math.round(total / scripts.length);
}

function GradingReviewSkeleton() {
  return (
    <div>
      <Skeleton className="h-3 w-32" />
      <Skeleton className="mt-4 h-8 w-1/2" />
      <Skeleton className="mt-3 h-4 w-1/3" />
      <Skeleton className="mt-8 h-32 w-full" />
      <Skeleton className="mt-8 h-72 w-full" />
    </div>
  );
}
