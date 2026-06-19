import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getRepositories } from "@/server/repositories";
import { getServices } from "@/server/services";
import { getDashboardSummary } from "@/server/dashboard/summary";
import { PageHeader } from "@/components/app/page-header";
import { Button, Card } from "@/components/ui";

export const metadata: Metadata = { title: "Dashboard — Envoy" };

export default async function DashboardPage() {
  const session = await getSession();
  const repos = getRepositories();
  const profile = session ? await repos.profiles.findByUserId(session.user.id) : null;

  if (!session || !profile) {
    return (
      <>
        <PageHeader title="Welcome to Envoy" subtitle="Set up your profile to get started." />
        <Card className="dash-card">
          <h3>Build your profile</h3>
          <p className="muted" style={{ fontSize: 14, margin: "6px 0 14px" }}>
            Upload your résumé and set your targets — Envoy will surface your first matches the
            same day.
          </p>
          <Button href="/onboarding">Set up your profile</Button>
        </Card>
      </>
    );
  }

  await getServices().findRoles({ profileId: profile.id });
  const s = await getDashboardSummary(repos, { userId: session.user.id, profileId: profile.id });

  const metrics = [
    { value: s.newMatches, label: "New matches" },
    { value: s.pendingApprovals, label: "Pending approvals" },
    { value: s.upcomingFollowUps, label: "Upcoming follow-ups" },
    { value: s.activeApplications, label: "Active applications" },
  ];

  return (
    <>
      <PageHeader
        title={`Welcome back, ${session.user.name.split(" ")[0]}`}
        subtitle="Here's where your search stands today."
      />

      <div className="metrics">
        {metrics.map((m) => (
          <div className="metric" key={m.label}>
            <b>{m.value}</b>
            <span>{m.label}</span>
          </div>
        ))}
      </div>

      <div className="panel-grid">
        <Card className="dash-card">
          <h3>New matches</h3>
          {s.topMatches.length > 0 ? (
            <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
              {s.topMatches.map((m) => (
                <li key={m.jobId} style={{ fontSize: 13.5, color: "var(--ink-soft)", marginTop: 5 }}>
                  {m.title} · {m.company} — {Math.round(m.score * 100)}%
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted" style={{ fontSize: 14, margin: 0 }}>
              No matches yet — build your profile to see ranked roles.
            </p>
          )}
          <Link href="/matches" className="tcard__link" style={{ marginTop: 10 }}>
            See all matches
          </Link>
        </Card>

        <Card className="dash-card">
          <h3>Needs your approval</h3>
          {s.pendingDrafts.length > 0 ? (
            <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
              {s.pendingDrafts.map((d) => (
                <li key={d.id} style={{ fontSize: 13.5, color: "var(--ink-soft)", marginTop: 5 }}>
                  {d.jobLabel}
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted" style={{ fontSize: 14, margin: 0 }}>
              Nothing to approve. Drafts appear here — nothing sends without your approval.
            </p>
          )}
          <Link href="/outreach" className="tcard__link" style={{ marginTop: 10 }}>
            Review outreach
          </Link>
        </Card>
      </div>

      <Card className="dash-card" style={{ marginTop: 16 }}>
        <h3>Upcoming follow-ups</h3>
        {s.upcomingActions.length > 0 ? (
          <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
            {s.upcomingActions.map((a, i) => (
              <li key={i} style={{ fontSize: 13.5, color: "var(--ink-soft)", marginTop: 5 }}>
                {a.company}: {a.label}
                {a.due ? ` · due ${a.due}` : ""}
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted" style={{ fontSize: 14, margin: 0 }}>
            No follow-ups scheduled. Envoy will nudge you when something&apos;s due.
          </p>
        )}
      </Card>
    </>
  );
}
