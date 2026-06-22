import { describe, it, expect } from "vitest";
import { ungroundedMetrics, sanitizeProse } from "./generate";

const BASE =
  "Alex Rivera Senior Frontend Engineer 6 years building React design systems, including a " +
  "component library used across a 40-person product org. Scaled payments to 2M req/day.";

describe("ungroundedMetrics (truthfulness guard)", () => {
  it("flags invented percentages and dollar/magnitude figures", () => {
    expect(ungroundedMetrics("increased conversion 40%", BASE)).toContain("40%");
    expect(ungroundedMetrics("drove $5M in ARR", BASE).length).toBeGreaterThan(0);
    expect(ungroundedMetrics("grew the team 10x", BASE)).toContain("10x");
  });

  it("allows figures that are present in the candidate's real profile", () => {
    expect(ungroundedMetrics("scaled to 2M requests a day", BASE)).toEqual([]);
    expect(ungroundedMetrics("a 40-person product org", BASE)).toEqual([]);
  });

  it("does not flag plain, non-metric numbers", () => {
    expect(ungroundedMetrics("I'd value 20 minutes to talk; 6 years of work", BASE)).toEqual([]);
  });
});

describe("sanitizeProse", () => {
  it("removes em/en dashes to match the rest of the site", () => {
    expect(sanitizeProse("strong work — real impact")).toBe("strong work, real impact");
    expect(sanitizeProse("2018–2021")).toBe("2018-2021");
  });
});
