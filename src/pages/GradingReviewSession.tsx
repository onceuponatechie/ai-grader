import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
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
  getSession,
  getStudent,
  getGradedResponses,
  getSessions,
} from '@/lib/api';
import { getAllResponses } from '@/lib/mock-extras';
import {
  flaggedScriptsFor,
  sessionTotals,
} from '@/lib/grading';
import { formatTimeOfDay, withCount } from '@/lib/format';
import { Skeleton } from '@/components/Skeleton';
import { ResponseReview } from '@/components/grading/ResponseReview';
import { cn } from '@/lib/cn';

type EditState = {
  scoreOverrides: Record<string, number | null>;
  feedback: Record<string, string>;
};

export function GradingReviewSession() {
  const { id, sessionId } = useParams<{ id: string; sessionId: string }>();
  const navigate = useNavigate();

  const [exam, setExam] = useState<Exam | null>(null);
  const [session, setSession] = useState<ExamSession | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [responses, setResponses] = useState<GradedResponse[] | null>(null);
  const [allFlaggedSessionIds, setAllFlaggedSessionIds] = useState<string[]>([]);
  const [edits, setEdits] = useState<EditState>({
    scoreOverrides: {},
    feedback: {},
  });

  useEffect(() => {
    if (!id || !sessionId) return;
    let cancelled = false;
    Promise.all([
      getExam(id),
      getSession(sessionId),
      getQuestions(id),
      getGradedResponses(sessionId),
      getSessions(id),
    ]).then(async ([e, s, qs, rs, allSessions]) => {
      if (cancelled) return;
      setExam(e);
      setSession(s);
      setQuestions(qs);
      setResponses(rs);

      // Determine the set of flagged sessions for this exam so we can
      // navigate "next flagged script" cleanly.
      const allResponses = getAllResponses().filter((r) =>
        allSessions.some((x) => x.id === r.session_id),
      );
      const flagged = flaggedScriptsFor(allSessions, allResponses, qs);
      setAllFlaggedSessionIds(flagged.map((f) => f.session.id));

      if (s) {
        const st = await getStudent(s.student_id);
        if (!cancelled) setStudent(st);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [id, sessionId]);

  const totals = useMemo(() => {
    if (!responses || !questions) {
      return { totalMarks: 0, score: 0, flagged: 0, confirmed: 0, percent: 0 };
    }
    const merged = responses.map((r) => ({
      ...r,
      manual_score:
        edits.scoreOverrides[r.id] !== undefined
          ? edits.scoreOverrides[r.id]
          : r.manual_score,
    }));
    return sessionTotals(merged, questions);
  }, [responses, questions, edits]);

  if (!exam || !session || !questions || !responses) {
    return <ScriptReviewSkeleton />;
  }

  const orderedResponses = questions
    .map((q) => responses.find((r) => r.question_id === q.id))
    .filter((r): r is GradedResponse => Boolean(r));

  function setScore(responseId: string, score: number | null) {
    setEdits((prev) => ({
      ...prev,
      scoreOverrides: { ...prev.scoreOverrides, [responseId]: score },
    }));
  }

  function setFeedback(responseId: string, fb: string) {
    setEdits((prev) => ({
      ...prev,
      feedback: { ...prev.feedback, [responseId]: fb },
    }));
  }

  const currentIdx = allFlaggedSessionIds.indexOf(session.id);
  const nextSessionId =
    currentIdx >= 0 && currentIdx < allFlaggedSessionIds.length - 1
      ? allFlaggedSessionIds[currentIdx + 1]
      : null;

  function saveAndContinue() {
    // Notify the list page that this session is now reviewed.
    window.dispatchEvent(
      new CustomEvent('marka:review-saved', {
        detail: { sessionId: session!.id },
      }),
    );
    if (nextSessionId) {
      navigate(`/exams/${exam!.id}/grading/${nextSessionId}`);
    } else {
      navigate(`/exams/${exam!.id}/grading`);
    }
  }

  return (
    <div>
      <Link
        to={`/exams/${exam.id}/grading`}
        className="inline-flex items-center gap-1.5 text-[13px] text-ink-secondary hover:text-ink"
      >
        <ArrowLeft size={14} strokeWidth={2} />
        Back to scripts list
      </Link>

      <div className="mt-3">
        <h1 className="text-[24px] font-semibold tracking-tight text-ink">
          {student?.full_name ?? 'Loading…'}
        </h1>
        <p className="mt-1.5 text-[13px] text-ink-secondary">
          {exam.title}
          {session.submitted_at && (
            <>
              <span className="mx-2 text-ink-tertiary">·</span>
              Submitted {formatTimeOfDay(new Date(session.submitted_at))}
            </>
          )}
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,_1fr)_320px]">
        {/* ─────── Left: question-by-question review ─────── */}
        <div className="space-y-5">
          {orderedResponses.map((r, idx) => {
            const q = questions.find((q) => q.id === r.question_id)!;
            return (
              <ResponseReview
                key={r.id}
                index={idx}
                total={questions.length}
                question={q}
                response={r}
                feedback={edits.feedback[r.id] ?? ''}
                override={
                  edits.scoreOverrides[r.id] !== undefined
                    ? edits.scoreOverrides[r.id]
                    : null
                }
                onScoreChange={(s) => setScore(r.id, s)}
                onFeedbackChange={(f) => setFeedback(r.id, f)}
              />
            );
          })}
        </div>

        {/* ─────── Right: sticky summary ─────── */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <SummaryCard
            studentName={student?.full_name ?? '—'}
            examTitle={exam.title}
            submittedAt={session.submitted_at}
            totals={totals}
            currentIdx={currentIdx}
            totalFlagged={allFlaggedSessionIds.length}
            nextSessionId={nextSessionId}
            onSaveAndContinue={saveAndContinue}
          />
        </aside>
      </div>
    </div>
  );
}

function SummaryCard({
  studentName,
  examTitle,
  submittedAt,
  totals,
  currentIdx,
  totalFlagged,
  nextSessionId,
  onSaveAndContinue,
}: {
  studentName: string;
  examTitle: string;
  submittedAt: string | null;
  totals: ReturnType<typeof sessionTotals>;
  currentIdx: number;
  totalFlagged: number;
  nextSessionId: string | null;
  onSaveAndContinue: () => void;
}) {
  return (
    <div className="rounded-card border border-border-subtle bg-surface p-5 shadow-soft">
      <p className="label-caps">Reviewing</p>
      <h2 className="mt-1.5 text-[15px] font-semibold text-ink">
        {studentName}
      </h2>
      <p className="mt-0.5 text-[12px] text-ink-secondary">{examTitle}</p>
      {submittedAt && (
        <p className="mt-0.5 text-[12px] text-ink-tertiary">
          Submitted {formatTimeOfDay(new Date(submittedAt))}
        </p>
      )}

      <div className="mt-5 rounded-control bg-canvas p-4">
        <p className="label-caps">Score so far</p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-[28px] font-semibold leading-none tracking-tight text-ink tabular-nums">
            {totals.score}
          </span>
          <span className="text-[14px] text-ink-tertiary">
            / {totals.totalMarks}
          </span>
          <span className="ml-auto text-[13px] tabular-nums text-ink-secondary">
            {totals.percent}%
          </span>
        </div>
      </div>

      <ul className="mt-5 space-y-2 text-[13px] text-ink-secondary">
        <li className="flex items-center gap-2">
          <CheckCircle2
            size={13}
            strokeWidth={1.75}
            className="text-positive"
            aria-hidden
          />
          {withCount(totals.confirmed, 'question')} look fine
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-attention" aria-hidden />
          {withCount(totals.flagged, 'question still needs', 'questions still need')} a look
        </li>
      </ul>

      <button
        type="button"
        onClick={onSaveAndContinue}
        className={cn(
          'mt-6 inline-flex w-full items-center justify-center gap-2 rounded-control bg-ink px-4 py-2.5 text-[13px] font-medium text-white shadow-soft transition-colors hover:bg-[#1F1F1F]',
        )}
      >
        {nextSessionId ? 'Save and continue' : 'Save and finish'}
        {nextSessionId && <ArrowRight size={13} strokeWidth={2} />}
      </button>
      {totalFlagged > 0 && currentIdx >= 0 && (
        <p className="mt-3 text-center text-[12px] text-ink-tertiary">
          Script {currentIdx + 1} of {totalFlagged} flagged
        </p>
      )}
    </div>
  );
}

function ScriptReviewSkeleton() {
  return (
    <div>
      <Skeleton className="h-3 w-32" />
      <Skeleton className="mt-4 h-7 w-1/3" />
      <Skeleton className="mt-2 h-4 w-1/2" />
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,_1fr)_320px]">
        <div className="space-y-5">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-72 w-full" />
          ))}
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  );
}
