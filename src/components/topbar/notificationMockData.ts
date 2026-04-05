import type { NotificationItem } from "./notificationTypes";

/** Demo feed — replace with API when available */
export function getDefaultNotifications(): NotificationItem[] {
  const now = new Date();
  return [
    {
      id: "1",
      kind: "request",
      tone: "info",
      title: "New request assigned",
      description: "A support ticket was routed to your department queue.",
      at: new Date(now.getTime() - 2 * 60_000),
      requestId: undefined,
    },
    {
      id: "2",
      kind: "status",
      tone: "success",
      title: "Request marked resolved",
      description: "REQ-1042 was closed successfully by your team.",
      at: new Date(now.getTime() - 18 * 60_000),
      requestId: "demo-resolved",
    },
    {
      id: "3",
      kind: "document",
      tone: "info",
      title: "Document ready for review",
      description: "Contract draft uploaded and pending your approval.",
      at: new Date(now.getTime() - 3 * 60 * 60_000),
    },
    {
      id: "4",
      kind: "alert",
      tone: "warning",
      title: "SLA warning",
      description: "One request is approaching its deadline in 4 hours.",
      at: new Date(now.getTime() - 26 * 60 * 60_000),
    },
    {
      id: "5",
      kind: "request",
      tone: "info",
      title: "Comment on your request",
      description: "The department left a new message on your open request.",
      at: new Date(now.getTime() - 50 * 60 * 60_000),
      requestId: "demo-thread",
    },
  ];
}
