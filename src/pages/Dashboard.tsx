import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  PlusCircle,
  Upload,
  MessageSquare,
  Search,
  Clock,
  Cpu,
  GitBranch,
  UserCheck,
  CheckCircle,
  FileText,
  Download,
  Eye,
  Send,
  Loader,
  Loader2,
  X,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { useAuth } from "../auth/useAuth";
import { fetchAllRequests, createRequest } from "../api/requests";
import { fetchDepartments } from "../api/departments";
import { fetchAllDocuments, type DocumentItem } from "../api/documents";
import { Skeleton, TableRowSkeleton } from "../components/ui/Skeleton";

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
const priorityBadge: Record<string, string> = {
  High: "bg-red-100 text-red-600 border-red-200",
  Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Low: "bg-blue-100 text-blue-600 border-blue-200",
};

const timelineBase = [
  { key: "submitted", icon: MessageSquare, label: "Request submitted" },
  { key: "classified", icon: Cpu, label: "AI classified request" },
  { key: "routed", icon: GitBranch, label: "Request routed to department" },
  { key: "agent", icon: UserCheck, label: "Agent started processing" },
  { key: "resolved", icon: CheckCircle, label: "Request resolved" },
];

type DocCategory = "All" | "HR" | "Finance" | "IT";

function extractFileType(fileUrl: string): string {
  const ext = fileUrl.split(".").pop()?.toUpperCase() ?? "FILE";
  if (ext === "PDF") return "PDF";
  if (ext === "DOC" || ext === "DOCX") return "DOC";
  return ext;
}

function formatUploadDate(createdAt?: string): string {
  if (!createdAt) return "Unknown date";
  return new Date(createdAt).toLocaleDateString(undefined, { dateStyle: "medium" });
}

function inferCategory(doc: DocumentItem, deptName: string): Exclude<DocCategory, "All"> {
  const text = `${doc.title} ${deptName}`.toLowerCase();
  if (text.includes("finance") || text.includes("invoice") || text.includes("expense")) return "Finance";
  if (text.includes("it") || text.includes("tech") || text.includes("support")) return "IT";
  return "HR";
}

function docSummary(doc: DocumentItem, deptName: string): string {
  return `AI summary: ${doc.title} is a ${extractFileType(doc.file_url)} document for ${deptName}.`;
}

export function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [quickText, setQuickText] = useState("");
  const [lastResult, setLastResult] = useState<{ department: string; priority: string } | null>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [docSearch, setDocSearch] = useState("");
  const [docCategory, setDocCategory] = useState<DocCategory>("All");
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const placeholderPhrases = [
    "Muammoingizni yozing... AI avtomatik aniqlaydi",
    "Masalan: Ish haqi hujjati kerak, HR ga yuboring",
    "Masalan: Kompyuter sekin ishlayapti, IT yordam kerak",
  ];

  useEffect(() => {
    const t = window.setInterval(() => {
      setPlaceholderIndex((p) => (p + 1) % placeholderPhrases.length);
    }, 2600);
    return () => window.clearInterval(t);
  }, [placeholderPhrases.length]);

  const { data: requests = [], isLoading, error } = useQuery({
    queryKey: ["requests"],
    queryFn: fetchAllRequests,
  });
  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
  });
  const { data: documents = [], isLoading: docsLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: fetchAllDocuments,
  });

  const myRequests = (() => {
    if (user?.role !== "user") return [];
    if (user?.id) return requests.filter((r) => r.requester_id === user.id);
    const ids = [...new Set(requests.map((r) => r.requester_id).filter(Boolean))];
    if (ids.length === 1) return requests.filter((r) => r.requester_id === ids[0]);
    return requests;
  })();
  const getDeptName = (id: string) => departments.find((d) => d.id === id)?.name ?? "—";

  const pending = myRequests.filter((r) => r.status === "new").length;
  const inProgress = myRequests.filter((r) => r.status === "in_progress").length;
  const resolved = myRequests.filter((r) => r.status === "resolved").length;

  const donutData = [
    { name: "Pending", value: pending, fill: "#EAB308" },
    { name: "In Progress", value: inProgress, fill: "#3B82F6" },
    { name: "Resolved", value: resolved, fill: "#22C55E" },
  ].filter((d) => d.value > 0);
  const donutDisplay = donutData.length ? donutData : [{ name: "No requests", value: 1, fill: "#E5E7EB" }];
  const totalForPct = pending + inProgress + resolved;
  const pendingPct = totalForPct > 0 ? Math.round((pending / totalForPct) * 100) : 0;

  const createMutation = useMutation({
    mutationFn: (text: string) => createRequest({ text, requester_id: user?.id ?? "" }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      const dept = departments.find((d) => d.id === data.department_id)?.name ?? data.category ?? "—";
      setLastResult({ department: String(dept), priority: data.priority });
      setQuickText("");
      toast.success("Request submitted and routed by AI.");
    },
    onError: (err: Error) => {
      toast.error(err?.message ?? "Failed to submit request. Please try again.");
    },
  });

  const handleQuickSubmit = () => {
    if (!quickText.trim() || !user?.id) return;
    createMutation.mutate(quickText.trim());
  };

  const recent = [...myRequests].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 8);
  const activeRequest = recent[0] ?? myRequests[0] ?? null;

  const activeDeptName = activeRequest ? getDeptName(activeRequest.department_id) : null;

  const currentTimelineIndex = (() => {
    if (!activeRequest) return -1;
    switch (activeRequest.status) {
      case "new":
        return 0;
      case "in_progress":
        return 3;
      case "resolved":
      case "rejected":
        return 4;
      default:
        return 0;
    }
  })();

  const submittedAt = activeRequest ? new Date(activeRequest.created_at) : null;
  const updatedAt = activeRequest?.updated_at ? new Date(activeRequest.updated_at) : null;

  const timelineSteps = timelineBase.map((step, idx) => {
    let at: Date | null = null;
    if (!activeRequest) {
      at = null;
    } else if (step.key === "submitted") {
      at = submittedAt;
    } else if (step.key === "classified" || step.key === "routed") {
      at = submittedAt;
    } else if (step.key === "agent") {
      if (activeRequest.status === "in_progress" || activeRequest.status === "resolved" || activeRequest.status === "rejected") {
        at = updatedAt ?? submittedAt;
      }
    } else if (step.key === "resolved") {
      if (activeRequest.status === "resolved" || activeRequest.status === "rejected") {
        at = updatedAt ?? submittedAt;
      }
    }
    return { ...step, idx, at };
  });

  const dashboardDocs = documents
    .map((doc) => {
      const deptName = getDeptName(doc.department_id);
      const category = inferCategory(doc, deptName);
      const description = `${deptName} documentation and operational reference.`;
      return { ...doc, deptName, category, description };
    })
    .filter((doc) => {
      const q = docSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        doc.title.toLowerCase().includes(q) ||
        doc.description.toLowerCase().includes(q) ||
        doc.deptName.toLowerCase().includes(q);
      const matchesCategory = docCategory === "All" ? true : doc.category === docCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bTime - aTime;
    });

  if (user?.role !== "user") {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#111827] flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-[#7C3AED]" />
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">Track your requests and submit new ones.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate("/chat")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7C3AED] text-white text-sm font-medium hover:bg-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-2"
          >
            <PlusCircle className="w-4 h-4" />
            New Request
          </button>
          <button
            type="button"
            onClick={() => navigate("/chat")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-[#111827] text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
          {String(error)}
        </div>
      )}

      {/* User statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 p-6 shadow-md shadow-gray-200/70 transition duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-gray-300/70">
          <div className="rounded-xl bg-white p-2.5 text-gray-600 ring-1 ring-gray-200">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-gray-500">My Requests</p>
            <p className="mt-1 text-2xl font-semibold text-[#111827]">{isLoading ? "—" : myRequests.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-yellow-200 bg-gradient-to-b from-white to-yellow-50 p-6 shadow-md shadow-yellow-200/60 transition duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-yellow-200/70">
          <div className="rounded-xl bg-white p-2.5 text-yellow-700 ring-1 ring-yellow-200">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-yellow-700">Pending</p>
            <p className="mt-1 text-2xl font-semibold text-yellow-700">{isLoading ? "—" : pending}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-blue-200 bg-gradient-to-b from-white to-blue-50 p-6 shadow-md shadow-blue-200/60 transition duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-200/70">
          <div className="rounded-xl bg-white p-2.5 text-blue-700 ring-1 ring-blue-200">
            <Loader className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-blue-700">In Progress</p>
            <p className="mt-1 text-2xl font-semibold text-blue-700">{isLoading ? "—" : inProgress}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-green-200 bg-gradient-to-b from-white to-green-50 p-6 shadow-md shadow-green-200/60 transition duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-green-200/70">
          <div className="rounded-xl bg-white p-2.5 text-green-700 ring-1 ring-green-200">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-green-700">Resolved</p>
            <p className="mt-1 text-2xl font-semibold text-green-700">{isLoading ? "—" : resolved}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request status donut */}
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-slate-50/60 p-6 shadow-md shadow-slate-200/70">
          <h3 className="text-lg font-semibold text-[#111827]">Request status</h3>
          <p className="text-sm text-gray-500 mt-1">Distribution by status</p>
          {isLoading ? (
            <Skeleton className="h-56 w-full mt-4 rounded-lg" />
          ) : (
            <div className="relative mt-4 h-56">
              <ResponsiveContainer width="100%" height="92%">
                <PieChart>
                  <Pie
                    data={donutDisplay}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {donutDisplay.map((_, i) => (
                      <Cell key={i} fill={donutDisplay[i].fill} stroke="#fff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      totalForPct > 0 ? `${Math.round((Number(value) / totalForPct) * 100)}%` : value,
                      name,
                    ]}
                    contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-lg font-semibold text-[#111827]">{myRequests.length} requests</p>
              </div>
              {donutData.length > 0 && (
                <div className="mt-1 text-center">
                  <p className="text-sm text-gray-500">Pending {pendingPct}%</p>
                </div>
              )}
              {donutData.length > 0 && (
                <div className="flex flex-wrap justify-center gap-4 mt-3 text-xs">
                  {donutData.map((d) => (
                    <span key={d.name} className="inline-flex items-center gap-1.5 text-gray-600">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.fill }} />
                      {d.name}: {totalForPct > 0 ? Math.round((d.value / totalForPct) * 100) : 0}%
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Request timeline */}
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-slate-50/60 p-6 shadow-md shadow-slate-200/70">
          <h3 className="text-lg font-semibold text-[#111827]">Request timeline</h3>
          <p className="text-sm text-gray-500 mt-1">
            {activeRequest ? "Latest request lifecycle" : "Typical request flow"}
          </p>
          <div className="mt-5 border-l border-gray-200 pl-4">
            {timelineSteps.map((step) => {
              const isCurrent = currentTimelineIndex === step.idx && !!activeRequest;
              const isComplete = currentTimelineIndex > step.idx && !!activeRequest && !!step.at;
              const hasTime = !!step.at;
              let statusText: string;

              if (!activeRequest) {
                statusText = "Waiting";
              } else if (isComplete && hasTime) {
                statusText = new Date(step.at as Date).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                });
              } else if (isCurrent) {
                statusText = "In progress";
              } else if (hasTime) {
                statusText = new Date(step.at as Date).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                });
              } else {
                statusText = "Waiting";
              }

              const label =
                step.key === "routed" && activeDeptName
                  ? `Request routed to ${activeDeptName} department`
                  : step.label;
              const dotClass =
                step.key === "submitted" || step.key === "classified"
                  ? "bg-purple-500"
                  : step.key === "routed" || step.key === "agent"
                    ? "bg-blue-500"
                    : "bg-green-500";

              return (
                <div key={step.key} className="relative flex items-start gap-3 py-3.5 first:pt-0">
                  <span
                    className={`mt-1.5 h-2.5 w-2.5 rounded-full ${dotClass} ${
                      isComplete || isCurrent ? "opacity-100" : "opacity-40"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#111827]">{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{statusText}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick request panel */}
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-purple-50/30 p-6 shadow-md shadow-purple-200/50">
          <h3 className="text-lg font-semibold text-[#111827]">Quick request</h3>
          <p className="text-sm text-gray-500 mt-1">Submit a request or upload a document</p>
          <div className="mt-4 space-y-3">
            <div className="relative">
              <MessageSquare className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <textarea
                value={quickText}
                onChange={(e) => setQuickText(e.target.value)}
                placeholder={placeholderPhrases[placeholderIndex]}
                rows={3}
                className="w-full resize-none rounded-xl border border-gray-300 py-2 pl-9 pr-3 text-sm text-[#111827] placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button
              type="button"
              disabled={!quickText.trim() || createMutation.isPending}
              onClick={handleQuickSubmit}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-purple-500/20 transition duration-200 hover:scale-[1.02] hover:from-[#6D28D9] hover:to-[#5B21B6] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-2"
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {createMutation.isPending ? "AI is analyzing..." : "Submit"}
            </button>
            <p className="text-xs text-gray-400">Or use the chat page to upload a document.</p>
            {lastResult && (
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-4 text-sm space-y-2">
                <p className="font-semibold text-[#111827]">AI classification result</p>
                <p className="text-gray-600">Detected category: {lastResult.department}</p>
                <p className="text-gray-600">Assigned department: {lastResult.department}</p>
                <p className="text-gray-600">Priority level: {lastResult.priority}</p>
                <p className="pt-2 mt-2 border-t border-gray-200 text-[#7C3AED] font-medium">
                  Your request has been routed to the correct department.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent requests table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-slate-50/40 shadow-md shadow-slate-200/70">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-[#111827]">Recent requests</h3>
          <p className="text-sm text-gray-500 mt-0.5">Your latest requests</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Request ID</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Title</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Intent</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Department</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Priority</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)
                : recent.length === 0
                  ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                        No requests yet. Create one using New Request or the quick request panel.
                      </td>
                    </tr>
                    )
                  : recent.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => navigate(`/my-requests/${r.id}`)}
                      className="cursor-pointer transition duration-200 hover:bg-gray-50 active:scale-[0.998]"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{r.id}</td>
                      <td className="px-4 py-3 font-medium text-[#111827]">
                        <span className="block max-w-[200px] truncate">{r.title || "—"}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 capitalize">{r.intent ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{getDeptName(r.department_id)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${priorityBadge[r.priority] ?? "bg-gray-100 text-gray-700"}`}>
                          {r.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${
                            r.status === "new"
                              ? "border-orange-200 bg-orange-100 text-orange-600"
                              : (statusBadge[r.status] ?? "bg-gray-100 text-gray-700")
                          }`}
                        >
                          {statusLabel[r.status] ?? r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {new Date(r.created_at).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Helpful documents */}
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-slate-50/40 p-6 shadow-md shadow-slate-200/70">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#111827]">Helpful documents</h3>
            <p className="mt-1 text-sm text-gray-500">Knowledge base and policy files from your teams</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
            <div className="relative min-w-0 flex-1 sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                placeholder="Search documents..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-[#111827] outline-none transition focus:ring-2 focus:ring-purple-500/30"
              />
            </div>
            <select
              value={docCategory}
              onChange={(e) => setDocCategory(e.target.value as DocCategory)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-[#111827] outline-none transition focus:ring-2 focus:ring-purple-500/30"
            >
              <option value="All">All categories</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="IT">IT</option>
            </select>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {docsLoading
            ? Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="mt-4 h-4 w-2/3 rounded-md" />
                <Skeleton className="mt-2 h-3 w-full rounded-md" />
                <Skeleton className="mt-1 h-3 w-3/4 rounded-md" />
              </div>
            ))
            : dashboardDocs.map((doc) => (
              <article
                key={doc.id}
                onClick={() => setPreviewDoc(doc)}
                className="group cursor-pointer rounded-2xl border border-gray-200 bg-white px-4 py-4 text-sm text-[#111827] shadow-sm transition duration-200 hover:scale-[1.02] hover:shadow-md"
              >
                <div className="mb-3 inline-flex rounded-xl bg-purple-50 p-2">
                  <FileText className="h-5 w-5 text-[#7C3AED]" />
                </div>
                <div className="flex items-start justify-between gap-3">
                  <h4 className="line-clamp-2 font-semibold text-[#111827]">{doc.title}</h4>
                  <span className="inline-flex shrink-0 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                    {extractFileType(doc.file_url)}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-gray-500">{doc.description}</p>
                <p className="mt-2 text-xs text-gray-500">Uploaded {formatUploadDate(doc.created_at)}</p>
                <p className="mt-1 text-xs text-purple-600/80">{docSummary(doc, doc.deptName)}</p>
                <div className="mt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewDoc(doc);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Preview
                  </button>
                  <a
                    href={doc.file_url}
                    download
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 hover:underline"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </a>
                </div>
              </article>
            ))}
        </div>
        {!docsLoading && dashboardDocs.length === 0 && (
          <div className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-white/80 px-6 py-10 text-center">
            <p className="text-base font-semibold text-[#111827]">No documents yet</p>
            <p className="mt-1 text-sm text-gray-500">Upload your first document to build a shared knowledge base.</p>
            <button
              type="button"
              onClick={() => navigate("/chat")}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#7C3AED] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#6D28D9]"
            >
              <Upload className="h-4 w-4" />
              Upload document
            </button>
          </div>
        )}
      </div>

      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
              <div>
                <h4 className="text-base font-semibold text-[#111827]">{previewDoc.title}</h4>
                <p className="text-xs text-gray-500">
                  {extractFileType(previewDoc.file_url)} · Uploaded {formatUploadDate(previewDoc.created_at)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 p-5">
              <p className="text-sm text-gray-600">
                {docSummary(previewDoc, getDeptName(previewDoc.department_id))}
              </p>
              {extractFileType(previewDoc.file_url) === "PDF" ? (
                <iframe
                  src={previewDoc.file_url}
                  title={previewDoc.title}
                  className="h-[55vh] w-full rounded-xl border border-gray-200"
                />
              ) : (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-600">
                  Preview is not available for this file type.
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-5 py-3">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="rounded-xl border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-50"
              >
                Close
              </button>
              <a
                href={previewDoc.file_url}
                download
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#7C3AED] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[#6D28D9]"
              >
                <Download className="h-4 w-4" />
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
