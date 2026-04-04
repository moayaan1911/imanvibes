type BrandWordmarkProps = {
  showTagline?: boolean;
  className?: string;
  wordmarkClassName?: string;
  taglineClassName?: string;
};

export default function BrandWordmark({
  showTagline = false,
  className = "",
  wordmarkClassName = "",
  taglineClassName = "",
}: BrandWordmarkProps) {
  return (
    <div className={className}>
      <p
        className={`flex items-baseline gap-2 leading-none text-[var(--sage-700)] ${wordmarkClassName}`.trim()}
      >
        <span className="text-[1.18em] [font-family:var(--font-brand-arabic)]">
          إيمان
        </span>
        <span className="italic tracking-[0.02em] [font-family:var(--font-display)]">
          Vibes
        </span>
      </p>

      {showTagline ? (
        <p
          className={`mt-1 max-w-xs text-sm leading-6 text-[var(--ink-700)] ${taglineClassName}`.trim()}
        >
          Quranic comfort for every mood
        </p>
      ) : null}
    </div>
  );
}
