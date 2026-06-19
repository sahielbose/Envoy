import { Prisma, PrismaClient } from "@prisma/client";
import { fixtures } from "../src/server/fixtures";

const prisma = new PrismaClient();
const json = (v: unknown): Prisma.InputJsonValue => v as Prisma.InputJsonValue;

async function main() {
  for (const u of fixtures.users) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: { email: u.email, name: u.name },
      create: { id: u.id, email: u.email, name: u.name, createdAt: u.createdAt },
    });
  }

  for (const c of fixtures.companies) {
    await prisma.company.upsert({
      where: { id: c.id },
      update: { name: c.name, domain: c.domain },
      create: { id: c.id, name: c.name, domain: c.domain },
    });
  }

  for (const j of fixtures.jobs) {
    await prisma.job.upsert({
      where: { id: j.id },
      update: { title: j.title, description: j.description, url: j.url },
      create: {
        id: j.id,
        source: j.source,
        sourceJobId: j.sourceJobId,
        companyId: j.companyId,
        title: j.title,
        location: j.location,
        remote: j.remote,
        description: j.description,
        url: j.url,
        postedAt: j.postedAt,
        ingestedAt: j.ingestedAt,
      },
    });
  }

  for (const p of fixtures.profiles) {
    await prisma.candidateProfile.upsert({
      where: { id: p.id },
      update: {
        structured: json(p.structured),
        preferences: json(p.preferences),
        summary: p.summary,
      },
      create: {
        id: p.id,
        userId: p.userId,
        linkedinUrl: p.linkedinUrl,
        rawResumeText: p.rawResumeText,
        structured: json(p.structured),
        preferences: json(p.preferences),
        summary: p.summary,
        updatedAt: p.updatedAt,
      },
    });
  }

  for (const m of fixtures.matches) {
    await prisma.match.upsert({
      where: { id: m.id },
      update: { score: m.score, reasoning: m.reasoning, gaps: json(m.gaps), status: m.status },
      create: {
        id: m.id,
        profileId: m.profileId,
        jobId: m.jobId,
        score: m.score,
        reasoning: m.reasoning,
        gaps: json(m.gaps),
        status: m.status,
        createdAt: m.createdAt,
      },
    });
  }

  for (const a of fixtures.applications) {
    await prisma.application.upsert({
      where: { id: a.id },
      update: { stage: a.stage, notes: a.notes, nextAction: json(a.nextAction) },
      create: {
        id: a.id,
        userId: a.userId,
        jobId: a.jobId,
        stage: a.stage,
        notes: a.notes,
        nextAction: json(a.nextAction),
        resumeFileId: a.resumeFileId,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      },
    });
  }

  for (const s of fixtures.settings) {
    await prisma.settings.upsert({
      where: { userId: s.userId },
      update: {
        notifyEmail: s.notifyEmail,
        cronMatchWeekly: s.cronMatchWeekly,
        cronFollowups: s.cronFollowups,
        gmailConnected: s.gmailConnected,
      },
      create: {
        userId: s.userId,
        notifyEmail: s.notifyEmail,
        cronMatchWeekly: s.cronMatchWeekly,
        cronFollowups: s.cronFollowups,
        gmailConnected: s.gmailConnected,
      },
    });
  }

  // eslint-disable-next-line no-console
  console.log(
    `Seeded ${fixtures.users.length} user(s), ${fixtures.companies.length} companies, ${fixtures.jobs.length} jobs, ${fixtures.matches.length} matches, ${fixtures.applications.length} applications.`,
  );
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
