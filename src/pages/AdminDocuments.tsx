import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAllDocuments,
  deleteDocument,
  type DocumentItem,
} from "../api/documents";
import { fetchDepartments as getDepartments } from "../api/departments";
import { FileText, Search, Eye, Download, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 10;

export function AdminDocuments() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [page, setPage] = useState(1);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: fetchAllDocuments,
  });
  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
  });

  const filtered = useMemo(() => {
    return documents.filter((d) => {
      const matchSearch =
        !search ||
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.id.toLowerCase().includes(search.toLowerCase());
      const matchDept = !deptFilter || d.department_id === deptFilter;
      const matchDate = !dateFrom || (d.created_at && d.created_at.slice(0, 10) >= dateFrom);
      return matchSearch && matchDept && matchDate;
    });
  }, [documents, search, deptFilter, dateFrom]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  const getDeptName = (id: string) => departments.find((d) => d.id === id)?.name ?? id.slice(0, 8);
  const createdDate = (d: DocumentItem) =>
    d.created_at ? new Date(d.created_at).toLocaleDateString(undefined, { dateStyle: "medium" }) : "—";

  async function handleDelete(d: DocumentItem) {
    if (!confirm(`Delete "${d.title}"?`)) return;
    try {
      await deleteDocument(d.id);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setSelectedDoc(null);
    } catch {
      // error handled by global toast
    }
  }

  return (
    <div className="flex gap-6">
      <div className={`flex-1 flex flex-col min-w-0 ${selectedDoc ? "max-w-[58%]" : ""}`}>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[#111827] flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#7C3AED]" />
            Documents
          </h1>
          <p className="text-sm text-gray-500 mt-1">Document management</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
            />
          </div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20"
          >
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20"
          >
            <option value="">All priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20"
          >
            <option value="">All statuses</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-gray-500">Loading…</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Document ID</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Title</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Department</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Uploaded By</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Priority</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Created Date</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginated.map((d) => (
                      <tr
                        key={d.id}
                        onClick={() => setSelectedDoc(d)}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-4 py-3 font-mono text-gray-600">{d.id.slice(0, 8)}…</td>
                        <td className="px-4 py-3 font-medium text-[#111827]">{d.title}</td>
                        <td className="px-4 py-3 text-gray-600">{getDeptName(d.department_id)}</td>
                        <td className="px-4 py-3 text-gray-500">—</td>
                        <td className="px-4 py-3 text-gray-500">—</td>
                        <td className="px-4 py-3 text-gray-500">—</td>
                        <td className="px-4 py-3 text-gray-600">{createdDate(d)}</td>
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setSelectedDoc(d)}
                              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <a
                              href={d.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleDelete(d)}
                              className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filtered.length === 0 && (
                <div className="p-12 text-center text-gray-500">No documents</div>
              )}
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                  <p className="text-sm text-gray-500">
                    Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selectedDoc && (
        <div className="w-[42%] min-w-[320px] flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden flex-1">
            <div className="p-6 border-b border-gray-200 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#111827]">{selectedDoc.title}</h2>
                <p className="text-xs font-mono text-gray-500 mt-1">{selectedDoc.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <dt className="text-gray-500">Department</dt>
                <dd className="text-[#111827]">{getDeptName(selectedDoc.department_id)}</dd>
                <dt className="text-gray-500">Created</dt>
                <dd className="text-[#111827]">{createdDate(selectedDoc)}</dd>
              </dl>
              <a
                href={selectedDoc.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#7C3AED] hover:underline"
              >
                <Download className="w-4 h-4" /> Download file
              </a>
              <button
                type="button"
                onClick={() => handleDelete(selectedDoc)}
                className="flex items-center gap-2 text-sm text-red-600 hover:underline"
              >
                <Trash2 className="w-4 h-4" /> Delete document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
