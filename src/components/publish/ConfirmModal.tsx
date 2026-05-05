import { useEffect } from 'react';
import { X } from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  studentCount: number;
};

export function PublishConfirmModal({
  open,
  onClose,
  onConfirm,
  studentCount,
}: Props) {
  useEffect(() => {
    if (!open) return;
    function handle(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-confirm-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
    >
      <div
        className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-md rounded-card bg-surface p-6 shadow-lift">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-control text-ink-secondary hover:bg-hairline hover:text-ink"
          aria-label="Close"
        >
          <X size={15} strokeWidth={1.75} />
        </button>

        <h2
          id="publish-confirm-title"
          className="text-[18px] font-semibold tracking-tight text-ink"
        >
          Publish results to {studentCount} students?
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-secondary">
          Once published, students can see their scores immediately. You can
          still edit individual scores after publishing if needed.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-control border border-border bg-surface px-4 text-[13px] font-medium text-ink transition-colors hover:bg-canvas"
          >
            Not yet
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-10 rounded-control bg-ink px-4 text-[13px] font-medium text-white shadow-soft transition-colors hover:bg-[#1F1F1F]"
          >
            Yes, publish
          </button>
        </div>
      </div>
    </div>
  );
}
