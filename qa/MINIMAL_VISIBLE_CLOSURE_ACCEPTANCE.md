# Minimal Visible Closure Acceptance

Version: v0.1
Owner: QA Worker
Date: 2026-05-07
Scope: friend links, site info, course detail navigation, and launch permission smoke checks.

## 1. Acceptance Goal

This checklist verifies the smallest visible portal loop:

- Admin can manage a footer friend link and the enabled link appears on the public portal.
- Admin can save site information and the public header/footer consume the latest values.
- Course cards from homepage and course list navigate to `/courses/:id`.
- Course detail exposes a launch button whose result follows the current auth and course permission rules.

Do not treat frontend mock data as passing evidence. Final acceptance requires backend API responses and visible page behavior to match.

## 2. Environment And Accounts

Base URLs:

| Target | URL |
| --- | --- |
| Backend API | `http://localhost:8080/api/v1` |
| Frontend portal | `http://localhost:5173/` |
| Admin backend UI | `http://localhost:5173/admin` |
| Course list | `http://localhost:5173/courses` |

Seed accounts:

| Persona | Username | Password | Expected role |
| --- | --- | --- | --- |
| Admin | `admin` | `123456` | `admin` |
| Outside user | `outside001` | `123456` | `external` |
| Student | `student001` | `123456` | `internal` |
| Anonymous | none | none | no token |

## 3. Build And Smoke Commands

Backend build/test:

```powershell
cd backend
$env:JAVA_HOME='D:\JAVA\jdk-17'
$env:MAVEN_HOME='D:\Maven\apache-maven-3.9.11'
$env:Path="$env:MAVEN_HOME\bin;$env:JAVA_HOME\bin;$env:Path"
mvn test
```

Frontend build:

```powershell
cd frontend
npm run build
```

Start local services for manual acceptance:

```powershell
docker compose up -d mysql redis
cd backend
mvn spring-boot:run
cd ..\frontend
npm run dev
```

API smoke:

```powershell
curl http://localhost:8080/api/v1/portal/home
curl http://localhost:8080/api/v1/portal/site-config
curl http://localhost:8080/api/v1/portal/friend-links
curl "http://localhost:8080/api/v1/portal/courses?page=1&size=10"
```

Admin token preparation:

```powershell
$admin = Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/v1/auth/login -ContentType application/json -Body '{"username":"admin","password":"123456"}'
$adminToken = $admin.data.accessToken
```

## 4. Friend Link CRUD Acceptance

Required sample:

| Field | Value |
| --- | --- |
| title | `四川师范大学官网` |
| url | `https://www.sicnu.edu.cn` |
| sortOrder | `1` |
| enabled | `true` |
| siteCode | `main` |

### 4.1 API Steps

| Case | Steps | Expected result |
| --- | --- | --- |
| FL-001 create | `POST /api/v1/admin/friend-links` with the required sample body and admin Bearer token. | HTTP 200, response `code=0`, returned data contains id, title, url, `sortOrder=1`, `enabled=true`. |
| FL-002 admin read | `GET /api/v1/admin/friend-links?siteCode=main` with admin token. | The sample is present. Disabled links may also appear. |
| FL-003 public read | `GET /api/v1/portal/friend-links?siteCode=main`. | Only enabled links appear; sample appears before higher sort values. |
| FL-004 portal home aggregation | `GET /api/v1/portal/home`. | `data.friendLinks` or equivalent homepage friend link data contains the sample. |
| FL-005 update | `PUT /api/v1/admin/friend-links/{id}` changing description or sort order, then re-read admin and public endpoints. | Updated fields persist and public ordering follows `sortOrder ASC, id DESC`. |
| FL-006 disable | `PUT /api/v1/admin/friend-links/{id}` with `enabled=false`. | Admin read still sees it; public `/portal/friend-links` and portal footer do not show it. |
| FL-007 re-enable | `PUT /api/v1/admin/friend-links/{id}` with `enabled=true`. | Public endpoint and portal footer show it again. |
| FL-008 delete | `DELETE /api/v1/admin/friend-links/{id}` after evidence is collected. | Admin and public reads no longer show it, or it follows the documented soft-delete behavior. |

Recommended create body:

```json
{
  "siteCode": "main",
  "title": "四川师范大学官网",
  "url": "https://www.sicnu.edu.cn",
  "sortOrder": 1,
  "enabled": true,
  "description": "学校官方网站"
}
```

### 4.2 Page Steps

| Case | Steps | Expected result |
| --- | --- | --- |
| FL-UI-001 admin create | Login as `admin`, open friend link management, create the sample. | Save succeeds without console blocking error; list shows the sample. |
| FL-UI-002 footer display | Open homepage as anonymous user. | Footer friend link area shows `四川师范大学官网`. |
| FL-UI-003 external navigation | Click the sample link. | Browser navigates to `https://www.sicnu.edu.cn` or opens it in a new tab; URL is not rewritten to an internal broken route. |
| FL-UI-004 disable hide | Disable the sample in admin and refresh homepage. | The sample no longer appears in footer. |

## 5. Site Info Save And Header/Footer Sync

Site info keys under `portal_site_config`:

| Key | Expected visible area |
| --- | --- |
| `site.name` | Header brand and/or portal title |
| `site.logo` | Header logo if configured |
| `site.description` | Portal description where displayed |
| `site.copyright` | Footer copyright |
| `site.icp` | Footer ICP text |
| `site.contactPhone` | Footer/contact area |
| `site.contactEmail` | Footer/contact area |
| `site.address` | Footer/contact area |

### 5.1 API Steps

| Case | Steps | Expected result |
| --- | --- | --- |
| SITE-001 baseline | `GET /api/v1/admin/site-config?siteCode=main` and `GET /api/v1/portal/site-config?siteCode=main`. | Responses use unified envelope; public response contains the same display keys. |
| SITE-002 save name | `PUT /api/v1/admin/site-config` for `site.name` with a temporary QA value. | Admin and public reads return the new value. |
| SITE-003 save footer fields | Save `site.copyright`, `site.icp`, `site.contactPhone`, `site.contactEmail`, and `site.address`. | Values persist independently; unrelated theme/course keys are not lost. |
| SITE-004 portal aggregation | `GET /api/v1/portal/home`. | `data.siteConfig` contains the latest site info values. |
| SITE-005 restore | Restore original baseline values after page evidence is captured. | Admin/public reads match baseline or the agreed retained test data. |

### 5.2 Page Steps

| Case | Steps | Expected result |
| --- | --- | --- |
| SITE-UI-001 header sync | Save a visible `site.name`, then hard refresh homepage and `/courses`. | Header brand/title updates on both pages. |
| SITE-UI-002 footer sync | Save footer contact/copyright fields, then hard refresh homepage. | Footer shows the latest values and does not show stale mock text. |
| SITE-UI-003 persistence | Close/reopen browser tab or hard refresh again. | Header/footer still reflect backend config. |

## 6. Course Detail Navigation And Launch

### 6.1 Navigation Steps

| Case | Steps | Expected result |
| --- | --- | --- |
| COURSE-001 list card route | Open `/courses`, click a visible course card. | Route changes to `/courses/:id`; detail page renders the selected course. |
| COURSE-002 home card route | Open `/`, click a recommended/new course card. | Route changes to `/courses/:id`; no dead link or list-only behavior. |
| COURSE-003 API alignment | Compare detail page with `GET /api/v1/portal/courses/{id}`. | Title, teacher, summary/description, cover and permission-relevant fields match API data. |
| COURSE-004 unavailable course | Directly visit a non-visible/non-authorized course id. | Returns 404/403 style page or friendly no-permission state; private details are not leaked. |

### 6.2 Launch Button Steps

| Case | Persona | Steps | Expected result |
| --- | --- | --- | --- |
| LAUNCH-001 anonymous | Anonymous | Open public course detail and click launch. | User is asked to log in or API returns HTTP 401; no launch URL is exposed. |
| LAUNCH-002 outside public | `outside001` | Login, open a public course, click launch. | If course is launchable for external users, returns `launchUrl` and `expiresAt`; otherwise clear 403/business denial. |
| LAUNCH-003 outside internal/private | `outside001` | Try internal/private course detail or launch by direct URL/API. | Detail/launch is denied with 403 or not found; no LMS URL is returned. |
| LAUNCH-004 student public/internal | `student001` | Login, open public and internal course details, click launch. | Public/internal courses are accessible; launch returns URL when allowed by course mapping. |
| LAUNCH-005 student private | `student001` | Try private course detail or launch by direct URL/API. | Denied with 403 or not found; no LMS URL is returned. |
| LAUNCH-006 admin all | `admin` | Login, open public/internal/private details, click launch. | Admin can view all permission levels; launch behavior returns URL or documented business denial, not auth failure. |

Expected launch response shape when allowed:

```json
{
  "launchUrl": "https://...",
  "expiresAt": "2026-05-07T12:45:00+08:00"
}
```

## 7. Permission Matrix

| Resource/action | Anonymous | outside001 external | student001 internal | admin |
| --- | --- | --- | --- | --- |
| `GET /portal/home` | 200 | 200 | 200 | 200 |
| `GET /portal/site-config` | 200 | 200 | 200 | 200 |
| `GET /portal/friend-links` | 200 enabled only | 200 enabled only | 200 enabled only | 200 enabled only |
| `GET /portal/courses` | public only | public only | public + internal | public + internal + private |
| `GET /portal/courses/{publicId}` | 200 | 200 | 200 | 200 |
| `GET /portal/courses/{internalId}` | 403/404 | 403/404 | 200 | 200 |
| `GET /portal/courses/{privateId}` | 403/404 | 403/404 | 403/404 | 200 |
| `POST /portal/courses/{publicId}/launch` | 401 | 200 or documented business denial | 200 or documented business denial | 200 or documented business denial |
| `POST /portal/courses/{internalId}/launch` | 401/403/404 | 403/404 | 200 or documented business denial | 200 or documented business denial |
| `POST /portal/courses/{privateId}/launch` | 401/403/404 | 403/404 | 403/404 | 200 or documented business denial |
| `GET /admin/friend-links` | 401 | 403 | 403 | 200 |
| `POST/PUT/DELETE /admin/friend-links` | 401 | 403 | 403 | 200 |
| `GET /admin/site-config` | 401 | 403 | 403 | 200 |
| `PUT /admin/site-config` | 401 | 403 | 403 | 200 |

Passing rule: frontend route guards may improve UX, but backend HTTP status is the decisive permission evidence.

## 8. Evidence Requirements

Minimum evidence for pass:

| Evidence | Requirement |
| --- | --- |
| API | method/path, persona/token, request body for writes, HTTP status, response `code/message`, key `data` fields. |
| Page | route, account used, action steps, visible result, screenshot or text record. |
| Data sync | before/after reads from admin endpoint, public endpoint, and public page. |
| Cleanup | friend link deleted or restored; site info restored or explicitly retained as agreed test data. |

## 9. Go/No-Go

Go:

- Friend link CRUD works with the sample `四川师范大学官网 https://www.sicnu.edu.cn 排序1 启用`.
- Public footer reflects enabled friend links and hides disabled/deleted links.
- Site info saved from admin is visible in public header/footer after refresh.
- Homepage and course list course cards navigate to `/courses/:id`.
- Launch button follows the permission matrix for anonymous, outside, student and admin personas.
- Backend and frontend builds pass, and API smoke endpoints return expected envelopes.

No-Go:

- Admin save succeeds only in frontend state or mock fallback and is not visible through public APIs.
- Public footer/header displays stale hardcoded values after backend config changes.
- Course cards do not route to detail pages.
- Launch exposes URL to anonymous or unauthorized users.
- `outside001` or `student001` can call admin friend-link/site-config write APIs successfully.
