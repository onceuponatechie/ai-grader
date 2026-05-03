import { useTeacher } from '@/hooks/useTeacher';

export function Dashboard() {
  const teacher = useTeacher();

  return (
    <div>
      <header className="mb-8">
        <p className="label-caps mb-2">Welcome back</p>
        <h1 className="text-[28px] font-semibold tracking-tight text-ink">
          {teacher ? teacher.full_name : 'Loading…'}
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-secondary">
          Your dashboard will appear here.
        </p>
      </header>
    </div>
  );
}
