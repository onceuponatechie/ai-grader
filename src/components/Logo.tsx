type Props = {
  className?: string;
};

export function Logo({ className }: Props) {
  return (
    <div className={className}>
      <span className="text-[18px] font-semibold tracking-tight text-ink">
        Marka
      </span>
    </div>
  );
}
