import { cn } from '@/lib/cn';

type Props = {
  className?: string;
};

export function Skeleton({ className }: Props) {
  return (
    <div
      aria-hidden
      className={cn(
        'animate-skeleton rounded-control bg-hairline',
        className,
      )}
    />
  );
}
