import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { login as apiLogin, type LoginResponse } from "../api/auth";
import { setOnUnauthorized } from "../services/apiClient";

export type Role = "user" | "admin" | "agent" | "department";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  department_id: string | null;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
}

const AUTH_KEY = "access_token";
const USER_KEY = "auth_user";

function getUserIdFromToken(token: string): string {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return "";
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))) as Record<string, unknown>;
    if (typeof payload.sub === "string") return payload.sub;
    if (typeof payload.user_id === "string") return payload.user_id;
    return "";
  } catch {
    return "";
  }
}

function loadStored(): { token: string | null; user: AuthUser | null } {
  const token = localStorage.getItem(AUTH_KEY);
  let user: AuthUser | null = null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) user = JSON.parse(raw) as AuthUser;
  } catch {
    // ignore
  }
  return { token, user };
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // 1. State declarations
  const [state, setState] = useState<AuthState>(() => {
    const { token, user } = loadStored();
    return {
      token,
      user,
      isLoading: true,
    };
  });

  // 2. Function declarations (must be before any useEffect or useMemo that references them)
  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin({ email, password });
    localStorage.setItem(AUTH_KEY, res.access_token);
    const resAny = res as Record<string, unknown>;
    let userId =
      typeof resAny.id === "string"
        ? resAny.id
        : typeof resAny.user_id === "string"
          ? resAny.user_id
          : (resAny.user && typeof (resAny.user as Record<string, unknown>).id === "string")
            ? (resAny.user as Record<string, unknown>).id as string
            : "";
    if (!userId && res.access_token) userId = getUserIdFromToken(res.access_token);
    const rawRole = res.role as string;
    const role: Role = rawRole === "department" ? "agent" : (rawRole as Role);
    const user: AuthUser = {
      id: userId,
      email,
      role,
      department_id: (res as LoginResponse).department_id ?? null,
    };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setState({ token: res.access_token, user, isLoading: false });
    return res;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);
    setState({ token: null, user: null, isLoading: false });
  }, []);

  const setUser = useCallback((user: AuthUser | null) => {
    setState((s) => ({ ...s, user }));
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, []);

  // 3. useEffect hooks (may safely reference login, logout, setUser)
  useEffect(() => {
    const { token, user } = loadStored();
    let resolvedUser = user;
    if (user && !user.id && token) {
      const idFromToken = getUserIdFromToken(token);
      if (idFromToken) {
        resolvedUser = { ...user, id: idFromToken };
        try {
          localStorage.setItem(USER_KEY, JSON.stringify(resolvedUser));
        } catch {
          // ignore
        }
      }
    }
    setState((s) => ({ ...s, token, user: resolvedUser, isLoading: false }));
  }, []);

  useEffect(() => {
    setOnUnauthorized(logout);
    return () => setOnUnauthorized(null);
  }, [logout]);

  // 4. Context value object
  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      logout,
      setUser,
    }),
    [state.token, state.user, state.isLoading, login, logout, setUser]
  );

  // 5. Return JSX
  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
