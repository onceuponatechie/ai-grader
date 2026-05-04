import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useExams } from '@/hooks/useExams';
import { useTeacher } from '@/hooks/useTeacher';
import { now } from '@/lib/clock';
import {
  formatLongDate,
  greetingFor,
  withCount,
} from '@/lib/format';
import {
  StatusCard,
  StatusCardSkeleton,
} from '@/components/dashboard/StatusCard';
import {
  LiveExamCard,
  LiveExamCardSkeleton,
  NoLiveExamCard,
} from '@/components/dashboard/LiveExamCard';
import {
  GradingActivityCard,
  GradingActivityCardSkeleton,
} from '@/components/dashboard/GradingActivityCard';
import {
  RecentExamsList,
  RecentExamsListSkeleton,
} from '@/components/dashboard/RecentExamsList';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Skeleton } from '@/components/Skeleton';
import { Users, FileSearch, CheckCircle2, FolderOpen } from 'lucide-react';

export function Dashboard() {
  const teacher = useTeacher();
  const { exams, loading } = useExams();
  const navigate = useNavigate();

  const today = now();
  const greeting = greetingFor(today);
  // Use only the surname for greeting — feels more like how a colleague speaks.
  const lastName = teacher?.full_name.split(' ').slice(-1)[0] ?? '';

  function handleCreate() {
    navigate('/exams/new');
  }

  return (
    <div>
      {/* ─────────────── Page header ─────────────── */}
      <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-ink sm:text-[32px]">
            {greeting}
            {teacher && (
              <>
                , Mrs. <span className="text-ink">{lastName}</span>
              </>
            )}
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-secondary">
            Here's what's happening with your exams today.
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end">
          <span className="text-[13px] text-ink-secondary">
            {formatLongDate(today)}
          </span>
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex h-11 items-center gap-2 rounded-control bg-ink px-5 text-[14px] font-medium text-white shadow-soft transition-colors hover:bg-[#1F1F1F]"
          >
            <Plus size={16} strokeWidth={2} />
            Create New Exam
          </button>
        </div>
      </header>

      {/* ─────────────── Empty state ─────────────── */}
      {!loading && exams && exams.length === 0 && (
        <div className="mt-10">
          <EmptyState onCreate={handleCreate} />
        </div>
      )}

      {(loading || (exams && exams.length > 0)) && (
        <DashboardBody loading={loading} exams={exams ?? []} />
      )}
    </div>
  );
}

function DashboardBody({
  loading,
  exams,
}: {
  loading: boolean;
  exams: ReturnType<typeof useExams>['exams'] extends infer T
    ? T extends null
      ? never
      : T
    : never;
}) {
  // Derive the four status numbers and their human descriptions.
  const liveExams = exams.filter((e) => e.status === 'live');
  const liveExam = liveExams[0] ?? null;
  const studentsWritingNow = liveExams.reduce(
    (sum, e) => sum + e.students_writing,
    0,
  );

  const flaggedExams = exams.filter((e) => e.scripts_pending_review > 0);
  const totalFlagged = flaggedExams.reduce(
    (sum, e) => sum + e.scripts_pending_review,
    0,
  );
  const flaggedDescription =
    flaggedExams.length === 0
      ? 'No scripts waiting for you'
      : flaggedExams.length === 1
        ? `in ${flaggedExams[0].title}`
        : `across ${withCount(flaggedExams.length, 'exam')}`;

  const readyExams = exams.filter((e) => e.status === 'ready_to_publish');
  const readyDescription =
    readyExams.length === 0
      ? 'Nothing waiting on you'
      : readyExams.length === 1
        ? `${readyExams[0].title} — review scores before students see them`
        : `${withCount(readyExams.length, 'exam')} — review scores before students see them`;

  const liveDescription =
    liveExams.length === 0
      ? 'No exam in progress'
      : `across ${withCount(liveExams.length, 'live exam')}`;

  const totalThisTerm = exams.length;
  const counts = {
    live: exams.filter((e) => e.status === 'live').length,
    grading: exams.filter((e) => e.status === 'grading').length,
    ready: exams.filter((e) => e.status === 'ready_to_publish').length,
    done: exams.filter(
      (e) => e.status === 'published' || e.status === 'archived',
    ).length,
  };
  const termDescription = [
    counts.live > 0 && `${counts.live} live`,
    counts.grading > 0 && `${counts.grading} grading`,
    counts.ready > 0 && `${counts.ready} awaiting publish`,
    counts.done > 0 && `${counts.done} done`,
  ]
    .filter(Boolean)
    .join(', ');

  const otherLiveCount = Math.max(0, liveExams.length - 1);

  return (
    <>
      {/* ─────────────── Status cards row ─────────────── */}
      <section
        aria-label="At a glance"
        className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {loading ? (
          <>
            <StatusCardSkeleton />
            <StatusCardSkeleton />
            <StatusCardSkeleton />
            <StatusCardSkeleton />
          </>
        ) : (
          <>
            <StatusCard
              label="Students writing now"
              value={studentsWritingNow}
              description={liveDescription}
              icon={Users}
              to={liveExam ? `/exams/${liveExam.id}/live` : undefined}
            />
            <StatusCard
              label="Scripts waiting for your review"
              value={totalFlagged}
              description={flaggedDescription}
              icon={FileSearch}
              to={totalFlagged > 0 ? '/results?filter=needs_review' : undefined}
              emphasis={totalFlagged > 0 ? 'attention' : 'none'}
            />
            <StatusCard
              label="Exams ready to publish"
              value={readyExams.length}
              description={readyDescription}
              icon={CheckCircle2}
              to={
                readyExams.length === 1
                  ? `/exams/${readyExams[0].id}`
                  : readyExams.length > 1
                    ? '/exams?filter=ready_to_publish'
                    : undefined
              }
            />
            <StatusCard
              label="Exams this term"
              value={totalThisTerm}
              description={termDescription || 'Nothing yet'}
              icon={FolderOpen}
              to="/exams"
            />
          </>
        )}
      </section>

      {/* ─────────────── Live + grading row ─────────────── */}
      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {loading ? (
            <LiveExamCardSkeleton />
          ) : liveExam ? (
            <LiveExamCard exam={liveExam} otherLiveCount={otherLiveCount} />
          ) : (
            <NoLiveExamCard />
          )}
        </div>
        <div className="lg:col-span-1">
          {loading ? (
            <GradingActivityCardSkeleton />
          ) : (
            <GradingActivityCard exams={exams} />
          )}
        </div>
      </section>

      {/* ─────────────── Recent exams list ─────────────── */}
      <div className="mt-10">
        {loading ? (
          <RecentExamsListSkeleton />
        ) : (
          <RecentExamsList exams={exams} />
        )}
      </div>

      {loading && (
        // Hidden helper so the Skeleton import isn't unused on no-data paths.
        <Skeleton className="hidden" />
      )}
    </>
  );
}
