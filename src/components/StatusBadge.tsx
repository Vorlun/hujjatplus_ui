import { memo } from "react";
import type { RequestStatus } from "../api/requests";

const statusStyles: Record<RequestStatus, string> = {
  new: "bg-blue-100 text-blue-700 border-blue-200",
  in_progress: "bg-amber-100 text-amber-600 border-amber-200",
  resolved: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
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
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[status]} ${className}`}
    >
      {statusLabels[status]}
    </span>
  );
});
