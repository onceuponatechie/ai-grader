import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/cn';

// ────────────────────────────────────────────────────────────────────
// Field — label + helper + control wrapper
// ────────────────────────────────────────────────────────────────────

type FieldProps = {
  label: string;
  htmlFor?: string;
  helper?: string;
  hint?: string;
  optional?: boolean;
  className?: string;
  children: ReactNode;
};

export function Field({
  label,
  htmlFor,
  helper,
  hint,
  optional,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-baseline justify-between">
        <label
          htmlFor={htmlFor}
          className="text-[13px] font-medium text-ink"
        >
          {label}
          {optional && (
            <span className="ml-1.5 text-[12px] font-normal text-ink-tertiary">
              (optional)
            </span>
          )}
        </label>
        {hint && <span className="text-[12px] text-ink-tertiary">{hint}</span>}
      </div>
      {children}
      {helper && (
        <p className="text-[12px] leading-snug text-ink-secondary">{helper}</p>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Input
// ────────────────────────────────────────────────────────────────────

const baseControl =
  'w-full rounded-control border border-border-subtle bg-surface px-3 text-[14px] text-ink placeholder:text-ink-tertiary outline-none transition-colors focus:border-border focus:ring-2 focus:ring-ink/5 disabled:bg-canvas disabled:text-ink-tertiary';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return (
      <input
        ref={ref}
        className={cn(baseControl, 'h-10', className)}
        {...rest}
      />
    );
  },
);

// ────────────────────────────────────────────────────────────────────
// Select
// ────────────────────────────────────────────────────────────────────

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, children, ...rest }, ref) {
  return (
    <select
      ref={ref}
      className={cn(baseControl, 'h-10 appearance-none pr-9', className)}
      style={{
        backgroundImage:
          'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%239B9B9B\' stroke-width=\'1.75\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E")',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 12px center',
      }}
      {...rest}
    >
      {children}
    </select>
  );
});

// ────────────────────────────────────────────────────────────────────
// Textarea
// ────────────────────────────────────────────────────────────────────

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, rows = 4, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(baseControl, 'resize-y py-2.5 leading-relaxed', className)}
      {...rest}
    />
  );
});

// ────────────────────────────────────────────────────────────────────
// Toggle (controlled switch)
// ────────────────────────────────────────────────────────────────────

type ToggleProps = {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  description?: string;
  id?: string;
};

export function Toggle({
  checked,
  onChange,
  label,
  description,
  id,
}: ToggleProps) {
  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        id={id}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
          checked ? 'bg-ink' : 'bg-hairline',
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white shadow-soft transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0.5',
          )}
        />
      </button>
      {(label || description) && (
        <div>
          {label && (
            <div className="text-[13px] font-medium text-ink">{label}</div>
          )}
          {description && (
            <div className="mt-0.5 text-[12px] leading-snug text-ink-secondary">
              {description}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Soft inline note (used for "we need a title to continue")
// ────────────────────────────────────────────────────────────────────

export function SoftNote({ children }: { children: ReactNode }) {
  return (
    <p className="text-[12px] leading-snug text-ink-tertiary">{children}</p>
  );
}
