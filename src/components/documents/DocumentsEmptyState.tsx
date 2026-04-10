import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import clsx from "clsx";
import { FolderOpen, Upload, Sparkles, Shapes } from "lucide-react";

interface DocumentsEmptyStateProps {
  onBrowseTemplates?: () => void;
}

export function DocumentsEmptyState({ onBrowseTemplates }: DocumentsEmptyStateProps) {
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
      <div className="relative mx-auto max-w-xl overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-8 shadow-md shadow-slate-200/50 sm:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-gradient-to-br from-indigo-100/70 to-purple-100/60 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-14 -left-14 h-36 w-36 rounded-full bg-gradient-to-br from-blue-100/70 to-cyan-100/50 blur-2xl"
        />
        <div className="flex flex-col items-center text-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-600/10 ring-1 ring-blue-100">
            <FolderOpen className="h-8 w-8 text-[#2563EB]" strokeWidth={1.5} aria-hidden />
            <span className="absolute -bottom-1 -right-1 inline-flex h-6 w-6 items-center justify-center rounded-lg bg-white ring-1 ring-slate-200">
              <Shapes className="h-3.5 w-3.5 text-violet-500" aria-hidden />
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <Sparkles className="h-3 w-3 text-amber-400" aria-hidden />
            Document library
          </div>
          <h2 className="mt-3 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Start building your team knowledge base
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
            Keep policies, guides, and playbooks in one searchable space so your team can move faster.
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
            <button
              type="button"
              onClick={() => {
                if (onBrowseTemplates) {
                  onBrowseTemplates();
                  return;
                }
                toast.message("Template library", {
                  description: "Browse starter templates and adapt them for your team.",
                });
              }}
              className={clsx(
                "inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm",
                "transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 hover:shadow"
              )}
            >
              Browse templates
            </button>
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
