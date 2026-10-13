import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export const CONTEXT_MODE_PINNED = "1.0.169";

export interface HarnessDiscovery {
  sandboxTools: string[];
  executeTools: string[];
  allToolNames: string[];
}

export function resolveContextModeBin(projectRoot = REPO_ROOT): string {
  const local = join(projectRoot, "node_modules", "context-mode", "cli.bundle.mjs");
  if (existsSync(local)) return local;
  throw new Error(
    `context-mode binary not found at ${local}. Run bun install (pinned ${CONTEXT_MODE_PINNED}).`,
  );
}

export function discoverToolRoles(tools: Tool[]): HarnessDiscovery {
  const names = tools.map((t) => t.name);
  const executeTools = names.filter((n) => /execute/i.test(n));
  const sandboxTools = names.filter(
    (n) =>
      n.startsWith("ctx_") &&
      (n.includes("execute") ||
        n.includes("index") ||
        n.includes("search") ||
        n.includes("fetch")),
  );
  return {
    sandboxTools: sandboxTools.length ? sandboxTools : names.filter((n) => n.startsWith("ctx_")),
    executeTools,
    allToolNames: names,
  };
}

export function assertHarnessTools(discovery: HarnessDiscovery): void {
  if (discovery.sandboxTools.length === 0) {
    throw new Error("No sandbox-style ctx_* tools discovered from context-mode MCP");
  }
  const hasExecute = discovery.executeTools.some((n) => /execute/i.test(n));
  if (!hasExecute) {
    throw new Error(
      `Expected at least one execute tool; got: ${discovery.allToolNames.join(", ")}`,
    );
  }
}

export interface ContextModeSession {
  client: Client;
  discovery: HarnessDiscovery;
  close: () => Promise<void>;
}

export async function startContextModeSession(projectRoot = REPO_ROOT): Promise<ContextModeSession> {
  const pkgRoot = join(projectRoot, "node_modules", "context-mode");
  const bin = resolveContextModeBin(projectRoot);
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [bin],
    cwd: pkgRoot,
    env: {
      ...process.env,
      CONTEXT_MODE_PROJECT_DIR: projectRoot,
    },
  });
  const client = new Client({ name: "minilab-context-mode", version: "1.0.0" }, { capabilities: {} });
  await client.connect(transport);
  const listed = await client.listTools();
  const discovery = discoverToolRoles(listed.tools);
  assertHarnessTools(discovery);
  return {
    client,
    discovery,
    close: async () => {
      await client.close();
    },
  };
}

/** Extract plain text from an MCP tool result for sizing. */
export function mcpResultToText(result: unknown): string {
  if (!result || typeof result !== "object") return String(result ?? "");
  const r = result as { content?: Array<{ type?: string; text?: string }> };
  if (!Array.isArray(r.content)) return JSON.stringify(result);
  return r.content
    .filter((c) => c.type === "text" && typeof c.text === "string")
    .map((c) => c.text!)
    .join("\n");
}
