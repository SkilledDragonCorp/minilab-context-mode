import { describe, expect, test } from "bun:test";
import { computeSummary, formatMarkdownReport } from "../src/report.ts";
import type { FixtureBenchResult } from "../src/types.ts";

const sampleFixtures: FixtureBenchResult[] = [
  {
    kind: "noisy_log",
    raw: { method: "cl100k_base", bytes: 1000, tokens: 250 },
    contextMode: { method: "cl100k_base", bytes: 100, tokens: 25 },
    signals: { expected: ["a"], found: ["a"], ok: true },
    toolUsed: "ctx_execute",
  },
  {
    kind: "json_api",
    raw: { method: "cl100k_base", bytes: 2000, tokens: 500 },
    contextMode: { method: "cl100k_base", bytes: 200, tokens: 50 },
    signals: { expected: [], found: [], ok: true },
    toolUsed: "ctx_execute",
  },
];

describe("report formatter", () => {
  test("markdown includes fixture table", () => {
    const md = formatMarkdownReport({
      generatedAt: "2026-01-01T00:00:00.000Z",
      contextModeVersion: "1.0.169",
      tokenMethod: "cl100k_base",
      harness: { ok: true, detail: "ok", sandboxTools: ["ctx_execute"], executeTools: ["ctx_execute"] },
      fixtures: sampleFixtures,
      summary: computeSummary(sampleFixtures),
    });
    expect(md).toContain("noisy_log");
    expect(md).toContain("90.0%");
  });

  test("computeSummary extracts log and json reduction", () => {
    const s = computeSummary(sampleFixtures);
    expect(s.logByteReductionPct).toBe(90);
    expect(s.jsonByteReductionPct).toBe(90);
    expect(s.allSignalsOk).toBe(true);
  });
});
