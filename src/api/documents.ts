import { apiClient } from "../services/apiClient";

export interface DocumentItem {
  id: string;
  title: string;
  department_id: string;
  file_url: string;
  created_at?: string;
}

export interface CreateDocumentBody {
  title: string;
  department_id: string;
  file_url: string;
}

export async function fetchAllDocuments(): Promise<DocumentItem[]> {
  return apiClient<DocumentItem[]>("/documents/");
}

export async function fetchDepartmentDocuments(
  departmentId: string
): Promise<DocumentItem[]> {
  return apiClient<DocumentItem[]>(
    `/documents/department/${encodeURIComponent(departmentId)}`
  );
}

export async function createDocument(
  data: CreateDocumentBody
): Promise<DocumentItem> {
  return apiClient<DocumentItem>("/documents/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteDocument(documentId: string): Promise<void> {
  return apiClient<void>(`/documents/${encodeURIComponent(documentId)}`, {
    method: "DELETE",
  });
}
