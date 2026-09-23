import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";

export default function ReportsPage() {
  return (
    <div>
      <PageHeader title="Reports" subtitle="AI-generated summaries" />
      <Card>
        <EmptyState
          icon="bar-chart-3"
          title="AI reports need one more setup step"
          subtitle="Connect an AI provider key to turn your visits, orders and targets into a plain-language weekly summary. Ask your admin to add this."
        />
      </Card>
    </div>
  );
}
