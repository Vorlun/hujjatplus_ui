import type { LucideIcon } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function PlaceholderPage({ title, description, icon: Icon }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#7C3AED]/10 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-[#7C3AED]" />
      </div>
      <h1 className="text-xl font-semibold text-[#111827]">{title}</h1>
      <p className="mt-2 text-sm text-[#6B7280] max-w-md">{description}</p>
    </div>
  );
}
