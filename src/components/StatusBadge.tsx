import { memo } from "react";
import type { RequestStatus } from "../api/requests";

const statusStyles: Record<RequestStatus, string> = {
  new: "bg-blue-100 text-blue-700 border-blue-200/60",
  in_progress: "bg-purple-100 text-purple-700 border-purple-200/60",
  resolved: "bg-green-100 text-green-700 border-green-200/60",
  rejected: "bg-red-100 text-red-700 border-red-200/60",
};

const statusLabels: Record<RequestStatus, string> = {
  new: "New",
  in_progress: "In Progress",
  resolved: "Resolved",
  rejected: "Rejected",
};

interface StatusBadgeProps {
  status: RequestStatus;
  className?: string;
}

export const StatusBadge = memo(function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-none ${statusStyles[status]} ${className}`}
    >
      {statusLabels[status]}
    </span>
  );
});
