/** Backend base URL. Set VITE_API_URL in .env (e.g. http://localhost:8000) to avoid CORS when dev server runs on a different port. */
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const AUTH_KEY = "access_token";
const USER_KEY = "auth_user";

function getToken(): string | null {
  return localStorage.getItem(AUTH_KEY);
}

type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

export function setOnUnauthorized(handler: UnauthorizedHandler | null): void {
  onUnauthorized = handler;
}

function clearAuth(): void {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(USER_KEY);
  onUnauthorized?.();
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiClient<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err) {
    const message =
      err instanceof TypeError && err.message === "Failed to fetch"
        ? "Unable to reach the server. Please check your connection and try again."
        : err instanceof Error
          ? err.message
          : "Network error. Please try again.";
    throw new ApiError(message, 0);
  }

  if (res.status === 401) {
    clearAuth();
    throw new ApiError("Session expired. Please sign in again.", 401);
  }

  if (!res.ok) {
    const text = await res.text();
    let message = text;
    try {
      const json = JSON.parse(text) as { detail?: string; message?: string };
      message =
        typeof json.detail === "string"
          ? json.detail
          : Array.isArray(json.detail)
            ? json.detail.map((d: { msg?: string }) => d?.msg ?? "").join(", ")
            : json.message ?? text;
    } catch {
      // use text as message
    }
    throw new ApiError(message || `HTTP ${res.status}`, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export { API_URL };
