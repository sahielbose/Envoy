import { smokeEval } from "./smoke";
import type { EvalSet } from "./types";

const SETS: EvalSet[] = [smokeEval];

async function main() {
  let allOk = true;
  console.log("Running Envoy evals…\n");

  for (const set of SETS) {
    const cases = await set.run();
    const passed = cases.filter((c) => c.passed).length;
    const score = cases.length > 0 ? passed / cases.length : 1;
    const ok = score >= set.threshold;
    if (!ok) allOk = false;

    console.log(
      `${ok ? "PASS" : "FAIL"}  ${set.name}: ${passed}/${cases.length} (score ${score.toFixed(2)}, threshold ${set.threshold.toFixed(2)})`,
    );
    for (const c of cases) {
      console.log(`      ${c.passed ? "✓" : "✗"} ${c.name}${c.note ? ` — ${c.note}` : ""}`);
    }
  }

  console.log(`\n${allOk ? "✓ All eval sets passed." : "✗ Some eval sets failed."}`);
  process.exitCode = allOk ? 0 : 1;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
