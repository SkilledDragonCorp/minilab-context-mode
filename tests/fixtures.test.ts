import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  FAILURE_NAMES,
  FIXTURE_SEED,
  generateJsonApiDump,
  generateNoisyLog,
  generatedDir,
  mulberry32,
} from "../fixtures/generators.ts";

const ROOT = join(import.meta.dir, "..");

describe("fixture generators", () => {
  test("mulberry32 is deterministic", () => {
    const a = mulberry32(FIXTURE_SEED);
    const b = mulberry32(FIXTURE_SEED);
    const seq = (fn: () => number) => [fn(), fn(), fn()];
    expect(seq(a)).toEqual(seq(b));
  });

  test("noisy log has 5000 lines and 3 failure names", () => {
    const dir = generatedDir(join(ROOT, ".generated-test-a"));
    const fx = generateNoisyLog(dir);
    const lines = readFileSync(fx.path, "utf8").split("\n").filter(Boolean);
    expect(lines.length).toBe(5000);
    for (const name of FAILURE_NAMES) {
      expect(readFileSync(fx.path, "utf8")).toContain(name);
    }
  });

  test("json api dump is at least 2MB", () => {
    const dir = generatedDir(join(ROOT, ".generated-test-a"));
    const json = generateJsonApiDump(dir);
    expect(json.bytes).toBeGreaterThanOrEqual(2 * 1024 * 1024);
  }, 30_000);
});
