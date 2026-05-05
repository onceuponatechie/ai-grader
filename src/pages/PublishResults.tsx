import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  TrendingDown,
  Users,
  Mail,
  Eye,
  CheckCircle2,
  type LucideIcon,
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
import { withCount } from '@/lib/format';
import { Skeleton } from '@/components/Skeleton';
import { ScoreDistribution } from '@/components/publish/ScoreDistribution';
import { PublishConfirmModal } from '@/components/publish/ConfirmModal';

const PASS_THRESHOLD_PERCENT = 50;

export function PublishResults() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [sessions, setSessions] = useState<ExamSession[] | null>(null);
  const [students, setStudents] = useState<Student[] | null>(null);
  const [responses, setResponses] = useState<GradedResponse[] | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    Promise.all([
      getExam(id),
      getQuestions(id),
      getSessions(id),
      getStudents(),
    ]).then(([e, qs, ss, sts]) => {
      if (cancelled) return;
      setExam(e);
      setQuestions(qs);
      setSessions(ss);
      setStudents(sts);
      const r = getAllResponses().filter((x) =>
        ss.some((s) => s.id === x.session_id),
      );
      setResponses(r);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const scriptScores = useMemo(() => {
    if (!sessions || !questions || !responses) return [];
    const totalMarks = questions.reduce((s, q) => s + q.marks, 0);
    return sessions
      .filter((s) => s.status === 'submitted' || s.status === 'auto_submitted')
      .map((session) => {
        const r = responses.filter((x) => x.session_id === session.id);
        const score = r.reduce(
          (s, x) => s + (x.manual_score ?? x.ai_score),
          0,
        );
        return { session, score, total: totalMarks };
      });
  }, [sessions, questions, responses]);

  if (!exam || !questions || !sessions || !students || !responses) {
    return <PublishSkeleton />;
  }

  const totalMarks = questions.reduce((s, q) => s + q.marks, 0);

  const studentsById = new Map(students.map((s) => [s.id, s] as const));

  // Top / bottom / average
  const sorted = [...scriptScores].sort((a, b) => b.score - a.score);
  const top = sorted[0];
  const bottom = sorted[sorted.length - 1];
  const avg = scriptScores.length
    ? Math.round(
        scriptScores.reduce((s, x) => s + x.score, 0) / scriptScores.length,
      )
    : 0;
  const passing = scriptScores.filter(
    (s) => totalMarks > 0 && (s.score / s.total) * 100 >= PASS_THRESHOLD_PERCENT,
  ).length;
  const passRate = scriptScores.length
    ? Math.round((passing / scriptScores.length) * 100)
    : 0;

  function handlePublish() {
    setConfirmOpen(false);
    // In production this writes back to the API. For the prototype we just
    // bounce home with a friendly state — the dashboard will show the exam
    // as "Published just now" once the data layer is wired to mutate.
    navigate('/');
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
        <h1 className="text-[28px] font-semibold tracking-tight text-ink">
          {exam.title}
        </h1>
        <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#F1EEFB] px-3 py-1 text-[12px] font-medium text-[#5A4FA8]">
          <CheckCircle2 size={12} strokeWidth={2} />
          Ready to publish results
        </p>
      </div>

      {/* Summary card */}
      <section className="mt-8 rounded-card border border-border-subtle bg-surface p-6 shadow-soft">
        <div className="flex items-start gap-3">
          <p className="text-[14px] leading-relaxed text-ink">
            You've reviewed all flagged scripts. Here's the summary:
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
          <SummaryStat
            icon={Users}
            label="Total students"
            value={withCount(scriptScores.length, 'student')}
          />
          <SummaryStat
            icon={Award}
            label="Highest score"
            value={top ? `${top.score} / ${totalMarks}` : '—'}
            sub={
              top
                ? studentsById.get(top.session.student_id)?.full_name
                : undefined
            }
          />
          <SummaryStat
            icon={TrendingDown}
            label="Lowest score"
            value={bottom ? `${bottom.score} / ${totalMarks}` : '—'}
          />
          <SummaryStat
            label="Class average"
            value={`${avg} / ${totalMarks}`}
          />
          <SummaryStat
            label="Pass rate"
            sub={`At ${PASS_THRESHOLD_PERCENT}% pass mark`}
            value={`${passRate}%`}
          />
        </div>

        <div className="mt-8 border-t border-border-subtle pt-6">
          <p className="label-caps">Score distribution</p>
          <div className="mt-3">
            <ScoreDistribution
              scores={scriptScores.map((s) => ({
                score: s.score,
                total: s.total,
              }))}
            />
          </div>
        </div>
      </section>

      {/* What students will see */}
      <section className="mt-6 rounded-card border border-border-subtle bg-surface p-6 shadow-soft">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-canvas text-ink">
            <Eye size={16} strokeWidth={1.75} aria-hidden />
          </div>
          <div>
            <h2 className="text-[14px] font-semibold text-ink">
              What students will see
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-secondary">
              When you publish, each student will see their own score, your
              feedback, and the correct answers for any questions you've
              marked as "show correct answer after publish". They won't see
              anyone else's scores.
            </p>
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="mt-10 border-t border-border-subtle pt-6">
        <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => navigate(`/exams/${exam.id}/grading`)}
            className="text-[13px] font-medium text-ink-secondary hover:text-ink"
          >
            Not yet — keep reviewing
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="inline-flex h-11 items-center gap-2 rounded-control bg-ink px-5 text-[14px] font-medium text-white shadow-soft transition-colors hover:bg-[#1F1F1F]"
            >
              Publish results to students
            </button>
          </div>
        </div>
        <p className="mt-4 inline-flex items-center gap-1.5 text-[12px] text-ink-tertiary">
          <Mail size={11} strokeWidth={1.75} aria-hidden />
          Students will get an email and notification when results are published.
        </p>
      </div>

      <PublishConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handlePublish}
        studentCount={scriptScores.length}
      />
    </div>
  );
}

function SummaryStat({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon?: LucideIcon;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-control bg-canvas p-4">
      <div className="flex items-center gap-1.5">
        {Icon && (
          <Icon
            size={11}
            strokeWidth={1.75}
            className="text-ink-tertiary"
          />
        )}
        <span className="label-caps">{label}</span>
      </div>
      <div className="mt-2 text-[20px] font-semibold leading-tight tracking-tight text-ink">
        {value}
      </div>
      {sub && (
        <div className="mt-1 truncate text-[12px] text-ink-tertiary">{sub}</div>
      )}
    </div>
  );
}

function PublishSkeleton() {
  return (
    <div>
      <Skeleton className="h-3 w-32" />
      <Skeleton className="mt-4 h-7 w-1/2" />
      <Skeleton className="mt-3 h-6 w-40 rounded-full" />
      <Skeleton className="mt-8 h-72 w-full" />
      <Skeleton className="mt-6 h-32 w-full" />
    </div>
  );
}
