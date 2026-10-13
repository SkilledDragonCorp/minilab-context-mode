---
name: context-budget
description: Decide when to route large tool output through context-mode sandbox (ctx_execute) instead of reading raw files into the agent context window.
---

# Context budget for coding agents

Use this skill when a task would **read, grep, or fetch** large artifacts (logs, JSON dumps, repo listings, git history) into the model context.

## Rules of thumb

1. **Under ~8–16 KB** of high-signal text: direct read is fine.
2. **Above ~32 KB** or repetitive noise: prefer **context-mode** MCP sandbox tools (`ctx_execute`, `ctx_index`, `ctx_search`) so raw bytes stay out of the window.
3. **Never** paste multi-megabyte blobs into chat; program the extraction (counts, failures, summaries) and return JSON or a short table.

## context-mode is not a security boundary

Sandbox execution follows [context-mode](https://github.com/mksglu/context-mode) policies (ELv2). Still use least privilege, trusted repos, and pinned npm versions.

## Signal preservation

When compressing test logs or CI output, explicitly extract **failure identifiers** (test names, error codes) in sandbox code and verify they appear in the tool response before concluding the run.

## Measure, don’t guess

Run the SkilledDragon **context-bench** minilab (`bun run bench`) to get measured byte/token reduction on your machine instead of repeating vendor marketing percentages.
