import type { ReactNode } from "react";
import clsx from "clsx";

interface SettingsCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
}

export function SettingsCard({ title, description, children, className, footer }: SettingsCardProps) {
  return (
    <section
      className={clsx(
        "rounded-xl border border-slate-200/90 bg-white shadow-sm shadow-slate-200/30",
        className
      )}
    >
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <h2 className="text-base font-bold tracking-tight text-slate-900">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
      {footer ? (
        <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-4 sm:px-6">{footer}</div>
      ) : null}
    </section>
  );
}
