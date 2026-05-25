# Codex Development Team Workflow

This workflow is for the Codex development team working in:

- Local workspace: `D:\work2.0\SICUN-Portal`
- Development repository: `https://github.com/Fiee0905/SICUN-Portal-dev.git`
- Delivery repository: `https://github.com/Fiee0905/SICUN-Portal-delivery.git`

## 1. Work Boundary

Codex owns the development workspace and development repository.

Codex may read and maintain internal project files such as:

- `PROJECT_MEMORY.md`
- `TASKS.md`
- `AGENTS.md`
- `pm/`
- `bug-report-*`
- development logs and internal analysis files

These files must not be included in Hermes test drops.

## 2. Daily Development Loop

1. Pull latest development code:

   ```powershell
   git pull origin main
   ```

2. Read project context before work:

   ```text
   PROJECT_MEMORY.md
   TASKS.md
   AGENTS.md
   ```

3. Implement fixes or features in `SICUN-Portal`.

4. Run required verification:

   ```powershell
   cd backend
   mvn test
   ```

   ```powershell
   cd frontend
   npm run build
   ```

5. Update internal records when needed:

   - Important conclusions: `PROJECT_MEMORY.md`
   - Task status: `TASKS.md`
   - API changes: `docs/API.md` and `docs/api-spec.md`

6. Commit and push to the development repository:

   ```powershell
   git add -A
   git commit -m "Describe the change"
   git push origin main
   ```

## 3. Create a Hermes Test Drop

When a version is ready for Hermes testing, generate a sanitized test drop:

```powershell
D:\work2.0\SICUN-Portal\scripts\export-test-drop.ps1 -Zip
```

This regenerates a temporary sanitized drop:

```text
D:\work2.0\.tmp\SICUN-Portal_test
D:\work2.0\.tmp\SICUN-Portal_handoff\releases\test-drop-*.zip
```

The test drop includes runtime and test-facing project files only.

The test drop excludes Codex internal files according to `.handoffignore`.

## 4. Publish to GitHub Delivery Repository

Publish the sanitized drop to a new delivery branch:

```powershell
D:\work2.0\SICUN-Portal\scripts\publish-delivery-repo.ps1 `
  -DeliveryRepoUrl https://github.com/Fiee0905/SICUN-Portal-delivery.git `
  -Branch test-drop/YYYYMMDD-NN `
  -CommitMessage "Publish Hermes test drop YYYYMMDD-NN"
```

Example:

```powershell
D:\work2.0\SICUN-Portal\scripts\publish-delivery-repo.ps1 `
  -DeliveryRepoUrl https://github.com/Fiee0905/SICUN-Portal-delivery.git `
  -Branch test-drop/20260525-01 `
  -CommitMessage "Publish Hermes test drop 20260525-01"
```

## 5. Notify Hermes

Send Hermes:

- Delivery repository URL
- Delivery branch name
- Main verification focus
- Known risks or exclusions

Example:

```text
Repository: https://github.com/Fiee0905/SICUN-Portal-delivery.git
Branch: test-drop/20260525-01
Please test auth regression, CMS CRUD sync, portal display, and no-hardcoded scan.
Please submit bugs through GitHub Issues in the delivery repository.
```

Hermes-facing workflow notes should be placed in the delivery repository or
Issue templates. The Codex development repository should only keep the Codex
team workflow.

## 6. Handle Hermes Feedback

Hermes submits bugs and suggestions as Issues in `SICUN-Portal-delivery`.

Codex should:

1. Read the issue.
2. Confirm the referenced `test-drop/*` branch.
3. Reproduce locally in `SICUN-Portal`.
4. Add the issue summary to `TASKS.md` and important conclusions to `PROJECT_MEMORY.md`.
5. Fix in the development workspace.
6. Verify locally.
7. Push to `SICUN-Portal-dev`.
8. Publish the next delivery branch.
9. Comment on the Hermes issue with the fixed delivery branch.

## 7. Naming Rules

Delivery branches:

```text
test-drop/YYYYMMDD-NN
```

Examples:

```text
test-drop/20260525-01
test-drop/20260525-02
test-drop/20260526-01
```

Commit messages:

```text
Publish Hermes test drop YYYYMMDD-NN
```

## 8. Do Not

- Do not give Hermes access to `SICUN-Portal-dev`.
- Do not push internal files into `SICUN-Portal-delivery`.
- Do not overwrite old `test-drop/*` branches.
- Do not accept bug reports that do not identify the tested delivery branch.
- Do not treat frontend route guards as proof of backend permission security.
- Do not keep long-lived local `SICUN-Portal_test` or `SICUN-Portal_handoff`
  folders; they are temporary export artifacts and can be regenerated.
