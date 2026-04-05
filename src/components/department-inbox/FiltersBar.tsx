import clsx from "clsx";
import { Search } from "lucide-react";
import type { RequestPriority, RequestStatus } from "../../api/requests";

const STATUS_OPTIONS: { value: "all" | RequestStatus; label: string }[] = [
  { value: "all", label: "All status" },
  { value: "new", label: "New" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
];

const PRIORITY_OPTIONS: { value: "all" | RequestPriority; label: string }[] = [
  { value: "all", label: "All priority" },
  { value: "High", label: "High" },
  { value: "Medium", label: "Medium" },
  { value: "Low", label: "Low" },
];

const SORT_OPTIONS = [
  { value: "desc" as const, label: "Newest first" },
  { value: "asc" as const, label: "Oldest first" },
];

interface FiltersBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: "all" | RequestStatus;
  onStatusFilter: (v: "all" | RequestStatus) => void;
  priorityFilter: "all" | RequestPriority;
  onPriorityFilter: (v: "all" | RequestPriority) => void;
  sortOrder: "asc" | "desc";
  onSortOrder: (v: "asc" | "desc") => void;
}

function PillSelect<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  ariaLabel: string;
}) {
  return (
    <div
      className="inline-flex flex-wrap gap-1 rounded-full border border-slate-200/90 bg-slate-50/80 p-0.5 shadow-sm"
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={clsx(
            "cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-150",
            value === o.value
              ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80"
              : "text-slate-600 hover:bg-white/80 hover:text-slate-900"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function FiltersBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilter,
  priorityFilter,
  onPriorityFilter,
  sortOrder,
  onSortOrder,
}: FiltersBarProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <input
          type="search"
          placeholder="Search by title or request ID…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className={clsx(
            "w-full rounded-xl border border-slate-200/90 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm",
            "placeholder:text-slate-400 transition-all duration-150",
            "focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
          )}
        />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:gap-4">
        <PillSelect
          ariaLabel="Status filter"
          value={statusFilter}
          onChange={onStatusFilter}
          options={STATUS_OPTIONS}
        />
        <PillSelect
          ariaLabel="Priority filter"
          value={priorityFilter}
          onChange={onPriorityFilter}
          options={PRIORITY_OPTIONS}
        />
        <PillSelect
          ariaLabel="Sort by date"
          value={sortOrder}
          onChange={onSortOrder}
          options={SORT_OPTIONS}
        />
      </div>
    </div>
  );
}
