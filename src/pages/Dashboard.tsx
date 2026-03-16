import { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  PlusCircle,
  Upload,
  MessageSquare,
  Cpu,
  GitBranch,
  UserCheck,
  CheckCircle,
  FileText,
  Download,
  Send,
  Loader2,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { useAuth } from "../auth/useAuth";
import { fetchAllRequests, createRequest } from "../api/requests";
import { fetchDepartments } from "../api/departments";
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
  High: "bg-red-100 text-red-700 border-red-200",
  Medium: "bg-amber-100 text-amber-700 border-amber-200",
  Low: "bg-blue-100 text-blue-700 border-blue-200",
};

const timelineBase = [
  { key: "submitted", icon: MessageSquare, label: "Request submitted" },
  { key: "classified", icon: Cpu, label: "AI classified request" },
  { key: "routed", icon: GitBranch, label: "Request routed to department" },
  { key: "agent", icon: UserCheck, label: "Agent started processing" },
  { key: "resolved", icon: CheckCircle, label: "Request resolved" },
];

const helpfulDocs = [
  {
    title: "HR Policies",
    description: "Company HR rules and employee guidelines",
    file: "/documents/hr-policies.html",
    icon: FileText,
  },
  {
    title: "Finance Forms",
    description: "Expense reports and reimbursement templates",
    file: "/documents/finance-forms.html",
    icon: FileText,
  },
  {
    title: "IT Support Guide",
    description: "Troubleshooting and internal IT help documentation",
    file: "/documents/it-support-guide.html",
    icon: FileText,
  },
];

export function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [quickText, setQuickText] = useState("");
  const [lastResult, setLastResult] = useState<{ department: string; priority: string } | null>(null);

  const { data: requests = [], isLoading, error } = useQuery({
    queryKey: ["requests"],
    queryFn: fetchAllRequests,
  });
  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
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

  const createMutation = useMutation({
    mutationFn: (text: string) => createRequest({ text, requester_id: user?.id ?? "" }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      const dept = departments.find((d) => d.id === data.department_id)?.name ?? data.category ?? "—";
      setLastResult({ department: String(dept), priority: data.priority });
      setQuickText("");
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
          <p className="text-sm font-medium text-gray-500">My Requests</p>
          <p className="text-2xl font-semibold text-[#111827] mt-1">{isLoading ? "—" : myRequests.length}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 shadow-sm p-6">
          <p className="text-sm font-medium text-amber-700">Pending Requests</p>
          <p className="text-2xl font-semibold text-amber-700 mt-1">{isLoading ? "—" : pending}</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 shadow-sm p-6">
          <p className="text-sm font-medium text-blue-700">In Progress</p>
          <p className="text-2xl font-semibold text-blue-700 mt-1">{isLoading ? "—" : inProgress}</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50/50 shadow-sm p-6">
          <p className="text-sm font-medium text-green-700">Resolved</p>
          <p className="text-2xl font-semibold text-green-700 mt-1">{isLoading ? "—" : resolved}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request status donut */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
          <h3 className="text-base font-semibold text-[#111827]">Request status</h3>
          <p className="text-sm text-gray-500 mt-1">Distribution by status</p>
          {isLoading ? (
            <Skeleton className="h-56 w-full mt-4 rounded-lg" />
          ) : (
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutDisplay}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={72}
                    paddingAngle={2}
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
              {donutData.length > 0 && (
                <div className="flex flex-wrap justify-center gap-4 mt-2 text-xs">
                  {donutData.map((d) => (
                    <span key={d.name}>
                      {d.name}: {totalForPct > 0 ? Math.round((d.value / totalForPct) * 100) : 0}%
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Request timeline */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
          <h3 className="text-base font-semibold text-[#111827]">Request timeline</h3>
          <p className="text-sm text-gray-500 mt-1">
            {activeRequest ? "Latest request lifecycle" : "Typical request flow"}
          </p>
          <div className="mt-4 space-y-0">
            {timelineSteps.map((step) => {
              const Icon = step.icon;
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

              return (
                <div key={step.key} className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isComplete || isCurrent ? "bg-[#7C3AED]/10 text-[#7C3AED]" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
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
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
          <h3 className="text-base font-semibold text-[#111827]">Quick request</h3>
          <p className="text-sm text-gray-500 mt-1">Submit a request or upload a document</p>
          <div className="mt-4 space-y-3">
            <textarea
              value={quickText}
              onChange={(e) => setQuickText(e.target.value)}
              placeholder="Describe your request..."
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-[#111827] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
            <button
              type="button"
              disabled={!quickText.trim() || createMutation.isPending}
              onClick={handleQuickSubmit}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-[#7C3AED] text-white text-sm font-medium hover:bg-[#6D28D9] disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-2"
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Submit
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
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-[#111827]">Recent requests</h3>
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
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{r.id}</td>
                      <td className="px-4 py-3 font-medium text-[#111827]">{r.title || "—"}</td>
                      <td className="px-4 py-3 text-gray-600 capitalize">{r.intent ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{getDeptName(r.department_id)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${priorityBadge[r.priority] ?? "bg-gray-100 text-gray-700"}`}>
                          {r.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${statusBadge[r.status] ?? "bg-gray-100 text-gray-700"}`}>
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
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <h3 className="text-base font-semibold text-[#111827]">Helpful documents</h3>
        <p className="text-sm text-gray-500 mt-1">Commonly used documents</p>
        <div className="mt-4 flex flex-wrap gap-4">
          {helpfulDocs.map((doc) => {
            const Icon = doc.icon;
            return (
              <a
                key={doc.title}
                href={doc.file}
                download
                className="inline-flex flex-col items-start gap-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-[#7C3AED]/30 transition-colors text-sm text-[#111827]"
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-[#7C3AED]" />
                  <span className="font-medium">{doc.title}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{doc.description}</p>
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[#7C3AED]">
                  <Download className="w-3 h-3" />
                  Download
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
