import { describe, expect, test } from "bun:test";
import { discoverToolRoles } from "../src/harness.ts";

describe("harness discovery", () => {
  test("discovers execute and sandbox tools", () => {
    const tools = [
      { name: "ctx_execute", description: "", inputSchema: { type: "object" as const } },
      { name: "ctx_index", description: "", inputSchema: { type: "object" as const } },
      { name: "ctx_stats", description: "", inputSchema: { type: "object" as const } },
    ];
    const d = discoverToolRoles(tools);
    expect(d.executeTools).toContain("ctx_execute");
    expect(d.sandboxTools.some((n) => n.includes("execute"))).toBe(true);
  });
});
