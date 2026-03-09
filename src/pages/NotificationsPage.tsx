import { Bell, FileText, MessageSquare, Building2, CheckCircle } from "lucide-react";

const notifications = [
  { id: "1", icon: MessageSquare, message: "New request assigned to your department", time: "2 min ago", unread: true },
  { id: "2", icon: CheckCircle, message: "Request status updated to Resolved", time: "15 min ago", unread: true },
  { id: "3", icon: FileText, message: "Document uploaded for review", time: "1 hour ago", unread: false },
  { id: "4", icon: Building2, message: "Department activity: 3 new requests in Finance", time: "2 hours ago", unread: false },
  { id: "5", icon: MessageSquare, message: "New request assigned to your department", time: "Yesterday", unread: false },
];

export function NotificationsPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#111827] flex items-center gap-2">
          <Bell className="w-6 h-6 text-[#7C3AED]" />
          Notifications
        </h1>
        <p className="text-sm text-gray-500 mt-1">System and activity notifications</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <ul className="divide-y divide-gray-100">
          {notifications.map((n) => {
            const Icon = n.icon;
            return (
              <li
                key={n.id}
                className={`flex gap-4 px-6 py-4 hover:bg-gray-50 transition-colors ${n.unread ? "bg-[#F5F3FF]/30" : ""}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${n.unread ? "bg-[#7C3AED]/10 text-[#7C3AED]" : "bg-gray-100 text-gray-500"}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${n.unread ? "font-medium text-[#111827]" : "text-gray-600"}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{n.time}</p>
                </div>
                {n.unread && (
                  <span className="w-2 h-2 rounded-full bg-[#7C3AED] flex-shrink-0 mt-2" aria-hidden />
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
