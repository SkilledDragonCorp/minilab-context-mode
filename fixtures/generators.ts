import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const FIXTURE_SEED = 42_001;

/** Deterministic PRNG (mulberry32). */
export function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const FAILURE_NAMES = [
  "test_auth_flow",
  "test_payment_webhook",
  "test_inventory_sync",
] as const;

export type FixtureKind = "noisy_log" | "json_api" | "git_stat" | "dir_listing";

export interface GeneratedFixture {
  kind: FixtureKind;
  path: string;
  bytes: number;
  meta: Record<string, unknown>;
}

export function generatedDir(root: string): string {
  const dir = join(root, ".generated");
  mkdirSync(dir, { recursive: true });
  return dir;
}

/** (a) 5000-line noisy test log with 3 real failure lines (one per test name). */
export function generateNoisyLog(outDir: string): GeneratedFixture {
  const rng = mulberry32(FIXTURE_SEED);
  const lines: string[] = [];
  const failLineNumbers: number[] = [];
  for (let i = 1; i <= 5000; i++) {
    if (i === 1203) {
      lines.push(`FAIL ${FAILURE_NAMES[0]} FAILED assertion at line ${i}`);
      failLineNumbers.push(i);
    } else if (i === 2891) {
      lines.push(`FAIL ${FAILURE_NAMES[1]} FAILED expected 200 got 502`);
      failLineNumbers.push(i);
    } else if (i === 4777) {
      lines.push(`FAIL ${FAILURE_NAMES[2]} FAILED timeout after 30s`);
      failLineNumbers.push(i);
    } else {
      const pad = Math.floor(rng() * 80);
      lines.push(`ok suite.case_${i} passed ${".".repeat(pad)}`);
    }
  }
  const body = lines.join("\n") + "\n";
  const path = join(outDir, "noisy-test.log");
  writeFileSync(path, body, "utf8");
  return {
    kind: "noisy_log",
    path,
    bytes: Buffer.byteLength(body, "utf8"),
    meta: { lines: 5000, failLineNumbers, failureNames: [...FAILURE_NAMES] },
  };
}

/** (b) ~2MB JSON API dump (deterministic). */
export function generateJsonApiDump(outDir: string): GeneratedFixture {
  const rng = mulberry32(FIXTURE_SEED + 1);
  const targetBytes = 2 * 1024 * 1024;
  const sample = {
    id: 1,
    sku: "SKU-0000",
    qty: 100,
    warehouse: "east",
    updated_at: "2026-01-15T12:00:00.000Z",
    meta: { batch: 0, noise: "0.12345678" },
  };
  const approxRecordBytes = JSON.stringify(sample).length + 1;
  const wrapperOverhead = 64;
  const recordCount = Math.ceil((targetBytes - wrapperOverhead) / approxRecordBytes);
  const records: object[] = [];
  for (let i = 0; i < recordCount; i++) {
    records.push({
      id: i + 1,
      sku: `SKU-${(i % 10000).toString().padStart(4, "0")}`,
      qty: Math.floor(rng() * 500),
      warehouse: ["east", "west", "central"][i % 3],
      updated_at: "2026-01-15T12:00:00.000Z",
      meta: { batch: Math.floor(i / 100), noise: rng().toFixed(8) },
    });
  }
  const payload = { data: records, page: 1, total: records.length };
  const body = JSON.stringify(payload);
  const path = join(outDir, "api-dump.json");
  writeFileSync(path, body, "utf8");
  return {
    kind: "json_api",
    path,
    bytes: Buffer.byteLength(body, "utf8"),
    meta: { recordCount: records.length, targetBytes: 2 * 1024 * 1024 },
  };
}

/** (c) Large git log --stat style output. */
export function generateGitStatLog(outDir: string): GeneratedFixture {
  const rng = mulberry32(FIXTURE_SEED + 2);
  const chunks: string[] = [];
  for (let c = 0; c < 800; c++) {
    const hash = `commit ${(FIXTURE_SEED + c).toString(16).padStart(40, "0")}`;
    chunks.push(
      `${hash}\nAuthor: bot${c % 7} <bot@example.com>\nDate:   Mon Jan ${(c % 28) + 1} 2026\n\n    chore: batch ${c}\n`,
    );
    const files = 3 + Math.floor(rng() * 12);
    for (let f = 0; f < files; f++) {
      const ins = Math.floor(rng() * 400);
      const del = Math.floor(rng() * 200);
      chunks.push(` src/module${c % 40}/file${f}.ts | ${ins + del} +${ins}-${del}\n`);
    }
    chunks.push(` ${files} files changed, ${Math.floor(rng() * 5000)} insertions(+)\n\n`);
  }
  const body = chunks.join("");
  const path = join(outDir, "git-log-stat.txt");
  writeFileSync(path, body, "utf8");
  return {
    kind: "git_stat",
    path,
    bytes: Buffer.byteLength(body, "utf8"),
    meta: { commits: 800 },
  };
}

/** (d) Big directory listing. */
export function generateDirListing(outDir: string): GeneratedFixture {
  const rng = mulberry32(FIXTURE_SEED + 3);
  const lines: string[] = [];
  for (let i = 0; i < 12_000; i++) {
    const depth = i % 6;
    const indent = "  ".repeat(depth);
    const kind = rng() > 0.3 ? "f" : "d";
    const name = kind === "d" ? `dir_${i}` : `file_${i}.tsx`;
    lines.push(`${indent}${kind} ${name}`);
  }
  const body = lines.join("\n") + "\n";
  const path = join(outDir, "dir-listing.txt");
  writeFileSync(path, body, "utf8");
  return {
    kind: "dir_listing",
    path,
    bytes: Buffer.byteLength(body, "utf8"),
    meta: { entries: 12_000 },
  };
}

export function generateAllFixtures(projectRoot: string): GeneratedFixture[] {
  const outDir = generatedDir(projectRoot);
  return [
    generateNoisyLog(outDir),
    generateJsonApiDump(outDir),
    generateGitStatLog(outDir),
    generateDirListing(outDir),
  ];
}
