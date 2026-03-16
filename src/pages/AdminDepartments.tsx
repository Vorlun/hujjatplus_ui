import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useAuth } from "../auth/useAuth";
import { fetchDepartments, type Department } from "../api/departments";
import { fetchAllRequests, fetchDepartmentRequests, type RequestListItem } from "../api/requests";
import {
  Building2,
  Inbox,
  Loader2,
  X,
  CheckCircle,
  ChevronUp,
  ChevronDown,
  Wallet,
  Users,
  Cpu,
  Scale,
  Megaphone,
  Settings,
  Eye,
  Download,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const DEPT_META: Record<string, { description: string; icon: LucideIcon; iconBg: string; iconColor: string }> = {
  finance: { description: "Financial reports, expenses, and reimbursement", icon: Wallet, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-600" },
  hr: { description: "HR policies, leave, and employee matters", icon: Users, iconBg: "bg-blue-500/10", iconColor: "text-blue-600" },
  it: { description: "Technical support and infrastructure", icon: Cpu, iconBg: "bg-violet-500/10", iconColor: "text-violet-600" },
  legal: { description: "Contracts, compliance, and legal requests", icon: Scale, iconBg: "bg-amber-500/10", iconColor: "text-amber-600" },
  marketing: { description: "Campaigns, content, and brand assets", icon: Megaphone, iconBg: "bg-pink-500/10", iconColor: "text-pink-600" },
  operations: { description: "General operations and logistics", icon: Settings, iconBg: "bg-teal-500/10", iconColor: "text-teal-600" },
};

function getDeptMeta(name: string) {
  const raw = (name || "").toLowerCase();
  const key = raw.replace(/\s+/g, "");
  if (DEPT_META[key]) return DEPT_META[key];
  if (key.includes("moliya") || key.includes("finance")) return DEPT_META.finance;
  if (key.includes("kadr") || key === "hr") return DEPT_META.hr;
  if (key === "it") return DEPT_META.it;
  if (key.includes("huquq") || key.includes("legal")) return DEPT_META.legal;
  if (key.includes("market")) return DEPT_META.marketing;
  if (key.includes("operats") || key.includes("operations")) return DEPT_META.operations;
  return { description: "Department requests and support", icon: Building2, iconBg: "bg-[#7C3AED]/10", iconColor: "text-[#7C3AED]" };
}

const statusBadge: Record<string, string> = {
  new: "bg-blue-100 text-blue-700 border-blue-200",
  in_progress: "bg-amber-100 text-amber-700 border-amber-200",
  resolved: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

const statusLabel: Record<string, string> = {
  new: "New",
  in_progress: "In Progress",
  resolved: "Resolved",
  rejected: "Rejected",
};

type SortKey = "priority" | "date" | null;
type SortDir = "asc" | "desc";

export function AdminDepartments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [tableSort, setTableSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "date", dir: "desc" });

  const { data: departments = [], isLoading: loadingDepts, error } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
    enabled: user?.role === "admin",
  });
  const { data: allRequests = [] } = useQuery({
    queryKey: ["requests"],
    queryFn: fetchAllRequests,
    enabled: user?.role === "admin",
  });
  const { data: deptRequests = [], isLoading: loadingDeptRequests } = useQuery({
    queryKey: ["department-requests", selectedDept?.id],
    queryFn: () => fetchDepartmentRequests(selectedDept!.id),
    enabled: !!selectedDept?.id,
  });

  const departmentStats = useMemo(() => {
    return departments.map((d) => {
      const reqs = allRequests.filter((r) => r.department_id === d.id);
      const agentIds = new Set(
        reqs
          .map((r) => (r as RequestListItem & { assigned_agent?: string; assigned_agent_name?: string }).assigned_agent ?? (r as RequestListItem & { assigned_agent_name?: string }).assigned_agent_name ?? "")
          .filter(Boolean)
      );
      return {
        ...d,
        total: reqs.length,
        pending: reqs.filter((r) => r.status === "new").length,
        inProgress: reqs.filter((r) => r.status === "in_progress").length,
        resolved: reqs.filter((r) => r.status === "resolved").length,
        overdue: reqs.filter((r) => r.status === "rejected").length,
        agentCount: agentIds.size,
      };
    });
  }, [departments, allRequests]);

  const sortedRequests = useMemo(() => {
    const list = [...deptRequests];
    if (tableSort.key === "date") {
      list.sort((a, b) => {
        const t1 = new Date(a.created_at).getTime();
        const t2 = new Date(b.created_at).getTime();
        return tableSort.dir === "asc" ? t1 - t2 : t2 - t1;
      });
    } else if (tableSort.key === "priority") {
      const order = { High: 0, Medium: 1, Low: 2 };
      list.sort((a, b) => {
        const p1 = order[a.priority] ?? 2;
        const p2 = order[b.priority] ?? 2;
        return tableSort.dir === "asc" ? p1 - p2 : p2 - p1;
      });
    }
    return list;
  }, [deptRequests, tableSort]);

  const isToday = (dateStr: string) => {
    const d = new Date(dateStr);
    const t = new Date();
    return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
  };

  const deptMetrics = useMemo(() => {
    if (!selectedDept) return null;
    const reqs = deptRequests;
    const requestsToday = reqs.filter((r) => isToday(r.created_at) || (r.updated_at && isToday(r.updated_at))).length;
    const activeRequests = reqs.filter((r) => r.status === "in_progress").length;
    const resolvedCount = reqs.filter((r) => r.status === "resolved").length;
    const agentIds = new Set(
      reqs
        .map((r) => (r as RequestListItem & { assigned_agent?: string; assigned_agent_name?: string }).assigned_agent ?? (r as RequestListItem & { assigned_agent_name?: string }).assigned_agent_name ?? "")
        .filter(Boolean)
    );
    return { requestsToday, activeRequests, resolvedCount, agentsCount: agentIds.size };
  }, [selectedDept, deptRequests]);

  const agentSummaries = useMemo(() => {
    const map = new Map<string, { name: string; active: number; resolvedToday: number }>();
    deptRequests.forEach((r) => {
      const name = (r as RequestListItem & { assigned_agent_name?: string; assigned_agent?: string }).assigned_agent_name ?? (r as RequestListItem & { assigned_agent?: string }).assigned_agent ?? "Unassigned";
      const key = name || "Unassigned";
      if (!map.has(key)) map.set(key, { name: key, active: 0, resolvedToday: 0 });
      const entry = map.get(key)!;
      if (r.status === "in_progress") entry.active += 1;
      if (r.status === "resolved" && r.updated_at && isToday(r.updated_at)) entry.resolvedToday += 1;
    });
    return Array.from(map.entries()).map(([, v]) => v).filter((a) => a.name !== "Unassigned");
  }, [deptRequests]);

  if (user?.role !== "admin") {
    return (
      <div>
        <p className="text-gray-500">Access denied.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      <div className={`flex-1 flex flex-col min-w-0 ${selectedDept ? "max-w-[58%]" : ""}`}>
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[#111827] flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#7C3AED]" />
            Departments
          </h1>
          <p className="text-sm text-gray-500 mt-1">Monitor department workloads and request distribution</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Click a department card to view details, requests, and activity.
          </p>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
            {String(error)}
          </div>
        )}

        {/* Department cards */}
        {loadingDepts ? (
          <div className="flex items-center justify-center py-16 gap-2 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading departments…</span>
          </div>
        ) : departmentStats.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center text-gray-500">
            No departments found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {departmentStats.map((d) => {
              const meta = getDeptMeta(d.name);
              const Icon = meta.icon;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDept({ id: d.id, name: d.name })}
                  className={`rounded-xl border bg-white shadow-sm p-6 text-left transition-all hover:shadow-md hover:border-[#7C3AED]/30 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 ${selectedDept?.id === d.id ? "ring-2 ring-[#7C3AED] border-[#7C3AED]" : "border-gray-200"}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.iconBg}`}>
                      <Icon className={`w-6 h-6 ${meta.iconColor}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-[#111827]">{d.name}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{meta.description}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-4">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                          <Inbox className="w-3.5 h-3.5" />
                          Requests: {d.total}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                          <Users className="w-3.5 h-3.5" />
                          Agents: {d.agentCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Department detail view */}
      {selectedDept && (
        <div className="w-[42%] min-w-[380px] flex flex-col gap-6 overflow-y-auto">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Section 2 — Top header */}
            <div className="p-6 border-b border-gray-100 flex items-start justify-between">
              <div className="min-w-0">
                <h2 className="text-xl font-semibold text-[#111827]">{selectedDept.name} Department</h2>
                <p className="text-sm text-gray-500 mt-1">{getDeptMeta(selectedDept.name).description}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDept(null)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 flex-shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDeptRequests ? (
              <div className="p-8 flex items-center justify-center gap-2 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Loading…</span>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Section 3 — Department metrics */}
                {deptMetrics && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
                      <Download className="w-5 h-5 text-[#7C3AED] mx-auto mb-1" />
                      <p className="text-2xl font-bold text-[#111827] tabular-nums">{deptMetrics.requestsToday}</p>
                      <p className="text-xs text-gray-500 font-medium">Requests Today</p>
                    </div>
                    <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-center shadow-sm">
                      <Inbox className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-amber-700 tabular-nums">{deptMetrics.activeRequests}</p>
                      <p className="text-xs text-amber-600 font-medium">Active Requests</p>
                    </div>
                    <div className="rounded-xl border border-green-200 bg-green-50/50 p-4 text-center shadow-sm">
                      <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-green-700 tabular-nums">{deptMetrics.resolvedCount}</p>
                      <p className="text-xs text-green-600 font-medium">Resolved</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
                      <Users className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-[#111827] tabular-nums">{deptMetrics.agentsCount}</p>
                      <p className="text-xs text-gray-500 font-medium">Agents</p>
                    </div>
                  </div>
                )}

                {/* Section 4 — Department request list */}
                <div>
                  <h3 className="text-sm font-semibold text-[#111827] mb-3">Department requests</h3>
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto max-h-72 overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium text-gray-600">Request ID</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-600">
                              <button type="button" onClick={() => setTableSort({ key: "priority", dir: tableSort.key === "priority" && tableSort.dir === "asc" ? "desc" : "asc" })} className="flex items-center gap-0.5 hover:text-[#111827]">Priority {tableSort.key === "priority" && (tableSort.dir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}</button>
                            </th>
                            <th className="px-3 py-2 text-left font-medium text-gray-600">Status</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-600">Assigned Agent</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-600">
                              <button type="button" onClick={() => setTableSort({ key: "date", dir: tableSort.key === "date" && tableSort.dir === "asc" ? "desc" : "asc" })} className="flex items-center gap-0.5 hover:text-[#111827]">Created {tableSort.key === "date" && (tableSort.dir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}</button>
                            </th>
                            <th className="px-3 py-2 text-right font-medium text-gray-600">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {sortedRequests.map((r) => {
                            const agentName = (r as RequestListItem & { assigned_agent_name?: string; assigned_agent?: string }).assigned_agent_name ?? (r as RequestListItem & { assigned_agent?: string }).assigned_agent ?? "—";
                            return (
                              <tr key={r.id} className="hover:bg-gray-50">
                                <td className="px-3 py-2 font-mono text-gray-600">{r.id}</td>
                                <td className="px-3 py-2">{r.priority}</td>
                                <td className="px-3 py-2">
                                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${statusBadge[r.status] ?? "bg-gray-100 text-gray-700"}`}>{statusLabel[r.status] ?? r.status}</span>
                                </td>
                                <td className="px-3 py-2 text-gray-600 truncate max-w-[80px]" title={agentName}>{agentName}</td>
                                <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{new Date(r.created_at).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}</td>
                                <td className="px-3 py-2 text-right">
                                  <button type="button" onClick={(e) => { e.stopPropagation(); navigate(`/admin/requests/${r.id}`); }} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-[#111827]" title="Open request"><Eye className="w-4 h-4" /></button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    {sortedRequests.length === 0 && (
                      <div className="p-6 text-center text-sm text-gray-500">No requests in this department.</div>
                    )}
                  </div>
                </div>

                {/* Section 5 — Department agents */}
                <div>
                  <h3 className="text-sm font-semibold text-[#111827] mb-3">Department agents</h3>
                  {agentSummaries.length === 0 ? (
                    <div className="rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-6 text-center text-sm text-gray-500">
                      No agent assignment data yet. Assign agents to requests to see them here.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {agentSummaries.map((agent) => (
                        <div key={agent.name} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white shadow-sm">
                          <div className="w-10 h-10 rounded-full bg-[#7C3AED]/10 flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-[#7C3AED]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-[#111827] truncate">{agent.name}</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <span className="text-xs text-amber-600">Active: {agent.active}</span>
                              <span className="text-xs text-green-600">Resolved today: {agent.resolvedToday}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
