import { z } from "zod";
import { shouldMock } from "@/lib/env";
import { getRepositories } from "@/server/repositories";
import { getServices } from "@/server/services";
import { runJob, jobNames } from "@/server/jobs/registry";

export const runtime = "nodejs";

const Body = z.object({ job: z.string() });

/** Dev-only mock scheduler: fire a cron job by name. Disabled outside mock mode. */
export async function POST(request: Request) {
  if (!shouldMock("cron")) {
    return Response.json({ error: "Disabled outside mock mode." }, { status: 403 });
  }
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "A job name is required.", jobs: jobNames() }, { status: 400 });
  }
  try {
    const result = await runJob(parsed.data.job, {
      repositories: getRepositories(),
      services: getServices(),
    });
    return Response.json(result);
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Job failed.", jobs: jobNames() },
      { status: 400 },
    );
  }
}

export async function GET() {
  return Response.json({ jobs: jobNames() });
}
