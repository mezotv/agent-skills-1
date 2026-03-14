#!/usr/bin/env bun

const EVALS_DIR = import.meta.dir;
const EVAL_RUN = `${EVALS_DIR}/eval-run.ts`;

/**
 * Arg parsing
 */
function parseArgs(): { prompt: string; skill?: string; count: number } {
  const args = process.argv.slice(2);
  let prompt: string | undefined;
  let skill: string | undefined;
  let count: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--prompt" && args[i + 1]) {
      prompt = args[++i];
    } else if (args[i] === "--skill" && args[i + 1]) {
      skill = args[++i];
    } else if (args[i] === "--count" && args[i + 1]) {
      count = args[++i];
    }
  }

  const n = parseInt(count ?? "", 10);
  if (!prompt || !["A", "B"].includes(prompt) || !count || isNaN(n) || n < 1) {
    console.error(
      "Usage: ./eval-batch.ts --prompt <A|B> --count <N> [--skill <version>]",
    );
    console.error("  --prompt  Required. A or B");
    console.error("  --count   Required. Number of parallel runs");
    console.error(
      "  --skill   Optional. Skill version (e.g., 003). Omit for baseline.",
    );
    process.exit(1);
  }

  return { prompt, skill, count: n };
}

/**
 * Main
 */

const { prompt, skill, count } = parseArgs();
const logDir = `/tmp/eval-batch-${process.pid}`;
await Bun.$`mkdir -p ${logDir}`.quiet();

const childArgs = ["--prompt", prompt];
if (skill) childArgs.push("--skill", skill);

console.log(`Launching ${count} parallel eval runs...`);
console.log(`Logs: ${logDir}/\n`);

const children = Array.from({ length: count }, (_, i) => {
  const logFile = Bun.file(`${logDir}/run-${i + 1}.log`);
  const proc = Bun.spawn(["bun", EVAL_RUN, ...childArgs], {
    stdout: logFile,
    stderr: logFile,
    stdin: "ignore",
  });
  return proc.exited.then((code) => ({ index: i + 1, code }));
});

const results = await Promise.all(children);

const passed = results.filter((r) => r.code === 0);
const failed = results.filter((r) => r.code !== 0);

console.log(`\n--- Summary ---`);
console.log(`Passed: ${passed.length}/${count}`);
console.log(`Failed: ${failed.length}/${count}`);

if (failed.length > 0) {
  console.log("\nFailed runs:");
  for (const r of failed) {
    console.log(
      `  run ${r.index} (exit ${r.code}): ${logDir}/run-${r.index}.log`,
    );
  }
}

process.exit(failed.length > 0 ? 1 : 0);
