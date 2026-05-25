# Final 13-Feature Traceability Acceptance Table

Result legend: `Not Run` means prepared for execution. `Blocked` means current
implementation gaps prevent full verification. This table is the phase 5 QA
handoff baseline.

| Feature | Requirement source | Primary acceptance points | API/UI evidence | Current result |
| --- | --- | --- | --- | --- |
| F01 Portal home aggregation | Agent 0 trace, Agent 1 portal API | Home renders banners, quick links, news, notices, courses; only enabled/published data exposed; empty states stable | `GET /api/v1/portal/home`, home page screenshot/log | Not Run; Gap: backend uses static banner/link data and empty news/notices |
| F02 Category/article browsing | Agent 0 trace, Agent 1 CMS/portal design | Visible category tree; category article list; article detail; public never sees draft/offline/deleted content | `GET /portal/categories/tree`, category list/detail UI | Not Run; Gap: category-specific article list endpoint not observed |
| F03 Portal search | Agent 0 trace, Agent 1 API | Keyword search returns published content only; pagination; SQL/XSS negative cases; Chinese text works | `GET /portal/articles/search` cases API-PORTAL-004/007 | Not Run; filters beyond keyword need confirmation |
| F04 Course catalog | Agent 0 trace, Agent 1 course model | Active courses by default; keyword/term/category filters; pagination; inactive hidden | `GET /portal/courses`, course list UI | Not Run |
| F05 Course detail/launch | Agent 0 trace, Agent 1 LMS launch design | Detail handles missing/hidden course; launch requires login; launch URL expires and is protected | `GET /portal/courses/{id}`, `POST /portal/courses/{id}/launch` | Not Run; Gap: launch login/signature not observed |
| F06 Authentication/session | Agent 0 trace, Agent 1 auth API | CAS URL/callback, replay/expiry/service mismatch, local login, refresh/logout, disabled user denial | `/auth/cas/*`, `/auth/login`, `/auth/refresh`, `/auth/logout` | Blocked; auth controller uses development stubs |
| F07 Profile/external registration | Agent 0 trace, Agent 1 user API | Register guest as pending; current-user endpoint returns roles/permissions; own profile edit is scoped | `/auth/register`, `/users/me`, `/users/me/profile`, profile UI | Blocked; `/users/me` endpoints not observed |
| F08 RBAC/admin access | Agent 0 trace, Agent 1 permission design | 401/403 matrix; backend enforces permissions; UI menu/route visibility matches backend | API-RBAC cases, admin/CMS route tests | Blocked; backend authz not observed; frontend uses mock auth |
| F09 CMS category management | Agent 0 trace, Agent 1 CMS API | CRUD/status/sort/visibility; code/path uniqueness; public cache/filter updates | `/admin/categories/*`, CMS pages | Not Run; implementation details require verification |
| F10 CMS article workflow | Agent 0 trace, Agent 1 workflow design | Draft-submit-approve/reject-publish-offline-delete; illegal transitions denied; version/audit/cache behavior | `/admin/articles/*`, CMS content UI | Blocked; workflow endpoints not observed |
| F11 Portal operation config | Agent 0 trace, Agent 1 portal config schema | Banners/quick links/notices/site config CRUD; enabled/time windows; home reflects changes | `/admin/banners`, `/admin/quick-links`, admin pages | Blocked; admin config APIs not observed |
| F12 User/role administration | Agent 0 trace, Agent 1 user/RBAC API | User list/detail/status review/disable; role assignment; role permission maintenance; session invalidation | `/admin/users`, `/admin/roles`, user admin UI | Blocked; status/roles endpoints not observed |
| F13 Course platform sync | Agent 0 trace, Agent 1 integration API | Full/incremental sync jobs; duplicate protection; partial failure; timeout safety; idempotency; job audit | `/admin/course-sync/jobs`, integration mock | Blocked; only direct `/integration/courses/sync` endpoint observed |

## Required Evidence Per Feature

- API request/response sample with status code and response body.
- Frontend screenshot or Playwright trace for UI-visible features.
- Database assertion for mutations, soft delete, audit log and sync/job state.
- Application log snippet with trace/request ID for errors, denied access and
  integration failures.
- Defect link or gap ID for every failed/blocked acceptance point.

## Consolidated Gap List

| Gap ID | Area | Gap | Suggested owner |
| --- | --- | --- | --- |
| GAP-001 | API contract | Older QA/examples used mixed paths; phase 5 standardizes to `/api/v1` | Backend/API owner |
| GAP-002 | Auth | CAS/local auth are development stubs; ticket validation/session invalidation not implemented | Backend auth owner |
| GAP-003 | RBAC | No backend permission enforcement observed on admin controllers | Backend security owner |
| GAP-004 | Frontend auth | Admin guard uses mock auth and CMS routes lack matching guard metadata | Frontend owner |
| GAP-005 | CMS workflow | Submit/approve/reject/publish/offline endpoints not observed | CMS backend owner |
| GAP-006 | Portal content | Category article list and DB-backed home news/notices need confirmation/implementation | Portal backend owner |
| GAP-007 | Portal config | Banner/quick link/admin config APIs not observed | Portal/CMS owner |
| GAP-008 | User roles | Status review/role assignment/role-permission endpoints not observed | User/RBAC owner |
| GAP-009 | Course launch | Launch endpoint does not appear to enforce login or signed/expiring access | Course integration owner |
| GAP-010 | Course sync | Designed job lifecycle endpoints not observed; current sync writes courses directly | Integration owner |
| GAP-011 | Audit | Audit table exists but write path not observed | Platform/backend owner |
| GAP-012 | Export | Export endpoints and masking/audit behavior not observed | Backend/API owner |
| GAP-013 | Seed/data quality | Seed SQL appears encoding-damaged in text and lacks all required status/persona fixtures | Database owner |

