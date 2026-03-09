import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../auth/useAuth";
import { fetchAllRequests } from "../api/requests";
import { fetchDepartments } from "../api/departments";
import { MessageCircleReply } from "lucide-react";

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

function formatRelativeTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  return d.toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
}

export function DepartmentResponses() {
  const { user } = useAuth();
  const navigate = useNavigate();

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

  const getDeptName = (id: string) => departments.find((d) => d.id === id)?.name ?? "—";
  const getAgentName = (r: (typeof requests)[0]) =>
    (r as { assigned_agent_name?: string; assigned_agent?: string }).assigned_agent_name ??
    (r as { assigned_agent_name?: string; assigned_agent?: string }).assigned_agent ??
    "—";
  const getMessage = (r: (typeof requests)[0]) =>
    (r as { department_reply?: string }).department_reply ?? r.description ?? r.title ?? "—";
  const getUpdatedAt = (r: (typeof requests)[0]) =>
    (r as { updated_at?: string }).updated_at ?? r.created_at;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#111827] flex items-center gap-2">
          <MessageCircleReply className="w-6 h-6 text-[#7C3AED]" />
          Department Responses
        </h1>
        <p className="text-sm text-gray-500 mt-1">Replies from departments regarding your requests</p>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
          {String(error)}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading…</div>
        ) : myRequests.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No requests yet. Submit a request from AI Chat to see responses here.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Request ID</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Department</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Agent Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Message</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Updated At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {myRequests.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => navigate(`/department-responses/${r.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{r.id}</td>
                    <td className="px-4 py-3 text-gray-700">{getDeptName(r.department_id)} Department</td>
                    <td className="px-4 py-3 text-gray-700">{getAgentName(r)}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-xs truncate" title={getMessage(r)}>
                      {getMessage(r)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge[r.status] ?? "bg-gray-100 text-gray-700"}`}>
                        {statusLabel[r.status] ?? r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatRelativeTime(getUpdatedAt(r))}</td>
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
