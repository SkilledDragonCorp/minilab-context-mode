# minilab-context-mode

**SkilledDragon LLC** · [skilleddragon.com](https://skilleddragon.com)

Educational minilab that **measures** how much context the [context-mode](https://github.com/mksglu/context-mode) MCP server saves versus dumping raw tool output into an AI coding agent’s window. Upstream ships under the **Elastic License 2.0 (ELv2)**; this repo is **MIT** and only wraps benchmarks + skills.

> **Not a security sandbox.** context-mode executes code in its own sandbox model. This lab runs real `ctx_execute` calls against generated fixtures on your machine. Treat results as local measurements, not guarantees in every client setup.

## Pinned upstream

| Package | Version |
| --- | --- |
| `context-mode` (npm) | **1.0.169** (exact pin in `package.json`) |
| `@modelcontextprotocol/sdk` | 1.32.1 |

## What it does

1. Generates deterministic fixtures at test/bench time (gitignored `.generated/`):
   - 5000-line noisy test log with **three** real failures
   - ~2MB JSON API dump
   - Large `git log --stat`-style text
   - Large directory listing
2. Spawns **real** context-mode over MCP stdio (`node node_modules/context-mode/cli.bundle.mjs`).
3. Compares **RAW** bytes/tokens (full file in context) vs **CM** bytes/tokens (MCP response from `ctx_execute` analysis).
4. Writes `reports/bench.json` and `reports/bench.md`.

Tokenizer default: **js-tiktoken `cl100k_base`**. Optional: `--tokenizer=chars_div_4` (chars÷4, labeled in report).

## API keys

| Service | Required? |
| --- | --- |
| context-mode MCP | No |
| OpenAI / other LLM | No (local bench only) |
| Any cloud API | No |

## Commands

```bash
bun install
bun test              # unit + e2e (real MCP)
bun run check:skills
bun audit
bun run bench         # regenerate fixtures + write reports/
bun run src/cli.ts --json   # JSON to stdout
```

Local ship gate (before push):

```bash
bun install && bun test && bun run check:skills && bun audit
gitleaks detect --source . --redact --verbose --no-banner   # or: gitleaks dir --redact --exit-code 1 .
```

Skip e2e only when debugging: `SKIP_E2E=1 bun test`.

## Skills

| Skill | Purpose |
| --- | --- |
| `.claude/skills/context-budget/SKILL.md` | When to sandbox vs read raw; budget heuristics |
| `.claude/skills/context-bench/SKILL.md` | Run and interpret this minilab |

## Sample results (local)

Run `bun run bench` on your machine. Example shape from a successful run:

- Noisy log: **~99%+** byte reduction with all three failure names preserved in CM output
- JSON dump: **~99%+** byte reduction

Marketing claims (e.g. “98%”) are **not** copied here — only numbers from your `reports/bench.md`.

## License

MIT — see [LICENSE](./LICENSE). context-mode upstream is ELv2; comply with upstream terms when using their package.
