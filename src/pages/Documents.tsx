import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/useAuth";
import {
  fetchAllDocuments,
  fetchDepartmentDocuments,
  deleteDocument,
} from "../api/documents";
import { fetchDepartments } from "../api/departments";
import { FileText } from "lucide-react";
import { DocumentsEmptyState } from "../components/documents/DocumentsEmptyState";
import { DocumentsGrid, DocumentsGridSkeleton } from "../components/documents/DocumentsGrid";
import { formatFileSize } from "../components/documents/formatFileSize";

export function Documents() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const canAccess =
    user && (user.role === "user" || user.role === "agent" || user.role === "admin");

  const { data: documents = [], isLoading, error } = useQuery({
    queryKey: ["documents", user?.role, user?.department_id],
    queryFn: () =>
      user?.role === "agent" && user?.department_id
        ? fetchDepartmentDocuments(user.department_id)
        : fetchAllDocuments(),
    enabled: !!canAccess,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
    enabled: !!canAccess,
  });

  const getDeptName = (id: string) => departments.find((d) => d.id === id)?.name ?? "—";

  async function handleDelete(id: string) {
    if (!confirm("Delete this document?")) return;
    try {
      await deleteDocument(id);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    } catch (e) {
      console.error(e);
    }
  }

  if (!user) {
    return null;
  }

  if (!canAccess) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
        Access denied.
      </div>
    );
  }

  const subtitle =
    user.role === "agent"
      ? "Your department documents"
      : user.role === "admin"
        ? "All documents"
        : "View and download documents";

  return (
    <div className="min-h-[calc(100vh-6rem)] bg-[#F8FAFC] -mx-4 -mt-4 px-4 pb-12 pt-4 md:-mx-6 md:px-6 md:pb-16 md:pt-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="animate-in fade-in slide-in-from-bottom-1 duration-300 motion-reduce:animate-none">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
              <FileText className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Documents</h1>
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            </div>
          </div>
        </header>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {String(error)}
          </div>
        )}

        {isLoading ? (
          <DocumentsGridSkeleton />
        ) : documents.length === 0 ? (
          <div className="flex min-h-[min(560px,calc(100vh-12rem))] items-center justify-center py-6">
            <DocumentsEmptyState learnMoreAsLink={user.role === "user"} learnMoreTo="/help" />
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <p className="text-sm font-medium text-slate-600">
                <span className="tabular-nums text-slate-900">{documents.length}</span> document
                {documents.length === 1 ? "" : "s"}
              </p>
            </div>
            <DocumentsGrid
              documents={documents}
              getDeptName={getDeptName}
              canDelete={user.role === "admin"}
              onDelete={user.role === "admin" ? handleDelete : undefined}
            />

            <div className="hidden overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-md shadow-slate-200/40 lg:block">
              <div className="border-b border-slate-100 px-4 py-3 sm:px-5">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  List view
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/90 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3 sm:px-5">Name</th>
                      <th className="px-4 py-3 sm:px-5">Department</th>
                      <th className="px-4 py-3 sm:px-5">Uploaded</th>
                      <th className="px-4 py-3 sm:px-5">Size</th>
                      <th className="px-4 py-3 pr-5 text-right sm:px-5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {documents.map((d, i) => (
                      <tr
                        key={d.id}
                        className={
                          i % 2 === 1
                            ? "bg-slate-50/50 transition-colors duration-150 hover:bg-slate-100/70"
                            : "bg-white transition-colors duration-150 hover:bg-slate-50/90"
                        }
                      >
                        <td className="max-w-[220px] px-4 py-3 font-medium text-slate-900 sm:px-5">
                          <span className="line-clamp-2">{d.title}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 sm:px-5">{getDeptName(d.department_id)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600 sm:px-5">
                          {d.created_at
                            ? new Date(d.created_at).toLocaleString(undefined, {
                                dateStyle: "short",
                                timeStyle: "short",
                              })
                            : "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600 sm:px-5">
                          {formatFileSize(d.file_size_bytes)}
                        </td>
                        <td className="px-4 py-3 pr-5 text-right sm:px-5">
                          <div className="flex justify-end gap-1">
                            <a
                              href={d.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-lg px-2 py-1.5 text-xs font-semibold text-[#2563EB] transition-colors hover:bg-blue-50"
                            >
                              View
                            </a>
                            {user.role === "admin" && (
                              <button
                                type="button"
                                onClick={() => handleDelete(d.id)}
                                className="rounded-lg px-2 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
