import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../auth/useAuth";
import { fetchDepartments, type Department } from "../api/departments";
import { fetchAllRequests, fetchDepartmentRequests, type RequestListItem } from "../api/requests";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  Building2,
  Inbox,
  Loader2,
  X,
  MessageSquare,
  UserCheck,
  CheckCircle,
  Upload,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function buildDepartmentMonthlyData(requests: RequestListItem[]): { month: string; count: number }[] {
  const now = new Date();
  const result: { month: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const count = requests.filter((r) => r.created_at && r.created_at.slice(0, 7) === monthKey).length;
    result.push({ month: MONTH_NAMES[d.getMonth()], count });
  }
  return result;
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
      return {
        ...d,
        total: reqs.length,
        pending: reqs.filter((r) => r.status === "new").length,
        inProgress: reqs.filter((r) => r.status === "in_progress").length,
        resolved: reqs.filter((r) => r.status === "resolved").length,
        overdue: reqs.filter((r) => r.status === "rejected").length,
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

  const monthlyData = useMemo(() => buildDepartmentMonthlyData(deptRequests), [deptRequests]);

  const activityItems = useMemo(() => {
    const items: { icon: typeof MessageSquare; label: string; time: string }[] = [];
    deptRequests.slice(0, 5).forEach((r, i) => {
      const date = new Date(r.created_at).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
      if (r.status === "resolved") items.push({ icon: CheckCircle, label: `Request resolved: ${r.title?.slice(0, 30)}…`, time: date });
      else if (r.status === "in_progress") items.push({ icon: UserCheck, label: `Agent started: ${r.title?.slice(0, 30)}…`, time: date });
      else items.push({ icon: MessageSquare, label: `New request: ${r.title?.slice(0, 30)}…`, time: date });
    });
    if (items.length === 0) {
      items.push({ icon: Inbox, label: "No recent activity", time: "—" });
    }
    return items.slice(0, 6);
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departmentStats.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedDept({ id: d.id, name: d.name })}
                className={`rounded-xl border bg-white shadow-sm p-6 text-left transition-all hover:shadow-md hover:border-[#7C3AED]/30 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 ${selectedDept?.id === d.id ? "ring-2 ring-[#7C3AED] border-[#7C3AED]" : "border-gray-200"}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-[#7C3AED]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-[#111827]">{d.name} Department</h3>
                    <dl className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Total Requests</dt>
                        <dd className="font-medium text-[#111827]">{d.total}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-amber-600">Pending</dt>
                        <dd className="font-medium text-amber-700">{d.pending}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-green-600">Resolved</dt>
                        <dd className="font-medium text-green-700">{d.resolved}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-red-600">Overdue</dt>
                        <dd className="font-medium text-red-700">{d.overdue}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Department detail view */}
      {selectedDept && (
        <div className="w-[42%] min-w-[340px] flex flex-col gap-6 overflow-y-auto">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#111827]">{selectedDept.name} Department</h2>
                <p className="text-sm text-gray-500 mt-0.5">Department dashboard</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDept(null)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
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
                {/* Department overview */}
                <div>
                  <h3 className="text-sm font-semibold text-[#111827] mb-3">Department Overview</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3">
                      <p className="text-xl font-semibold text-[#111827] tabular-nums">{deptRequests.length}</p>
                      <p className="text-xs text-gray-500">Total Requests</p>
                    </div>
                    <div className="rounded-xl border border-amber-200 bg-amber-50/30 px-4 py-3">
                      <p className="text-xl font-semibold text-amber-700 tabular-nums">{deptRequests.filter((r) => r.status === "new").length}</p>
                      <p className="text-xs text-amber-600">Pending</p>
                    </div>
                    <div className="rounded-xl border border-blue-200 bg-blue-50/30 px-4 py-3">
                      <p className="text-xl font-semibold text-blue-700 tabular-nums">{deptRequests.filter((r) => r.status === "in_progress").length}</p>
                      <p className="text-xs text-blue-600">In Progress</p>
                    </div>
                    <div className="rounded-xl border border-green-200 bg-green-50/30 px-4 py-3">
                      <p className="text-xl font-semibold text-green-700 tabular-nums">{deptRequests.filter((r) => r.status === "resolved").length}</p>
                      <p className="text-xs text-green-600">Resolved</p>
                    </div>
                  </div>
                </div>

                {/* Requests per month */}
                <div>
                  <h3 className="text-sm font-semibold text-[#111827] mb-3">Requests per month</h3>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData} margin={{ left: 0, right: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#6B7280" }} />
                        <YAxis tick={{ fontSize: 10, fill: "#6B7280" }} allowDecimals={false} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }} />
                        <Bar dataKey="count" name="Requests" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Request table */}
                <div>
                  <h3 className="text-sm font-semibold text-[#111827] mb-3">Requests</h3>
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto max-h-64 overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium text-gray-600">Request ID</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-600">Title</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-600">
                              <button type="button" onClick={() => setTableSort({ key: "priority", dir: tableSort.key === "priority" && tableSort.dir === "asc" ? "desc" : "asc" })} className="flex items-center gap-0.5 hover:text-[#111827]">
                                Priority {tableSort.key === "priority" && (tableSort.dir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                              </button>
                            </th>
                            <th className="px-3 py-2 text-left font-medium text-gray-600">Status</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-600">
                              <button type="button" onClick={() => setTableSort({ key: "date", dir: tableSort.key === "date" && tableSort.dir === "asc" ? "desc" : "asc" })} className="flex items-center gap-0.5 hover:text-[#111827]">
                                Created {tableSort.key === "date" && (tableSort.dir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                              </button>
                            </th>
                            <th className="px-3 py-2 text-left font-medium text-gray-600">Agent</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {sortedRequests.map((r) => (
                            <tr key={r.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2 font-mono text-gray-600">{r.id.slice(0, 8)}…</td>
                              <td className="px-3 py-2 font-medium text-[#111827] max-w-[100px] truncate" title={r.title}>{r.title || "—"}</td>
                              <td className="px-3 py-2">{r.priority}</td>
                              <td className="px-3 py-2">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${statusBadge[r.status] ?? "bg-gray-100 text-gray-700"}`}>
                                  {statusLabel[r.status] ?? r.status}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{new Date(r.created_at).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}</td>
                              <td className="px-3 py-2 text-gray-500">—</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {sortedRequests.length === 0 && (
                      <div className="p-6 text-center text-sm text-gray-500">No requests in this department.</div>
                    )}
                  </div>
                </div>

                {/* Department activity */}
                <div>
                  <h3 className="text-sm font-semibold text-[#111827] mb-3">Department Activity</h3>
                  <div className="space-y-0">
                    {activityItems.map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div key={i} className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 text-gray-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-[#111827]">{item.label}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{item.time}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Top agents placeholder */}
                <div>
                  <h3 className="text-sm font-semibold text-[#111827] mb-3">Top Agents</h3>
                  <div className="rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-4 text-center text-sm text-gray-500">
                    Agent assignment data not available. Assign agents to requests to see activity here.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
