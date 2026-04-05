import type { RequestListItem } from "../../api/requests";

export interface AgentOption {
  id: string;
  name: string;
}

/** null = explicitly unassigned (override); object = assigned; undefined key = use server fields */
export type AssignmentOverrides = Record<string, AgentOption | null>;

export function getDisplayAssignment(
  r: RequestListItem,
  overrides: AssignmentOverrides
): AgentOption | null {
  if (Object.prototype.hasOwnProperty.call(overrides, r.id)) {
    return overrides[r.id] ?? null;
  }
  if (r.assigned_agent_name || r.assigned_agent) {
    return {
      id: r.assigned_agent ?? r.assigned_agent_name ?? "",
      name: r.assigned_agent_name ?? r.assigned_agent ?? "—",
    };
  }
  return null;
}

export function buildCandidateAgents(
  requests: RequestListItem[],
  currentUser: { id: string; email: string } | null
): AgentOption[] {
  const out: AgentOption[] = [];
  const seen = new Set<string>();
  if (currentUser?.id) {
    seen.add(currentUser.id);
    const short = currentUser.email.split("@")[0] || "Me";
    out.push({ id: currentUser.id, name: short });
  }
  for (const r of requests) {
    const id = r.assigned_agent;
    const name = r.assigned_agent_name ?? r.assigned_agent;
    if (id && name && !seen.has(id)) {
      seen.add(id);
      out.push({ id, name });
    }
  }
  return out;
}
