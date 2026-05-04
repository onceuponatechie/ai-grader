import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, type LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/Skeleton';
import { cn } from '@/lib/cn';

type Props = {
  label: string;
  value: number | string;
  description: string;
  icon: LucideIcon;
  to?: string;
  /** Subtle visual emphasis when the count is non-zero and demands attention. */
  emphasis?: 'none' | 'attention';
};

export function StatusCard({
  label,
  value,
  description,
  icon: Icon,
  to,
  emphasis = 'none',
}: Props) {
  const navigate = useNavigate();
  const isClickable = Boolean(to);
  const Component = isClickable ? 'button' : 'div';

  return (
    <Component
      type={isClickable ? 'button' : undefined}
      onClick={isClickable ? () => navigate(to!) : undefined}
      className={cn(
        'group relative flex h-full flex-col rounded-card border border-border-subtle bg-surface p-5 text-left shadow-soft transition-shadow',
        isClickable && 'cursor-pointer hover:shadow-lift focus:outline-none focus:ring-2 focus:ring-ink/10',
      )}
    >
      <div className="flex items-start justify-between">
        <span className="label-caps">{label}</span>
        <Icon
          size={15}
          strokeWidth={1.75}
          className={cn(
            'shrink-0 transition-colors',
            emphasis === 'attention' ? 'text-attention' : 'text-ink-tertiary',
          )}
          aria-hidden
        />
      </div>

      <div className="mt-5 text-[34px] font-semibold leading-none tracking-tight text-ink">
        {value}
      </div>

      <p className="mt-3 text-[13px] leading-snug text-ink-secondary">
        {description}
      </p>

      {isClickable && (
        <ArrowUpRight
          size={14}
          strokeWidth={1.75}
          aria-hidden
          className="absolute bottom-4 right-4 text-ink-tertiary opacity-0 transition-opacity group-hover:opacity-100"
        />
      )}
    </Component>
  );
}

export function StatusCardSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-card border border-border-subtle bg-surface p-5 shadow-soft">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-5 h-9 w-16" />
      <Skeleton className="mt-3 h-3 w-32" />
    </div>
  );
}
