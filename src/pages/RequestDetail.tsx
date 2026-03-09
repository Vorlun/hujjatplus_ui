import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../auth/useAuth";
import { fetchRequestById } from "../api/requests";
import { fetchDepartments } from "../api/departments";
import { StatusBadge } from "../components/StatusBadge";
import {
  ArrowLeft,
  FileText,
  Send,
  Cpu,
  GitBranch,
  UserCheck,
  CheckCircle,
  Clock,
} from "lucide-react";

const priorityStyles: Record<string, string> = {
  High: "bg-red-100 text-red-700 border-red-200",
  Medium: "bg-amber-100 text-amber-700 border-amber-200",
  Low: "bg-blue-100 text-blue-700 border-blue-200",
};

const progressSteps = [
  { key: "submitted", label: "Submitted" },
  { key: "classification", label: "AI Classification" },
  { key: "routed", label: "Routed" },
  { key: "processing", label: "Processing" },
  { key: "resolved", label: "Resolved" },
];

const timelineSteps = [
  { key: "submitted", icon: Send, label: "Request submitted", statusMatch: ["new", "in_progress", "resolved", "rejected"] },
  { key: "classified", icon: Cpu, label: "AI classified request", statusMatch: ["new", "in_progress", "resolved", "rejected"] },
  { key: "routed", icon: GitBranch, label: "Routed to department", statusMatch: ["new", "in_progress", "resolved", "rejected"] },
  { key: "agent", icon: UserCheck, label: "Agent started processing", statusMatch: ["in_progress", "resolved", "rejected"] },
  { key: "resolved", icon: CheckCircle, label: "Request resolved", statusMatch: ["resolved", "rejected"] },
];

function getCurrentStepIndex(status: string): number {
  const map: Record<string, number> = {
    new: 1,
    in_progress: 3,
    resolved: 4,
    rejected: 4,
  };
  return map[status] ?? 0;
}

export function RequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState<Awaited<ReturnType<typeof fetchRequestById>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchRequestById(id);
        if (!cancelled) setRequest(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  const { data: departments = [] } = useQuery({ queryKey: ["departments"], queryFn: fetchDepartments });
  const getDeptName = (deptId: string) => departments.find((d) => d.id === deptId)?.name ?? deptId;

  if (!id) {
    navigate("/my-requests");
    return null;
  }

  if (loading) return <div className="text-gray-500 p-6">Loading…</div>;
  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-red-600">{error}</div>
        <button type="button" onClick={() => navigate("/my-requests")} className="text-[#7C3AED] hover:underline">
          Back to My Requests
        </button>
      </div>
    );
  }
  if (!request) return null;

  const isOwner = user?.id && request.requester_id === user.id;
  if (!isOwner && user?.role === "user") {
    navigate("/my-requests");
    return null;
  }

  const createdStr = new Date(request.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  const currentStep = getCurrentStepIndex(request.status);
  const resAny = request as Record<string, unknown>;
  const confidence = typeof resAny.confidence === "number" ? resAny.confidence : typeof resAny.confidence_score === "number" ? resAny.confidence_score : null;
  const assignedAgent = typeof resAny.assigned_agent === "string" ? resAny.assigned_agent : typeof resAny.assigned_agent_name === "string" ? resAny.assigned_agent_name : "—";
  const deptDisplayName = getDeptName(request.department_id);

  return (
    <div className="max-w-3xl space-y-6">
      <button
        type="button"
        onClick={() => navigate("/my-requests")}
        className="flex items-center gap-2 text-gray-500 hover:text-[#111827]"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to My Requests
      </button>

      {/* Request Information */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <h2 className="text-lg font-semibold text-[#111827] mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#7C3AED]" />
          Request Information
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-gray-500">Title</dt>
            <dd className="font-medium text-[#111827]">{request.title || "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Request ID</dt>
            <dd className="font-mono text-gray-600">{request.id}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Department</dt>
            <dd className="text-[#111827]">{getDeptName(request.department_id)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Priority</dt>
            <dd>
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${priorityStyles[request.priority] ?? "bg-gray-100"}`}>
                {request.priority}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Status</dt>
            <dd><StatusBadge status={request.status} /></dd>
          </div>
          <div>
            <dt className="text-gray-500">Created At</dt>
            <dd className="text-gray-600">{createdStr}</dd>
          </div>
        </dl>
        {request.description && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <dt className="text-gray-500 text-sm mb-1">Description</dt>
            <dd className="text-[#111827]">{request.description}</dd>
          </div>
        )}
      </div>

      {/* Assigned Department */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <h2 className="text-lg font-semibold text-[#111827] mb-4">Assigned department</h2>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-gray-500">Routed to</dt>
            <dd className="font-medium text-[#111827]">{deptDisplayName} Department</dd>
          </div>
          <div>
            <dt className="text-gray-500">Assigned agent</dt>
            <dd className="text-[#111827]">{assignedAgent}</dd>
          </div>
        </dl>
      </div>

      {/* AI Classification */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <h2 className="text-lg font-semibold text-[#111827] mb-4 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-[#7C3AED]" />
          AI Classification
        </h2>
        <ul className="space-y-2 text-sm">
          <li><span className="text-gray-500">Detected category:</span> <span className="text-[#111827] capitalize">{request.category}</span></li>
          <li><span className="text-gray-500">Assigned department:</span> <span className="text-[#111827]">{getDeptName(request.department_id)}</span></li>
          <li><span className="text-gray-500">Priority:</span> <span className="text-[#111827]">{request.priority}</span></li>
          {confidence != null && (
            <li><span className="text-gray-500">Confidence score:</span> <span className="text-[#111827]">{Math.round(confidence * 100)}%</span></li>
          )}
        </ul>
      </div>

      {/* Request Status Tracker */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <h2 className="text-lg font-semibold text-[#111827] mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#7C3AED]" />
          Request status
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {progressSteps.map((step, idx) => {
            const isActive = idx <= currentStep;
            return (
              <div key={step.key} className="flex items-center gap-1">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                    isActive ? "bg-[#7C3AED]/10 text-[#7C3AED]" : "bg-gray-100 text-gray-500"
                  } ${idx === currentStep ? "ring-2 ring-[#7C3AED]/30" : ""}`}
                >
                  {step.label}
                </div>
                {idx < progressSteps.length - 1 && (
                  <span className="text-gray-300 text-sm">→</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Request Activity Timeline */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <h2 className="text-lg font-semibold text-[#111827] mb-4">Request activity timeline</h2>
        <ul className="space-y-4">
          {timelineSteps.map((step, idx) => {
            const Icon = step.icon;
            const isDone = idx <= currentStep;
            const timestamp = idx === 0 ? createdStr : idx <= currentStep ? (idx === currentStep && request.status !== "new" ? "Completed" : "—") : "—";
            const stepLabel = step.key === "routed" ? `Routed to ${deptDisplayName} department` : step.label;
            return (
              <li key={step.key} className="flex gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isDone ? "bg-[#7C3AED]/10 text-[#7C3AED]" : "bg-gray-100 text-gray-400"}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-[#111827]">{stepLabel}</p>
                  <p className="text-xs text-gray-500">{timestamp}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
