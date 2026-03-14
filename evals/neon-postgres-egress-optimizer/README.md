# Evals runbook

How to run and score evaluations for the neon-postgres-egress-optimizer skill.

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
cp evals/neon-postgres-egress-optimizer/skill-versions/SKILL-vXXX.md skills/neon-postgres-egress-optimizer/SKILL.md
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

## Results summary

| Problem                          | Baseline (7 runs) | v001 (4 runs) | v002 (4 runs) |
| -------------------------------- | ----------------- | ------------- | ------------- |
| P1: SELECT \* unused columns     | 100%              | 100%          | 100%          |
| P2: Missing pagination           | 0%                | 25%           | 100%          |
| P3: High-frequency query         | 0%                | 0%            | 0%            |
| P4: Application-side aggregation | 100%              | 100%          | 100%          |
| P5: Join duplication             | 43%               | 100%          | 100%          |

P3 is expected to miss — it requires pg_stat_statements data which prompts A and B don't provide. All runs pass tests. Full data in `results.csv`.

## Running an eval

```bash
./eval-run.ts --prompt A --skill 003    # skill run with v003
./eval-run.ts --prompt B                # baseline run (no --skill)
```

The script handles the full lifecycle:

1. Copies the fixture to a temp workspace (`/tmp/eval-...`)
2. Installs the skill version (if `--skill` provided)
3. Initializes git and launches Claude Code interactively
4. After Claude Code exits, pauses for confirmation
5. Runs `bun test` (with retry on failure)
6. Captures the diff to `diffs/` (race-safe for parallel runs)
7. Launches Claude Code to score against `eval-rubric.md`

Verify Claude Code outputs "Skill(neon-postgres-egress-optimizer) — Successfully loaded skill" at the start of the run. If it doesn't, the skill didn't trigger and the run is effectively a baseline. Note this in the `results.csv` notes column.

To force the skill, abort and re-run with: `claude "/neon-postgres-egress-optimizer <prompt>"`

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
