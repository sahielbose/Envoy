import type { ApplicationStage } from "@/lib/domain";

/** The pipeline, in order. */
export const STAGES: ApplicationStage[] = [
  "saved",
  "researching",
  "outreach_sent",
  "applied",
  "interviewing",
  "offer",
  "closed",
];

export const STAGE_LABELS: Record<ApplicationStage, string> = {
  saved: "Saved",
  researching: "Researching",
  outreach_sent: "Outreach sent",
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer",
  closed: "Closed",
};

export const STAGE_DOT: Record<ApplicationStage, string> = {
  saved: "#7c9a8e",
  researching: "#8a7fc0",
  outreach_sent: "#d99f55",
  applied: "#9aab6f",
  interviewing: "#e0a6a0",
  offer: "#7fa9a0",
  closed: "#a89e8d",
};

/** Active = anything not closed. */
export function isActive(stage: string): boolean {
  return stage !== "closed";
}
