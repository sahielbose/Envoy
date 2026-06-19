import { shouldMock } from "@/lib/env";
import { getEmbedder } from "@/lib/matching/embeddings";
import { getWebSearch } from "@/lib/search";
import { getRepositories } from "@/server/repositories";

interface Check {
  name: string;
  ok: boolean;
  note: string;
}

/**
 * Live smoke test. With USE_MOCKS=true (default) every provider reports "mocked"
 * and passes. With real keys + the provider unmocked, it exercises a tiny live
 * call. No emails are sent and no LLM tokens are spent (those are exercised in
 * the app, not here).
 */
async function main() {
  const checks: Check[] = [];

  if (shouldMock("embeddings")) {
    checks.push({ name: "embeddings", ok: true, note: "mocked" });
  } else {
    try {
      const v = await getEmbedder().embed(["smoke test"]);
      checks.push({ name: "embeddings (Voyage)", ok: (v[0]?.length ?? 0) > 0, note: `dim ${v[0]?.length}` });
    } catch (e) {
      checks.push({ name: "embeddings (Voyage)", ok: false, note: String(e) });
    }
  }

  if (shouldMock("search")) {
    checks.push({ name: "search", ok: true, note: "mocked" });
  } else {
    try {
      const r = await getWebSearch().search("Cloudflare", { limit: 1 });
      checks.push({ name: "search (Exa)", ok: r.length > 0, note: `${r.length} results` });
    } catch (e) {
      checks.push({ name: "search (Exa)", ok: false, note: String(e) });
    }
  }

  if (shouldMock("db")) {
    checks.push({ name: "db", ok: true, note: "mocked" });
  } else {
    try {
      const n = await getRepositories().jobs.count();
      checks.push({ name: "db (Postgres)", ok: true, note: `${n} jobs` });
    } catch (e) {
      checks.push({ name: "db (Postgres)", ok: false, note: String(e) });
    }
  }

  for (const c of checks) console.log(`${c.ok ? "✓" : "✗"} ${c.name} — ${c.note}`);
  const allOk = checks.every((c) => c.ok);
  console.log(`\n${allOk ? "✓ Smoke passed." : "✗ Smoke failed."}`);
  process.exitCode = allOk ? 0 : 1;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
