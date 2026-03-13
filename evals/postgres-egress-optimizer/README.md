# Evals runbook

How to run and score evaluations for the postgres-egress-optimizer skill.

## Skill versions

Skill versions live in `skill-versions/` as numbered files: `SKILL-v001.md`, `SKILL-v002.md`, etc. Each eval run uses a specific version and records it in `results.csv`.

Workflow:

1. Copy the current version or create a new one in `skill-versions/`
2. Run evals against it
3. Record results with the version number
4. Iterate — create a new version for each change
5. When a version consistently beats baseline, promote it:

```bash
# From the repo root:
cp evals/postgres-egress-optimizer/skill-versions/SKILL-vXXX.md skills/postgres-egress-optimizer/SKILL.md
```

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

# Variables
P=A                # A or B
RUN_TYPE=skill     # "baseline" or "skill"
SKILL_VERSION=002  # version number from skill-versions/

# 0. Set up paths and pick prompt (run from evals/postgres-egress-optimizer/)
EVALS_DIR=$(pwd)
SUFFIX=$(date +%Y%m%d)

declare -A PROMPTS
PROMPTS[A]="My Neon bill spiked to \$400 this month, most of it is data transfer. Help me figure out why."
PROMPTS[B]="Optimize the database egress in this project."
TYPE=$( [ "$RUN_TYPE" = "baseline" ] && echo "baseline" || echo "v${SKILL_VERSION}" )
EVAL_DIR=/tmp/eval-${SUFFIX}_${P}_${TYPE}_$$

# 1. Copy fixture to a clean workspace
rm -fR $EVAL_DIR
mkdir $EVAL_DIR
cp -r fixtures/hono-drizzle-app/. $EVAL_DIR/
cd $EVAL_DIR


# 2a. Copy skill into the workspace (skip for baseline)
if [ "$RUN_TYPE" = "skill" ]; then
  mkdir -p .claude/skills/postgres-egress-optimizer
  cp $EVALS_DIR/skill-versions/SKILL-v${SKILL_VERSION}.md .claude/skills/postgres-egress-optimizer/SKILL.md
fi

# 2b commit to git so we can get a diff later
git init && git add . && git commit -m "baseline"

# 2c. Run Claude Code
claude "${PROMPTS[$P]}"
# Verify Claude Code outputs "Skill(postgres-egress-optimizer) — Successfully loaded skill"
# at the start of the run. If it doesn't, the skill didn't trigger and the run
# is effectively a baseline. Note this in the results.csv notes column.
# To force the skill, use: claude "/postgres-egress-optimizer ${PROMPTS[$P]}"

# 3. Run integration tests
bun test

# 4. Capture the diff (counter assigned here to avoid collisions with parallel runs)
NEXT=$(printf "%02d" $(( $(ls $EVALS_DIR/diffs/*.diff 2>/dev/null | wc -l) + 1 )))
DIFF=diffs/${NEXT}_${SUFFIX}_${P}_${TYPE}.diff
git diff > $EVALS_DIR/$DIFF

# 5. Score: return to evals dir and run scoring command
cd $EVALS_DIR
claude --model claude-sonnet-4-6 "/score-eval $DIFF"
```

## Scoring

Open `eval-rubric.md` and answer each yes/no question per problem against the diff. Record one row in `results.csv`.

**Columns:**

- `date` — YYYY-MM-DD
- `fixture` — fixture name (e.g., `hono-drizzle-app`)
- `prompt` — which prompt was used (A, B)
- `model` — Claude model version used
- `skill_version` — version from `skill-versions/` (e.g., `v001`); empty for baseline runs
- `diff_file` — filename of the saved diff in diffs/ (e.g., `01_20260311_A_baseline.diff`)
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
