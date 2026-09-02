---
description: Cross-check docs/roadmap.md phase status against actual git history and E2E tests, report drift
---

Check whether `docs/roadmap.md` §4 "Current Status" still matches reality:

1. Run `git log --oneline -30` and `git branch -a` in the atlase repo.
2. List `e2e/tests/*.spec.ts` and skim what journeys they cover.
3. Read `docs/roadmap.md` §4 phase status table.
4. For each phase, decide: matches commits/tests (✅), partially built but table says done or not-started (🟡 drift), or genuinely not started (⬜).
5. Report only the phases where the table is wrong — don't restate what's already correct.
6. If asked to fix it, edit `docs/roadmap.md` §4 directly with the corrected table; don't touch anything else in the file.

Do not run `pnpm build` or `pnpm test` unless explicitly asked — this command is a docs/git cross-check, not a test run.
