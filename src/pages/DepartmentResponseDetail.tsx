import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../auth/useAuth";
import { fetchRequestById } from "../api/requests";
import { fetchDepartments } from "../api/departments";
import {
  ArrowLeft,
  User,
  Building2,
  MessageSquare,
  Sparkles,
  Clock3,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Flame,
} from "lucide-react";

const statusLabel: Record<string, string> = {
  new: "Pending",
  in_progress: "In Progress",
  resolved: "Resolved",
  rejected: "Rejected",
};

const statusBadge: Record<string, string> = {
  new: "bg-amber-100 text-amber-700 border-amber-200",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
  resolved: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

const priorityBadge: Record<string, string> = {
  High: "bg-red-100 text-red-700 border-red-200",
  Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Low: "bg-blue-100 text-blue-700 border-blue-200",
};

function currentTimelineStep(status: string): number {
  if (status === "in_progress") return 3;
  if (status === "resolved") return 4;
  return 2;
}

export function DepartmentResponseDetail() {
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

  useEffect(() => {
    if (!id) navigate("/department-responses");
  }, [id, navigate]);

  useEffect(() => {
    if (loading || error || !request || !user) return;
    const isOwner = request.requester_id === user.id;
    if (user.role === "user" && !isOwner) navigate("/department-responses");
  }, [loading, error, request, user, navigate]);

  const { data: departments = [] } = useQuery({ queryKey: ["departments"], queryFn: fetchDepartments });
  const getDeptName = (deptId: string) => departments.find((d) => d.id === deptId)?.name ?? deptId;

  if (!id) return null;
  if (loading) return <div className="text-gray-500 p-6">Loading…</div>;
  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-red-600">{error}</div>
        <button type="button" onClick={() => navigate("/department-responses")} className="text-[#7C3AED] hover:underline">
          Back to Department Responses
        </button>
      </div>
    );
  }
  if (!request) return null;

  const isOwner = user?.id && request.requester_id === user.id;
  if (!isOwner && user?.role === "user") return null;

  const req = request as typeof request & { assigned_agent_name?: string; assigned_agent?: string; department_reply?: string };
  const agentName = req.assigned_agent_name ?? req.assigned_agent ?? "—";
  const departmentReply = req.department_reply ?? null;
  const deptName = getDeptName(request.department_id);
  const createdStr = new Date(request.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  const updatedStr = (request as { updated_at?: string }).updated_at
    ? new Date((request as { updated_at: string }).updated_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : createdStr;
  const step = currentTimelineStep(request.status);
  const slaText = (() => {
    if (!request.sla_deadline) return null;
    const diff = new Date(request.sla_deadline).getTime() - Date.now();
    const mins = Math.round(Math.abs(diff) / 60000);
    const h = Math.floor(mins / 60);
    const v = h > 0 ? `${h}h ${mins % 60}m` : `${mins}m`;
    return diff < 0 ? `Overdue by ${v}` : `${v} remaining`;
  })();

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={() => navigate("/department-responses")}
        className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-[#111827]"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Department Responses
      </button>

      <header className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h1 className="text-xl font-semibold text-[#111827]">{request.title || "Request conversation"}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 font-mono text-xs text-gray-600">
            {request.id}
          </span>
          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadge[request.status] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}>
            {statusLabel[request.status] ?? request.status}
          </span>
          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityBadge[request.priority] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}>
            {request.priority}
          </span>
          <span className="text-xs text-gray-500">Created {createdStr}</span>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[7fr_3fr]">
        <section className="min-w-0">
          <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="text-base font-semibold text-[#111827]">Conversation</h2>
              <p className="mt-1 text-sm text-gray-500">Request updates from your assigned department</p>
            </div>
            <div className="space-y-5 p-6">
              {/* User request */}
              <div className="flex justify-end">
                <div className="max-w-[70%]">
                  <div className="rounded-2xl rounded-br-md bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] px-4 py-3 text-sm text-white shadow-sm">
                    {request.title || request.description || "—"}
                  </div>
                  <p className="mt-1 text-right text-[11px] text-gray-400">You · {createdStr}</p>
                </div>
              </div>

              {/* Department reply */}
              {departmentReply ? (
                <div className="flex justify-start gap-2.5">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="max-w-[70%]">
                    <div className="rounded-2xl rounded-bl-md border border-gray-200 bg-white px-4 py-3 text-sm text-[#111827] shadow-sm">
                      {departmentReply}
                    </div>
                    <p className="mt-1 text-[11px] text-gray-400">
                      {deptName} {agentName !== "—" && `· ${agentName}`} · {updatedStr}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gradient-to-b from-gray-50 to-white px-6 py-10 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Your request has been routed. An agent will respond shortly.</p>
                  <p className="mt-1 text-xs text-gray-500">You can continue monitoring updates on this page.</p>
                </div>
              )}
            </div>
          </article>
        </section>

        <aside className="space-y-4">
          <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Request details</h3>
            <div className="mt-3 space-y-2 text-sm">
              <p className="inline-flex items-center gap-2 text-gray-700">
                <Building2 className="h-4 w-4 text-violet-500" />
                <span className="font-medium">Department:</span> {deptName}
              </p>
              <p className="inline-flex items-center gap-2 text-gray-700">
                <Flame className="h-4 w-4 text-amber-500" />
                <span className="font-medium">Priority:</span> {request.priority}
              </p>
              <p className="inline-flex items-center gap-2 text-gray-700">
                <User className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Assigned agent:</span> {agentName === "—" ? "Not assigned yet" : agentName}
              </p>
              {slaText && (
                <p className={`inline-flex items-center gap-2 rounded-lg border px-2 py-1 text-xs font-medium ${
                  slaText.startsWith("Overdue")
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-green-200 bg-green-50 text-green-700"
                }`}>
                  {slaText.startsWith("Overdue") ? <AlertTriangle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  SLA: {slaText}
                </p>
              )}
            </div>
          </article>

          <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Timeline</h3>
            <ul className="relative mt-3 space-y-3 border-l border-gray-200 pl-3">
              {[
                { key: "submitted", label: "Submitted", active: step >= 1, time: createdStr },
                { key: "routed", label: "Routed", active: step >= 2, time: createdStr },
                { key: "waiting", label: "Waiting", active: request.status === "new", time: request.status === "new" ? "Current" : "Passed" },
                { key: "in_progress", label: "In progress", active: step >= 3, time: request.status === "in_progress" ? updatedStr : "Pending" },
                { key: "resolved", label: "Resolved", active: step >= 4, time: request.status === "resolved" ? updatedStr : "Pending" },
              ].map((t) => (
                <li key={t.key} className="relative">
                  <span className={`absolute -left-[18px] top-1 h-2.5 w-2.5 rounded-full ${
                    t.active ? "bg-violet-600 ring-2 ring-violet-100" : "bg-gray-300"
                  }`} />
                  <p className={`text-sm font-medium ${t.active ? "text-[#111827]" : "text-gray-500"}`}>{t.label}</p>
                  <p className="text-xs text-gray-500">{t.time}</p>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Status overview</h3>
            <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
              {request.status === "in_progress" ? <Loader2 className="h-4 w-4 text-blue-600" /> : <CheckCircle2 className="h-4 w-4 text-violet-600" />}
              {statusLabel[request.status] ?? request.status}
            </div>
            <p className="mt-2 text-xs text-gray-500">Last update: {updatedStr}</p>
          </article>
        </aside>
      </div>
    </div>
  );
}
