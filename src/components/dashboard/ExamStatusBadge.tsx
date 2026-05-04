import type { Exam } from '@/types';
import { now } from '@/lib/clock';
import { statusLabel, statusTone } from '@/lib/format';
import { cn } from '@/lib/cn';
import { PulseDot } from './PulseDot';

type Props = {
  exam: Exam;
};

const toneClasses: Record<string, string> = {
  live: 'bg-[#EAF6EE] text-[#2F7A4F]',
  attention: 'bg-[#FBF1DE] text-[#A66D11]',
  ready: 'bg-[#F1EEFB] text-[#5A4FA8]',
  muted: 'bg-hairline text-ink-secondary',
  neutral: 'bg-hairline text-ink-secondary',
};

export function ExamStatusBadge({ exam }: Props) {
  const tone = statusTone(exam.status);
  const label = statusLabel(exam, now());

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium',
        toneClasses[tone],
      )}
    >
      {tone === 'live' && <PulseDot />}
      {label}
    </span>
  );
}
