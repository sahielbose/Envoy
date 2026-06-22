import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRepositories } from "@/server/repositories";
import { ProfileStructuredSchema } from "@/lib/domain";
import { slugify } from "@/lib/utils";

/**
 * Public, shareable candidate profile resolved by handle (a slug of the name).
 * This is the real destination of the "Get discovered" share link. It is a
 * presentation page only: public-safe fields (headline, summary, skills,
 * experience), never contact info, comp, work authorization, or preferences.
 */
async function resolve(handle: string) {
  const profiles = await getRepositories().profiles.list();
  return profiles.find((p) => {
    const parsed = ProfileStructuredSchema.safeParse(p.structured);
    return parsed.success && slugify(parsed.data.name) === handle;
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const profile = await resolve(handle);
  if (!profile) return { title: "Profile not found, Envoy" };
  const s = ProfileStructuredSchema.parse(profile.structured);
  return { title: `${s.name}, ${s.headline} · Envoy` };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const profile = await resolve(handle);
  if (!profile) notFound();

  const s = ProfileStructuredSchema.parse(profile.structured);

  return (
    <main className="pubprofile">
      <header className="pubprofile__bar">
        <Link href="/" className="pubprofile__brand">
          Envoy
        </Link>
        <span className="pubprofile__open">Open to opportunities</span>
      </header>

      <section className="pubprofile__card">
        <div className="prof">
          <div className="prof__av" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1>{s.name}</h1>
            <p>
              {s.headline}
              {s.location ? ` · ${s.location}` : ""}
              {s.yearsExperience ? ` · ${s.yearsExperience} yrs` : ""}
            </p>
          </div>
        </div>

        {profile.summary ? <p className="pubprofile__summary">{profile.summary}</p> : null}

        {s.skills.length > 0 ? (
          <div className="ppv__section">
            <div className="ppv__label">Skills</div>
            <div className="skills">
              {s.skills.map((skill) => (
                <span className="skill" key={skill}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {s.experience.length > 0 ? (
          <div className="ppv__section">
            <div className="ppv__label">Experience</div>
            {s.experience.map((e) => (
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
          </div>
        ) : null}

        {s.education.length > 0 ? (
          <div className="ppv__section">
            <div className="ppv__label">Education</div>
            {s.education.map((ed) => (
              <div className="ppv__exp" key={`${ed.school}-${ed.degree}`}>
                <b>{ed.degree}</b> <span>· {ed.school}</span>
                {ed.year ? <span> ({ed.year})</span> : null}
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <footer className="pubprofile__foot">
        Presented with <Link href="/">Envoy</Link>. This candidate chose to be discoverable. Envoy
        never sells or shares candidate data.
      </footer>
    </main>
  );
}
