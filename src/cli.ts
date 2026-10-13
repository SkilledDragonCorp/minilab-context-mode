#!/usr/bin/env bun
/** CLI entry: `context-bench` / `bun run bench` */
import { runBench } from "./bench.ts";
import { formatMarkdownReport } from "./report.ts";

const jsonOnly = process.argv.includes("--json");
const tokenArg = process.argv.find((a) => a.startsWith("--tokenizer="));
const tokenMethod =
  tokenArg?.split("=")[1] === "chars_div_4" ? "chars_div_4" : "cl100k_base";

runBench(undefined, { tokenMethod })
  .then((report) => {
    if (jsonOnly) console.log(JSON.stringify(report, null, 2));
    else process.stdout.write(formatMarkdownReport(report));
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
