import { apiClient } from "../services/apiClient";

export interface RegisterBody {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin" | "agent";
  department_id: string | null;
}

export interface RegisterResponse {
  id: string;
  email: string;
  role: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  role: string;
  id?: string;
  department_id?: string | null;
}

export async function register(data: RegisterBody): Promise<RegisterResponse> {
  return apiClient<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function login(data: LoginBody): Promise<LoginResponse> {
  return apiClient<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
