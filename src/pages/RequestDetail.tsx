import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/useAuth";
import { fetchRequestById, getFeedback, submitFeedback, suggestResponse } from "../api/requests";
import { fetchMessages, sendMessage, type MessagePayload } from "../api/messages";
import { fetchDepartments } from "../api/departments";
import {
  ArrowLeft,
  FileText,
  Send,
  Cpu,
  GitBranch,
  UserCheck,
  CheckCircle,
  Clock,
  Copy,
  Share2,
  Download,
  MapPin,
  User,
  MessageSquare,
  Lightbulb,
  Star,
} from "lucide-react";
import { toast } from "sonner";

const priorityStyles: Record<string, string> = {
  High: "bg-red-100 text-red-700 border-red-200",
  Medium: "bg-amber-100 text-amber-700 border-amber-200",
  Low: "bg-blue-100 text-blue-700 border-blue-200",
};

const statusBadgeStyles: Record<string, string> = {
  new: "bg-blue-100 text-blue-700 border-blue-200",
  in_progress: "bg-amber-100 text-amber-700 border-amber-200",
  resolved: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

function formatStatusLabel(s: string): string {
  if (s === "new") return "New";
  if (s === "in_progress") return "In Progress";
  if (s === "resolved") return "Resolved";
  if (s === "rejected") return "Rejected";
  return s;
}

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
  const [copied, setCopied] = useState(false);

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

  useEffect(() => {
    if (!id) {
      navigate("/my-requests");
      return;
    }
  }, [id, navigate]);

  useEffect(() => {
    if (loading || error || !request || !user) return;
    const isOwner = request.requester_id === user.id;
    if (user.role === "user" && !isOwner) {
      navigate("/my-requests");
    }
  }, [loading, error, request, user, navigate]);

  const { data: departments = [] } = useQuery({ queryKey: ["departments"], queryFn: fetchDepartments });
  const getDeptName = (deptId: string) => departments.find((d) => d.id === deptId)?.name ?? deptId;

  const queryClient = useQueryClient();
  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ["messages", id],
    queryFn: () => fetchMessages(id!),
    enabled: !!id,
  });
  const { data: existingFeedback, refetch: refetchFeedback } = useQuery({
    queryKey: ["feedback", id],
    queryFn: () => getFeedback(id!),
    enabled: !!id,
  });
  const [comment, setComment] = useState("");
  const [suggestedResponseText, setSuggestedResponseText] = useState<string | null>(null);
  const [feedbackRating, setFeedbackRating] = useState("");
  const [feedbackComment, setFeedbackComment] = useState("");
  const addMessageMutation = useMutation({
    mutationFn: () => sendMessage(id!, comment.trim(), user!.id),
    onSuccess: () => {
      setComment("");
      refetchMessages();
      queryClient.invalidateQueries({ queryKey: ["request", id] });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to send message"),
  });
  const submitFeedbackMutation = useMutation({
    mutationFn: () => submitFeedback(id!, user!.id, feedbackRating, feedbackComment || undefined),
    onSuccess: () => {
      setFeedbackRating("");
      setFeedbackComment("");
      refetchFeedback();
      queryClient.invalidateQueries({ queryKey: ["feedback", id] });
      toast.success("Thank you for your feedback");
    },
    onError: (e: Error) => toast.error(e.message || "Failed to submit feedback"),
  });
  const handleSuggestResponse = async () => {
    try {
      const res = await suggestResponse(id!);
      setSuggestedResponseText(res.suggested_response);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load suggestion");
    }
  };

  if (!id) return null;
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
    return null;
  }

  const createdStr = new Date(request.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  const updatedStr = request.updated_at ? new Date(request.updated_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : null;
  const currentStep = getCurrentStepIndex(request.status);
  const resAny = request as Record<string, unknown>;
  const assignedAgent = typeof resAny.assigned_agent === "string" ? resAny.assigned_agent : typeof resAny.assigned_agent_name === "string" ? resAny.assigned_agent_name : null;
  const deptDisplayName = getDeptName(request.department_id);
  const assignedToDisplay = assignedAgent ?? `${deptDisplayName} Support Team`;

  async function handleCopyId() {
    try {
      await navigator.clipboard.writeText(request.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }
  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: request.title || request.id, url }).catch(() => navigator.clipboard.writeText(url));
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }
  function handleDownload() {
    window.print();
  }

  return (
    <div className="max-w-3xl space-y-6">
      <button
        type="button"
        onClick={() => navigate("/my-requests")}
        className="flex items-center gap-2 text-gray-500 hover:text-[#111827] text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to My Requests
      </button>

      {/* Top header */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold text-[#111827] truncate">{request.title || "Request"}</h1>
            <p className="text-sm font-mono text-gray-500 mt-1">{request.id}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-shrink-0">
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${statusBadgeStyles[request.status] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}>
              {formatStatusLabel(request.status)}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleCopyId}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 border border-gray-200"
                title="Copy Request ID"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? "Copied" : "Copy ID"}
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 border border-gray-200"
                title="Share"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 border border-gray-200"
                title="Download / Print"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Request meta grid */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Request details</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div>
            <dt className="text-gray-500 mb-0.5">Department</dt>
            <dd className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#7C3AED]" />
              <span className="font-medium text-[#111827]">{deptDisplayName}</span>
            </dd>
          </div>
          <div>
            <dt className="text-gray-500 mb-0.5">Priority</dt>
            <dd>
              <span className={`inline-flex px-2.5 py-0.5 rounded-md text-xs font-medium border ${priorityStyles[request.priority] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}>
                {request.priority}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-gray-500 mb-0.5">Status</dt>
            <dd>
              <span className={`inline-flex px-2.5 py-0.5 rounded-md text-xs font-medium border ${statusBadgeStyles[request.status] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}>
                {formatStatusLabel(request.status)}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-gray-500 mb-0.5">Created date</dt>
            <dd className="text-[#111827] font-medium">{createdStr}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-gray-500 mb-0.5">Assigned to</dt>
            <dd className="flex items-center gap-1.5 text-[#111827] font-medium">
              <User className="w-4 h-4 text-gray-400" />
              {assignedToDisplay}
            </dd>
          </div>
          {request.sla_deadline && (
            <div>
              <dt className="text-gray-500 mb-0.5">SLA deadline</dt>
              <dd className="text-[#111827] font-medium">
                {new Date(request.sla_deadline).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
              </dd>
            </div>
          )}
          {request.sla_status && (
            <div>
              <dt className="text-gray-500 mb-0.5">SLA status</dt>
              <dd>
                <span className={`inline-flex px-2.5 py-0.5 rounded-md text-xs font-medium border ${
                  request.sla_status === "overdue" ? "bg-red-100 text-red-700 border-red-200" :
                  request.sla_status === "warning" ? "bg-amber-100 text-amber-700 border-amber-200" :
                  "bg-green-100 text-green-700 border-green-200"
                }`}>
                  {request.sla_status === "overdue" ? "Overdue" : request.sla_status === "warning" ? "Warning" : "On time"}
                </span>
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* SLA remaining time */}
      {request.sla_deadline && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
          <h2 className="text-sm font-semibold text-[#111827] mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#7C3AED]" />
            SLA remaining time
          </h2>
          <p className="text-sm text-[#111827]">
            {(() => {
              const now = Date.now();
              const dl = new Date(request.sla_deadline).getTime();
              const diff = dl - now;
              const minutes = Math.round(Math.abs(diff) / 60000);
              const hours = Math.floor(minutes / 60);
              const mins = minutes % 60;
              const label =
                hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
              if (diff >= 0) {
                return `${label} remaining`;
              }
              return `Overdue by ${label}`;
            })()}
          </p>
        </div>
      )}

      {/* AI classification */}
      {(request.intent != null || (request.confidence ?? request.ai_confidence) != null || request.category) && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#7C3AED]" />
            AI classification
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            {request.intent != null && (
              <div>
                <dt className="text-gray-500">Intent</dt>
                <dd className="font-medium text-[#111827] capitalize">{request.intent}</dd>
              </div>
            )}
            {request.category != null && (
              <div>
                <dt className="text-gray-500">Domain</dt>
                <dd className="font-medium text-[#111827] capitalize">{request.category}</dd>
              </div>
            )}
            {(request.confidence ?? request.ai_confidence) != null && (
              <div>
                <dt className="text-gray-500">Confidence</dt>
                <dd className="font-medium text-[#111827]">{Math.round((Number(request.confidence ?? request.ai_confidence)) * 100)}%</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Request description */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <h2 className="text-base font-semibold text-[#111827] mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#7C3AED]" />
          Request description
        </h2>
        <p className="text-sm text-[#111827] leading-relaxed whitespace-pre-wrap">
          {request.description || request.title || "No description provided."}
        </p>
      </div>

      {/* Request timeline */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <h2 className="text-base font-semibold text-[#111827] mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#7C3AED]" />
          Request timeline
        </h2>
        <ul className="relative space-y-0">
          {timelineSteps.map((step, idx) => {
            const Icon = step.icon;
            const isDone = currentStep > idx;
            const isCurrent = currentStep === idx;
            const stepLabel = step.key === "routed" ? `Routed to ${deptDisplayName} department` : step.label;
            const timestamp = idx === 0 ? createdStr : isDone || isCurrent ? (idx === 4 && (request.status === "resolved" || request.status === "rejected") && updatedStr ? updatedStr : isCurrent ? "In progress" : createdStr) : "Waiting";
            return (
              <li key={step.key} className="flex gap-4 pb-6 last:pb-0">
                <div className="relative flex flex-col items-center flex-shrink-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      isDone ? "bg-[#7C3AED] border-[#7C3AED] text-white" : isCurrent ? "bg-white border-[#7C3AED] text-[#7C3AED]" : "bg-white border-gray-200 text-gray-400"
                    }`}
                  >
                    {isDone ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  {idx < timelineSteps.length - 1 && (
                    <div className="absolute top-10 left-1/2 w-0.5 h-full -translate-x-1/2 bg-gray-200" style={{ minHeight: "24px" }} />
                  )}
                </div>
                <div className="pt-1 min-w-0">
                  <p className="font-medium text-[#111827]">{stepLabel}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{timestamp}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Conversation thread */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <h2 className="text-base font-semibold text-[#111827] mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#7C3AED]" />
          Conversation
        </h2>
        <ul className="space-y-3 mb-4">
          {messages.length === 0 && (
            <li className="text-sm text-gray-500 py-2">No messages yet.</li>
          )}
          {messages.map((m: MessagePayload) => {
            const isRequester = m.sender_id === request.requester_id;
            return (
              <li
                key={m.id}
                className={`flex ${isRequester ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm ${
                    isRequester
                      ? "bg-[#7C3AED]/10 text-[#111827] border border-[#7C3AED]/20"
                      : "bg-gray-100 text-[#111827] border border-gray-200"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.message_text}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(m.created_at).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
        {user?.id && (
          <div className="flex gap-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
            />
            <button
              type="button"
              onClick={() => comment.trim() && addMessageMutation.mutate()}
              disabled={!comment.trim() || addMessageMutation.isPending}
              className="px-4 py-2 bg-[#7C3AED] text-white rounded-lg text-sm font-medium hover:bg-[#6D28D9] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        )}
      </div>

      {/* Suggested response (for agents/admins) */}
      {(user?.role === "agent" || user?.role === "admin") && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
          <h2 className="text-base font-semibold text-[#111827] mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Suggested response
          </h2>
          {suggestedResponseText != null ? (
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-100 text-sm text-[#111827] whitespace-pre-wrap">
              {suggestedResponseText}
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSuggestResponse}
              className="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium hover:bg-amber-200"
            >
              Get suggested response
            </button>
          )}
        </div>
      )}

      {/* Feedback (when resolved, for requester) */}
      {request.status === "resolved" && isOwner && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
          <h2 className="text-base font-semibold text-[#111827] mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            Rate this request
          </h2>
          {existingFeedback ? (
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 text-sm">
              <p className="font-medium text-[#111827]">
                Your rating: {existingFeedback.rating}/5
                {existingFeedback.comment && (
                  <span className="block text-gray-600 mt-1">{existingFeedback.comment}</span>
                )}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Rating:</span>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setFeedbackRating(String(n))}
                    className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                      feedbackRating === String(n)
                        ? "border-amber-500 bg-amber-50 text-amber-700"
                        : "border-gray-200 hover:border-amber-300"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <textarea
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="Optional comment..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20"
              />
              <button
                type="button"
                onClick={() => feedbackRating && submitFeedbackMutation.mutate()}
                disabled={!feedbackRating || submitFeedbackMutation.isPending}
                className="px-4 py-2 bg-[#7C3AED] text-white rounded-lg text-sm font-medium hover:bg-[#6D28D9] disabled:opacity-50"
              >
                Submit feedback
              </button>
            </div>
          )}
        </div>
      )}

      {/* Agent activity */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <h2 className="text-base font-semibold text-[#111827] mb-4">Agent activity</h2>
        <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 border border-gray-100">
          <div className="w-10 h-10 rounded-full bg-[#7C3AED]/10 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-[#7C3AED]" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-[#111827]">{assignedToDisplay}</p>
            <p className="text-sm text-gray-600 mt-0.5">
              {request.status === "new"
                ? "Request is in queue; an agent will pick it up shortly."
                : request.status === "in_progress"
                  ? "Started processing the request."
                  : request.status === "resolved" || request.status === "rejected"
                    ? "Request has been closed."
                    : "No activity yet."}
            </p>
            {(updatedStr || createdStr) && (
              <p className="text-xs text-gray-500 mt-2">
                {request.status === "new" ? `Submitted ${createdStr}` : `Last update ${updatedStr ?? createdStr}`}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
