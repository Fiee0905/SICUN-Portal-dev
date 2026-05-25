# API Test Cases

Base URL: `http://localhost:8080/api/v1`

Use the IDs below for manual API execution, REST Assured, Postman/Newman or
HTTP-file conversion. Expected response envelope is:

```json
{
  "code": 0,
  "message": "success",
  "data": {},
  "timestamp": "2026-05-02T00:00:00Z"
}
```

## 1. Common Contract

| ID | Scenario | Method/Path | Preconditions | Expected |
| --- | --- | --- | --- | --- |
| API-COM-001 | Unknown route | `GET /not-found` | None | `404` or global error envelope; no HTML stack trace |
| API-COM-002 | Unsupported method | `PATCH /portal/home` | None | `405`, no state change |
| API-COM-003 | Invalid JSON body | `POST /admin/articles` | Admin token | `400`, validation message, no insert |
| API-COM-004 | Missing required field | `POST /admin/articles` | Admin token; empty title | `400`, field-level error |
| API-COM-005 | Invalid path id | `GET /admin/articles/0` | Admin token | `400`, validation error |
| API-COM-006 | Pagination defaults | `GET /portal/courses` | Seed courses | `200`, page starts at 1 and default size applied |
| API-COM-007 | Oversized page size | `GET /portal/courses?size=10000` | Seed courses | Capped to max size or `400` per contract |
| API-COM-008 | Trace/correlation header | Any API with `X-Request-Id` | Header supplied | Response/log preserves trace or request ID |

## 2. Authentication

| ID | Scenario | Method/Path | Input | Expected |
| --- | --- | --- | --- | --- |
| API-AUTH-001 | CAS login URL | `GET /auth/cas/login-url?redirectUri=http://localhost:5173/callback` | Valid redirect | `200`, returns CAS URL with service |
| API-AUTH-002 | CAS login URL rejects unsafe redirect | Same path | `redirectUri=https://evil.example` | `400` or configured allow-list denial |
| API-AUTH-003 | Valid CAS callback | `POST /auth/cas/callback` | Valid mock ticket/service | `200`, tokens/session and active user returned |
| API-AUTH-004 | Invalid CAS ticket | `POST /auth/cas/callback` | Unknown ticket | `401`/business error, no session |
| API-AUTH-005 | Replayed CAS ticket | `POST /auth/cas/callback` | Same ticket twice | First succeeds, second fails |
| API-AUTH-006 | Expired CAS ticket | `POST /auth/cas/callback` | Expired ticket | Fails with clear code/message |
| API-AUTH-007 | Local guest login | `POST /auth/login` | Active approved user | `200`, token/session returned |
| API-AUTH-008 | Pending user login | `POST /auth/login` | Pending guest | `403` or agreed review-required error |
| API-AUTH-009 | Disabled user login | `POST /auth/login` | Disabled user | `403`, no token |
| API-AUTH-010 | Register external user | `POST /auth/register` | Unique username/email/mobile | `200`/`201`, status `PENDING_REVIEW` |
| API-AUTH-011 | Refresh token | `POST /auth/refresh` | Valid refresh token | New access token, old access token policy honored |
| API-AUTH-012 | Logout | `POST /auth/logout` | Authenticated user | Session/cache invalidated; old token rejected |

## 3. Current User And Profile

| ID | Scenario | Method/Path | Role | Expected |
| --- | --- | --- | --- | --- |
| API-ME-001 | Anonymous current user | `GET /users/me` | Anonymous | `401` |
| API-ME-002 | Current user profile | `GET /users/me` | Any active user | User id/name/source/status/roles/permissions returned |
| API-ME-003 | Update own profile | `PUT /users/me/profile` | Active user | Editable fields updated |
| API-ME-004 | Update protected field | `PUT /users/me/profile` | Active user changes role/status | `400`/`403`, protected field unchanged |

## 4. Authorization Matrix

| ID | Scenario | Method/Path | Actor | Expected |
| --- | --- | --- | --- | --- |
| API-RBAC-001 | Anonymous reads admin users | `GET /admin/users` | Anonymous | `401` |
| API-RBAC-002 | Student reads admin users | `GET /admin/users` | Student | `403` |
| API-RBAC-003 | CMS editor creates article | `POST /admin/articles` | Editor with `cms:article:create` | Success |
| API-RBAC-004 | CMS editor publishes article | `POST /admin/articles/{id}/publish` | Editor without publish permission | `403` |
| API-RBAC-005 | Reviewer approves article | `POST /admin/articles/{id}/approve` | Reviewer | Success |
| API-RBAC-006 | Portal user triggers sync | `POST /admin/course-sync/jobs` | Portal user | `403` |
| API-RBAC-007 | Super admin assigns roles | `PUT /admin/users/{id}/roles` | Super admin | Success and audit record |
| API-RBAC-008 | Hidden UI action called directly | Any denied mutation | Non-admin | `403`, no state change |

## 5. Portal APIs

| ID | Scenario | Method/Path | Input | Expected |
| --- | --- | --- | --- | --- |
| API-PORTAL-001 | Home aggregation | `GET /portal/home` | None | Banners, quickLinks, news, notices, courses |
| API-PORTAL-002 | Category tree | `GET /portal/categories/tree` | None | Visible/enabled category tree only |
| API-PORTAL-003 | Category article list | `GET /portal/categories/news/articles?page=1&size=20` | Published articles | Published records only |
| API-PORTAL-004 | Article search | `GET /portal/articles/search?keyword=portal&page=1&size=20` | Keyword | Matching published records only |
| API-PORTAL-005 | Article detail | `GET /portal/articles/{id}` | Published article | Detail returned |
| API-PORTAL-006 | Draft article detail | `GET /portal/articles/{id}` | Draft article | `404`/`403`, no draft content |
| API-PORTAL-007 | SQL injection search | `GET /portal/articles/search?keyword=' OR 1=1 --` | None | No broad data leakage |

## 6. Course APIs

| ID | Scenario | Method/Path | Input | Expected |
| --- | --- | --- | --- | --- |
| API-COURSE-001 | Public course list | `GET /portal/courses?page=1&size=20` | None | Active courses only |
| API-COURSE-002 | Course keyword search | `GET /portal/courses?keyword=CS101` | Seed course | Matching courses |
| API-COURSE-003 | Course term filter | `GET /portal/courses?termCode=2026-SPRING` | Seed term | Term-scoped results |
| API-COURSE-004 | Course detail | `GET /portal/courses/{id}` | Active course | Detail returned |
| API-COURSE-005 | Missing course detail | `GET /portal/courses/999999` | Unknown id | `404` or business error, not success null |
| API-COURSE-006 | Hidden course detail | `GET /portal/courses/{id}` | Inactive/deleted course | Hidden from public user |
| API-COURSE-007 | Course launch anonymous | `POST /portal/courses/{id}/launch` | Anonymous | `401` |
| API-COURSE-008 | Course launch student | `POST /portal/courses/{id}/launch` | Student | Signed/expiring launch URL returned |
| API-COURSE-009 | Admin course list | `GET /admin/courses` | Admin | Paginated all permitted courses |
| API-COURSE-010 | Admin course update | `PUT /admin/courses/{id}` | Admin | Display fields updated; audit logged |

## 7. CMS Category And Article APIs

| ID | Scenario | Method/Path | Input | Expected |
| --- | --- | --- | --- | --- |
| API-CMS-CAT-001 | Category tree admin | `GET /admin/categories/tree` | Admin | Full category tree |
| API-CMS-CAT-002 | Create category | `POST /admin/categories` | Unique code/path | Created |
| API-CMS-CAT-003 | Duplicate category code/path | `POST /admin/categories` | Duplicate | `409` or validation error |
| API-CMS-CAT-004 | Disable category | `PUT /admin/categories/{id}/status` | Enabled false | Public tree excludes it |
| API-CMS-ART-001 | List articles | `GET /admin/articles?page=1&size=20` | Admin | Paginated articles |
| API-CMS-ART-002 | Create draft | `POST /admin/articles` | Valid draft | Created as `DRAFT` |
| API-CMS-ART-003 | Update article | `PUT /admin/articles/{id}` | Valid changes | Updated and version/audit preserved |
| API-CMS-ART-004 | Submit article | `POST /admin/articles/{id}/submit` | Draft | Status `PENDING_REVIEW` |
| API-CMS-ART-005 | Approve article | `POST /admin/articles/{id}/approve` | Pending review | Status `APPROVED` |
| API-CMS-ART-006 | Reject article | `POST /admin/articles/{id}/reject` | Pending review | Status `REJECTED`, reason stored |
| API-CMS-ART-007 | Publish article | `POST /admin/articles/{id}/publish` | Approved | Status `PUBLISHED`, publishedAt set |
| API-CMS-ART-008 | Offline article | `POST /admin/articles/{id}/offline` | Published | Status `OFFLINE`, removed from portal |
| API-CMS-ART-009 | Illegal transition | Publish rejected article | Rejected | `409`, state unchanged |
| API-CMS-ART-010 | Delete article | `DELETE /admin/articles/{id}` | Existing | Soft deleted, hidden everywhere |
| API-CMS-ART-011 | XSS title/content | Create/update article | `<script>` payload | Stored/rendered per sanitization contract |

## 8. User, Role And Permission APIs

| ID | Scenario | Method/Path | Input | Expected |
| --- | --- | --- | --- | --- |
| API-USER-001 | List users | `GET /admin/users?status=&source=&page=1&size=20` | Admin | Paginated users |
| API-USER-002 | User detail | `GET /admin/users/{id}` | Admin | User detail without password hash |
| API-USER-003 | Approve pending user | `PUT /admin/users/{id}/status` | Status `ACTIVE` | User can login |
| API-USER-004 | Disable user | `PUT /admin/users/{id}/status` | Status `DISABLED` | Existing sessions invalidated |
| API-USER-005 | Assign roles | `PUT /admin/users/{id}/roles` | Role IDs | Roles updated; audit logged |
| API-USER-006 | List roles | `GET /admin/roles` | Admin | Roles and permissions returned |
| API-USER-007 | Update role permissions | `PUT /admin/roles/{id}/permissions` | Permission IDs | Permission cache invalidated |

## 9. Course Sync APIs

| ID | Scenario | Method/Path | Input | Expected |
| --- | --- | --- | --- | --- |
| API-SYNC-001 | Create full sync job | `POST /admin/course-sync/jobs` | `FULL`, term | Job created with `PENDING`/`RUNNING` |
| API-SYNC-002 | Create incremental sync job | `POST /admin/course-sync/jobs` | `INCREMENTAL`, watermark | Job drains pages and stores watermark |
| API-SYNC-003 | List sync jobs | `GET /admin/course-sync/jobs?page=1&size=20` | Admin | Paginated jobs |
| API-SYNC-004 | Job detail | `GET /admin/course-sync/jobs/{id}` | Existing | Status, counts, errors, timing |
| API-SYNC-005 | Duplicate upstream IDs | Mock duplicate courses | Sync run | No duplicate local records |
| API-SYNC-006 | Partial failure | Mock invalid one record | Sync run | Success/failure/skipped counts logged |
| API-SYNC-007 | Upstream timeout | Mock timeout | Sync run | Failed/retryable job, no data corruption |
| API-SYNC-008 | Idempotent replay | Same payload twice | Sync run | Same final data, no duplicates |

## 10. Export APIs

Export endpoints are expected by QA even if implementation paths are not yet
present. Final paths may be adjusted by implementation owners.

| ID | Scenario | Method/Path | Input | Expected |
| --- | --- | --- | --- | --- |
| API-EXP-001 | Export users | `GET /admin/users/export?status=ACTIVE` | Admin | File returned; filters honored |
| API-EXP-002 | Export articles | `GET /admin/articles/export?status=PUBLISHED` | Admin | Only permitted fields/statuses |
| API-EXP-003 | Export courses | `GET /admin/courses/export?termCode=2026-SPRING` | Admin | Chinese text not garbled |
| API-EXP-004 | Export denied | Same endpoints | Student/anonymous | `401`/`403`, no file |
| API-EXP-005 | Empty export | Filter no records | Admin | Valid empty file with headers |
| API-EXP-006 | Export audit | Any export | Admin | Audit log records query/filter/count/file type |

