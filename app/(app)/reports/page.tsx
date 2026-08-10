import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import { Sparkles } from "lucide-react";

export default function ReportsPage() {
  return (
    <div>
      <PageHeader title="Reports" subtitle="AI-polished visit summaries and PDF reports" />
      <Card>
        <div className="flex items-start gap-4">
          <div className="h-11 w-11 rounded-full bg-offwhite flex items-center justify-center shrink-0">
            <Sparkles size={18} className="text-teal" />
          </div>
          <div>
            <p className="font-medium text-ink">Wired up next</p>
            <p className="text-sm text-muted mt-1.5 leading-relaxed">
              This will pull visits from a date range and rewrite each rep&apos;s raw notes into a clean,
              professional summary — then export as a PDF or share straight to WhatsApp. It needs an AI
              provider key added to this project&apos;s environment variables before it goes live.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
