import { ClipboardEdit } from 'lucide-react';

type Props = {
  onCreate: () => void;
};

export function EmptyState({ onCreate }: Props) {
  return (
    <div className="flex flex-col items-start rounded-card border border-border-subtle bg-surface p-10 shadow-soft">
      <div className="flex h-11 w-11 items-center justify-center rounded-control bg-hairline text-ink">
        <ClipboardEdit size={20} strokeWidth={1.75} aria-hidden />
      </div>
      <h2 className="mt-5 text-[20px] font-semibold tracking-tight text-ink">
        You haven't created any exams yet
      </h2>
      <p className="mt-2 max-w-md text-[14px] leading-relaxed text-ink-secondary">
        Let's create your first one. You can add questions yourself or pull
        from your question bank — and Marka will handle the marking once
        students submit.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-control bg-ink px-5 text-[13px] font-medium text-white shadow-soft transition-colors hover:bg-[#1F1F1F]"
      >
        Create your first exam
      </button>
    </div>
  );
}
