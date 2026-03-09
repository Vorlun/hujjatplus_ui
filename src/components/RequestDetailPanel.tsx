import { useState } from "react";
import { X, Send, Cpu, GitBranch, UserPlus, CheckCircle, Loader2 } from "lucide-react";
import type { RequestListItem, RequestStatus } from "../api/requests";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";

const STATUS_OPTIONS: { value: RequestStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
];

interface RequestDetailPanelProps {
  request: RequestListItem;
  departmentName?: string;
  onClose: () => void;
  onStatusChange?: (requestId: string, status: RequestStatus) => void;
  isUpdating?: boolean;
  showAdminActions?: boolean;
}

const timelineSteps = [
  { icon: Send, label: "Client submitted request", color: "text-blue-600" },
  { icon: Cpu, label: "AI classified request", color: "text-purple-600" },
  { icon: GitBranch, label: "Request routed to department", color: "text-cyan-600" },
  { icon: UserPlus, label: "Agent started processing", color: "text-amber-600" },
  { icon: CheckCircle, label: "Request resolved", color: "text-green-600" },
];

export function RequestDetailPanel({
  request,
  departmentName = "—",
  onClose,
  onStatusChange,
  isUpdating = false,
  showAdminActions = false,
}: RequestDetailPanelProps) {
  const [responseText, setResponseText] = useState("");
  const created = request.created_at
    ? new Date(request.created_at).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#111827]">{request.title || "Untitled request"}</h2>
          <p className="text-xs font-mono text-gray-500 mt-1">{request.id}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#111827]"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Main details */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[#111827]">Details</h3>
          {request.description && (
            <p className="text-sm text-gray-600">{request.description}</p>
          )}
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="text-gray-500">Requester</dt>
            <dd className="text-[#111827]">{request.requester_name ?? request.requester_id ?? "—"}</dd>
            <dt className="text-gray-500">Department</dt>
            <dd className="text-[#111827]">{departmentName}</dd>
            <dt className="text-gray-500">Priority</dt>
            <dd><PriorityBadge priority={request.priority} /></dd>
            <dt className="text-gray-500">Status</dt>
            <dd><StatusBadge status={request.status} /></dd>
            <dt className="text-gray-500">Created</dt>
            <dd className="text-[#111827]">{created}</dd>
          </dl>
        </div>

        {/* AI Classification Result */}
        <div className="rounded-xl border border-gray-200 p-4 bg-gray-50/50">
          <h3 className="text-sm font-semibold text-[#111827] mb-3">AI Classification Result</h3>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="text-gray-500">Detected category</dt>
            <dd className="text-[#111827] capitalize">{request.category ?? "—"}</dd>
            <dt className="text-gray-500">Assigned department</dt>
            <dd className="text-[#111827]">{departmentName}</dd>
            <dt className="text-gray-500">Priority level</dt>
            <dd className="text-[#111827]">{request.priority}</dd>
            <dt className="text-gray-500">Confidence score</dt>
            <dd className="text-[#111827]">92%</dd>
          </dl>
        </div>

        {/* Routing flow timeline */}
        <div>
          <h3 className="text-sm font-semibold text-[#111827] mb-3">Routing flow</h3>
          <div className="relative space-y-0">
            {timelineSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.label} className="flex gap-4 pb-4 last:pb-0">
                  <div className="relative flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center flex-shrink-0 ${step.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {i < timelineSteps.length - 1 && (
                      <div className="absolute top-8 left-1/2 w-0.5 h-full -translate-x-1/2 bg-gray-200" style={{ minHeight: 24 }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm font-medium text-[#111827]">{step.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{i === 0 ? created : "—"}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Admin / Department Actions */}
        {showAdminActions && onStatusChange && (
          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-4">
            <h3 className="text-sm font-semibold text-[#111827]">Actions</h3>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select
                value={request.status}
                onChange={(e) => onStatusChange(request.id, e.target.value as RequestStatus)}
                disabled={isUpdating}
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 disabled:opacity-50"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onStatusChange(request.id, "resolved")}
                disabled={isUpdating || request.status === "resolved"}
                className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Mark Resolved
              </button>
              <button
                type="button"
                onClick={() => onStatusChange(request.id, "rejected")}
                disabled={isUpdating || request.status === "rejected"}
                className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                Reject Request
              </button>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Response / Comment</label>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Your issue has been forwarded to IT support."
                rows={3}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-[#111827] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20"
              />
              <p className="text-xs text-gray-500 mt-1">Responses can be sent when the backend supports the feature.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
