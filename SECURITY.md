# Security Policy

**Built by [SkilledDragon LLC](https://skilleddragon.com)**

This is a **SkilledDragon educational minilab**, not a production product. It is published so people can learn how much context [context-mode](https://github.com/mksglu/context-mode) can save in agent workflows. We do **not** maintain these repos on a regular schedule and we do **not** operate a vulnerability response program for them.

## Contact

General questions: **hello@skilleddragon.com**  
Do not use a dedicated security mailbox for this repo — none exists.

## If you find an issue

- Prefer reporting **upstream** when the issue is in [mksglu/context-mode](https://github.com/mksglu/context-mode), npm `context-mode`, or other dependencies.
- For something specific to this minilab’s harness or fixtures, you may email hello@skilleddragon.com. There is **no SLA**, and we may not patch or reply quickly.
- Do not expect private coordinated disclosure or paid bounty handling here.

## Scope / hygiene

This repository ships documentation, CI checks, deterministic fixtures, and a local benchmark harness. It is **not** a security sandbox — `ctx_execute` runs code via context-mode’s own runtime policies.

- Never commit `.env`, API keys, or tokens.
- CI is intended to stay keyless (gitleaks, audits, skill checks, unit + e2e tests).

Use at your own risk. Pin versions, review the code, and treat this as sample material.
