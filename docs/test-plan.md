# Education Portal QA Test Plan

## 1. Scope

This plan covers phase 5 QA readiness for the education portal system. It is
based on Agent 0 functional traceability, Agent 1 API/database design, and a
read-only check of the current repository.

In scope:

- Portal frontend: home aggregation, article browsing/search, course catalog,
  course detail/launch, login/register/profile entry points.
- CMS/admin frontend: dashboard, page configuration, content management,
  user management, courses, banners, notices and settings pages.
- Backend REST API: auth, portal, CMS article/category, user, course and
  integration endpoints.
- Database and integration contracts: MySQL schema/seed data, Redis
  session/cache expectations, CAS mock and course-platform mock.
- Special QA topics: authorization, audit/logging, data export, error envelope,
  idempotency and traceability.

Out of scope for phase 5:

- Fixing backend/frontend/database implementation defects.
- Production load testing beyond smoke-level non-functional acceptance.
- Real CAS/LMS certification with school-owned external systems.

## 2. Test Objectives

- Verify that the 13 tracked functions have clear acceptance criteria and
  evidence requirements.
- Verify API contracts against `/api/v1` paths, unified response envelope,
  validation behavior, permission rules and pagination.
- Verify frontend route guards, menu visibility, forms, list/detail pages and
  error states.
- Verify that database seed data supports admin/editor/guest, CMS content,
  portal configuration, courses and sync-job scenarios.
- Verify permission denial, audit logs and export behavior as dedicated
  regression areas.
- Produce a gap list that implementation agents can act on without QA writing
  outside `qa/` and this file.

## 3. Environment

| Component | Default |
| --- | --- |
| API base URL | `http://localhost:8080/api/v1` |
| Backend context path | `/api` |
| Frontend dev URL | `http://localhost:5173` |
| MySQL | `localhost:3306`, database `edu_portal`, user `edu` |
| Redis | `localhost:6379`, database `0` |
| Integration mock | `http://localhost:4010` |

Recommended startup order:

1. `docker compose up -d mysql redis`
2. Import or verify `database/schema.sql` and `database/seed.sql`
3. Start backend with `mvn spring-boot:run`
4. Start frontend with `npm run dev`
5. Start `integration/mock-server` when CAS/LMS scenarios are executed

## 4. Test Data

Required accounts:

| Persona | Purpose |
| --- | --- |
| Super admin | Full admin/CMS/user/course/sync coverage |
| CMS editor | Draft/edit/submit content coverage |
| CMS reviewer | Approve/publish/offline content coverage |
| Student or portal user | Course browse/launch and protected page coverage |
| Pending guest | Registration review and access denial coverage |
| Disabled user | Login denial coverage |

Required business data:

- At least one published article, one draft, one pending-review item, one
  rejected item and one offline item.
- At least one visible category and one hidden/disabled category.
- At least one active course, one inactive/hidden course, one course with no
  image and one course with missing teacher or mapping data.
- Course sync fixtures for success, duplicate upstream IDs, partial failure,
  timeout and replay/idempotency.
- Export fixtures with Chinese text, special characters, long fields and empty
  result sets.

## 5. Entry Criteria

- Backend and frontend can start without blocking runtime errors.
- MySQL schema and seed scripts execute successfully.
- Integration mock health check passes when integration tests are selected.
- API path convention is confirmed as `/api/v1`.
- Test credentials, roles and permissions are documented.
- Known implementation gaps are recorded before execution begins.

## 6. Exit Criteria

- All P0/P1 acceptance cases for the 13 tracked functions pass, or each failure
  has an accepted owner, severity and target date.
- API smoke, permission matrix, audit/log checks and export checks have been
  executed or explicitly blocked.
- No unauthenticated or unauthorized route can read admin/private data.
- Public portal only exposes published/enabled content and active courses.
- Final traceability table is updated with result, evidence and gap reference.

## 7. Deliverables

- `qa/checklists/functional-completeness.md`
- `qa/api/api-test-cases.md`
- `qa/checklists/permission-log-export.md`
- `qa/checklists/final-13-feature-traceability.md`
- `docs/test-plan.md`

## 8. Regression Triggers

Run targeted regression when any of these change:

- Authentication, CAS callback, token/session, logout or Redis cache behavior.
- Role, permission code, route guard or menu visibility logic.
- CMS status workflow, article/category schema or public article filtering.
- Course sync mapping, LMS client, launch URL signature or idempotency logic.
- Shared API envelope, error format, pagination or validation contract.
- Export fields, file format, masking rules or query filters.

## 9. Current Read-Only Findings

These findings are based on code inspection only and should be verified by the
implementation agents:

- Controllers are mounted under `/api/v1`, while older QA examples used mixed
  `/api`, `/courses` and `/admin/cms` paths.
- Current backend stubs return tokens but do not enforce real authentication or
  authorization on admin APIs.
- CAS callback and local login are development stubs and do not validate the
  integration mock, disabled users or replayed/expired tickets.
- CMS article workflow endpoints for submit/approve/reject/publish/offline are
  not present in the inspected controller.
- Audit log table exists, but no controller/service write path was observed.
- Export APIs were not observed; export remains a test-ready requirement rather
  than an executable path.
- Frontend admin route guard uses mock auth data; CMS routes did not show the
  same admin meta guard in the inspected router.

