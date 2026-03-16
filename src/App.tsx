import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { RequestChat } from "./pages/RequestChat";
import { MyRequests } from "./pages/MyRequests";
import { RequestDetail } from "./pages/RequestDetail";
import { Documents } from "./pages/Documents";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminRequests } from "./pages/AdminRequests";
import { AdminRequestDetail } from "./pages/AdminRequestDetail";
import { AdminDepartments } from "./pages/AdminDepartments";
import { DefaultRedirect } from "./pages/DefaultRedirect";
import { IncomingDocuments } from "./pages/IncomingDocuments";
import { OutgoingDocuments } from "./pages/OutgoingDocuments";
import { InternalTasks } from "./pages/InternalTasks";
import { DocumentEditorPage } from "./pages/DocumentEditorPage";
import { ArchivePage } from "./pages/Archive";
import { SearchPage } from "./pages/SearchPage";
import { SettingsPage } from "./pages/SettingsPage";
import { AdminDocuments } from "./pages/AdminDocuments";
import { NotificationsPage } from "./pages/NotificationsPage";
import { HelpPage } from "./pages/HelpPage";
import { DepartmentResponses } from "./pages/DepartmentResponses";
import { DepartmentResponseDetail } from "./pages/DepartmentResponseDetail";
import { DepartmentDashboard } from "./pages/DepartmentDashboard";
import { DepartmentCalendar } from "./pages/DepartmentCalendar";

const Dashboard = lazy(() => import("./pages/Dashboard").then((m) => ({ default: m.Dashboard })));
const DepartmentInbox = lazy(() =>
  import("./pages/DepartmentInbox").then((m) => ({ default: m.DepartmentInbox }))
);
const Reports = lazy(() => import("./pages/Reports").then((m) => ({ default: m.Reports })));

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-[200px] text-[#6B7280]">
      Loading…
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DefaultRedirect />} />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <Suspense fallback={<PageFallback />}>
                  <Dashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="chat"
            element={
              <ProtectedRoute allowedRoles={["user", "admin"]}>
                <RequestChat />
              </ProtectedRoute>
            }
          />
          <Route
            path="my-requests"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <MyRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="my-requests/:id"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <RequestDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="department-responses"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <DepartmentResponses />
              </ProtectedRoute>
            }
          />
          <Route
            path="department-responses/:id"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <DepartmentResponseDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="department/dashboard"
            element={
              <ProtectedRoute allowedRoles={["agent", "admin"]}>
                <DepartmentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="inbox"
            element={
              <ProtectedRoute allowedRoles={["agent", "admin"]}>
                <Suspense fallback={<PageFallback />}>
                  <DepartmentInbox />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="department/calendar"
            element={
              <ProtectedRoute allowedRoles={["agent", "admin"]}>
                <DepartmentCalendar />
              </ProtectedRoute>
            }
          />
          <Route
            path="documents"
            element={
              <ProtectedRoute allowedRoles={["user", "agent", "admin"]}>
                <Documents />
              </ProtectedRoute>
            }
          />
          <Route
            path="help"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <HelpPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/requests"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/requests/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminRequestDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/documents"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDocuments />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/departments"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDepartments />
              </ProtectedRoute>
            }
          />
          <Route
            path="notifications"
            element={
              <ProtectedRoute allowedRoles={["user", "agent", "admin"]}>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="incoming"
            element={
              <ProtectedRoute allowedRoles={["user", "agent", "admin"]}>
                <IncomingDocuments />
              </ProtectedRoute>
            }
          />
          <Route
            path="outgoing"
            element={
              <ProtectedRoute allowedRoles={["user", "agent", "admin"]}>
                <OutgoingDocuments />
              </ProtectedRoute>
            }
          />
          <Route
            path="tasks"
            element={
              <ProtectedRoute allowedRoles={["agent", "admin"]}>
                <InternalTasks />
              </ProtectedRoute>
            }
          />
          <Route
            path="documents/editor"
            element={
              <ProtectedRoute allowedRoles={["agent", "admin"]}>
                <DocumentEditorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="archive"
            element={
              <ProtectedRoute allowedRoles={["agent", "admin"]}>
                <ArchivePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="search"
            element={
              <ProtectedRoute allowedRoles={["user", "agent", "admin"]}>
                <SearchPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="reports"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Suspense fallback={<PageFallback />}>
                  <Reports />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute allowedRoles={["user", "agent", "admin"]}>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
