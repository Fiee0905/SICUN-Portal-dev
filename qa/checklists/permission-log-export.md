# Permission, Logging And Export Checklist

## 1. Permission Matrix

| Area | Anonymous | Portal user | CMS editor | CMS reviewer | Super admin |
| --- | --- | --- | --- | --- | --- |
| Portal home/articles/categories | Read public only | Read public only | Read public only | Read public only | Read public only |
| Course list/detail | Read active only | Read active only | Read active only | Read active only | Read/admin per permission |
| Course launch | `401` | Allowed if mapped/enrolled per design | Allowed if permitted | Allowed if permitted | Allowed |
| CMS article create/edit | `401` | `403` | Allowed | Read/review only | Allowed |
| CMS approve/publish/offline | `401` | `403` | `403` unless granted | Allowed | Allowed |
| Category/config mutation | `401` | `403` | Scoped by permission | `403` unless granted | Allowed |
| User/role management | `401` | `403` | `403` | `403` | Allowed |
| Course sync | `401` | `403` | `403` unless granted | Read only if granted | Allowed |
| Export | `401` | `403` | Scoped export only if granted | Scoped export only if granted | Allowed |

Acceptance points:

- Backend denial is authoritative; frontend hiding is not enough.
- Admin and CMS routes must not render sensitive data before permission checks
  finish.
- Permission cache changes take effect after role updates, logout/login, or the
  documented cache invalidation trigger.
- Denied mutations leave database state unchanged and still emit security logs.

## 2. Audit Log Checks

Expected audit record fields:

- `actor_user_id`
- `action`
- `target_type`
- `target_id`
- `ip_address`
- `user_agent`
- `before_json`
- `after_json`
- `created_at`

Required audited actions:

| ID | Action | Expected target |
| --- | --- | --- |
| LOG-AUD-001 | Create/update/delete category | `CMS_CATEGORY` |
| LOG-AUD-002 | Create/update/submit/approve/reject/publish/offline/delete article | `CMS_ARTICLE` |
| LOG-AUD-003 | Create/update/delete media | `CMS_MEDIA_ASSET` |
| LOG-AUD-004 | Create/update/delete banner or quick link | `PORTAL_CONFIG` |
| LOG-AUD-005 | Approve/reject/disable user | `SYS_USER` |
| LOG-AUD-006 | Assign user roles | `SYS_USER_ROLE` |
| LOG-AUD-007 | Update role permissions | `SYS_ROLE_PERMISSION` |
| LOG-AUD-008 | Create course sync job | `COURSE_SYNC_JOB` |
| LOG-AUD-009 | Export users/articles/courses | `EXPORT_JOB` or agreed target |

Audit acceptance:

- Audit write succeeds in the same transaction for business mutations where
  required, or uses an explicitly documented reliable async strategy.
- Failed validation should not create business mutation audit records.
- Permission-denied attempts should appear in security/application logs even if
  not stored in `cms_audit_log`.
- Before/after summaries must avoid leaking passwords, tokens and secret keys.

## 3. Runtime Log Checks

For each API smoke scenario, capture at least one log sample and verify:

- Request path and HTTP method are present.
- User ID or anonymous marker is present after authentication is resolved.
- Trace/correlation ID is present and matches response/header when supported.
- Error code/category distinguishes auth, validation, business, integration and
  unexpected system errors.
- CAS and course-platform integration failures include upstream trace/error
  summary without logging full credentials or tokens.
- Slow sync and export operations include duration and record counts.

## 4. Export Checks

Expected export behavior:

- Export honors exactly the same filters and permission scope as list APIs.
- Export denies anonymous and unauthorized users.
- Export includes stable headers and UTF-8/Excel-compatible Chinese text.
- Export masks sensitive fields such as password hash, tokens, mobile/email if
  masking is required by policy.
- Export supports empty results and large results without timeout or memory
  failure at the agreed limit.
- Export response sets file name, content type and cache policy.
- Export action is audited with actor, filter summary, result count and format.

Suggested export scenarios:

| ID | Dataset | Filters | Expected |
| --- | --- | --- | --- |
| EXP-USR-001 | Users | `status=ACTIVE` | Active users only; no password hash |
| EXP-USR-002 | Users | `source=CAS` | CAS users only |
| EXP-ART-001 | Articles | `status=PUBLISHED` | Published articles only |
| EXP-ART-002 | Articles | `categoryId`, keyword | Same count as list API for same filters |
| EXP-CRS-001 | Courses | `termCode=2026-SPRING` | Course rows with external ID and term |
| EXP-CRS-002 | Sync jobs | failed jobs | Error summaries truncated safely |

## 5. Read-Only Implementation Gaps

- No backend security interceptor or annotation-based permission enforcement was
  observed in the inspected controllers.
- `cms_audit_log` exists in schema, but no service/controller write path was
  observed.
- Export endpoints were not observed in the inspected backend controllers.
- Frontend `/admin` routes use mock auth; `/cms` routes did not show the same
  route meta guard in the inspected router.

