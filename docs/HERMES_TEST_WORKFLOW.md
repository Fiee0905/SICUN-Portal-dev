# Hermes Testing Team Workflow

This workflow is for the Hermes testing team.

Hermes tests only sanitized delivery drops from:

```text
https://github.com/Fiee0905/SICUN-Portal-delivery.git
```

Hermes should not read or depend on the Codex development repository.

## 1. Work Boundary

Hermes uses only the delivery repository and its `test-drop/*` branches.

Hermes should not require access to:

- Codex development workspace
- `SICUN-Portal-dev`
- `PROJECT_MEMORY.md`
- `TASKS.md`
- `AGENTS.md`
- `pm/`
- Codex internal logs or bug-fix notes

## 2. Get a Test Drop

Codex will provide:

- Delivery repository URL
- Delivery branch name

Example:

```text
Repository: https://github.com/Fiee0905/SICUN-Portal-delivery.git
Branch: test-drop/20260525-01
```

Clone and checkout the branch:

```powershell
git clone https://github.com/Fiee0905/SICUN-Portal-delivery.git SICUN-Portal_test
cd SICUN-Portal_test
git checkout test-drop/20260525-01
```

If the repository is already cloned:

```powershell
cd SICUN-Portal_test
git fetch origin
git checkout test-drop/20260525-01
git pull
```

## 3. Confirm Delivery Manifest

Before testing, open:

```text
DELIVERY_MANIFEST.md
```

Record:

- Delivery branch
- Generated time
- Source revision if present

Every bug report must mention the tested delivery branch.

## 4. Start the Project

Follow `README.md` in the delivery branch.

Typical local startup:

```powershell
docker compose up -d mysql redis
```

Backend:

```powershell
cd backend
$env:DB_PASSWORD='edu123456'
$env:PORTAL_CAS_LOGIN_URL='https://cas.qa.local/cas/login'
$env:PORTAL_LMS_LAUNCH_BASE_URL='https://lms.qa.local/course-platform'
mvn spring-boot:run
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

Default URLs:

```text
Frontend: http://localhost:5173/
Backend:  http://localhost:8080/api
```

## 5. Test Scope

Hermes should prioritize:

- Portal homepage display
- CMS/admin CRUD to public portal sync
- Authentication and permission boundaries
- Course search and course launch
- News, notices, teachers, friend links
- Theme and module visibility configuration
- no-mock/no-hardcoded scans
- Deployment configuration for intranet/domain/CAS/LMS

## 6. Bug Report Rules

Submit bugs as GitHub Issues in:

```text
SICUN-Portal-delivery
```

Use the `Hermes Bug Report` issue template.

Each issue must include:

- Delivery branch, for example `test-drop/20260525-01`
- Severity: P0/P1/P2/P3
- Area: backend/frontend/auth/cms/course/deployment/documentation
- Reproduction steps
- Actual result
- Expected result
- Evidence: logs, screenshots, API response, scan output
- Suggested fix if available

## 7. Suggestion Rules

Submit non-blocking recommendations as GitHub Issues using the `Hermes Suggestion`
template.

Suggestions should still reference the tested delivery branch.

## 8. Severity Guide

P0 blocker:

- System cannot start
- Data corruption
- Portal or admin core path unusable

P1 critical:

- Authentication bypass
- Permission bypass
- Major CMS/admin CRUD closure failure
- Public portal cannot satisfy core acceptance

P2 major:

- Deployment configuration problem
- Important feature incomplete
- Wrong external integration URL
- Missing strong regression evidence

P3 minor:

- Usability issue
- Documentation gap
- Non-blocking display defect

## 9. Retest Workflow

1. Codex publishes a new branch, for example:

   ```text
   test-drop/20260525-02
   ```

2. Hermes checks out the new branch.

3. Hermes retests the original issue.

4. Hermes comments on the issue:

   ```text
   Retested on test-drop/20260525-02.
   Result: passed / failed.
   Evidence: ...
   ```

5. Hermes closes the issue only after the fix passes.

## 10. Do Not

- Do not test from `SICUN-Portal-dev`.
- Do not rely on Codex internal files.
- Do not report bugs without a delivery branch.
- Do not modify delivery code directly unless explicitly asked.
- Do not close a bug without retest evidence.

