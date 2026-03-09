import { apiClient } from "../services/apiClient";

export interface Department {
  id: string;
  name: string;
}

export async function fetchDepartments(): Promise<Department[]> {
  return apiClient<Department[]>("/departments/");
}

export async function createDepartment(data: {
  name: string;
}): Promise<Department> {
  return apiClient<Department>("/departments/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
