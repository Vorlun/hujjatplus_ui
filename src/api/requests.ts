import { apiClient } from "../services/apiClient";

export type RequestStatus = "new" | "in_progress" | "resolved" | "rejected";
export type RequestPriority = "High" | "Medium" | "Low";

export type SlaStatus = "on_time" | "warning" | "overdue";

export interface RequestListItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  intent?: string;
  confidence?: number;
  ai_confidence?: number;
  priority: RequestPriority;
  status: RequestStatus;
  requester_id: string;
  department_id: string;
  created_at: string;
  updated_at?: string;
  deadline?: string;
  sla_deadline?: string;
  sla_status?: SlaStatus;
  requester_name?: string;
  requester_initials?: string;
  assigned_agent?: string;
  assigned_agent_name?: string;
  department_reply?: string;
}

export interface RequestFeedback {
  id: string;
  request_id: string;
  user_id: string;
  rating: string;
  comment?: string;
  created_at: string;
}

export interface CreateRequestBody {
  text: string;
  requester_id: string;
}

export async function fetchAllRequests(): Promise<RequestListItem[]> {
  return apiClient<RequestListItem[]>("/requests/");
}

export async function fetchDepartmentRequests(
  departmentId: string
): Promise<RequestListItem[]> {
  return apiClient<RequestListItem[]>(
    `/requests/department/${encodeURIComponent(departmentId)}`
  );
}

export async function fetchRequestById(id: string): Promise<RequestListItem> {
  return apiClient<RequestListItem>(`/requests/${encodeURIComponent(id)}`);
}

export async function createRequest(
  data: CreateRequestBody
): Promise<RequestListItem> {
  const text = typeof data.text === "string" ? data.text.trim() : "";
  const requester_id = typeof data.requester_id === "string" ? data.requester_id.trim() : "";
  if (!text) {
    throw new Error("Request text is required.");
  }
  if (!requester_id) {
    throw new Error("You must be signed in to submit a request.");
  }
  return apiClient<RequestListItem>("/requests/", {
    method: "POST",
    body: JSON.stringify({ text, requester_id }),
  });
}

export async function updateRequestStatus(
  requestId: string,
  status: RequestStatus
): Promise<RequestListItem> {
  return apiClient<RequestListItem>(
    `/requests/${encodeURIComponent(requestId)}?status=${encodeURIComponent(status)}`,
    { method: "PATCH" }
  );
}

export async function deleteRequest(requestId: string): Promise<void> {
  await apiClient<void>(`/requests/${encodeURIComponent(requestId)}`, {
    method: "DELETE",
  });
}

export async function getFeedback(requestId: string): Promise<RequestFeedback | null> {
  return apiClient<RequestFeedback | null>(`/requests/${encodeURIComponent(requestId)}/feedback`);
}

export async function submitFeedback(
  requestId: string,
  userId: string,
  rating: string,
  comment?: string
): Promise<RequestFeedback> {
  return apiClient<RequestFeedback>(`/requests/${encodeURIComponent(requestId)}/feedback`, {
    method: "POST",
    body: JSON.stringify({ user_id: userId, rating, comment }),
  });
}

export async function getFeedbackSummary(departmentId?: string): Promise<{
  average_rating: number | null;
  count: number;
  by_department: Record<string, { average: number; count: number }>;
}> {
  const q = departmentId ? `?department_id=${encodeURIComponent(departmentId)}` : "";
  return apiClient(`/feedback/summary${q}`);
}

export async function suggestResponse(requestId: string): Promise<{ suggested_response: string }> {
  return apiClient<{ suggested_response: string }>("/ai/suggest-response", {
    method: "POST",
    body: JSON.stringify({ request_id: requestId }),
  });
}
