import { apiClient } from "../services/apiClient";

export type RequestStatus = "new" | "in_progress" | "resolved" | "rejected";
export type RequestPriority = "High" | "Medium" | "Low";

export interface RequestListItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: RequestPriority;
  status: RequestStatus;
  requester_id: string;
  department_id: string;
  created_at: string;
  updated_at?: string;
  requester_name?: string;
  requester_initials?: string;
  assigned_agent?: string;
  assigned_agent_name?: string;
  department_reply?: string;
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
  return apiClient<RequestListItem>("/requests/", {
    method: "POST",
    body: JSON.stringify(data),
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
