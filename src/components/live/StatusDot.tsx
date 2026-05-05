import { cn } from '@/lib/cn';
import type { LiveStatusInfo } from '@/lib/grading';
import { PulseDot } from '@/components/dashboard/PulseDot';

const TONE_CLASSES: Record<LiveStatusInfo['tone'], string> = {
  live: 'text-positive',
  positive: 'text-positive',
  attention: 'text-attention',
  problem: 'text-problem',
  muted: 'text-ink-tertiary',
};

const DOT_CLASSES: Record<LiveStatusInfo['tone'], string> = {
  live: 'bg-positive',
  positive: 'bg-positive',
  attention: 'bg-attention',
  problem: 'bg-problem',
  muted: 'bg-ink-tertiary/60',
};

type Props = {
  status: LiveStatusInfo;
  showLabel?: boolean;
  className?: string;
};

export function StatusDot({ status, showLabel = true, className }: Props) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-[13px]', className)}>
      {status.tone === 'live' ? (
        <PulseDot label={status.label} />
      ) : (
        <span
          aria-hidden
          className={cn('h-1.5 w-1.5 rounded-full', DOT_CLASSES[status.tone])}
        />
      )}
      {showLabel && (
        <span className={cn('font-medium', TONE_CLASSES[status.tone])}>
          {status.label}
        </span>
      )}
    </span>
  );
}
