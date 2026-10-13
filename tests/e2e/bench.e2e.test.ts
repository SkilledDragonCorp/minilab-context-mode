import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { runBench } from "../../src/bench.ts";
import { FAILURE_NAMES } from "../../fixtures/generators.ts";

const ROOT = join(import.meta.dir, "../..");
const E2E = process.env.SKIP_E2E !== "1";

describe.skipIf(!E2E)("e2e context-mode MCP bench", () => {
  test(
    "real MCP: reduction >= 80% on log+JSON, failure names preserved",
    async () => {
      const report = await runBench(ROOT, { tokenMethod: "cl100k_base" });
      expect(report.harness.ok).toBe(true);

      const log = report.fixtures.find((f) => f.kind === "noisy_log");
      const json = report.fixtures.find((f) => f.kind === "json_api");
      expect(log).toBeDefined();
      expect(json).toBeDefined();

      const logPct =
        ((log!.raw.bytes - log!.contextMode.bytes) / log!.raw.bytes) * 100;
      const jsonPct =
        ((json!.raw.bytes - json!.contextMode.bytes) / json!.raw.bytes) * 100;

      expect(logPct).toBeGreaterThanOrEqual(80);
      expect(jsonPct).toBeGreaterThanOrEqual(80);

      for (const name of FAILURE_NAMES) {
        expect(log!.signals.found).toContain(name);
      }
      expect(log!.signals.ok).toBe(true);
    },
    { timeout: 120_000 },
  );
});
