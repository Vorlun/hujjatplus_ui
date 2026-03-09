import { FileUp } from "lucide-react";
import { PlaceholderPage } from "./PlaceholderPage";

export function OutgoingDocuments() {
  return (
    <PlaceholderPage
      title="Outgoing Documents"
      description="Documents that have been sent or completed and are in the outgoing queue."
      icon={FileUp}
    />
  );
}
