import { memo } from "react";
import { FileText } from "lucide-react";
import type { RequestListItem } from "../api/requests";
import { StatusBadge } from "./StatusBadge";

const priorityStyles: Record<string, string> = {
  High: "bg-red-100 text-red-700 border-red-200",
  Medium: "bg-amber-100 text-amber-700 border-amber-200",
  Low: "bg-blue-100 text-blue-700 border-blue-200",
};

interface RequestCardProps {
  request: RequestListItem;
  onClick?: () => void;
}

export const RequestCard = memo(function RequestCard({ request, onClick }: RequestCardProps) {
  const priorityClass = priorityStyles[request.priority] ?? priorityStyles.Medium;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      className="bg-[#FFFFFF] rounded-xl border border-[#E5E7EB] p-4 shadow-sm hover:shadow-md hover:border-[#7C3AED]/30 transition-all cursor-pointer text-left"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-[#7C3AED]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-mono text-[#6B7280]">{request.id}</p>
            <h3 className="font-semibold text-[#111827] truncate">
              {request.title}
            </h3>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span
                className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border ${priorityClass}`}
              >
                {request.priority}
              </span>
              <StatusBadge status={request.status} />
              <span className="text-xs text-[#6B7280] capitalize">
                {request.category}
              </span>
            </div>
          </div>
        </div>
      </div>
      {request.requester_name && (
        <p className="text-xs text-[#6B7280] mt-2">
          {request.requester_initials ? `(${request.requester_initials}) ` : ""}
          {request.requester_name}
        </p>
      )}
      <p className="text-xs text-[#6B7280] mt-1">
        {new Date(request.created_at).toLocaleString()}
      </p>
    </div>
  );
});
