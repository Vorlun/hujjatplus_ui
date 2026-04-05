export type CalendarViewMode = "month" | "week" | "day";

export interface CalendarRequestEvent {
  id: string;
  title: string;
  department: string;
  priority: string;
  deadline: string;
  status: string;
}
