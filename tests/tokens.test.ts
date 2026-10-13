import { describe, expect, test } from "bun:test";
import { countTokensCharsDiv4, countTokensCl100k, measureText } from "../src/tokens.ts";

describe("token counter", () => {
  test("cl100k counts increase with text length", () => {
    const short = countTokensCl100k("hello");
    const long = countTokensCl100k("hello world ".repeat(20));
    expect(long).toBeGreaterThan(short);
  });

  test("chars/4 estimator", () => {
    expect(countTokensCharsDiv4("abcd")).toBe(1);
    expect(countTokensCharsDiv4("abcde")).toBe(2);
  });

  test("measureText bundles bytes", () => {
    const m = measureText("test", "cl100k_base");
    expect(m.bytes).toBe(4);
    expect(m.method).toBe("cl100k_base");
  });
});
