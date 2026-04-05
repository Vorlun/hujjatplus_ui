import { memo } from "react";
import type { RequestPriority } from "../api/requests";

const priorityStyles: Record<RequestPriority, string> = {
  High: "bg-red-100 text-red-600 border-red-200/60",
  Medium: "bg-yellow-100 text-yellow-700 border-yellow-200/60",
  Low: "bg-green-100 text-green-700 border-green-200/60",
};

interface PriorityBadgeProps {
  priority: RequestPriority;
  className?: string;
}

export const PriorityBadge = memo(function PriorityBadge({
  priority,
  className = "",
}: PriorityBadgeProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-none ${priorityStyles[priority]} ${className}`}
    >
      {priority}
    </span>
  );
});
