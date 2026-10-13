#!/usr/bin/env bun
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  FAILURE_NAMES,
  generateAllFixtures,
  type GeneratedFixture,
} from "../fixtures/generators.ts";
import {
  CONTEXT_MODE_PINNED,
  mcpResultToText,
  startContextModeSession,
} from "./harness.ts";
import { analysisCodeForFixture } from "./analysis-scripts.ts";
import { computeSummary, formatMarkdownReport } from "./report.ts";
import type { BenchReport, FixtureBenchResult, SignalCheck } from "./types.ts";
import { measureText, type TokenMethod } from "./tokens.ts";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function parseArgs(argv: string[]): { jsonOnly: boolean; tokenMethod: TokenMethod } {
  let jsonOnly = false;
  let tokenMethod: TokenMethod = "cl100k_base";
  for (const a of argv) {
    if (a === "--json") jsonOnly = true;
    if (a.startsWith("--tokenizer=")) {
      const v = a.split("=")[1];
      if (v === "chars_div_4" || v === "cl100k_base") tokenMethod = v;
    }
  }
  return { jsonOnly, tokenMethod };
}

function checkSignals(kind: GeneratedFixture["kind"], cmText: string): SignalCheck {
  if (kind !== "noisy_log") {
    return { expected: [], found: [], ok: true };
  }
  const expected = [...FAILURE_NAMES];
  const found = expected.filter((name) => cmText.includes(name));
  return { expected, found, ok: found.length === expected.length };
}

async function benchFixture(
  fixture: GeneratedFixture,
  tokenMethod: TokenMethod,
  callExecute: (code: string) => Promise<string>,
): Promise<FixtureBenchResult> {
  const rawText = readFileSync(fixture.path, "utf8");
  const raw = measureText(rawText, tokenMethod);
  const code = analysisCodeForFixture(fixture.kind, fixture.path);
  const cmText = await callExecute(code);
  const contextMode = measureText(cmText, tokenMethod);
  const signals = checkSignals(fixture.kind, cmText);
  return {
    kind: fixture.kind,
    raw,
    contextMode,
    signals,
    toolUsed: "ctx_execute",
  };
}

export async function runBench(projectRoot = REPO_ROOT, options?: { tokenMethod?: TokenMethod }) {
  const tokenMethod = options?.tokenMethod ?? "cl100k_base";
  const fixtures = generateAllFixtures(projectRoot);
  const session = await startContextModeSession(projectRoot);

  const callExecute = async (code: string): Promise<string> => {
    const result = await session.client.callTool({
      name: "ctx_execute",
      arguments: { language: "javascript", code, cwd: projectRoot },
    });
    return mcpResultToText(result);
  };

  const results: FixtureBenchResult[] = [];
  for (const fx of fixtures) {
    results.push(await benchFixture(fx, tokenMethod, callExecute));
  }

  await session.close();

  const report: BenchReport = {
    generatedAt: new Date().toISOString(),
    contextModeVersion: CONTEXT_MODE_PINNED,
    tokenMethod,
    harness: {
      ok: true,
      detail: `Discovered ${session.discovery.allToolNames.length} tools`,
      sandboxTools: session.discovery.sandboxTools,
      executeTools: session.discovery.executeTools,
    },
    fixtures: results,
    summary: computeSummary(results),
  };

  const reportsDir = join(projectRoot, "reports");
  mkdirSync(reportsDir, { recursive: true });
  writeFileSync(join(reportsDir, "bench.json"), JSON.stringify(report, null, 2) + "\n");
  writeFileSync(join(reportsDir, "bench.md"), formatMarkdownReport(report) + "\n");
  return report;
}

async function main() {
  const { jsonOnly, tokenMethod } = parseArgs(process.argv.slice(2));
  const report = await runBench(REPO_ROOT, { tokenMethod });
  if (jsonOnly) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(formatMarkdownReport(report));
  }
}

if (import.meta.main) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
