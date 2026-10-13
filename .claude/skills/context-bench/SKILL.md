---
name: context-bench
description: Run the minilab-context-mode benchmark against pinned context-mode MCP and interpret reports/bench.md results.
---

# context-bench minilab

## When to use

You need **numbers** for how much context-mode saves on large fixtures, or you want to verify failure names survive sandbox summarization.

## Prerequisites

- Bun ≥ 1.2, Node ≥ 24 (engines in `package.json`)
- `bun install` in repo root (pins `context-mode@1.0.169`)

## Run

```bash
bun run bench
# or JSON only:
bun run src/cli.ts --json
```

Outputs:

- `reports/bench.json` — machine-readable
- `reports/bench.md` — human summary

## Interpret

- **RAW** = entire fixture as if loaded into context
- **CM** = MCP `ctx_execute` response text (what the agent actually sees)
- **Signals** (noisy log) = three failing test names must appear in CM output
- E2E tests require ≥ **80%** byte reduction on log + JSON fixtures (measured locally)

Optional tokenizer: `--tokenizer=chars_div_4` (fallback estimator, labeled in report).

## Upstream

Package: [context-mode on npm](https://www.npmjs.com/package/context-mode) · GitHub: [mksglu/context-mode](https://github.com/mksglu/context-mode) (Elastic-2.0).

Contact for this minilab: hello@skilleddragon.com (SkilledDragon educational lab, not a vuln program).
