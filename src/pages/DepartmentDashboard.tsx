import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useAuth } from "../auth/useAuth";
import { fetchDepartmentRequests } from "../api/requests";
import { fetchDepartments } from "../api/departments";
import { StatusBadge } from "../components/StatusBadge";
import { PriorityBadge } from "../components/PriorityBadge";
import { TableRowSkeleton } from "../components/ui/Skeleton";
import {
  LayoutDashboard,
  Inbox,
  Loader2,
  FileSearch,
  Eye,
  Clock,
  MessageSquare,
} from "lucide-react";

export function DepartmentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const departmentId = user?.department_id ?? "";

  const { data: requests = [], isLoading, error } = useQuery({
    queryKey: ["department-requests", departmentId],
    queryFn: () => fetchDepartmentRequests(departmentId),
    enabled: !!departmentId && (user?.role === "agent" || user?.role === "admin"),
  });
  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
  });

  const getDeptName = (id: string) => departments.find((d) => d.id === id)?.name ?? "—";
  const departmentName = departmentId ? getDeptName(departmentId) : "Your department";

  const stats = {
    new: requests.filter((r) => r.status === "new").length,
    in_progress: requests.filter((r) => r.status === "in_progress").length,
    resolved: requests.filter((r) => r.status === "resolved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  const recentActivity = requests.slice(0, 5);

  if (user?.role !== "agent" && user?.role !== "admin") {
    return (
      <div className="text-[#6B7280] p-6">Access denied. Department or Admin only.</div>
    );
  }

  if (!departmentId && user?.role === "agent") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-6 text-amber-800">
        <p className="font-medium">No department assigned</p>
        <p className="text-sm mt-1">Contact your administrator to assign you to a department (HR, IT, Finance, Legal, Marketing, Operations).</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-w-0 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#111827] flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-[#7C3AED]" />
          Department Dashboard
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">{departmentName}</p>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
          {String(error)}
        </div>
      )}

      {/* Top stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 px-4 py-4">
          <p className="text-2xl font-semibold text-blue-700 tabular-nums">{stats.new}</p>
          <p className="text-xs font-medium text-blue-600 mt-0.5">New Requests</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-4">
          <p className="text-2xl font-semibold text-amber-700 tabular-nums">{stats.in_progress}</p>
          <p className="text-xs font-medium text-amber-600 mt-0.5">In Progress</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50/50 px-4 py-4">
          <p className="text-2xl font-semibold text-green-700 tabular-nums">{stats.resolved}</p>
          <p className="text-xs font-medium text-green-600 mt-0.5">Resolved</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50/50 px-4 py-4">
          <p className="text-2xl font-semibold text-red-700 tabular-nums">{stats.rejected}</p>
          <p className="text-xs font-medium text-red-600 mt-0.5">Rejected</p>
        </div>
      </div>

      {/* Requests table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-[#111827] flex items-center gap-2">
            <Inbox className="w-4 h-4 text-[#7C3AED]" />
            Department Requests
          </h2>
          <button
            type="button"
            onClick={() => navigate("/inbox")}
            className="text-sm text-[#7C3AED] hover:underline font-medium"
          >
            Open Inbox →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Title</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Priority</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Requester</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Created</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <>
                  <tr><td colSpan={6} className="px-4 py-3 text-gray-500 text-center">Loading requests...</td></tr>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <TableRowSkeleton key={i} cols={6} />
                  ))}
                </>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    <FileSearch className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                    <p className="font-medium text-gray-600">No requests for this department yet</p>
                    <p className="text-xs mt-1">New requests will appear here when they are routed to your department.</p>
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => navigate("/inbox")}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-[#111827]">{r.title || "—"}</td>
                    <td className="px-4 py-3"><PriorityBadge priority={r.priority} /></td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3 text-gray-600">{r.requester_name ?? r.requester_id ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {new Date(r.created_at).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); navigate("/inbox"); }}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#111827]"
                        title="View in Inbox"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-[#111827] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#7C3AED]" />
            Recent Activity
          </h2>
        </div>
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading requests...</span>
            </div>
          ) : recentActivity.length === 0 ? (
            <p className="text-sm text-gray-500">No recent activity.</p>
          ) : (
            <ul className="space-y-3">
              {recentActivity.map((r) => (
                <li key={r.id} className="flex items-start gap-3 text-sm">
                  <MessageSquare className="w-4 h-4 text-[#7C3AED] flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[#111827] truncate">{r.title || "Request"}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {r.status} · {new Date(r.created_at).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
