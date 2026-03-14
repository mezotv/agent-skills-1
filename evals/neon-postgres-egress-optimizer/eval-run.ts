#!/usr/bin/env bun

const EVALS_DIR = import.meta.dir;

const PROMPTS = {
  A: "My Neon bill spiked to $400 this month, most of it is data transfer. Help me figure out why.",
  B: "Optimize the database egress in this project.",
};

/**
 * Arg parsing
 */
function parseArgs(): { prompt: "A" | "B"; skill?: string } {
  const args = process.argv.slice(2);
  let prompt: string | undefined;
  let skill: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--prompt" && args[i + 1]) {
      prompt = args[++i];
    } else if (args[i] === "--skill" && args[i + 1]) {
      skill = args[++i];
    }
  }

  if (!prompt || !["A", "B"].includes(prompt)) {
    console.error("Usage: ./eval-run.ts --prompt <A|B> [--skill <version>]");
    console.error("  --prompt  Required. A or B");
    console.error(
      "  --skill   Optional. Skill version (e.g., 003). Omit for baseline.",
    );
    process.exit(1);
  }

  return { prompt: prompt as "A" | "B", skill };
}

/**
 * Helpers
 */

async function claimDiffFile(
  diffsDir: string,
  suffix: string,
  content: string,
): Promise<string> {
  const glob = new Bun.Glob("*.diff");
  let maxCounter = 0;
  for await (const file of glob.scan(diffsDir)) {
    const match = file.match(/^(\d+)_/);
    if (match) maxCounter = Math.max(maxCounter, parseInt(match[1] ?? "0", 10));
  }

  for (let i = maxCounter + 1; i < maxCounter + 100; i++) {
    const name = `${String(i).padStart(2, "0")}_${suffix}.diff`;
    const fullPath = `${diffsDir}/${name}`;
    if (await Bun.file(fullPath).exists()) continue;
    await Bun.write(fullPath, content);
    return name;
  }
  throw new Error("Could not claim a diff filename after 99 attempts");
}

async function spawnInteractive(cmd: string[], cwd: string): Promise<number> {
  const proc = Bun.spawn(cmd, {
    cwd,
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });
  return proc.exited;
}

/**
 * Main
 */

const { prompt, skill } = parseArgs();
const type = skill ? `v${skill}` : "baseline";
const dateSuffix = new Date().toISOString().slice(0, 10).replace(/-/g, "");
const evalDir = `/tmp/eval-${dateSuffix}_${prompt}_${type}_${process.pid}`;

console.log(`\nEval dir: ${evalDir}`);
console.log(`Prompt:   ${prompt} (${type})\n`);

/**
 * Phase 1: Setup + Claude Code
 */

await Bun.$`rm -rf ${evalDir}`.quiet();
await Bun.$`mkdir -p ${evalDir}`;
await Bun.$`cp -r ${EVALS_DIR}/fixtures/hono-drizzle-app/. ${evalDir}/`;

if (skill) {
  const skillSource = `${EVALS_DIR}/skill-versions/SKILL-v${skill}.md`;
  if (!(await Bun.file(skillSource).exists())) {
    console.error(`Skill file not found: ${skillSource}`);
    process.exit(1);
  }
  await Bun.$`mkdir -p ${evalDir}/.claude/skills/neon-postgres-egress-optimizer`;
  await Bun.$`cp ${skillSource} ${evalDir}/.claude/skills/neon-postgres-egress-optimizer/SKILL.md`;
}

await Bun.$`git init && git add . && git commit -m "baseline"`
  .cwd(evalDir)
  .quiet();

const claudePrompt = skill
  ? `/neon-postgres-egress-optimizer ${PROMPTS[prompt]}`
  : PROMPTS[prompt];

console.log("Starting Claude Code...\n");
await spawnInteractive(
  [
    "claude",
    "--model",
    "claude-sonnet-4-6",
    "--effort",
    "high",
    "--permission-mode",
    "acceptEdits",
    "--print",
    claudePrompt,
  ],
  evalDir,
);

/**
 * Phase 2: Test + Diff + Score
 */

let testsPassed = false;
for (let attempt = 1; attempt <= 5; attempt++) {
  const exitCode = await spawnInteractive(["bun", "test"], evalDir);
  if (exitCode === 0) {
    testsPassed = true;
    break;
  }
  console.log(`\nTests failed (attempt ${attempt}/5).`);
}

if (!testsPassed) {
  console.error("\nTests failed after 5 attempts. Skipping scoring.");
  process.exit(1);
}

const diffContent = await Bun.$`git diff`.cwd(evalDir).text();
const diffsDir = `${EVALS_DIR}/diffs`;
await Bun.$`mkdir -p ${diffsDir}`.quiet();
const diffName = await claimDiffFile(
  diffsDir,
  `${dateSuffix}_${prompt}_${type}`,
  diffContent,
);
console.log(`\nDiff saved: diffs/${diffName}`);

console.log("Starting scoring...\n");
await spawnInteractive(
  [
    "claude",
    "--model",
    "claude-sonnet-4-6",
    "--effort",
    "high",
    "--permission-mode",
    "acceptEdits",
    "--print",
    `/score-eval diffs/${diffName}`,
  ],
  EVALS_DIR,
);

console.log("\nDone.");
