import type { BenchReport, FixtureBenchResult } from "./types.ts";

function pctReduction(raw: number, reduced: number): number {
  if (raw <= 0) return 0;
  return ((raw - reduced) / raw) * 100;
}

export function formatFixtureRow(r: FixtureBenchResult): string {
  const bytePct = pctReduction(r.raw.bytes, r.contextMode.bytes).toFixed(1);
  const tokPct = pctReduction(r.raw.tokens, r.contextMode.tokens).toFixed(1);
  const signals = r.signals.found.length
    ? r.signals.found.join(", ")
    : r.signals.ok
      ? "n/a"
      : "MISSING";
  return `| ${r.kind} | ${r.raw.bytes.toLocaleString()} | ${r.contextMode.bytes.toLocaleString()} | ${bytePct}% | ${r.raw.tokens.toLocaleString()} | ${r.contextMode.tokens.toLocaleString()} | ${tokPct}% | ${signals} |`;
}

export function formatMarkdownReport(report: BenchReport): string {
  const lines: string[] = [];
  lines.push("# context-mode bench report");
  lines.push("");
  lines.push(`- **Generated:** ${report.generatedAt}`);
  lines.push(`- **context-mode (npm):** \`${report.contextModeVersion}\``);
  lines.push(`- **Tokenizer:** \`${report.tokenMethod}\` (js-tiktoken cl100k_base when set)`);
  lines.push(`- **Harness:** ${report.harness.ok ? "OK" : "FAILED"} — ${report.harness.detail}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(
    `Log fixture byte reduction: **${report.summary.logByteReductionPct.toFixed(1)}%** · JSON fixture byte reduction: **${report.summary.jsonByteReductionPct.toFixed(1)}%**`,
  );
  lines.push("");
  lines.push("## Per fixture");
  lines.push("");
  lines.push(
    "| Fixture | Raw bytes | CM bytes | Byte Δ | Raw tokens | CM tokens | Token Δ | Signals |",
  );
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |");
  for (const row of report.fixtures) {
    lines.push(formatFixtureRow(row));
  }
  lines.push("");
  lines.push("## Notes");
  lines.push("");
  lines.push("- **RAW** = full fixture text as if the agent read the entire artifact into context.");
  lines.push("- **CM** = MCP `ctx_execute` sandbox output returned to the agent (measured response text).");
  lines.push("- Signal check applies to the noisy log: three distinct failing test names must appear in CM output.");
  lines.push("- Reduction percentages are **measured** on this machine; do not assume vendor marketing numbers.");
  lines.push("");
  return lines.join("\n");
}

export function computeSummary(fixtures: FixtureBenchResult[]): BenchReport["summary"] {
  const log = fixtures.find((f) => f.kind === "noisy_log");
  const json = fixtures.find((f) => f.kind === "json_api");
  const bytePct = (raw: number, cm: number) => (raw <= 0 ? 0 : ((raw - cm) / raw) * 100);
  return {
    logByteReductionPct: log ? bytePct(log.raw.bytes, log.contextMode.bytes) : 0,
    jsonByteReductionPct: json ? bytePct(json.raw.bytes, json.contextMode.bytes) : 0,
    allSignalsOk: fixtures.filter((f) => f.kind === "noisy_log").every((f) => f.signals.ok),
  };
}
