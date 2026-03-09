import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../auth/useAuth";
import { fetchAllRequests } from "../api/requests";
import { fetchDepartments } from "../api/departments";
import { ListTodo, Search } from "lucide-react";

const statusBadge: Record<string, string> = {
  new: "bg-blue-100 text-blue-700 border-blue-200",
  in_progress: "bg-amber-100 text-amber-600 border-amber-200",
  resolved: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};
const statusLabel: Record<string, string> = {
  new: "New",
  in_progress: "In Progress",
  resolved: "Resolved",
  rejected: "Rejected",
};
const priorityBadge: Record<string, string> = {
  High: "bg-red-100 text-red-700 border-red-200",
  Medium: "bg-orange-100 text-orange-700 border-orange-200",
  Low: "bg-blue-100 text-blue-700 border-blue-200",
};

export function MyRequests() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

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
    return myRequests.filter((r) => {
      const matchSearch = !q || r.title?.toLowerCase().includes(q) || r.id?.toLowerCase().includes(q);
      const matchStatus = !statusFilter || r.status === statusFilter;
      const matchPriority = !priorityFilter || r.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [myRequests, search, statusFilter, priorityFilter]);

  const getDeptName = (id: string) => departments.find((d) => d.id === id)?.name ?? "—";

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

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 min-w-[140px]"
        >
          <option value="">All statuses</option>
          <option value="new">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 min-w-[120px]"
        >
          <option value="">All priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No requests found. Create one from Dashboard or AI Request Chat.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Request ID</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Title</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Department</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Priority</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => navigate(`/my-requests/${r.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{r.id}</td>
                    <td className="px-4 py-3 font-medium text-[#111827]">{r.title || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{getDeptName(r.department_id)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${priorityBadge[r.priority] ?? "bg-gray-100 text-gray-700"}`}>
                        {r.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge[r.status] ?? "bg-gray-100 text-gray-700"}`}>
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
        )}
      </div>
    </div>
  );
}
