# Evals

How to run and score evaluations for the postgres-egress-optimizer skill.

## Prompts

| ID  | Type     | Prompt                                                                                       |
| --- | -------- | -------------------------------------------------------------------------------------------- |
| A   | Vague    | My Neon bill spiked to $400 this month, most of it is data transfer. Help me figure out why. |
| B   | Moderate | Optimize the database egress in this project.                                                |

Prompt C (specific, with pg_stat_statements data) is planned but deferred until the mock stats workflow is finalized. See `eval-rubric.md` for problem P3 details — it is only detectable via stats, so prompts A and B are expected to score 0 on P3 detection.

## Running an eval

```bash
# 0. Store the evals directory path
EVALS_DIR=$(pwd)/evals

# 1. Copy fixture to a clean workspace
mkdir /tmp/eval-$(date +%Y%m%d)
cp -r evals/fixtures/hono-drizzle-app/. /tmp/eval-$(date +%Y%m%d)/
cd /tmp/eval-$(date +%Y%m%d)
git init && git add . && git commit -m "baseline"

# 2. Run Claude Code with one prompt
# Prompt A:
claude "My Neon bill spiked to $400 this month, most of it is data transfer. Help me figure out why."
# Prompt B:
claude "Optimize the database egress in this project."

# 3. Run integration tests
bun test

# 4. Capture the diff
git diff > $EVALS_DIR/diffs/$(date +%Y-%m-%d)_A_baseline.diff

# 5. Score against eval-rubric.md
# See "Scoring" below
```

## Scoring

Open `eval-rubric.md` and answer each yes/no question per problem against the diff. Record one row in `results.csv`.

**Columns:**

- `date` — YYYY-MM-DD
- `skill_commit` — commit hash of the skill + fixture
- `fixture` — fixture name (e.g., `hono-drizzle-app`)
- `prompt` — which prompt was used (A, B)
- `model` — Claude model version used
- `p1_detected` through `p5_detected` — yes/no
- `p1_fixed` through `p5_fixed` — yes/no
- `tests_pass` — yes/no (run `bun test` after the agent's changes)
- `notes` — free text for anything notable

## Judge

For v1, score manually against the rubric. To use Claude Code as judge:

1. Copy fixture to temp directory
2. Run Claude Code with skill installed + one prompt → produces a git diff
3. Feed diff + original fixture code + `eval-rubric.md` to a second Claude Code instance
4. Judge outputs detected/fixed per problem + test pass status
5. Append row to `results.csv`

First few runs: verify the judge's scoring manually. Once trustworthy, human spot-checks only.
