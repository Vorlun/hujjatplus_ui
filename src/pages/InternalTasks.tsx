import { ListTodo } from "lucide-react";
import { PlaceholderPage } from "./PlaceholderPage";

export function InternalTasks() {
  return (
    <PlaceholderPage
      title="Internal Tasks"
      description="Internal tasks assigned to your department or team."
      icon={ListTodo}
    />
  );
}
