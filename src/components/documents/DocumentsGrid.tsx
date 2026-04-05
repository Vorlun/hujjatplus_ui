import clsx from "clsx";
import { Download, Eye, FileText, Trash2 } from "lucide-react";
import type { DocumentItem } from "../../api/documents";
import { formatFileSize } from "./formatFileSize";

interface DocumentsGridProps {
  documents: DocumentItem[];
  getDeptName: (departmentId: string) => string;
  canDelete: boolean;
  onDelete?: (id: string) => void;
}

export function DocumentsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-slate-100 bg-white p-5 shadow-sm"
        >
          <div className="h-10 w-10 rounded-lg bg-slate-100" />
          <div className="mt-4 h-4 w-48 max-w-full rounded bg-slate-100" />
          <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
          <div className="mt-4 flex gap-2">
            <div className="h-8 flex-1 rounded-lg bg-slate-100" />
            <div className="h-8 w-8 rounded-lg bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DocumentsGrid({ documents, getDeptName, canDelete, onDelete }: DocumentsGridProps) {
  return (
    <div
      className={clsx(
        "grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
        "animate-in fade-in slide-in-from-bottom-1 duration-300 ease-out motion-reduce:animate-none"
      )}
    >
      {documents.map((d) => (
        <article
          key={d.id}
          className={clsx(
            "group flex flex-col rounded-xl border border-slate-200/90 bg-white p-5 shadow-md shadow-slate-200/40",
            "transition-all duration-200 hover:border-slate-300 hover:shadow-lg"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 ring-1 ring-slate-200/80">
              <FileText className="h-5 w-5 text-[#2563EB]" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold leading-snug text-slate-900 line-clamp-2">{d.title}</h3>
              <p className="mt-1 text-xs text-slate-500">{getDeptName(d.department_id)}</p>
            </div>
          </div>
          <dl className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-xs text-slate-600">
            <div className="flex justify-between gap-2">
              <dt className="text-slate-400">Uploaded</dt>
              <dd className="font-medium text-slate-700">
                {d.created_at
                  ? new Date(d.created_at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-400">Size</dt>
              <dd className="font-medium text-slate-700">{formatFileSize(d.file_size_bytes)}</dd>
            </div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={d.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className={clsx(
                "inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700",
                "transition-all duration-150 hover:border-blue-200 hover:bg-blue-50/80 hover:text-blue-800 min-w-[5rem]"
              )}
            >
              <Eye className="h-3.5 w-3.5" aria-hidden />
              View
            </a>
            <a
              href={d.file_url}
              target="_blank"
              rel="noopener noreferrer"
              download
              className={clsx(
                "inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white",
                "transition-all duration-150 hover:bg-slate-800 min-w-[5rem]"
              )}
            >
              <Download className="h-3.5 w-3.5" aria-hidden />
              Download
            </a>
            {canDelete && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(d.id)}
                className={clsx(
                  "inline-flex cursor-pointer items-center justify-center rounded-lg border border-red-100 bg-red-50/80 p-2 text-red-600",
                  "transition-all duration-150 hover:bg-red-100"
                )}
                title="Delete"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
