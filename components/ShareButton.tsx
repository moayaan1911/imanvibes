import type { ReactNode } from "react";

type ShareButtonProps = {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  className?: string;
  iconOnly?: boolean;
  disabled?: boolean;
};

export default function ShareButton({
  label,
  icon,
  onClick,
  className = "",
  iconOnly = false,
  disabled = false,
}: ShareButtonProps) {
  const baseClassName = iconOnly
    ? "button-secondary cursor-pointer flex aspect-square w-full items-center justify-center rounded-full text-lg"
    : "button-secondary cursor-pointer flex items-center justify-center gap-1.5 rounded-full px-3 py-3 text-center text-[13px] font-semibold";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`${baseClassName} ${disabled ? "cursor-not-allowed opacity-55" : ""} ${className}`.trim()}
    >
      <span className={iconOnly ? "" : "text-base"}>{icon}</span>
      {iconOnly ? null : <span className="whitespace-nowrap">{label}</span>}
    </button>
  );
}
