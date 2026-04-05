import { useEffect, useMemo, useState } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/useAuth";
import {
  fetchDepartmentRequests,
  updateRequestStatus,
  type RequestPriority,
  type RequestStatus,
} from "../api/requests";
import { fetchMessages, sendMessage } from "../api/messages";
import { Inbox, Sparkles } from "lucide-react";
import { FiltersBar } from "../components/department-inbox/FiltersBar";
import { InboxTable } from "../components/department-inbox/InboxTable";
import { RequestDetailPanel } from "../components/department-inbox/RequestDetailPanel";
import {
  buildCandidateAgents,
  getDisplayAssignment,
  type AgentOption,
  type AssignmentOverrides,
} from "../components/department-inbox/assignmentUtils";

export function DepartmentInbox() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const departmentId = user?.department_id ?? "";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | RequestStatus>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | RequestPriority>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [response, setResponse] = useState("");
  const [assignOverrides, setAssignOverrides] = useState<AssignmentOverrides>({});

  const { data: requests = [], isLoading, error } = useQuery({
    queryKey: ["department-requests", departmentId],
    queryFn: () => fetchDepartmentRequests(departmentId),
    enabled: !!departmentId && (user?.role === "agent" || user?.role === "admin"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: RequestStatus }) => updateRequestStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["department-requests", departmentId] });
    },
  });

  const candidateAgents = useMemo(() => {
    const base = buildCandidateAgents(requests, user ? { id: user.id, email: user.email } : null);
    const seen = new Set(base.map((a) => a.id));
    for (const a of Object.values(assignOverrides)) {
      if (a && !seen.has(a.id)) {
        seen.add(a.id);
        base.push(a);
      }
    }
    return base;
  }, [requests, user, assignOverrides]);

  useEffect(() => {
    if (selectedId && !requests.some((r) => r.id === selectedId)) {
      setSelectedId(null);
    }
  }, [requests, selectedId]);

  const filtered = useMemo(() => {
    let list = requests.filter((r) => {
      const matchSearch =
        !search ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || r.status === statusFilter;
      const matchPriority = priorityFilter === "all" || r.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    });
    list = [...list].sort((a, b) => {
      const ta = new Date(a.created_at).getTime();
      const tb = new Date(b.created_at).getTime();
      return sortOrder === "desc" ? tb - ta : ta - tb;
    });
    return list;
  }, [requests, search, statusFilter, priorityFilter, sortOrder]);

  const selected = selectedId ? requests.find((r) => r.id === selectedId) ?? null : null;
  const selectedAssignee = selected ? getDisplayAssignment(selected, assignOverrides) : null;

  const {
    data: messages = [],
    refetch: refetchMessages,
    isLoading: loadingMessages,
  } = useQuery({
    queryKey: ["dept-messages", selected?.id],
    queryFn: () => fetchMessages(selected!.id),
    enabled: !!selected?.id,
  });

  const sendResponseMutation = useMutation({
    mutationFn: () => sendMessage(selected!.id, response.trim(), user!.id),
    onSuccess: () => {
      setResponse("");
      refetchMessages();
    },
  });

  function handleStatusChange(requestId: string, status: RequestStatus) {
    updateMutation.mutate({ id: requestId, status });
  }

  function handleAssign(agent: AgentOption | null) {
    if (!selectedId) return;
    setAssignOverrides((prev) => ({ ...prev, [selectedId]: agent }));
  }

  const totalCount = requests.length;
  const highPriorityCount = useMemo(
    () => requests.filter((r) => r.priority === "High").length,
    [requests]
  );

  if (user?.role !== "agent" && user?.role !== "admin") {
    return <div className="text-slate-500">Access denied. Agent or Admin only.</div>;
  }

  if (!departmentId && user?.role === "agent") {
    return <div className="text-slate-500">No department assigned.</div>;
  }

  return (
    <Tooltip.Provider delayDuration={280}>
      <div className="min-h-full bg-[#F8FAFC] -mx-4 -mt-4 px-4 pb-10 pt-4 md:-mx-6 md:px-6 md:pb-12 md:pt-6">
        <div className="mx-auto max-w-[1600px] space-y-6">
          <header className="animate-in fade-in slide-in-from-bottom-1 duration-300 motion-reduce:animate-none">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                  <Inbox className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Department Inbox
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">Incoming requests for your department</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white px-4 py-2 text-sm shadow-sm">
                  <Sparkles className="h-4 w-4 text-amber-500" aria-hidden />
                  <span className="font-semibold text-slate-900 tabular-nums">{totalCount}</span>
                  <span className="text-slate-500">total</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2 text-sm shadow-sm">
                  <span className="font-semibold text-red-700 tabular-nums">{highPriorityCount}</span>
                  <span className="text-red-600/80">high priority</span>
                </div>
              </div>
            </div>
          </header>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {String(error)}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-10 lg:items-start lg:gap-8">
            <div className="space-y-4 lg:col-span-7">
              <FiltersBar
                search={search}
                onSearchChange={setSearch}
                statusFilter={statusFilter}
                onStatusFilter={setStatusFilter}
                priorityFilter={priorityFilter}
                onPriorityFilter={setPriorityFilter}
                sortOrder={sortOrder}
                onSortOrder={setSortOrder}
              />
              <InboxTable
                requests={filtered}
                selectedId={selectedId}
                onSelect={setSelectedId}
                isLoading={isLoading}
                assignmentOverrides={assignOverrides}
              />
            </div>

            <div className="lg:col-span-3">
              <RequestDetailPanel
                request={selected}
                assignee={selectedAssignee}
                candidateAgents={candidateAgents}
                onAssign={handleAssign}
                showCloseMobile
                onClose={() => setSelectedId(null)}
                messages={messages}
                loadingMessages={loadingMessages}
                response={response}
                onResponseChange={setResponse}
                onSendResponse={() => response.trim() && sendResponseMutation.mutate()}
                sendPending={sendResponseMutation.isPending}
                updateMutation={updateMutation}
                onStatusChange={handleStatusChange}
              />
            </div>
          </div>
        </div>
      </div>
    </Tooltip.Provider>
  );
}
