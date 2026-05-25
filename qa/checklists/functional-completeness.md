# Functional Acceptance Checklist

Status legend: `Ready` means the acceptance point is testable once the system
is running. `Blocked` means current implementation or missing data prevents
execution. `Gap` means design expects the behavior but read-only inspection did
not find an implementation path.

## F01 Portal Home Aggregation

- [ ] Home page calls `GET /api/v1/portal/home` and renders banners, quick
  links, news, notices and courses.
- [ ] Disabled banners/links and unpublished content are excluded.
- [ ] Empty sections render stable empty states without console errors.
- [ ] API response follows the shared envelope and includes no admin-only data.
- [ ] Gap: inspected backend currently returns static banners/links and empty
  news/notices rather than database-backed portal configuration/content.

## F02 Portal Category And Article Browsing

- [ ] Category tree loads through `GET /api/v1/portal/categories/tree`.
- [ ] Category article list supports page/size and only returns published,
  enabled, non-deleted content.
- [ ] Article detail returns a published article and increments or preserves
  view count per design.
- [ ] Draft, pending, rejected, offline and deleted articles are inaccessible
  from public portal APIs.
- [ ] Gap: inspected controller has category tree and article detail/search,
  but no category-specific article-list endpoint was observed.

## F03 Portal Search

- [ ] `GET /api/v1/portal/articles/search` supports keyword and pagination.
- [ ] Search escapes SQL/XSS payloads and does not broaden result scope.
- [ ] Empty results preserve search criteria and show a useful empty state.
- [ ] Chinese text and mixed punctuation search work with seed data.
- [ ] Gap: category and time filters from design require confirmation.

## F04 Course Catalog

- [ ] `GET /api/v1/portal/courses` returns active courses by default.
- [ ] Keyword, term, category/status filters work as documented.
- [ ] Pagination defaults and max page size are enforced.
- [ ] Hidden/inactive/deleted courses are not shown to normal portal users.
- [ ] Missing media uses fallback display in frontend.

## F05 Course Detail And Launch

- [ ] `GET /api/v1/portal/courses/{id}` returns course metadata, teacher,
  term, description and launch availability.
- [ ] Unknown course returns `404` or agreed business error, not success with
  null data.
- [ ] `POST /api/v1/portal/courses/{id}/launch` requires login.
- [ ] Launch URL expires, is signed or tokenized, and cannot be reused beyond
  the validity window.
- [ ] Gap: inspected launch endpoint does not enforce login and appears to
  return a direct URL fallback.

## F06 Authentication And Session

- [ ] CAS login URL includes a validated service/redirect URI.
- [ ] CAS callback validates ticket, service, expiry and replay with the mock.
- [ ] Local guest registration creates `PENDING_REVIEW` users.
- [ ] Login refuses disabled/rejected/pending users where required.
- [ ] Refresh and logout invalidate old tokens/session/cache entries.
- [ ] Gap: inspected auth controller uses development stub users/tokens.

## F07 User Profile And External Registration

- [ ] `GET /api/v1/users/me` returns current user, roles and permissions.
- [ ] `PUT /api/v1/users/me/profile` validates editable fields only.
- [ ] External user registration validates username/email/mobile uniqueness.
- [ ] Pending external users cannot access restricted resources before review.
- [ ] Gap: current inspected user controller only exposes admin user CRUD.

## F08 RBAC And Admin Access

- [ ] Anonymous admin API calls return `401`.
- [ ] Authenticated users without permission return `403`.
- [ ] Admin/editor/reviewer/student menu visibility matches backend
  permissions.
- [ ] Direct API calls are denied even when hidden UI buttons are bypassed.
- [ ] Permission code coverage includes CMS, portal config, user, role, course,
  sync and mapping actions.
- [ ] Gap: no real backend security interceptor was observed.

## F09 CMS Category Management

- [ ] Admin can list category tree and create/update/delete/enable/disable
  categories.
- [ ] Category code/path uniqueness is enforced per site.
- [ ] Deleting or disabling a category does not expose orphan public content.
- [ ] Sort order and visibility affect portal output.
- [ ] Gap: category controller exists, but full behavior must be verified
  against implementation and public filtering.

## F10 CMS Article Workflow

- [ ] Article create/edit validates title, category, content and length limits.
- [ ] Status flow supports draft, submit, approve, reject, publish, offline and
  soft delete.
- [ ] Illegal transitions return `409` or agreed business error.
- [ ] Publish/offline invalidates portal/home/article cache.
- [ ] Version/audit fields are preserved after edits.
- [ ] Gap: inspected article controller only has list/detail/create/update/delete.

## F11 Portal Operation Configuration

- [ ] Banners, quick links, notices and site configuration can be managed by
  authorized users.
- [ ] Start/end time and enabled flags control public visibility.
- [ ] Invalid URLs, missing images and duplicate sort/order edge cases are
  handled.
- [ ] Changes are reflected on home page after cache invalidation.
- [ ] Gap: portal config tables exist, but matching backend admin endpoints
  were not observed.

## F12 User/Role Administration

- [ ] Admin can list, filter and inspect users.
- [ ] Admin can approve/reject pending guests and enable/disable users.
- [ ] Admin can assign roles and maintain role permissions.
- [ ] User delete is soft delete and does not break audit/history records.
- [ ] Gap: inspected admin user controller has CRUD but no status/role-specific
  endpoints.

## F13 Course Platform Synchronization

- [ ] Authorized user can create sync jobs and inspect job list/detail.
- [ ] Full and incremental sync map stable upstream IDs without duplicates.
- [ ] Partial failure records summary counts and failed details.
- [ ] Timeout/upstream error does not corrupt existing course data.
- [ ] Re-running the same payload is idempotent.
- [ ] Gap: inspected integration endpoint writes courses directly and does not
  expose designed `/admin/course-sync/jobs` job lifecycle.

## Cross-Cutting Acceptance

- [ ] All mutating admin APIs create audit-log records with actor, action,
  target, IP/user-agent, before/after summary and timestamp.
- [ ] Logs include request path, trace/correlation ID, user ID when available,
  elapsed time and error code.
- [ ] Exported files honor filters, permissions, masking and Chinese encoding.
- [ ] Validation errors are field-specific and use the shared response shape.
- [ ] Database seed data covers every persona and status required by this file.

