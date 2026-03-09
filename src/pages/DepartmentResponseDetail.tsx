import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../auth/useAuth";
import { fetchRequestById } from "../api/requests";
import { fetchDepartments } from "../api/departments";
import { ArrowLeft, User, Building2 } from "lucide-react";

const statusLabel: Record<string, string> = {
  new: "New",
  in_progress: "In Progress",
  resolved: "Resolved",
  rejected: "Rejected",
};

export function DepartmentResponseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState<Awaited<ReturnType<typeof fetchRequestById>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchRequestById(id);
        if (!cancelled) setRequest(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  const { data: departments = [] } = useQuery({ queryKey: ["departments"], queryFn: fetchDepartments });
  const getDeptName = (deptId: string) => departments.find((d) => d.id === deptId)?.name ?? deptId;

  if (!id) {
    navigate("/department-responses");
    return null;
  }

  if (loading) return <div className="text-gray-500 p-6">Loading…</div>;
  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-red-600">{error}</div>
        <button type="button" onClick={() => navigate("/department-responses")} className="text-[#7C3AED] hover:underline">
          Back to Department Responses
        </button>
      </div>
    );
  }
  if (!request) return null;

  const isOwner = user?.id && request.requester_id === user.id;
  if (!isOwner && user?.role === "user") {
    navigate("/department-responses");
    return null;
  }

  const req = request as typeof request & { assigned_agent_name?: string; assigned_agent?: string; department_reply?: string };
  const agentName = req.assigned_agent_name ?? req.assigned_agent ?? "—";
  const departmentReply = req.department_reply ?? null;
  const deptName = getDeptName(request.department_id);
  const createdStr = new Date(request.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  const updatedStr = (request as { updated_at?: string }).updated_at
    ? new Date((request as { updated_at: string }).updated_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : createdStr;

  return (
    <div className="max-w-2xl space-y-6">
      <button
        type="button"
        onClick={() => navigate("/department-responses")}
        className="flex items-center gap-2 text-gray-500 hover:text-[#111827]"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Department Responses
      </button>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <h2 className="text-lg font-semibold text-[#111827] mb-4">Request status</h2>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-gray-500">Request ID</dt>
            <dd className="font-mono font-medium text-[#111827]">{request.id}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Status</dt>
            <dd className="font-medium text-[#111827]">{statusLabel[request.status] ?? request.status}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Department</dt>
            <dd className="text-[#111827]">{deptName}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Assigned agent</dt>
            <dd className="text-[#111827]">{agentName}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <h2 className="text-lg font-semibold text-[#111827] px-6 py-4 border-b border-gray-100">Conversation</h2>
        <div className="p-6 space-y-4">
          {/* User request */}
          <div className="flex justify-end">
            <div className="max-w-[85%]">
              <div className="px-4 py-3 bg-[#7C3AED] text-white rounded-2xl rounded-br-md text-sm shadow-sm">
                {request.title || request.description || "—"}
              </div>
              <p className="text-xs text-gray-500 mt-1 text-right">You · {createdStr}</p>
            </div>
          </div>

          {/* Department reply */}
          {departmentReply ? (
            <div className="flex justify-start">
              <div className="max-w-[85%]">
                <div className="px-4 py-3 bg-gray-100 text-[#111827] rounded-2xl rounded-bl-md text-sm border border-gray-200">
                  {departmentReply}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {deptName} {agentName !== "—" && `· ${agentName}`} · {updatedStr}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex justify-start">
              <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-bl-md text-sm border border-dashed border-gray-200 bg-gray-50 text-gray-500 italic">
                No department reply yet. Our team will respond shortly.
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 flex items-center gap-4 text-sm text-gray-600">
        <Building2 className="w-5 h-5 text-[#7C3AED]" />
        <span>Routed to <strong className="text-[#111827]">{deptName} Department</strong></span>
        {agentName !== "—" && (
          <>
            <span className="text-gray-300">·</span>
            <User className="w-5 h-5 text-[#7C3AED]" />
            <span>Assigned agent: <strong className="text-[#111827]">{agentName}</strong></span>
          </>
        )}
      </div>
    </div>
  );
}
