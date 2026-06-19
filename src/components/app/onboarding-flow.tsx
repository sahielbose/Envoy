"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card } from "@/components/ui";
import { cn } from "@/lib/utils";
import { ResumeUpload, type UploadResult } from "./resume-upload";
import { PreferencesForm } from "./preferences-form";
import type { Preferences, ProfileStructured } from "@/lib/domain";

type Step = "upload" | "preferences" | "done";
const ORDER: Step[] = ["upload", "preferences", "done"];
const LABELS: Record<Step, string> = {
  upload: "Upload résumé",
  preferences: "Set preferences",
  done: "Profile ready",
};

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
      <p className="muted" style={{ fontSize: 12.5, marginTop: 14 }}>
        Drafted from your résumé, you can edit every field later.
      </p>
    </Card>
  );
}

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("upload");
  const [structured, setStructured] = useState<ProfileStructured | null>(null);
  const [summary, setSummary] = useState("");
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
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

  async function onPreferences(preferences: Preferences) {
    if (!structured) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/profile/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ structured, preferences }),
      });
      if (!res.ok) throw new Error("build failed");
      const data = (await res.json()) as { summary: string };
      setSummary(data.summary);
      setStep("done");
    } catch {
      setError("Couldn't save your profile. Try again.");
    } finally {
      setSaving(false);
    }
  }

  const currentIndex = ORDER.indexOf(step);

  return (
    <div style={{ maxWidth: 720 }}>
      <div className="ob-steps">
        {ORDER.map((s, i) => (
          <span
            key={s}
            className={cn("ob-step", step === s && "is-active", i < currentIndex && "is-done")}
          >
            <span className="n">{i + 1}</span>
            {LABELS[s]}
          </span>
        ))}
      </div>

      {step === "upload" ? (
        <>
          <ResumeUpload onUploaded={onUploaded} />
          {parsing ? (
            <p className="muted" style={{ marginTop: 12 }}>
              Reading your résumé…
            </p>
          ) : null}
          {structured ? <ProfilePreview structured={structured} /> : null}
          {structured ? (
            <div style={{ marginTop: 16 }}>
              <Button onClick={() => setStep("preferences")}>Looks right, continue</Button>
            </div>
          ) : null}
        </>
      ) : null}

      {step === "preferences" ? (
        <PreferencesForm
          initial={{
            titles: structured?.headline ? [structured.headline] : [],
            locations: structured?.location ? [structured.location] : [],
            remote: true,
          }}
          onSubmit={onPreferences}
          submitting={saving}
          submitLabel="Build my profile"
        />
      ) : null}

      {step === "done" ? (
        <Card>
          <h3 style={{ fontFamily: "var(--serif)", fontSize: 19, fontWeight: 550, margin: 0 }}>
            Your profile is ready
          </h3>
          <p className="muted" style={{ fontSize: 14, marginTop: 8 }}>
            {summary}
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
            <Button onClick={() => router.push("/matches")}>See your matches</Button>
            <Button variant="ghost" onClick={() => router.push("/profile")}>
              View profile
            </Button>
          </div>
        </Card>
      ) : null}

      {error ? <p className="form-error">{error}</p> : null}
    </div>
  );
}
