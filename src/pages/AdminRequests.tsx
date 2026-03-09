import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/useAuth";
import { fetchAllRequests, updateRequestStatus, type RequestListItem, type RequestStatus } from "../api/requests";
import { fetchDepartments } from "../api/departments";
import { useNavigate } from "react-router";
import {
  ListTodo,
  Search,
  Eye,
  Pencil,
  MoreVertical,
  Loader2,
  FileSearch,
} from "lucide-react";
import { TableRowSkeleton } from "../components/ui/Skeleton";

const statusConfig: Record<string, { label: string; className: string }> = {
  new: { label: "New", className: "bg-blue-100 text-blue-700 border-blue-200" },
  in_progress: { label: "In Progress", className: "bg-amber-100 text-amber-700 border-amber-200" },
  resolved: { label: "Resolved", className: "bg-green-100 text-green-700 border-green-200" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700 border-red-200" },
};

const priorityConfig: Record<string, { className: string }> = {
  High: { className: "bg-red-100 text-red-700 border-red-200" },
  Medium: { className: "bg-orange-100 text-orange-700 border-orange-200" },
  Low: { className: "bg-blue-100 text-blue-700 border-blue-200" },
};

const STATUS_OPTIONS: { value: RequestStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
];

export function AdminRequests() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: RequestStatus }) =>
      updateRequestStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["department-requests"] });
      queryClient.invalidateQueries({ queryKey: ["request"] });
    },
  });

  const { data: requests = [], isLoading, error } = useQuery({
    queryKey: ["requests"],
    queryFn: fetchAllRequests,
    enabled: user?.role === "admin",
  });
  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
  });

  const getDeptName = (id: string) => departments.find((d) => d.id === id)?.name ?? "—";

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return requests.filter((r) => {
      const matchSearch =
        !term ||
        r.title?.toLowerCase().includes(term) ||
        r.id?.toLowerCase().includes(term) ||
        getDeptName(r.department_id).toLowerCase().includes(term) ||
        (r.category || "").toLowerCase().includes(term);
      const matchDept = !deptFilter || r.department_id === deptFilter;
      const matchPriority = !priorityFilter || r.priority === priorityFilter;
      const matchStatus = !statusFilter || r.status === statusFilter;
      const matchDate = !dateFrom || (r.created_at && r.created_at.slice(0, 10) >= dateFrom);
      return matchSearch && matchDept && matchPriority && matchStatus && matchDate;
    });
  }, [requests, search, deptFilter, priorityFilter, statusFilter, dateFrom, departments]);

  const stats = useMemo(
    () => ({
      new: requests.filter((r) => r.status === "new").length,
      in_progress: requests.filter((r) => r.status === "in_progress").length,
      resolved: requests.filter((r) => r.status === "resolved").length,
      rejected: requests.filter((r) => r.status === "rejected").length,
    }),
    [requests]
  );

  if (user?.role !== "admin") {
    return (
      <div>
        <p className="text-gray-500">Access denied.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-w-0">
      <div className="flex-1 flex flex-col min-w-0">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[#111827] flex items-center gap-2">
            <ListTodo className="w-6 h-6 text-[#7C3AED]" />
            Requests
          </h1>
          <p className="text-sm text-gray-500 mt-1">All requests across departments</p>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
            {String(error)}
          </div>
        )}

        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search requests by title, request ID or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-[#111827] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 min-w-[120px]"
            >
              <option value="">All departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 min-w-[110px]"
            >
              <option value="">All priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 min-w-[110px]"
            >
              <option value="">All statuses</option>
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20"
            />
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 px-4 py-3">
            <p className="text-2xl font-semibold text-blue-700 tabular-nums">{stats.new}</p>
            <p className="text-xs font-medium text-blue-600 mt-0.5">New Requests</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-3">
            <p className="text-2xl font-semibold text-amber-700 tabular-nums">{stats.in_progress}</p>
            <p className="text-xs font-medium text-amber-600 mt-0.5">In Progress</p>
          </div>
          <div className="rounded-xl border border-green-200 bg-green-50/50 px-4 py-3">
            <p className="text-2xl font-semibold text-green-700 tabular-nums">{stats.resolved}</p>
            <p className="text-xs font-medium text-green-600 mt-0.5">Resolved</p>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50/50 px-4 py-3">
            <p className="text-2xl font-semibold text-red-700 tabular-nums">{stats.rejected}</p>
            <p className="text-xs font-medium text-red-600 mt-0.5">Rejected</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Request ID</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Title</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Category</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Department</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Requester</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Priority</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Created At</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600 w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRowSkeleton key={i} cols={9} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3 text-gray-500">
              <FileSearch className="w-12 h-12 text-gray-300" />
              <p className="text-sm font-medium text-gray-600">No requests found</p>
              <p className="text-xs text-gray-400">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Request ID</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Title</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Category</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Department</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Requester</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Priority</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Created At</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600 w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((r) => {
                    const status = statusConfig[r.status] ?? { label: r.status, className: "bg-gray-100 text-gray-700 border-gray-200" };
                    const priority = priorityConfig[r.priority] ?? { className: "bg-gray-100 text-gray-700 border-gray-200" };
                    return (
                      <tr
                        key={r.id}
                        onClick={() => navigate(`/admin/requests/${r.id}`)}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">{r.id}</td>
                        <td className="px-4 py-3 font-medium text-[#111827]">{r.title || "—"}</td>
                        <td className="px-4 py-3 text-gray-600 capitalize">{r.category || "—"}</td>
                        <td className="px-4 py-3 text-gray-600">{getDeptName(r.department_id)}</td>
                        <td className="px-4 py-3 text-gray-600">{r.requester_name ?? r.requester_id ?? "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${priority.className}`}>
                            {r.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={r.status}
                            onChange={(e) => {
                              const s = e.target.value as RequestStatus;
                              updateStatusMutation.mutate({ id: r.id, status: s });
                            }}
                            disabled={updateStatusMutation.isPending}
                            className="min-w-[7rem] px-2.5 py-1.5 rounded-lg text-xs font-medium border border-gray-200 bg-white text-[#111827] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] disabled:opacity-60"
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {new Date(r.created_at).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                        </td>
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); navigate(`/admin/requests/${r.id}`); }}
                              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#111827]"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#111827]"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setActionMenuId(actionMenuId === r.id ? null : r.id)}
                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#111827]"
                                title="More options"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              {actionMenuId === r.id && (
                                <>
                                  <div className="fixed inset-0 z-10" onClick={() => setActionMenuId(null)} aria-hidden />
                                  <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-20">
                                    <button type="button" onClick={() => { navigate(`/admin/requests/${r.id}`); setActionMenuId(null); }} className="w-full px-3 py-2 text-left text-sm text-[#111827] hover:bg-gray-50 flex items-center gap-2">
                                      <Eye className="w-4 h-4" /> View
                                    </button>
                                    <button type="button" className="w-full px-3 py-2 text-left text-sm text-[#111827] hover:bg-gray-50 flex items-center gap-2">
                                      <Pencil className="w-4 h-4" /> Edit
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
