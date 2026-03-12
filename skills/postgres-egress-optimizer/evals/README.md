# Evals runbook

How to run and score evaluations for the postgres-egress-optimizer skill.

## Prompts

| ID  | Type     | Prompt                                                                                       |
| --- | -------- | -------------------------------------------------------------------------------------------- |
| A   | Vague    | My Neon bill spiked to $400 this month, most of it is data transfer. Help me figure out why. |
| B   | Moderate | Optimize the database egress in this project.                                                |

Prompt C (specific, with pg_stat_statements data) is planned but deferred until the mock stats workflow is finalized. See `eval-rubric.md` for problem P3 details — it is only detectable via stats, so prompts A and B are expected to score 0 on P3 detection.

## Baseline

Baseline established from 7 runs without the skill (4 × Prompt A, 3 × Prompt B) on Opus 4.6 high effort.

| Problem                          | Without skill           | Notes                                                                                                                    |
| -------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| P1: SELECT \* unused columns     | 7/7 detected, 7/7 fixed | Always caught. The skill won't improve this.                                                                             |
| P2: Missing pagination           | 0/7 detected, 0/7 fixed | Never caught. The skill must deliver this.                                                                               |
| P3: High-frequency query         | 0/7 detected, 0/7 fixed | Never caught. Expected — only detectable via pg_stat_statements data.                                                    |
| P4: Application-side aggregation | 7/7 detected, 7/7 fixed | Always caught. The skill won't improve this.                                                                             |
| P5: Join duplication             | 3/7 detected, 3/7 fixed | ~50% catch rate. When missed, the agent applies P1-style column narrowing instead of fixing the structural join problem. |

Tests passed on all 7 runs. Full results in `results.csv`.

## Running an eval

```bash
setopt INTERACTIVE_COMMENTS 2>/dev/null # allow # comments when pasting into zsh

# Change this to B for the other prompt
P=A

# 0. Set up paths and pick prompt
SKILL_DIR=$(pwd)
SUFFIX=$(date +%Y%m%d)

declare -A PROMPTS
PROMPTS[A]="My Neon bill spiked to \$400 this month, most of it is data transfer. Help me figure out why."
PROMPTS[B]="Optimize the database egress in this project."
TAG=${SUFFIX}_${P}
N=2; while [ -f "$SKILL_DIR/evals/diffs/${TAG}_baseline.diff" ]; do TAG=${SUFFIX}_${P}${N}; ((N++)); done
DIFF=evals/diffs/${TAG}_baseline.diff
EVAL_DIR=/tmp/eval-${TAG}

# 1. Copy fixture to a clean workspace
rm -fR $EVAL_DIR
mkdir $EVAL_DIR
cp -r evals/fixtures/hono-drizzle-app/. $EVAL_DIR/
cd $EVAL_DIR
git init && git add . && git commit -m "baseline"

# 2. Run Claude Code
claude "${PROMPTS[$P]}"

# 3. Run integration tests
bun test

# 4. Capture the diff
git diff > $SKILL_DIR/$DIFF

# 5. Score: return to skill dir and run scoring command
cd $SKILL_DIR
claude --model claude-sonnet-4-6 "/score-eval $DIFF"
```

## Scoring

Open `eval-rubric.md` and answer each yes/no question per problem against the diff. Record one row in `results.csv`.

**Columns:**

- `date` — YYYY-MM-DD
- `skill_commit` — commit hash of the skill + fixture
- `fixture` — fixture name (e.g., `hono-drizzle-app`)
- `prompt` — which prompt was used (A, B)
- `model` — Claude model version used
- `diff_file` — filename of the saved diff in evals/diffs/ (e.g., `20260312_A_baseline.diff`)
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
