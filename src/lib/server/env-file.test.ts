import { describe, it, expect, afterEach } from "vitest";
import { readFileSync, rmSync, mkdtempSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { applyEnvFile } from "./env-file";
import { shouldMock, requireProvider } from "@/lib/env";

const tmp = mkdtempSync(join(tmpdir(), "envoy-env-"));
const file = join(tmp, ".env.local");

afterEach(() => {
  try {
    rmSync(file);
  } catch {
    /* not written yet */
  }
});

describe("applyEnvFile", () => {
  it("creates, upserts, removes, and preserves unrelated lines", () => {
    applyEnvFile({ ANTHROPIC_API_KEY: "sk-ant-aaa", MOCK_LLM: "false" }, file);
    expect(readFileSync(file, "utf8")).toBe("ANTHROPIC_API_KEY=sk-ant-aaa\nMOCK_LLM=false\n");

    // Update one key, keep the other.
    applyEnvFile({ ANTHROPIC_API_KEY: "sk-ant-bbb" }, file);
    const updated = readFileSync(file, "utf8");
    expect(updated).toContain("ANTHROPIC_API_KEY=sk-ant-bbb");
    expect(updated).toContain("MOCK_LLM=false");

    // Remove keys with null.
    applyEnvFile({ ANTHROPIC_API_KEY: null, MOCK_LLM: null }, file);
    expect(readFileSync(file, "utf8").trim()).toBe("");
  });

  it("preserves comments and unrelated entries", () => {
    applyEnvFile({ KEEP: "1" }, file);
    // Hand-write a comment in, then upsert another key.
    const withComment = `# a comment\nKEEP=1\nOTHER=stay\n`;
    writeFileSync(file, withComment);
    applyEnvFile({ NEW: "2" }, file);
    const out = readFileSync(file, "utf8");
    expect(out).toContain("# a comment");
    expect(out).toContain("OTHER=stay");
    expect(out).toContain("NEW=2");
  });
});

describe("runtime LLM gating", () => {
  it("flips off mock when a key + MOCK_LLM=false are present, and back when removed", () => {
    const prevKey = process.env.ANTHROPIC_API_KEY;
    const prevMock = process.env.MOCK_LLM;
    try {
      process.env.ANTHROPIC_API_KEY = "sk-ant-test-key-1234567890";
      process.env.MOCK_LLM = "false";
      expect(shouldMock("llm")).toBe(false);
      expect(() => requireProvider("llm")).not.toThrow();

      delete process.env.ANTHROPIC_API_KEY;
      delete process.env.MOCK_LLM;
      expect(shouldMock("llm")).toBe(true); // USE_MOCKS defaults true
    } finally {
      if (prevKey === undefined) delete process.env.ANTHROPIC_API_KEY;
      else process.env.ANTHROPIC_API_KEY = prevKey;
      if (prevMock === undefined) delete process.env.MOCK_LLM;
      else process.env.MOCK_LLM = prevMock;
    }
  });
});
