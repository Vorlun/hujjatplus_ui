import { useEffect, useMemo, useRef, useState } from "react";
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
  AlertTriangle,
  Building2,
  Flame,
  Sparkles,
  Paperclip,
  MoreHorizontal,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";

const priorityStyles: Record<string, string> = {
  High: "bg-red-100 text-red-700 border-red-200",
  Medium: "bg-amber-100 text-amber-700 border-amber-200",
  Low: "bg-blue-100 text-blue-700 border-blue-200",
};

const statusBadgeStyles: Record<string, string> = {
  new: "bg-amber-100 text-amber-700 border-amber-200",
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

const statusIndicatorStyles: Record<string, string> = {
  submitted: "bg-violet-100 text-violet-700 border-violet-200",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
  waiting: "bg-amber-100 text-amber-700 border-amber-200",
  resolved: "bg-green-100 text-green-700 border-green-200",
};

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

function cleanTitle(rawTitle?: string): string {
  if (!rawTitle) return "Request";
  const normalized = rawTitle
    .replace(/\bUrgency\s*:\s*(High|Medium|Low)\b/gi, "")
    .replace(/\bDetails?\s*:\s*.+$/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  const errorCode =
    normalized.match(/\b(?:error|xatolik(?:\s*kodi)?)\s*[:#-]?\s*(\d{3,4})\b/i)?.[1] ??
    normalized.match(/\b(\d{3,4})\b/)?.[1];
  let base = normalized
    .replace(/\b(?:error|xatolik(?:\s*kodi)?)\s*[:#-]?\s*\d{3,4}\b/gi, "")
    .replace(/[,:-]\s*$/, "")
    .trim();
  if (!base) base = normalized;
  if (errorCode && !base.toLowerCase().includes(`error ${errorCode}`)) {
    return `${base} (Error ${errorCode})`;
  }
  return base;
}

function minutesKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}-${d.getMinutes()}`;
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
  const [agentTyping, setAgentTyping] = useState(false);
  const [noteMode, setNoteMode] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const addMessageMutation = useMutation({
    mutationFn: () => sendMessage(id!, comment.trim(), user!.id),
    onSuccess: () => {
      setComment("");
      refetchMessages();
      queryClient.invalidateQueries({ queryKey: ["request", id] });
      setAgentTyping(false);
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

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, agentTyping]);

  const groupedMessages = useMemo(() => {
    return messages.map((m: MessagePayload, idx) => {
      const prev = messages[idx - 1] as MessagePayload | undefined;
      const grouped =
        !!prev &&
        prev.sender_id === m.sender_id &&
        minutesKey(prev.created_at) === minutesKey(m.created_at);
      return { item: m, grouped };
    });
  }, [messages]);

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
  const cleanedTitle = cleanTitle(request.title || request.description || "Request");
  const confidenceValue = request.confidence ?? request.ai_confidence;
  const slaMeta = (() => {
    if (!request.sla_deadline) return null;
    const now = Date.now();
    const dl = new Date(request.sla_deadline).getTime();
    const diff = dl - now;
    const mins = Math.round(Math.abs(diff) / 60000);
    const hours = Math.floor(mins / 60);
    const rem = hours > 0 ? `${hours}h ${mins % 60}m` : `${mins}m`;
    if (diff < 0) {
      return {
        overdue: true,
        label: `Overdue by ${rem}`,
      };
    }
    return {
      overdue: false,
      label: `${rem} remaining`,
    };
  })();

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
  function handleSendMessage() {
    if (!comment.trim() || addMessageMutation.isPending) return;
    setAgentTyping(true);
    addMessageMutation.mutate();
  }
  function handleQuickStatusAction(action: "close" | "reopen" | "note") {
    if (action === "note") {
      setNoteMode(true);
      setComment((prev) => (prev ? prev : "Internal note: "));
      return;
    }
    if (action === "close") {
      setComment("Please close this request.");
      toast.message("Close request drafted in reply box.");
      return;
    }
    setComment("Please reopen this request.");
    toast.message("Reopen request drafted in reply box.");
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => navigate("/my-requests")}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#111827]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Requests
      </button>

      <header className="sticky top-14 z-20 rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold text-[#111827]">{cleanedTitle}</h1>
            <p className="mt-1 text-xs text-gray-500">
              Created {createdStr}
              {updatedStr ? ` • Last updated ${updatedStr}` : ""}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadgeStyles[request.status] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}>
                {formatStatusLabel(request.status)}
              </span>
              <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityStyles[request.priority] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}>
                {request.priority}
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-xs font-mono text-gray-600 transition hover:bg-gray-50"
              >
                <Copy className="h-3.5 w-3.5" />
                {copied ? "Copied" : request.id}
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50">Assign</button>
            <button type="button" className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50">Change Status</button>
            <button type="button" onClick={handleShare} className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"><Share2 className="h-3.5 w-3.5" />Share</button>
            <button type="button" onClick={handleDownload} className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"><Download className="h-3.5 w-3.5" />Download</button>
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[7fr_3fr]">
        <section className="min-w-0 space-y-4">
          <article className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-base font-semibold text-[#111827]">Conversation</h2>
              <p className="mt-1 text-sm text-gray-500">Conversation-first support thread</p>
            </div>

            <div ref={messagesContainerRef} className="max-h-[68vh] space-y-3 overflow-y-auto px-5 py-4">
              {groupedMessages.length === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gradient-to-b from-gray-50 to-white px-4 py-10 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">No conversation yet</p>
                  <p className="mt-1 text-sm text-gray-500">Agent will respond shortly.</p>
                  <p className="mt-1 text-xs text-gray-400">Share details or attach a file below to speed up support.</p>
                </div>
              )}
              {groupedMessages.map(({ item: m, grouped }) => {
                const isRequester = m.sender_id === request.requester_id;
                const text = m.message_text ?? "";
                const imageMatch = text.match(/https?:\/\/\S+\.(png|jpg|jpeg|gif|webp)/i);
                const fileMatch = text.match(/https?:\/\/\S+\.(pdf|doc|docx|xls|xlsx|txt)/i);
                return (
                  <div key={m.id} className={`group flex ${isRequester ? "justify-end" : "justify-start"} ${grouped ? "-mt-1" : "mt-2"}`}>
                    <div className={`flex max-w-[72%] items-end gap-2 ${isRequester ? "flex-row-reverse" : ""}`}>
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isRequester ? "bg-violet-600 text-white" : "bg-white text-violet-600 ring-1 ring-gray-200"}`}>
                        {isRequester ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                      </div>
                      <div className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${isRequester ? "rounded-br-md bg-gradient-to-r from-violet-600 to-purple-600 text-white" : "rounded-bl-md border border-gray-200 bg-white text-[#111827]"}`}>
                        <p className="whitespace-pre-wrap">{text}</p>
                        {imageMatch?.[0] && (
                          <a href={imageMatch[0]} target="_blank" rel="noreferrer" className="mt-2 block overflow-hidden rounded-lg border border-gray-200">
                            <img src={imageMatch[0]} alt="Attachment preview" className="max-h-52 w-full object-cover" />
                          </a>
                        )}
                        {fileMatch?.[0] && (
                          <a href={fileMatch[0]} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100">
                            <Paperclip className="h-3.5 w-3.5" />
                            Attached file
                          </a>
                        )}
                        <p className={`mt-1 text-[10px] opacity-0 transition group-hover:opacity-80 ${isRequester ? "text-right text-violet-100" : "text-gray-400"}`}>
                          {new Date(m.created_at).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {(addMessageMutation.isPending || agentTyping) && (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 shadow-sm">
                    Agent is typing...
                    <span className="inline-flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.2s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.1s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 border-t border-gray-100 bg-white px-5 py-3">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => handleQuickStatusAction("close")} className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50">Close request</button>
                <button type="button" onClick={() => handleQuickStatusAction("reopen")} className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50">Reopen</button>
                <button type="button" onClick={() => handleQuickStatusAction("note")} className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50">Add note</button>
              </div>
              {user?.id && (
                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    disabled={addMessageMutation.isPending || agentTyping}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={noteMode ? "Reply with note..." : "Reply..."}
                    disabled={addMessageMutation.isPending || agentTyping}
                    className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={!comment.trim() || addMessageMutation.isPending || agentTyping}
                    className="inline-flex items-center gap-1 rounded-xl bg-violet-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    Send
                  </button>
                </div>
              )}
            </div>
          </article>
        </section>

        <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
          <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Request details</h3>
            <div className="mt-3 space-y-2 text-sm">
              <p className="flex items-center gap-2 text-gray-700"><Building2 className="h-4 w-4 text-violet-500" /> <span className="font-medium">Department:</span> {deptDisplayName}</p>
              <p className="flex items-center gap-2 text-gray-700"><Flame className="h-4 w-4 text-amber-500" /> <span className="font-medium">Priority:</span> {request.priority}</p>
              <p className="flex items-center gap-2 text-gray-700"><User className="h-4 w-4 text-blue-500" /> <span className="font-medium">Agent:</span> {assignedToDisplay}</p>
              <p className="text-xs text-gray-500">Created {createdStr}</p>
              {updatedStr && <p className="text-xs text-gray-500">Last update {updatedStr}</p>}
            </div>
          </article>

          {slaMeta && (
            <article className={`rounded-2xl border p-4 shadow-sm ${slaMeta.overdue ? "border-red-200 bg-red-50/80" : "border-green-200 bg-green-50/70"}`}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-600">SLA</h3>
              <div className="mt-2 flex items-center gap-2">
                {slaMeta.overdue ? <AlertTriangle className="h-4 w-4 text-red-600" /> : <CheckCircle className="h-4 w-4 text-green-600" />}
                <p className={`text-sm font-semibold ${slaMeta.overdue ? "text-red-700" : "text-green-700"}`}>{slaMeta.overdue ? slaMeta.label : "On track"}</p>
              </div>
              <p className="mt-1 text-xs text-gray-600">{slaMeta.label}</p>
            </article>
          )}

          <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Timeline</h3>
            <ul className="relative mt-3 space-y-3 pl-3">
              <span className="absolute left-[1px] top-0 h-full w-[2px] rounded-full bg-gradient-to-b from-violet-300 via-blue-300 to-green-300" />
              {[
                { key: "submitted", label: "Submitted", icon: "✔", active: currentStep >= 0, time: createdStr },
                { key: "in_progress", label: "In progress", icon: "🔄", active: currentStep >= 3, time: request.status === "in_progress" ? "Current" : updatedStr ?? "Waiting" },
                { key: "waiting", label: "Waiting", icon: "⏳", active: request.status === "new", time: request.status === "new" ? "Current" : "Passed" },
                { key: "resolved", label: "Resolved", icon: "✅", active: request.status === "resolved", time: request.status === "resolved" ? updatedStr ?? createdStr : "Pending" },
              ].map((item) => (
                <li key={item.key} className="relative">
                  <span className={`absolute -left-[18px] top-1 h-2.5 w-2.5 rounded-full ring-2 ring-white ${item.active ? "bg-violet-600" : "bg-gray-300"}`} />
                  <p className={`text-sm font-medium ${item.active ? "text-[#111827]" : "text-gray-500"}`}>{item.icon} {item.label}</p>
                  <p className="text-xs text-gray-500">{item.time}</p>
                </li>
              ))}
            </ul>
          </article>

          {(request.intent != null || confidenceValue != null || request.category) && (
            <article className="rounded-2xl border border-violet-200 bg-violet-50/70 p-4 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-violet-700">AI insights</h3>
              <p className="mt-2 text-sm text-[#111827]">
                AI detected this as <span className="font-semibold capitalize">{request.category ?? request.intent ?? "general issue"}</span>
                {confidenceValue != null && (
                  <> ({Math.round(Number(confidenceValue) * 100)}% confidence)</>
                )}
              </p>
              {confidenceValue != null && (
                <div className="mt-2">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-violet-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                      style={{ width: `${Math.max(0, Math.min(100, Math.round(Number(confidenceValue) * 100)))}%` }}
                    />
                  </div>
                </div>
              )}
              <p className="mt-1 text-sm text-violet-800">Recommended team: {deptDisplayName} Support</p>
              <p className="mt-1 text-xs text-violet-700/80">Recommendation: route to Level-1 queue for faster first response.</p>
            </article>
          )}

          <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Agent activity</h3>
            <ul className="mt-3 space-y-3 border-l border-gray-200 pl-3 text-sm">
              <li className="relative">
                <span className="absolute -left-[18px] top-1.5 h-2.5 w-2.5 rounded-full bg-violet-500 ring-2 ring-white" />
                <p className="font-medium text-gray-700">Assigned to {assignedToDisplay}</p>
                <p className="text-xs text-gray-500">{createdStr}</p>
              </li>
              <li className="relative">
                <span className="absolute -left-[18px] top-1.5 h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-white" />
                <p className="font-medium text-gray-700">Agent viewed request</p>
                <p className="text-xs text-gray-500">{updatedStr ?? createdStr}</p>
              </li>
              <li className="relative">
                <span className="absolute -left-[18px] top-1.5 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
                <p className="font-medium text-gray-700">Status changed to {formatStatusLabel(request.status)}</p>
                <p className="text-xs text-gray-500">{updatedStr ?? createdStr}</p>
              </li>
            </ul>
          </article>

          {(user?.role === "agent" || user?.role === "admin") && (
            <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Suggested response</h3>
              {suggestedResponseText != null ? (
                <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 p-3 text-sm text-[#111827] whitespace-pre-wrap">
                  {suggestedResponseText}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSuggestResponse}
                  className="mt-3 rounded-xl bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-200"
                >
                  <Lightbulb className="mr-1 inline h-4 w-4" />
                  Get suggestion
                </button>
              )}
            </article>
          )}

          {request.status === "resolved" && isOwner && (
            <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Feedback</h3>
              {existingFeedback ? (
                <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm">
                  <p className="font-medium text-[#111827]">Your rating: {existingFeedback.rating}/5</p>
                  {existingFeedback.comment && <p className="mt-1 text-gray-600">{existingFeedback.comment}</p>}
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setFeedbackRating(String(n))}
                        className={`h-8 w-8 rounded-full border text-xs font-semibold ${
                          feedbackRating === String(n) ? "border-amber-500 bg-amber-50 text-amber-700" : "border-gray-200 text-gray-500 hover:border-amber-300"
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
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
                  />
                  <button
                    type="button"
                    onClick={() => feedbackRating && submitFeedbackMutation.mutate()}
                    disabled={!feedbackRating || submitFeedbackMutation.isPending}
                    className="rounded-xl bg-violet-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
                  >
                    <Star className="mr-1 inline h-4 w-4" />
                    Submit feedback
                  </button>
                </div>
              )}
            </article>
          )}
        </aside>
      </div>
    </div>
  );
}
