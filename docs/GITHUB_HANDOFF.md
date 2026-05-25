# GitHub Handoff Workflow

## Goal

Codex develops in `SICUN-Portal`. Hermes tests only sanitized delivery drops.
The two teams should not read each other's internal working folders.

Detailed role-specific workflows:

- Codex development workflow: `docs/CODEX_DEV_WORKFLOW.md`
- Hermes testing workflow: `docs/HERMES_TEST_WORKFLOW.md`

## Recommended Repository Layout

- `SICUN-Portal-dev`: private Codex development repository.
- `SICUN-Portal-delivery`: private Hermes delivery repository.

Do not give Hermes read access to the development repository if it contains
Codex internal files such as `PROJECT_MEMORY.md`, `TASKS.md`, `AGENTS.md`,
`pm/`, local logs, or bug-report work folders.

## Delivery Steps

1. Codex finishes a fix in `SICUN-Portal`.
2. Export a sanitized test drop:

   ```powershell
   D:\work2.0\SICUN-Portal\scripts\export-test-drop.ps1 -Zip
   ```

   The default export location is temporary:

   ```text
   D:\work2.0\.tmp\SICUN-Portal_test
   D:\work2.0\.tmp\SICUN-Portal_handoff\releases
   ```

3. Publish the drop to the Hermes delivery repository:

   ```powershell
   D:\work2.0\SICUN-Portal\scripts\publish-delivery-repo.ps1 `
     -DeliveryRepoUrl https://github.com/<owner>/SICUN-Portal-delivery.git
   ```

4. Hermes tests the generated branch, for example:

   ```text
   test-drop/20260525-153000
   ```

5. Hermes returns bug reports through GitHub Issues in the delivery repository,
   or uploads a report bundle to a neutral handoff folder.

6. Codex fixes bugs in the dev workspace and publishes the next test drop.

## What Goes Into Test Drops

Included:

- `backend/`
- `frontend/`
- `database/`
- `docs/`
- `integration/`
- `qa/`
- `scripts/`
- `README.md`
- `docker-compose.yml`

Excluded by `.handoffignore`:

- `.git/`
- dependency/build output folders such as `node_modules/`, `target/`, `dist/`
- local logs
- Codex internal coordination files
- PM/Figma/internal bug-report folders
- local environment files

## Why Two Repositories

GitHub read access is normally repository-wide. If Hermes can read one shared
repository, they can usually read all branches in that repository. A separate
delivery repository gives a clean permission boundary.
