---
name: score-eval
disable-model-invocation: true
---

Score the eval diff at $ARGUMENTS against the eval rubric.

1. Read the diff file at the path provided
2. Read the eval rubric at evals/eval-rubric.md
3. Read the original fixture app in evals/fixture/hono-drizzle-app/ for comparison
4. For each problem P1-P5, answer the Detected? and Fixed? questions from the rubric as yes or no
5. Get the current commit hash with `git rev-parse --short HEAD`
6. Append a row to evals/results.csv — fill in date, skill_commit, fixture, and P1-P5 scoring. Leave prompt, model, and tests_pass empty for me to complete.
