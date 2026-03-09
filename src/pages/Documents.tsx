import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/useAuth";
import {
  fetchAllDocuments,
  fetchDepartmentDocuments,
  deleteDocument,
  type DocumentItem,
} from "../api/documents";
import { fetchDepartments } from "../api/departments";
import { FileText, Trash2, Download } from "lucide-react";

export function Documents() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading, error } = useQuery({
    queryKey: ["documents", user?.role, user?.department_id],
    queryFn: () =>
      user?.role === "agent" && user?.department_id
        ? fetchDepartmentDocuments(user.department_id)
        : fetchAllDocuments(),
  });
  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
  });
  const getDeptName = (id: string) => departments.find((d) => d.id === id)?.name ?? "—";

  if (user?.role === "user") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#111827] mb-2 flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#7C3AED]" />
            Documents
          </h1>
          <p className="text-sm text-gray-500">View and download documents</p>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
            {String(error)}
          </div>
        )}

        {isLoading ? (
          <p className="text-gray-500">Loading…</p>
        ) : documents.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-12 text-center text-gray-500">
            No documents available.
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Document name</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Department</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Uploaded date</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {documents.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-[#111827]">{d.title}</td>
                      <td className="px-4 py-3 text-gray-600">{getDeptName(d.department_id)}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {d.created_at ? new Date(d.created_at).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" }) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <a
                          href={d.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#7C3AED] hover:underline"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (user?.role !== "agent" && user?.role !== "admin") {
    return (
      <div>
        <p className="text-gray-500">Access denied.</p>
      </div>
    );
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this document?")) return;
    try {
      await deleteDocument(id);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#111827] mb-2 flex items-center gap-2">
          <FileText className="w-6 h-6 text-[#7C3AED]" />
          Documents
        </h1>
        <p className="text-sm text-gray-500">
          {user?.role === "agent" ? "Your department documents" : "All documents"}
        </p>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
          {String(error)}
        </div>
      )}

      {isLoading ? (
        <p className="text-gray-500">Loading…</p>
      ) : documents.length === 0 ? (
        <p className="text-gray-500">No documents</p>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Title</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Department</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Link</th>
                  {user?.role === "admin" && (
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Action</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {documents.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{d.title}</td>
                    <td className="px-4 py-3 text-gray-600">{getDeptName(d.department_id)}</td>
                    <td className="px-4 py-3">
                      <a
                        href={d.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#7C3AED] hover:underline truncate block max-w-xs"
                      >
                        {d.file_url}
                      </a>
                    </td>
                    {user?.role === "admin" && (
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(d.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
