import { FileDown } from "lucide-react";
import { PlaceholderPage } from "./PlaceholderPage";

export function IncomingDocuments() {
  return (
    <PlaceholderPage
      title="Incoming Documents"
      description="Documents and requests that have been received and are awaiting processing."
      icon={FileDown}
    />
  );
}
