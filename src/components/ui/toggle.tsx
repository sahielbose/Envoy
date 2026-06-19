import { cn } from "@/lib/utils";

/** Accessible on/off switch (role="switch"). */
export function Toggle({
  checked,
  onChange,
  label,
  className,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={cn("switch", className)}
      onClick={() => onChange(!checked)}
    />
  );
}
