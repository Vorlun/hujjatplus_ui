import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import clsx from "clsx";
import type { CalendarViewMode } from "./types";

interface CalendarHeaderProps {
  title: string;
  view: CalendarViewMode;
  onViewChange: (view: CalendarViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
}

const views: { id: CalendarViewMode; label: string }[] = [
  { id: "month", label: "Month" },
  { id: "week", label: "Week" },
  { id: "day", label: "Day" },
];

export function CalendarHeader({ title, view, onViewChange, onPrev, onNext }: CalendarHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
          <CalendarDays className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Department Calendar
          </h1>
          <p className="truncate text-sm text-slate-500">Request deadlines by day</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <button
            type="button"
            onClick={onPrev}
            className={clsx(
              "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm",
              "transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/35"
            )}
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="min-w-[10rem] flex-1 text-center text-sm font-semibold text-slate-800 sm:min-w-[14rem] sm:text-base">
            {title}
          </p>
          <button
            type="button"
            onClick={onNext}
            className={clsx(
              "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm",
              "transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/35"
            )}
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div
          className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm"
          role="group"
          aria-label="Calendar view"
        >
          {views.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => onViewChange(id)}
              className={clsx(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 sm:text-sm",
                view === id
                  ? "bg-[#2563EB] text-white shadow-sm shadow-blue-500/20"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
