import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { Search, FileText, MessageSquare, Users } from "lucide-react";
import { fetchAllRequests } from "../api/requests";
import { fetchAllDocuments } from "../api/documents";
import { fetchDepartments } from "../api/departments";
import { StatusBadge } from "../components/StatusBadge";
import { PriorityBadge } from "../components/PriorityBadge";
import { useAuth } from "../auth/useAuth";

export function SearchPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const qParam = searchParams.get("q") ?? "";
  const [q, setQ] = useState(qParam);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");

  const { data: requests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ["requests"],
    queryFn: fetchAllRequests,
  });
  const { data: documents = [], isLoading: loadingDocs } = useQuery({
    queryKey: ["documents"],
    queryFn: fetchAllDocuments,
    enabled: user?.role === "admin" || user?.role === "agent",
  });
  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
  });

  const searchTerm = q.trim().toLowerCase();
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchSearch =
        !searchTerm ||
        r.title.toLowerCase().includes(searchTerm) ||
        r.id.toLowerCase().includes(searchTerm) ||
        (r.description || "").toLowerCase().includes(searchTerm) ||
        (r.category || "").toLowerCase().includes(searchTerm);
      const matchStatus = statusFilter === "all" || r.status === statusFilter;
      const matchDept = deptFilter === "all" || (r.category || "").toLowerCase() === deptFilter;
      if (user?.role === "user" && user?.id && r.requester_id !== user.id) return false;
      return matchSearch && matchStatus && matchDept;
    });
  }, [requests, searchTerm, statusFilter, deptFilter, user?.role, user?.id]);

  const filteredDocuments = useMemo(() => {
    if (!searchTerm) return documents.slice(0, 10);
    return documents.filter(
      (d) =>
        d.title.toLowerCase().includes(searchTerm) ||
        d.id.toLowerCase().includes(searchTerm)
    );
  }, [documents, searchTerm]);

  const filteredDepartments = useMemo(() => {
    if (!searchTerm) return departments.slice(0, 5);
    return departments.filter((d) =>
      d.name.toLowerCase().includes(searchTerm)
    );
  }, [departments, searchTerm]);

  const hasResults =
    filteredRequests.length > 0 ||
    filteredDocuments.length > 0 ||
    (filteredDepartments.length > 0 && (user?.role === "admin" || user?.role === "agent"));
  const isLoading = loadingRequests || loadingDocs;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#111827] flex items-center gap-2">
          <Search className="w-6 h-6 text-[#7C3AED]" />
          Global Search
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Search documents, requests, and departments. Results update as you type.
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents, requests, departments..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSearchParams(e.target.value ? { q: e.target.value } : {});
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20"
        >
          <option value="all">All status</option>
          <option value="new">New</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20"
        >
          <option value="all">All departments</option>
          <option value="financial">Finance</option>
          <option value="hr">HR</option>
          <option value="it">IT</option>
          <option value="legal">Legal</option>
          <option value="marketing">Marketing</option>
          <option value="operations">Operations</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading…</div>
        ) : !hasResults ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-2">
            <FileText className="w-12 h-12 text-gray-200" />
            <p>No results</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredDocuments.length > 0 && (user?.role === "admin" || user?.role === "agent") && (
              <section className="p-4">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Documents
                </h2>
                <ul className="space-y-2">
                  {filteredDocuments.map((d) => (
                    <li key={d.id} className="px-4 py-3 rounded-lg hover:bg-gray-50 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-[#111827]">{d.title}</p>
                        <p className="text-xs font-mono text-gray-500 mt-0.5">{d.id}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {filteredRequests.length > 0 && (
              <section className="p-4">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Requests
                </h2>
                <ul className="space-y-2">
                  {filteredRequests.map((r) => (
                    <li key={r.id} className="px-4 py-3 rounded-lg hover:bg-gray-50 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-[#111827]">{r.title}</p>
                        <p className="text-xs font-mono text-gray-500 mt-0.5">{r.id}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm text-gray-500 capitalize">{r.category}</span>
                        <PriorityBadge priority={r.priority} />
                        <StatusBadge status={r.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {filteredDepartments.length > 0 && (user?.role === "admin" || user?.role === "agent") && (
              <section className="p-4">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Departments
                </h2>
                <ul className="space-y-2">
                  {filteredDepartments.map((d) => (
                    <li key={d.id} className="px-4 py-3 rounded-lg hover:bg-gray-50">
                      <p className="font-medium text-[#111827]">{d.name}</p>
                      <p className="text-xs font-mono text-gray-500 mt-0.5">{d.id}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
