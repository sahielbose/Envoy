import type {
  Application,
  CandidateProfile,
  Company,
  Job,
  Match,
  Settings,
  User,
} from "@prisma/client";
import type { MockData } from "@/server/repositories/mock-store";

const d = (iso: string) => new Date(iso);

export const users: User[] = [
  {
    id: "demo-user",
    email: "alex@example.com",
    name: "Alex Rivera",
    createdAt: d("2026-04-01T00:00:00.000Z"),
  },
];

export const profiles: CandidateProfile[] = [
  {
    id: "demo-profile",
    userId: "demo-user",
    linkedinUrl: "https://www.linkedin.com/in/alex-rivera-demo",
    baseResumeId: null,
    rawResumeText:
      "Alex Rivera, Senior Frontend Engineer. 6 years building React design systems at scale.",
    structured: {
      name: "Alex Rivera",
      headline: "Senior Frontend Engineer",
      location: "Remote (US)",
      yearsExperience: 6,
      skills: [
        "React",
        "TypeScript",
        "Design systems",
        "Accessibility",
        "Node",
        "GraphQL",
        "0 to 1 product",
      ],
      experience: [
        {
          company: "Brightseed",
          title: "Senior Frontend Engineer",
          start: "2021",
          end: "Present",
          highlights: [
            "Built a component library used across a 40-person product org.",
            "Led the migration to a typed design-system tokens pipeline.",
          ],
        },
        {
          company: "Loomis",
          title: "Frontend Engineer",
          start: "2018",
          end: "2021",
          highlights: ["Shipped the customer dashboard 0 to 1 in React + TypeScript."],
        },
      ],
      education: [{ school: "UC Davis", degree: "B.S. Computer Science", year: "2018" }],
    },
    preferences: {
      titles: ["Senior Frontend Engineer", "Frontend Engineer", "Full-Stack Engineer"],
      seniority: "senior",
      locations: ["Remote"],
      remote: true,
      minComp: 160000,
      workAuth: "US citizen",
      stages: ["Seed", "Series A"],
      mustHaves: ["Remote-friendly"],
      dealbreakers: ["On-site 5 days/week"],
    },
    summary:
      "Senior frontend engineer with 6 years building React design systems at scale; strong on accessibility and 0 to 1 product.",
    updatedAt: d("2026-05-01T00:00:00.000Z"),
  },
];

export const companies: Company[] = [
  { id: "co-northwind", name: "Northwind", domain: "northwind.example", dossier: null, dossierAt: null },
  { id: "co-lumen", name: "Lumen", domain: "lumen.example", dossier: null, dossierAt: null },
  { id: "co-cobalt", name: "Cobalt Labs", domain: "cobalt.example", dossier: null, dossierAt: null },
  { id: "co-fathom", name: "Fathom", domain: "fathom.example", dossier: null, dossierAt: null },
  { id: "co-drift", name: "Drift House", domain: "drifthouse.example", dossier: null, dossierAt: null },
];

export const jobs: Job[] = [
  {
    id: "job-northwind-fe",
    source: "greenhouse",
    sourceJobId: "gh-northwind-1001",
    companyId: "co-northwind",
    title: "Senior Frontend Engineer",
    location: "Remote (US)",
    remote: true,
    description:
      "We're building a new customer-facing platform in React and TypeScript. You'll own the design system and partner closely with product and design. Seed-stage, remote-first team.",
    url: "https://boards.greenhouse.io/northwind/jobs/1001",
    postedAt: d("2026-05-20T00:00:00.000Z"),
    ingestedAt: d("2026-05-21T00:00:00.000Z"),
  },
  {
    id: "job-lumen-designer",
    source: "lever",
    sourceJobId: "lever-lumen-2002",
    companyId: "co-lumen",
    title: "Product Designer",
    location: "New York, NY (Hybrid)",
    remote: false,
    description:
      "Scaling our design team at a Series A fintech. You'll shape end-to-end product flows in Figma and partner with engineering on a growing design system.",
    url: "https://jobs.lever.co/lumen/2002",
    postedAt: d("2026-05-18T00:00:00.000Z"),
    ingestedAt: d("2026-05-21T00:00:00.000Z"),
  },
  {
    id: "job-cobalt-fullstack",
    source: "ashby",
    sourceJobId: "ashby-cobalt-3003",
    companyId: "co-cobalt",
    title: "Full-Stack Engineer",
    location: "Remote",
    remote: true,
    description:
      "Small, TypeScript-heavy team shipping fast. Node, Postgres, React. You'll work across the stack on a seed-stage developer tool.",
    url: "https://jobs.ashbyhq.com/cobalt/3003",
    postedAt: d("2026-05-15T00:00:00.000Z"),
    ingestedAt: d("2026-05-21T00:00:00.000Z"),
  },
  {
    id: "job-fathom-founding",
    source: "greenhouse",
    sourceJobId: "gh-fathom-4004",
    companyId: "co-fathom",
    title: "Founding Engineer",
    location: "Remote (US)",
    remote: true,
    description:
      "Join as one of the first engineers. Full ownership across frontend and backend; React, TypeScript, and a green field. Pre-seed.",
    url: "https://boards.greenhouse.io/fathom/jobs/4004",
    postedAt: d("2026-05-12T00:00:00.000Z"),
    ingestedAt: d("2026-05-21T00:00:00.000Z"),
  },
  {
    id: "job-drift-frontend",
    source: "lever",
    sourceJobId: "lever-drift-5005",
    companyId: "co-drift",
    title: "Frontend Engineer",
    location: "Remote (US)",
    remote: true,
    description:
      "Build delightful, accessible interfaces for our collaboration product. React + TypeScript, strong design partnership. Series A.",
    url: "https://jobs.lever.co/drifthouse/5005",
    postedAt: d("2026-05-10T00:00:00.000Z"),
    ingestedAt: d("2026-05-21T00:00:00.000Z"),
  },
  {
    id: "job-northwind-pm",
    source: "greenhouse",
    sourceJobId: "gh-northwind-1006",
    companyId: "co-northwind",
    title: "Senior Product Manager",
    location: "Remote (US)",
    remote: true,
    description:
      "Own the roadmap for our customer platform. Partner with eng and design. Seed-stage, remote-first.",
    url: "https://boards.greenhouse.io/northwind/jobs/1006",
    postedAt: d("2026-05-19T00:00:00.000Z"),
    ingestedAt: d("2026-05-21T00:00:00.000Z"),
  },
];

export const matches: Match[] = [
  {
    id: "match-northwind-fe",
    profileId: "demo-profile",
    jobId: "job-northwind-fe",
    score: 0.94,
    reasoning:
      "Your React + design-systems work maps directly onto their new customer-facing platform, and they're remote-first at exactly your stage.",
    gaps: ["No prior team-lead title, though you've led design-system work."],
    status: "new",
    createdAt: d("2026-05-21T00:00:00.000Z"),
  },
  {
    id: "match-cobalt-fullstack",
    profileId: "demo-profile",
    jobId: "job-cobalt-fullstack",
    score: 0.86,
    reasoning:
      "Small, TypeScript-heavy team, close to the shape of your last role. Node + Postgres are a stretch but adjacent to your stack.",
    gaps: ["Less backend depth (Node/Postgres) than a pure full-stack hire."],
    status: "saved",
    createdAt: d("2026-05-21T00:00:00.000Z"),
  },
  {
    id: "match-fathom-founding",
    profileId: "demo-profile",
    jobId: "job-fathom-founding",
    score: 0.82,
    reasoning:
      "Founding-engineer breadth fits your 0 to 1 product experience; pre-seed risk is the main trade-off.",
    gaps: ["Pre-seed stage may be earlier than your stated Seed-Series A preference."],
    status: "new",
    createdAt: d("2026-05-21T00:00:00.000Z"),
  },
  {
    id: "match-drift-frontend",
    profileId: "demo-profile",
    jobId: "job-drift-frontend",
    score: 0.8,
    reasoning:
      "Accessibility-forward frontend role at Series A, squarely in your wheelhouse.",
    gaps: [],
    status: "new",
    createdAt: d("2026-05-21T00:00:00.000Z"),
  },
  {
    id: "match-lumen-designer",
    profileId: "demo-profile",
    jobId: "job-lumen-designer",
    score: 0.58,
    reasoning:
      "Design-systems overlap is real, but this is a Product Designer role, not engineering, likely a reach unless you're pivoting.",
    gaps: ["Role is design-led, not engineering.", "Hybrid in New York vs. your remote preference."],
    status: "dismissed",
    createdAt: d("2026-05-21T00:00:00.000Z"),
  },
];

export const applications: Application[] = [
  {
    id: "app-cobalt",
    userId: "demo-user",
    jobId: "job-cobalt-fullstack",
    stage: "saved",
    notes: "Liked the team; revisit after Northwind.",
    nextAction: { label: "Review JD", due: "2026-06-05" },
    resumeFileId: null,
    createdAt: d("2026-05-22T00:00:00.000Z"),
    updatedAt: d("2026-05-22T00:00:00.000Z"),
  },
  {
    id: "app-northwind",
    userId: "demo-user",
    jobId: "job-northwind-fe",
    stage: "outreach_sent",
    notes: "Sent intro to Priya (EM).",
    nextAction: { label: "Follow up if no reply", due: "2026-06-03" },
    resumeFileId: null,
    createdAt: d("2026-05-23T00:00:00.000Z"),
    updatedAt: d("2026-05-25T00:00:00.000Z"),
  },
  {
    id: "app-lumen",
    userId: "demo-user",
    jobId: "job-lumen-designer",
    stage: "interviewing",
    notes: "Round 2 scheduled Thursday.",
    nextAction: { label: "Prep round 2", due: "2026-06-04" },
    resumeFileId: null,
    createdAt: d("2026-05-20T00:00:00.000Z"),
    updatedAt: d("2026-05-26T00:00:00.000Z"),
  },
  {
    id: "app-drift",
    userId: "demo-user",
    jobId: "job-drift-frontend",
    stage: "offer",
    notes: "Verbal offer; reviewing comp.",
    nextAction: { label: "Respond to offer", due: "2026-06-06" },
    resumeFileId: null,
    createdAt: d("2026-05-18T00:00:00.000Z"),
    updatedAt: d("2026-05-27T00:00:00.000Z"),
  },
];

export const settings: Settings[] = [
  {
    userId: "demo-user",
    notifyEmail: true,
    cronMatchWeekly: true,
    cronFollowups: true,
    gmailConnected: false,
  },
];

/** The full fixture bundle used to seed both the mock store and a real DB. */
export const fixtures: Required<MockData> = {
  users,
  profiles,
  companies,
  jobs,
  matches,
  applications,
  outreach: [],
  settings,
};
