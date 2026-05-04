import { Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  CalendarDays,
  Users,
  ListChecks,
  PlayCircle,
  Eye,
  Sparkles,
} from 'lucide-react';
import type { QuestionType } from '@/types';
import { useDraftExam } from '@/hooks/useDraftExam';
import {
  durationInMinutes,
  formatDuration,
  furthestStep,
  totalMarks,
} from '@/lib/wizard';
import { withCount } from '@/lib/format';
import { clearDraft } from '@/lib/draft-store';
import { WizardShell } from '@/components/wizard/WizardShell';
import { QUESTION_TYPE_META } from '@/components/wizard/questions/icons';
import { cn } from '@/lib/cn';

export function ReviewStep() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { draft } = useDraftExam(params.id);

  if (params.id && params.id !== draft.id) {
    return <Navigate to={`/exams/new/${draft.id}/review`} replace />;
  }

  const validStudents = draft.parsed_students.filter((s) => s.valid);
  const total = totalMarks(draft);
  const breakdown = breakdownByType(draft.questions.map((q) => q.type));
  const dateLine = formatStartLine(draft);

  function publish() {
    clearDraft(draft.id);
    navigate('/');
  }

  function saveAsDraft() {
    navigate('/exams');
  }

  return (
    <WizardShell
      current="review"
      draftId={draft.id}
      furthestReached={furthestStep(draft)}
    >
      <div>
        <h1 className="text-[28px] font-semibold tracking-tight text-ink">
          Almost ready
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-secondary">
          Take one last look. You can still go back and change anything before
          you publish.
        </p>
      </div>

      {/* Section: Exam */}
      <Section
        title="Exam details"
        icon={CalendarDays}
        editHref={`/exams/new/details`}
      >
        <Row label="Title" value={draft.title || '—'} />
        <Row
          label="Subject and class"
          value={
            [draft.subject, draft.class_name].filter(Boolean).join(' · ') ||
            '—'
          }
        />
        <Row label="When" value={dateLine} />
        <Row
          label="Duration"
          value={formatDuration(durationInMinutes(draft))}
        />
        <Row
          label="Late join window"
          value={`${draft.late_join_minutes} minutes after start`}
        />
        {draft.instructions.trim() && (
          <Row
            label="Instructions"
            value={draft.instructions}
            multiline
          />
        )}
      </Section>

      {/* Section: Questions */}
      <Section
        title="Questions"
        icon={ListChecks}
        editHref={`/exams/new/${draft.id}/questions`}
      >
        <Row
          label="Count"
          value={`${withCount(draft.questions.length, 'question')} · ${withCount(total, 'mark')} total`}
        />
        {breakdown.length > 0 && (
          <Row
            label="By type"
            value={breakdown
              .map((b) => `${b.count} ${b.label}`)
              .join(' · ')}
          />
        )}
      </Section>

      {/* Section: Students */}
      <Section
        title="Students"
        icon={Users}
        editHref={`/exams/new/${draft.id}/students`}
      >
        <Row
          label="Invited"
          value={withCount(validStudents.length, 'student')}
        />
        <Row
          label="Invitations"
          value={
            draft.invite_timing === 'now'
              ? 'Sent as soon as you publish'
              : 'Sent when the exam goes live'
          }
        />
      </Section>

      {/* What happens next */}
      <section className="mt-8 rounded-card border border-border-subtle bg-surface p-6 shadow-soft">
        <h2 className="text-[14px] font-semibold text-ink">
          When you publish this exam
        </h2>
        <ul className="mt-4 space-y-3">
          <NextStep
            icon={PlayCircle}
            text={`Students will be able to join from ${dateLine}.`}
          />
          <NextStep
            icon={Eye}
            text="You'll be able to monitor progress live as they write."
          />
          <NextStep
            icon={Sparkles}
            text="Scripts will be graded automatically. You'll review and publish results."
          />
        </ul>
      </section>

      {/* Actions */}
      <div className="mt-10 border-t border-border-subtle pt-6">
        <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => navigate(`/exams/new/${draft.id}/students`)}
            className="text-[13px] font-medium text-ink-secondary hover:text-ink"
          >
            ← Back
          </button>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={saveAsDraft}
              className="h-11 rounded-control border border-border bg-surface px-5 text-[14px] font-medium text-ink transition-colors hover:bg-canvas"
            >
              Save as draft
            </button>
            <button
              type="button"
              onClick={publish}
              className={cn(
                'h-11 rounded-control bg-ink px-5 text-[14px] font-medium text-white shadow-soft transition-colors hover:bg-[#1F1F1F]',
              )}
            >
              Publish exam
            </button>
          </div>
        </div>
      </div>
    </WizardShell>
  );
}

function Section({
  title,
  icon: Icon,
  editHref,
  children,
}: {
  title: string;
  icon: typeof CalendarDays;
  editHref: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8 rounded-card border border-border-subtle bg-surface shadow-soft">
      <header className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
        <div className="flex items-center gap-2.5">
          <Icon size={15} strokeWidth={1.75} className="text-ink-tertiary" aria-hidden />
          <h2 className="text-[14px] font-semibold text-ink">{title}</h2>
        </div>
        <a
          href={editHref}
          className="text-[12px] text-ink-secondary hover:text-ink"
        >
          Edit
        </a>
      </header>
      <dl className="divide-y divide-border-subtle">{children}</dl>
    </section>
  );
}

function Row({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-1 px-6 py-3.5 sm:grid-cols-[180px_1fr] sm:gap-6">
      <dt className="text-[12px] font-medium uppercase tracking-wider text-ink-tertiary sm:pt-0.5">
        {label}
      </dt>
      <dd
        className={cn(
          'text-[14px] text-ink',
          multiline ? 'whitespace-pre-wrap leading-relaxed' : 'truncate',
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function NextStep({
  icon: Icon,
  text,
}: {
  icon: typeof PlayCircle;
  text: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-canvas text-ink">
        <Icon size={14} strokeWidth={1.75} aria-hidden />
      </span>
      <span className="pt-1 text-[13px] leading-relaxed text-ink-secondary">
        {text}
      </span>
    </li>
  );
}

function breakdownByType(
  types: QuestionType[],
): { type: QuestionType; count: number; label: string }[] {
  const counts = new Map<QuestionType, number>();
  for (const t of types) counts.set(t, (counts.get(t) ?? 0) + 1);
  const order: QuestionType[] = ['mcq', 'short_answer', 'long_answer', 'handwritten'];
  return order
    .filter((t) => counts.get(t))
    .map((t) => ({
      type: t,
      count: counts.get(t)!,
      label: QUESTION_TYPE_META[t].label.toLowerCase(),
    }));
}

function formatStartLine(draft: ReturnType<typeof useDraftExam>['draft']): string {
  if (!draft.start_date || !draft.start_time) return '—';
  const dt = new Date(`${draft.start_date}T${draft.start_time}:00`);
  if (Number.isNaN(dt.getTime())) return '—';
  const date = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(dt);
  const time = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(dt);
  return `${date} at ${time}`;
}
