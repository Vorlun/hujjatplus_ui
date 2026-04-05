import clsx from "clsx";

interface SettingsToggleProps {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  id?: string;
  disabled?: boolean;
}

export function SettingsToggle({ checked, onCheckedChange, id, disabled }: SettingsToggleProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={clsx(
        "relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-out",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/40 focus-visible:ring-offset-2",
        disabled && "cursor-not-allowed opacity-50",
        checked ? "bg-[#2563EB]" : "bg-slate-200"
      )}
    >
      <span
        className={clsx(
          "pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-out",
          checked ? "translate-x-[1.35rem]" : "translate-x-0.5"
        )}
      />
    </button>
  );
}
