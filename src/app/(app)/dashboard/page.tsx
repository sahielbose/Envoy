import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui";

export const metadata: Metadata = { title: "Dashboard — Envoy" };

const METRICS = [
  { value: "—", label: "New matches this week" },
  { value: "—", label: "Pending approvals" },
  { value: "—", label: "Upcoming follow-ups" },
  { value: "—", label: "Active applications" },
];

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Welcome back" subtitle="Here's where your search stands today." />

      <div className="metrics">
        {METRICS.map((m) => (
          <div className="metric" key={m.label}>
            <b>{m.value}</b>
            <span>{m.label}</span>
          </div>
        ))}
      </div>

      <div className="panel-grid">
        <Card className="dash-card">
          <h3>New matches</h3>
          <p className="muted" style={{ fontSize: 14, margin: 0 }}>
            Ranked roles will appear here once your profile is built.
          </p>
        </Card>
        <Card className="dash-card">
          <h3>Needs your approval</h3>
          <p className="muted" style={{ fontSize: 14, margin: 0 }}>
            Outreach drafts await your review — nothing sends without your approval.
          </p>
        </Card>
      </div>
    </>
  );
}
