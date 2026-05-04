type Props = {
  label?: string;
};

/**
 * The small pulsing green dot used to mark a live exam. The visible dot
 * is a steady ring of solid colour; the pulsing layer expands and fades
 * behind it.
 */
export function PulseDot({ label }: Props) {
  return (
    <span
      className="relative inline-flex h-2.5 w-2.5 items-center justify-center"
      role={label ? 'img' : undefined}
      aria-label={label}
    >
      <span className="absolute inline-flex h-full w-full animate-livepulse rounded-full bg-positive" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-positive" />
    </span>
  );
}
