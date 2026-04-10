import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../auth/useAuth";
import { fetchAllRequests } from "../api/requests";
import { fetchDepartments } from "../api/departments";
import {
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleDot,
  Clock3,
  Copy,
  ExternalLink,
  ListTodo,
  Loader2,
  MessageSquare,
  Search,
} from "lucide-react";
import { toast } from "sonner";

const statusBadge: Record<string, string> = {
  new: "bg-amber-100 text-amber-700 border-amber-200",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
  resolved: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};
const statusLabel: Record<string, string> = {
  new: "Pending",
  in_progress: "In Progress",
  resolved: "Resolved",
  rejected: "Rejected",
};
const priorityMeta: Record<string, { label: string; icon: string; className: string }> = {
  High: { label: "High", icon: "🔴", className: "bg-red-100 text-red-700 border-red-200" },
  Medium: { label: "Medium", icon: "🟡", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  Low: { label: "Low", icon: "🔵", className: "bg-blue-100 text-blue-700 border-blue-200" },
};

const statusTabs = [
  { id: "all", label: "All" },
  { id: "new", label: "Pending" },
  { id: "in_progress", label: "In Progress" },
  { id: "resolved", label: "Resolved" },
] as const;

type SortBy = "newest" | "oldest" | "priority";

function cleanTitle(rawTitle?: string): string {
  if (!rawTitle) return "Untitled request";
  let cleaned = rawTitle
    .replace(/\bUrgency\s*:\s*(High|Medium|Low)\b/gi, "")
    .replace(/\bDetails?\s*:\s*.+$/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  cleaned = cleaned.replace(/[;,\-:]+$/g, "").trim();
  return cleaned || "Untitled request";
}

function buildDescription(rawTitle: string | undefined, fallback?: string): string {
  if (fallback?.trim()) return fallback.trim();
  if (!rawTitle) return "No additional description.";
  const match = rawTitle.match(/Details?\s*:\s*(.+)$/i);
  if (match?.[1]) return match[1].trim();
  return "No additional description.";
}

function statusBarClass(status: string): string {
  if (status === "new") return "bg-amber-400";
  if (status === "in_progress") return "bg-blue-500";
  if (status === "resolved") return "bg-green-500";
  return "bg-red-400";
}

function relativeUpdated(value?: string): string {
  if (!value) return "Updated recently";
  const then = new Date(value).getTime();
  const diffMs = Date.now() - then;
  if (diffMs < 60 * 1000) return "Updated just now";
  const mins = Math.floor(diffMs / (60 * 1000));
  if (mins < 60) return `Updated ${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Updated ${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `Updated ${days} day${days > 1 ? "s" : ""} ago`;
}

function progressStep(status: string): 1 | 2 | 3 {
  if (status === "in_progress") return 2;
  if (status === "resolved") return 3;
  return 1;
}

export function MyRequests() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statusTabs)[number]["id"]>("all");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 8;

  const { data: requests = [], isLoading, error } = useQuery({
    queryKey: ["requests"],
    queryFn: fetchAllRequests,
  });
  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
  });

  const myRequests = useMemo(() => {
    if (!user) return [];
    if (user.id) return requests.filter((r) => r.requester_id === user.id);
    const ids = [...new Set(requests.map((r) => r.requester_id).filter(Boolean))];
    if (ids.length === 1) return requests.filter((r) => r.requester_id === ids[0]);
    return requests;
  }, [requests, user]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const priorityRank: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
    const next = myRequests.filter((r) => {
      const title = cleanTitle(r.title);
      const matchSearch = !q || title.toLowerCase().includes(q) || r.id?.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || r.status === statusFilter;
      const matchPriority = !priorityFilter || r.priority === priorityFilter;
      const matchDepartment = !departmentFilter || r.department_id === departmentFilter;
      return matchSearch && matchStatus && matchPriority && matchDepartment;
    });
    return [...next].sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === "priority") {
        return (priorityRank[b.priority] ?? 0) - (priorityRank[a.priority] ?? 0);
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [myRequests, search, statusFilter, priorityFilter, departmentFilter, sortBy]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const departmentsUsed = useMemo(
    () =>
      departments.filter((d) =>
        myRequests.some((r) => r.department_id === d.id)
      ),
    [departments, myRequests]
  );

  const getDeptName = (id: string) => departments.find((d) => d.id === id)?.name ?? "—";

  const statusCount = useMemo(() => {
    return {
      all: myRequests.length,
      new: myRequests.filter((r) => r.status === "new").length,
      in_progress: myRequests.filter((r) => r.status === "in_progress").length,
      resolved: myRequests.filter((r) => r.status === "resolved").length,
    };
  }, [myRequests]);

  function copyRequestId(id: string) {
    navigator.clipboard
      .writeText(id)
      .then(() => toast.success("Request ID copied"))
      .catch(() => toast.error("Unable to copy ID"));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#111827] flex items-center gap-2">
          <ListTodo className="w-6 h-6 text-[#7C3AED]" />
          My Requests
        </h1>
        <p className="text-sm text-gray-500 mt-1">Track your submitted requests</p>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
          {String(error)}
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-2">
          {statusTabs.map((tab) => {
            const active = statusFilter === tab.id;
            const count = statusCount[tab.id as keyof typeof statusCount] ?? 0;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.id);
                  setPage(1);
                }}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "border-[#7C3AED]/40 bg-[#7C3AED]/10 text-[#6D28D9]"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {tab.label}
                <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] text-gray-500 ring-1 ring-gray-200">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
          />
        </div>
        <select
          value={priorityFilter}
          onChange={(e) => {
            setPriorityFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 rounded-xl border border-gray-200 bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 min-w-[140px]"
        >
          <option value="">All priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <select
          value={departmentFilter}
          onChange={(e) => {
            setDepartmentFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 rounded-xl border border-gray-200 bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 min-w-[150px]"
        >
          <option value="">All departments</option>
          {departmentsUsed.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as SortBy);
              setPage(1);
            }}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 min-w-[130px]"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="priority">Priority</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 inline-flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading requests...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <ListTodo className="h-5 w-5" />
            </div>
            <p className="text-base font-semibold text-gray-700">No requests yet</p>
            <p className="mt-1 text-sm text-gray-500">Create your first request and track progress here.</p>
            <button
              type="button"
              onClick={() => navigate("/chat")}
              className="mt-4 rounded-xl bg-[#7C3AED] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6D28D9]"
            >
              Create request
            </button>
          </div>
        ) : (
          <div className="space-y-2 bg-slate-50/50 p-3">
            {paginated.map((r, idx) => {
              const open = expandedId === r.id;
              const cleanedTitle = cleanTitle(r.title);
              const description = buildDescription(r.title, r.description);
              const priority = priorityMeta[r.priority] ?? {
                label: r.priority,
                icon: "⚪",
                className: "bg-gray-100 text-gray-700 border-gray-200",
              };
              const step = progressStep(r.status);

              return (
                <div key={r.id} className={`rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md ${idx % 2 ? "bg-slate-50/30" : ""}`}>
                  <button
                    type="button"
                    onClick={() => setExpandedId((prev) => (prev === r.id ? null : r.id))}
                    className="flex w-full items-start gap-4 px-4 py-4 text-left"
                  >
                    <span className={`mt-0.5 h-14 w-1 rounded-full ${statusBarClass(r.status)}`} />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-base font-semibold text-[#111827]">{cleanedTitle}</p>
                          <p className="mt-1 truncate text-sm text-gray-500">{description}</p>
                        </div>
                        <div className="inline-flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${priority.className}`}>
                            <span>{priority.icon}</span>
                            {priority.label}
                          </span>
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadge[r.status] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}>
                            {statusLabel[r.status] ?? r.status}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <CalendarClock className="h-3.5 w-3.5" />
                          {new Date(r.created_at).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" />
                          {getDeptName(r.department_id)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="h-3.5 w-3.5" />
                          {relativeUpdated(r.updated_at ?? r.created_at)}
                        </span>
                        <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                          {r.id}
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              copyRequestId(r.id);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                e.stopPropagation();
                                copyRequestId(r.id);
                              }
                            }}
                            className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </span>
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/my-requests/${r.id}`);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                        >
                          View details
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/chat");
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          Open chat
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/my-requests/${r.id}`);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Track status
                        </button>
                        <span className="ml-auto inline-flex items-center text-xs text-gray-400">
                          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </span>
                      </div>
                    </div>
                  </button>

                  {open && (
                    <div className="border-t border-gray-100 bg-slate-50/60 px-5 py-4">
                      <div className="grid gap-4 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                          <h4 className="text-sm font-semibold text-gray-700">Description</h4>
                          <p className="mt-1 text-sm text-gray-600">{description}</p>
                          <div className="mt-4">
                            <h4 className="text-sm font-semibold text-gray-700">Status progress</h4>
                            <div className="mt-2 flex items-center gap-2 text-xs">
                              {["Submitted", "In Progress", "Resolved"].map((label, i) => {
                                const active = i + 1 <= step;
                                return (
                                  <div key={label} className="flex items-center gap-2">
                                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 ${active ? "bg-violet-100 text-violet-700" : "bg-gray-100 text-gray-500"}`}>
                                      <CircleDot className="h-3 w-3" />
                                      {label}
                                    </span>
                                    {i < 2 && <span className="h-px w-6 bg-gray-300" />}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 rounded-xl border border-gray-200 bg-white p-3 text-sm">
                          <p className="inline-flex items-center gap-2 text-gray-600">
                            <CheckCircle2 className="h-4 w-4 text-violet-500" />
                            <span className="font-medium text-gray-700">Assigned agent:</span>{" "}
                            {r.assigned_agent_name || r.assigned_agent || "Unassigned"}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium text-gray-700">Last update:</span>{" "}
                            {r.updated_at
                              ? new Date(r.updated_at).toLocaleString(undefined, {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })
                              : "No updates yet"}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium text-gray-700">Timeline:</span>{" "}
                            {statusLabel[r.status] ?? r.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="flex items-center justify-between pt-2 text-sm">
              <p className="text-gray-500">
                Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}-
                {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-xs font-semibold text-gray-500">
                  Page {page} / {pageCount}
                </span>
                <button
                  type="button"
                  disabled={page >= pageCount}
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
