import type { Metadata } from "next";
import { User } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getRepositories } from "@/server/repositories";
import { PreferencesSchema, ProfileStructuredSchema } from "@/lib/domain";
import { slugify } from "@/lib/utils";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { GetDiscovered } from "@/components/app/get-discovered";
import { Button, Card } from "@/components/ui";

export const metadata: Metadata = { title: "Profile, Envoy" };

function chips(values: string[]) {
  return (
    <div className="skills">
      {values.map((v) => (
        <span className="skill" key={v}>
          {v}
        </span>
      ))}
    </div>
  );
}

export default async function ProfilePage() {
  const session = await getSession();
  const profile = session
    ? await getRepositories().profiles.findByUserId(session.user.id)
    : null;

  if (!profile) {
    return (
      <>
        <PageHeader title="Profile" subtitle="Your candidate profile, built from your résumé." />
        <EmptyState
          icon={User}
          title="No profile yet"
          description="Complete onboarding to build your profile. “Get discovered” stays off by default."
          action={<Button href="/onboarding">Set up your profile</Button>}
        />
      </>
    );
  }

  const structured = ProfileStructuredSchema.parse(profile.structured);
  const prefs = PreferencesSchema.parse(profile.preferences);
  const handle = slugify(structured.name);

  return (
    <>
      <PageHeader
        title="Profile"
        subtitle="Your candidate profile, built from your résumé."
        actions={
          <Button variant="ghost" href="/onboarding">
            Edit
          </Button>
        }
      />

      <div style={{ maxWidth: 760, display: "flex", flexDirection: "column", gap: 16 }}>
        <Card>
          <div className="prof">
            <div className="prof__av" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4>{structured.name}</h4>
              <p>
                {structured.headline}
                {structured.location ? ` · ${structured.location}` : ""}
                {structured.yearsExperience ? ` · ${structured.yearsExperience} yrs` : ""}
              </p>
            </div>
          </div>
          {profile.summary ? (
            <p className="muted" style={{ fontSize: 14, marginTop: 14 }}>
              {profile.summary}
            </p>
          ) : null}
          {structured.skills.length > 0 ? (
            <div className="ppv__section">
              <div className="ppv__label">Skills</div>
              {chips(structured.skills)}
            </div>
          ) : null}
        </Card>

        {structured.experience.length > 0 ? (
          <Card className="ppv">
            <div className="ppv__label">Experience</div>
            {structured.experience.map((e) => (
              <div className="ppv__exp" key={`${e.company}-${e.title}`}>
                <b>{e.title}</b> <span>· {e.company}</span>{" "}
                <span>
                  ({e.start}-{e.end})
                </span>
                {e.highlights.length > 0 ? (
                  <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
                    {e.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </Card>
        ) : null}

        <Card className="ppv">
          <div className="ppv__label">What you&apos;re looking for</div>
          {prefs.titles.length > 0 ? (
            <div className="ppv__section">
              <div className="ppv__label">Titles</div>
              {chips(prefs.titles)}
            </div>
          ) : null}
          <div className="ppv__section">
            <div className="ppv__label">Details</div>
            {chips(
              [
                prefs.seniority ? `Seniority: ${prefs.seniority}` : null,
                prefs.remote ? "Remote-friendly" : null,
                prefs.minComp ? `Min comp: $${prefs.minComp.toLocaleString()}` : null,
                prefs.workAuth ? `Work auth: ${prefs.workAuth}` : null,
                ...prefs.locations.map((l) => `Location: ${l}`),
                ...prefs.stages.map((s) => `Stage: ${s}`),
              ].filter((x): x is string => Boolean(x)),
            )}
          </div>
          {prefs.dealbreakers.length > 0 ? (
            <div className="ppv__section">
              <div className="ppv__label">Dealbreakers</div>
              {chips(prefs.dealbreakers)}
            </div>
          ) : null}
        </Card>

        <GetDiscovered handle={handle} />
      </div>
    </>
  );
}
