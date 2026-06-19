"use client";

import { useState } from "react";
import { Card } from "@/components/ui";
import { ResumeUpload, type UploadResult } from "@/components/app/resume-upload";
import type { ProfileStructured } from "@/lib/domain";

function ProfilePreview({ structured }: { structured: ProfileStructured }) {
  return (
    <Card className="ppv" style={{ marginTop: 16 }}>
      <h3>{structured.name}</h3>
      <p className="ppv__headline">
        {structured.headline}
        {structured.location ? ` · ${structured.location}` : ""}
        {structured.yearsExperience ? ` · ${structured.yearsExperience} yrs` : ""}
      </p>

      {structured.skills.length > 0 ? (
        <div className="ppv__section">
          <div className="ppv__label">Skills</div>
          <div className="skills">
            {structured.skills.map((s) => (
              <span className="skill" key={s}>
                {s}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {structured.experience.length > 0 ? (
        <div className="ppv__section">
          <div className="ppv__label">Experience</div>
          {structured.experience.map((e) => (
            <div className="ppv__exp" key={`${e.company}-${e.title}`}>
              <b>{e.title}</b> <span>· {e.company}</span>{" "}
              <span>
                ({e.start}–{e.end})
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

      <p className="muted" style={{ fontSize: 12.5, marginTop: 14 }}>
        This is a draft built from your résumé — you&apos;ll be able to edit every field.
      </p>
    </Card>
  );
}

export function OnboardingFlow() {
  const [parsing, setParsing] = useState(false);
  const [structured, setStructured] = useState<ProfileStructured | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onUploaded(meta: UploadResult) {
    setParsing(true);
    setError(null);
    try {
      const res = await fetch("/api/resume/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: meta.fileId }),
      });
      if (!res.ok) throw new Error("parse failed");
      const data = (await res.json()) as { structured: ProfileStructured };
      setStructured(data.structured);
    } catch {
      setError("Couldn't read that résumé. Try another file.");
    } finally {
      setParsing(false);
    }
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <ResumeUpload onUploaded={onUploaded} />
      {parsing ? (
        <p className="muted" style={{ marginTop: 12 }}>
          Reading your résumé…
        </p>
      ) : null}
      {error ? <p className="form-error">{error}</p> : null}
      {structured ? <ProfilePreview structured={structured} /> : null}
    </div>
  );
}
