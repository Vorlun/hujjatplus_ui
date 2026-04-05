import { useCallback, useRef, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import clsx from "clsx";
import { FolderOpen, Upload, Sparkles } from "lucide-react";

interface DocumentsEmptyStateProps {
  /** When true, secondary button links to help; otherwise shows an in-app tip */
  learnMoreAsLink?: boolean;
  learnMoreTo?: string;
}

export function DocumentsEmptyState({
  learnMoreAsLink = true,
  learnMoreTo = "/help",
}: DocumentsEmptyStateProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const onFiles = useCallback((files: FileList | null) => {
    if (!files?.length) return;
    toast.message("Files received", {
      description: `${files.length} file(s) selected. Your team can register document links in this library; full direct upload may require admin setup.`,
    });
  }, []);

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 ease-out motion-reduce:animate-none motion-reduce:opacity-100">
      <div className="mx-auto max-w-lg rounded-2xl border border-slate-200/90 bg-white p-8 shadow-md shadow-slate-200/50 sm:p-10">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-600/10 ring-1 ring-blue-100">
            <FolderOpen className="h-8 w-8 text-[#2563EB]" strokeWidth={1.5} aria-hidden />
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <Sparkles className="h-3 w-3 text-amber-400" aria-hidden />
            Document library
          </div>
          <h2 className="mt-3 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            No documents yet
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
            Upload and manage your department documents in one place.
          </p>

          <input
            ref={inputRef}
            type="file"
            multiple
            className="sr-only"
            aria-label="Choose files to upload"
            onChange={(e) => {
              onFiles(e.target.files);
              e.target.value = "";
            }}
          />

          <div className="mt-8 flex w-full flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className={clsx(
                "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/25",
                "transition-all duration-200 ease-out hover:scale-[1.02] hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/30",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              )}
            >
              <Upload className="h-4 w-4" aria-hidden />
              Upload Document
            </button>
            {learnMoreAsLink ? (
              <Link
                to={learnMoreTo}
                className={clsx(
                  "inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm",
                  "transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 hover:shadow"
                )}
              >
                Learn more
              </Link>
            ) : (
              <button
                type="button"
                onClick={() =>
                  toast.message("About documents", {
                    description:
                      "Documents listed here are shared by your organization. Contact an admin to add links, or use department requests to send files.",
                  })
                }
                className={clsx(
                  "inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm",
                  "transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 hover:shadow"
                )}
              >
                Learn more
              </button>
            )}
          </div>
        </div>

        <div
          role="button"
          tabIndex={0}
          aria-label="Open file picker or drop files to upload"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onClick={() => inputRef.current?.click()}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragActive(false);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            onFiles(e.dataTransfer.files);
          }}
          className={clsx(
            "mt-8 cursor-pointer rounded-xl border-2 border-dashed px-4 py-8 text-center transition-all duration-200",
            dragActive
              ? "border-[#2563EB] bg-blue-50/60 shadow-inner"
              : "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50"
          )}
        >
          <Upload
            className={clsx("mx-auto h-8 w-8", dragActive ? "text-[#2563EB]" : "text-slate-300")}
            aria-hidden
          />
          <p className="mt-2 text-sm font-medium text-slate-700">Drag & drop files here</p>
          <p className="mt-1 text-xs text-slate-500">or click to browse — PDF, images, Office</p>
        </div>
      </div>
    </div>
  );
}
