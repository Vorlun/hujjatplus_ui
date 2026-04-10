import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/useAuth";
import {
  fetchAllDocuments,
  fetchDepartmentDocuments,
  deleteDocument,
  type DocumentItem,
} from "../api/documents";
import { fetchDepartments } from "../api/departments";
import {
  ArrowDownAZ,
  ArrowUpDown,
  Download,
  Eye,
  File,
  FileSpreadsheet,
  FileText,
  Grid3X3,
  List,
  MoreHorizontal,
  Search,
  Share2,
  Trash2,
  Upload,
} from "lucide-react";
import { formatFileSize } from "../components/documents/formatFileSize";
import { toast } from "sonner";

const defaultSeedDocuments: DocumentItem[] = [
  {
    id: "seed-hr-policy",
    title: "HR Policy Handbook",
    department_id: "seed-hr",
    file_url: "/documents/hr-policies.html",
    created_at: "2026-01-10T09:00:00Z",
  },
  {
    id: "seed-finance-expenses",
    title: "Finance Expense Template",
    department_id: "seed-finance",
    file_url: "/documents/finance-forms.html",
    created_at: "2026-01-12T09:00:00Z",
  },
  {
    id: "seed-it-onboarding",
    title: "IT Support Quick Guide",
    department_id: "seed-it",
    file_url: "/documents/it-support-guide.html",
    created_at: "2026-01-14T09:00:00Z",
  },
];

type CategoryFilter = "All" | "HR" | "Finance" | "IT";
type SortMode = "newest" | "oldest" | "name";
type ViewMode = "grid" | "list";
type ListSortKey = "title" | "department" | "created" | "size";
type ListSortDirection = "asc" | "desc";

function inferCategory(title: string, departmentName: string): Exclude<CategoryFilter, "All"> {
  const t = `${title} ${departmentName}`.toLowerCase();
  if (/(finance|invoice|expense|budget|payment)/.test(t)) return "Finance";
  if (/(it|support|tech|system|network|vpn)/.test(t)) return "IT";
  return "HR";
}

function fileExt(url: string): string {
  return url.split(".").pop()?.toUpperCase() ?? "FILE";
}

function fileTypeIcon(ext: string) {
  if (ext === "PDF") return FileText;
  if (ext === "XLSX" || ext === "XLS" || ext === "CSV") return FileSpreadsheet;
  return File;
}

export function Documents() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [listSort, setListSort] = useState<{ key: ListSortKey; direction: ListSortDirection }>({
    key: "created",
    direction: "desc",
  });

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

  const getDeptName = (id: string) =>
    departments.find((d) => d.id === id)?.name ??
    ({
      "seed-hr": "HR",
      "seed-finance": "Finance",
      "seed-it": "IT",
    }[id] ?? "—");

  async function handleDelete(id: string) {
    if (!confirm("Delete this document?")) return;
    try {
      await deleteDocument(id);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document deleted");
    } catch (e) {
      console.error(e);
      toast.error("Unable to delete document");
    }
  }

  function handleShare(doc: DocumentItem) {
    const url = doc.file_url;
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success("Share link copied"))
      .catch(() => toast.error("Unable to copy link"));
  }

  function handleRename(doc: DocumentItem) {
    const next = window.prompt("Rename document", doc.title);
    if (!next || next.trim() === doc.title) return;
    toast.message("Rename queued", {
      description: "Rename endpoint is not enabled yet. UI action captured.",
    });
  }

  function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const next = Array.from(files);
    setSelectedFiles(next);
    setUploadProgress(0);
  }

  useEffect(() => {
    if (selectedFiles.length === 0) return;
    if (uploadProgress >= 100) return;
    const t = window.setInterval(() => {
      setUploadProgress((p) => Math.min(100, p + 12));
    }, 180);
    return () => window.clearInterval(t);
  }, [selectedFiles.length, uploadProgress]);

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
  const usingSeedDocuments = documents.length === 0;
  const visibleDocuments = usingSeedDocuments ? defaultSeedDocuments : documents;
  const decoratedDocuments = useMemo(() => {
    return visibleDocuments.map((d) => {
      const departmentName = getDeptName(d.department_id);
      const ext = fileExt(d.file_url);
      const categoryName = inferCategory(d.title, departmentName);
      return { ...d, departmentName, ext, categoryName };
    });
  }, [visibleDocuments, departments]);

  const filteredDocuments = useMemo(() => {
    const q = search.trim().toLowerCase();
    const next = decoratedDocuments.filter((d) => {
      const matchesSearch =
        !q ||
        d.title.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q) ||
        d.departmentName.toLowerCase().includes(q);
      const matchesCategory = category === "All" || d.categoryName === category;
      return matchesSearch && matchesCategory;
    });
    return [...next].sort((a, b) => {
      if (sortMode === "name") return a.title.localeCompare(b.title);
      if (sortMode === "oldest")
        return new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime();
      return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
    });
  }, [decoratedDocuments, search, category, sortMode]);

  const listSortedDocuments = useMemo(() => {
    return [...filteredDocuments].sort((a, b) => {
      const mul = listSort.direction === "asc" ? 1 : -1;
      if (listSort.key === "title") return a.title.localeCompare(b.title) * mul;
      if (listSort.key === "department") return a.departmentName.localeCompare(b.departmentName) * mul;
      if (listSort.key === "size") return ((a.file_size_bytes ?? 0) - (b.file_size_bytes ?? 0)) * mul;
      return (
        (new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime()) * mul
      );
    });
  }, [filteredDocuments, listSort]);

  function toggleListSort(key: ListSortKey) {
    setListSort((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] bg-[#F8FAFC] -mx-4 -mt-4 px-4 pb-12 pt-4 md:-mx-6 md:px-6 md:pb-16 md:pt-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="animate-in fade-in slide-in-from-bottom-1 duration-300 motion-reduce:animate-none">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                  <FileText className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Documents</h1>
                  <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => uploadInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"
              >
                <Upload className="h-4 w-4" />
                Upload
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_170px_160px_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search documents..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryFilter)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="All">All</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="IT">IT</option>
              </select>
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="name">Name</option>
              </select>
              <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold ${viewMode === "grid" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  <Grid3X3 className="h-3.5 w-3.5" />
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold ${viewMode === "list" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  <List className="h-3.5 w-3.5" />
                  List
                </button>
              </div>
            </div>
          </div>
        </header>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {String(error)}
          </div>
        )}

        <input
          ref={uploadInputRef}
          type="file"
          multiple
          className="sr-only"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />

        <div
          className={`rounded-2xl border-2 border-dashed p-4 transition ${
            dragOver ? "border-blue-300 bg-blue-50/50" : "border-slate-200 bg-white"
          }`}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(false);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
        >
          <p className="text-sm text-slate-600">Drag & drop files here, or click Upload to choose files.</p>
          {selectedFiles.length > 0 && (
            <div className="mt-3 space-y-2">
              {selectedFiles.slice(0, 3).map((f) => (
                <div key={f.name} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  {f.name}
                </div>
              ))}
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="h-10 w-10 rounded-xl bg-slate-100" />
                <div className="mt-4 h-4 w-40 rounded bg-slate-100" />
                <div className="mt-2 h-3 w-2/3 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <FileText className="h-5 w-5" />
            </div>
            <p className="text-base font-semibold text-slate-700">No documents found</p>
            <p className="mt-1 text-sm text-slate-500">
              Start organizing your team files in one place.
            </p>
            <button
              type="button"
              onClick={() => uploadInputRef.current?.click()}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
            >
              <Upload className="h-4 w-4" />
              Upload document
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredDocuments.map((d) => {
              const Icon = fileTypeIcon(d.ext);
              return (
                <article
                  key={d.id}
                  className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpenMenuId((prev) => (prev === d.id ? null : d.id))}
                      className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                  <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">{d.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">{d.departmentName} · {d.categoryName}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {formatFileSize(d.file_size_bytes)} ·{" "}
                    {d.created_at
                      ? new Date(d.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })
                      : "—"}
                  </p>

                  <div className="mt-4 flex gap-2 opacity-0 transition group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => setPreviewDoc(d)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Preview
                    </button>
                    <a
                      href={d.file_url}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </a>
                  </div>

                  {openMenuId === d.id && (
                    <div className="absolute right-4 top-12 z-10 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                      <button type="button" onClick={() => handleRename(d)} className="block w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50">
                        Rename
                      </button>
                      <button type="button" onClick={() => handleShare(d)} className="block w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50">
                        Share
                      </button>
                      {!usingSeedDocuments && user.role === "admin" && (
                        <button
                          type="button"
                          onClick={() => handleDelete(d.id)}
                          className="block w-full px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {[
                      { key: "title", label: "Name" },
                      { key: "department", label: "Department" },
                      { key: "created", label: "Uploaded" },
                      { key: "size", label: "Size" },
                    ].map((col) => (
                      <th key={col.key} className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => toggleListSort(col.key as ListSortKey)}
                          className="inline-flex items-center gap-1 hover:text-slate-700"
                        >
                          {col.label}
                          <ArrowUpDown className="h-3.5 w-3.5" />
                        </button>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {listSortedDocuments.map((d) => {
                    const Icon = fileTypeIcon(d.ext);
                    return (
                      <tr key={d.id} className="transition hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className="font-medium text-slate-900">{d.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{d.departmentName}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {d.created_at
                            ? new Date(d.created_at).toLocaleDateString(undefined, {
                                dateStyle: "medium",
                              })
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{formatFileSize(d.file_size_bytes)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setPreviewDoc(d)}
                              className="rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                            >
                              Preview
                            </button>
                            <a
                              href={d.file_url}
                              target="_blank"
                              rel="noreferrer"
                              download
                              className="rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                            >
                              Download
                            </a>
                            <button
                              type="button"
                              onClick={() => setOpenMenuId((prev) => (prev === d.id ? null : d.id))}
                              className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </div>
                          {openMenuId === d.id && (
                            <div className="absolute right-6 z-10 mt-1 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                              <button type="button" onClick={() => handleRename(d)} className="block w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50">
                                Rename
                              </button>
                              <button type="button" onClick={() => handleShare(d)} className="block w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50">
                                Share
                              </button>
                              {!usingSeedDocuments && user.role === "admin" && (
                                <button
                                  type="button"
                                  onClick={() => handleDelete(d.id)}
                                  className="block w-full px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {previewDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
            <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
                <h3 className="text-base font-semibold text-slate-900">{previewDoc.title}</h3>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100"
                >
                  Close
                </button>
              </div>
              <div className="p-4">
                {fileExt(previewDoc.file_url) === "PDF" ? (
                  <iframe
                    src={previewDoc.file_url}
                    title={previewDoc.title}
                    className="h-[65vh] w-full rounded-xl border border-slate-200"
                  />
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-600">
                    Preview is not available for this file type.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
