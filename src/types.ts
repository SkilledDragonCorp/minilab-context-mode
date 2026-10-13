import type { FixtureKind } from "../fixtures/generators.ts";
import type { TokenMethod } from "./tokens.ts";

export interface TokenCounts {
  method: TokenMethod;
  tokens: number;
  bytes: number;
}

export interface SignalCheck {
  expected: string[];
  found: string[];
  ok: boolean;
}

export interface FixtureBenchResult {
  kind: FixtureKind;
  raw: TokenCounts;
  contextMode: TokenCounts;
  signals: SignalCheck;
  toolUsed: string;
}

export interface BenchReport {
  generatedAt: string;
  contextModeVersion: string;
  tokenMethod: TokenMethod;
  harness: { ok: boolean; detail: string; sandboxTools: string[]; executeTools: string[] };
  fixtures: FixtureBenchResult[];
  summary: {
    logByteReductionPct: number;
    jsonByteReductionPct: number;
    allSignalsOk: boolean;
  };
}
