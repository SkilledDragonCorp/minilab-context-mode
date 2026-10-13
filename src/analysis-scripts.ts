import type { FixtureKind } from "../fixtures/generators.ts";

/** Sandbox JS run via ctx_execute — returns compact JSON string on stdout. */
export function analysisCodeForFixture(kind: FixtureKind, absolutePath: string): string {
  const p = JSON.stringify(absolutePath);
  switch (kind) {
    case "noisy_log":
      return [
        "const fs = require('fs');",
        `const p = ${p};`,
        "const text = fs.readFileSync(p, 'utf8');",
        "const fails = [...new Set(text.match(/FAIL\\s+(\\S+)\\s+FAILED/g) || [])];",
        "const names = fails.map(l => { const m = l.match(/FAIL\\s+(\\S+)\\s+FAILED/); return m ? m[1] : null; }).filter(Boolean);",
        "console.log(JSON.stringify({ failureLines: fails.length, uniqueFailures: names }));",
      ].join("\n");
    case "json_api":
      return [
        "const fs = require('fs');",
        `const p = ${p};`,
        "const doc = JSON.parse(fs.readFileSync(p, 'utf8'));",
        "const data = doc.data || [];",
        "const byWh = {};",
        "for (const row of data) { byWh[row.warehouse] = (byWh[row.warehouse] || 0) + 1; }",
        "console.log(JSON.stringify({ records: data.length, warehouses: byWh, sample: data.slice(0, 3) }));",
      ].join("\n");
    case "git_stat":
      return [
        "const fs = require('fs');",
        `const p = ${p};`,
        "const text = fs.readFileSync(p, 'utf8');",
        "const commits = (text.match(/^commit /gm) || []).length;",
        "const files = (text.match(/\\| \\d+/g) || []).length;",
        "console.log(JSON.stringify({ commits, fileLines: files, head: text.slice(0, 200) }));",
      ].join("\n");
    case "dir_listing":
      return [
        "const fs = require('fs');",
        `const p = ${p};`,
        "const lines = fs.readFileSync(p, 'utf8').split(/\\n/);",
        "let files = 0, dirs = 0;",
        "for (const l of lines) { if (l.includes(' f ')) files++; if (l.includes(' d ')) dirs++; }",
        "console.log(JSON.stringify({ lines: lines.length, files, dirs }));",
      ].join("\n");
    default:
      throw new Error(`Unknown fixture kind: ${kind satisfies never}`);
  }
}
