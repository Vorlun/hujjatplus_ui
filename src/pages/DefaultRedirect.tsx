import { Navigate } from "react-router";
import { useAuth } from "../auth/useAuth";

export function DefaultRedirect() {
  const { user } = useAuth();
  if (user?.role === "admin") return <Navigate to="/admin" replace />;
  if (user?.role === "agent") return <Navigate to="/department/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
}
