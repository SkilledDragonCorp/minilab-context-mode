import { getEncoding } from "js-tiktoken";

export type TokenMethod = "cl100k_base" | "chars_div_4";

let encoding: ReturnType<typeof getEncoding> | null = null;

function getCl100k() {
  if (!encoding) encoding = getEncoding("cl100k_base");
  return encoding;
}

/** Count tokens using js-tiktoken cl100k_base (OpenAI-style). */
export function countTokensCl100k(text: string): number {
  return getCl100k().encode(text).length;
}

/** Fallback estimator: character length / 4, rounded up. */
export function countTokensCharsDiv4(text: string): number {
  return Math.ceil(text.length / 4);
}

export interface TokenCounts {
  method: TokenMethod;
  tokens: number;
  bytes: number;
}

export function measureText(text: string, method: TokenMethod = "cl100k_base"): TokenCounts {
  const bytes = Buffer.byteLength(text, "utf8");
  const tokens =
    method === "cl100k_base" ? countTokensCl100k(text) : countTokensCharsDiv4(text);
  return { method, tokens, bytes };
}
