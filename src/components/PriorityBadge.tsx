import { memo } from "react";
import type { RequestPriority } from "../api/requests";

const priorityStyles: Record<RequestPriority, string> = {
  High: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]",
  Medium: "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]",
  Low: "bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]",
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
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${priorityStyles[priority]} ${className}`}
    >
      {priority}
    </span>
  );
});
