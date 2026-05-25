# P07/P08 Configuration Acceptance

Version: v0.1
Owner: QA Agent
Date: 2026-05-06
Scope: P07 module visibility and P08 theme switching, based on latest "待联调" state.

## 1. Current Status

| Item | Status | Acceptance focus |
| --- | --- | --- |
| P07 模块显示隐藏 | 待联调 | `portal_page_config.layoutJson.sections` can hide/show homepage modules through API persistence, and the portal renders the latest config without layout collapse. |
| P08 多主题配色 | 待联调 | `portal_site_config` theme keys can be updated and persisted, and the portal applies them to CSS variables after refresh/reload. |

Known implementation basis:

- Public homepage `GET /api/v1/portal/home` returns `siteConfig` and `pageConfig`.
- Public config endpoints exist: `GET /api/v1/portal/page-config/{pageCode}` and `GET /api/v1/portal/site-config`.
- Admin config endpoints exist: `GET/PUT /api/v1/admin/page-config/{pageCode}` and `GET/PUT /api/v1/admin/site-config`.
- Homepage currently supports module codes: `banner`, `quickLinks`, `colleges`, `courses`, `newCourses`, `teachers`, `notices`, `news`, `friendLinks`.
- Homepage hides a known module when `enabled=false` or `visible=false`; if `sections` is missing or empty, all modules are expected to display.
- Theme keys currently used by frontend: `theme.primary`, `theme.primaryDark`, `theme.dark`, mapped to CSS variables `--portal-primary`, `--portal-primary-dark`, `--portal-dark`.

## 2. Data Preparation

Start services and seed data:

```powershell
docker compose up -d mysql redis
cd backend
mvn spring-boot:run
cd ..\frontend
npm run dev
```

Base URLs:

| Target | URL |
| --- | --- |
| Backend API | `http://localhost:8080/api/v1` |
| Frontend portal | `http://localhost:5173/` |
| Admin page config | `http://localhost:5173/admin/page-config` |
| Admin settings | `http://localhost:5173/admin/settings` |

Required seed/config state:

| Data | Requirement |
| --- | --- |
| Homepage page config | `siteCode=main`, `pageCode=home`, `enabled=true`, `layoutJson.sections` contains all supported module codes. |
| Portal content | At least one visible item for banner, quick links, courses, notices and news, so hide/show is observable. |
| Theme config | `theme.primary`, `theme.primaryDark`, `theme.dark` exist in `portal_site_config` for `siteCode=main`. |
| Admin access | Current backend stubs may allow admin APIs without real auth; if auth is enabled later, prepare an account with `portal:config:read` and `portal:config:update`. |

Baseline read commands:

```powershell
curl http://localhost:8080/api/v1/portal/home
curl http://localhost:8080/api/v1/portal/page-config/home
curl http://localhost:8080/api/v1/portal/site-config
curl http://localhost:8080/api/v1/admin/page-config/home
curl http://localhost:8080/api/v1/admin/site-config
```

Before destructive config changes, capture the original `GET /admin/page-config/home` and `GET /admin/site-config` responses so they can be restored.

## 3. API Tests

### P07 Module Visibility

| Case | Steps | Expected result |
| --- | --- | --- |
| API-P07-001 read homepage config | `GET /api/v1/admin/page-config/home`; `GET /api/v1/portal/page-config/home`; `GET /api/v1/portal/home`. | All responses use unified envelope. Public and admin page config contain `layoutJson.sections`; `/portal/home.data.pageConfig` is aligned with the public page config. |
| API-P07-002 hide one module by `enabled=false` | `PUT /api/v1/admin/page-config/home?siteCode=main` with `news` set to `enabled:false`, then read public config and `/portal/home`. | Response persists `news.enabled=false`; public config and `/portal/home.data.pageConfig` both return the updated value. Other module codes remain unchanged. |
| API-P07-003 hide one module by `visible=false` | Repeat with `notices` set to `visible:false` while `enabled` is absent or true. | Config persists and frontend contract can treat `visible:false` as hidden. |
| API-P07-004 restore module | Restore `news` and `notices` to `enabled:true` or remove `visible:false`. | Public config returns restored values; homepage data remains available. |
| API-P07-005 unknown module code | Add `{ "code": "qaUnknown", "enabled": false }` to `sections`. | API should persist or reject consistently. Homepage must not fail; unknown codes must not hide known modules. Record actual behavior. |
| API-P07-006 empty/missing sections fallback | Temporarily set `layoutJson` to `{}` or `{"sections":[]}`. | Public homepage should still return 200. Frontend expected behavior is default display of all modules. |
| API-P07-007 invalid layout JSON | Send malformed `layoutJson` string if API accepts raw string bodies. | Expected to reject with validation error. If it persists malformed JSON, mark as defect because public rendering falls back silently and config quality is uncontrolled. |

Recommended P07 hide payload:

```json
{
  "pageTitle": "首页",
  "layoutJson": "{\"sections\":[{\"code\":\"banner\",\"enabled\":true},{\"code\":\"quickLinks\",\"enabled\":true},{\"code\":\"colleges\",\"enabled\":true},{\"code\":\"courses\",\"enabled\":true},{\"code\":\"newCourses\",\"enabled\":true},{\"code\":\"teachers\",\"enabled\":true},{\"code\":\"notices\",\"enabled\":true},{\"code\":\"news\",\"enabled\":false},{\"code\":\"friendLinks\",\"enabled\":true}]}",
  "seoJson": "{}",
  "enabled": true
}
```

### P08 Theme Switching

| Case | Steps | Expected result |
| --- | --- | --- |
| API-P08-001 read theme config | `GET /api/v1/admin/site-config`; `GET /api/v1/portal/site-config`; `GET /api/v1/portal/home`. | Theme keys appear in admin/public config and `/portal/home.data.siteConfig`. Values are valid CSS color strings. |
| API-P08-002 update primary color | `PUT /api/v1/admin/site-config` for `theme.primary` with a test color such as `#2563eb`; read public config. | Updated value persists and is visible from public endpoint and `/portal/home`. |
| API-P08-003 update paired colors | Update `theme.primaryDark` and `theme.dark` to compatible values. | All three values persist independently; no unrelated site config is lost. |
| API-P08-004 restore seed theme | Restore `theme.primary=#b91c1c`, `theme.primaryDark=#991b1b`, and seed `theme.dark` value. | Public config matches original theme values. |
| API-P08-005 invalid color value | Try `configValue:"not-a-color"` for `theme.primary`. | Preferred result: reject with validation error. If accepted, mark as defect/risk because frontend will apply an invalid CSS variable. |
| API-P08-006 missing theme key fallback | Temporarily remove or blank a non-critical test key only if environment allows cleanup. | Frontend should keep default CSS variables and page should not break. Do not delete production seed keys in shared environment. |

Recommended P08 update payload:

```json
{
  "siteCode": "main",
  "configKey": "theme.primary",
  "configValue": "#2563eb",
  "valueType": "STRING",
  "description": "QA theme primary color"
}
```

## 4. Page Tests

### P07 Portal Rendering

| Case | Steps | Expected result |
| --- | --- | --- |
| UI-P07-001 baseline all modules | Open `http://localhost:5173/` after baseline config. | Visible modules include banner, quick links, colleges, recommended courses, new courses, teachers, notices, news and friend links where data exists. No console blocking error. |
| UI-P07-002 hide news | Apply API-P07-002 and hard refresh homepage. | News section is not rendered; surrounding sections move up naturally; no blank reserved band or broken anchor. |
| UI-P07-003 restore news | Restore config and hard refresh homepage. | News section returns with expected data. |
| UI-P07-004 hide banner | Set `banner.enabled=false` and refresh. | Hero carousel is absent; the next enabled section becomes the first visible content without visual collapse. |
| UI-P07-005 no sections fallback | Apply empty `sections` test config and refresh. | Homepage displays all known modules by default. |
| UI-P07-006 mock fallback guard | Stop backend or force API failure only in local test. | If frontend mock fallback displays modules, mark evidence as mock-only and not valid for final P07 acceptance. |

### P08 Theme Rendering

| Case | Steps | Expected result |
| --- | --- | --- |
| UI-P08-001 baseline CSS variables | Open homepage, inspect `document.documentElement` computed styles. | `--portal-primary`, `--portal-primary-dark`, `--portal-dark` match public site config. |
| UI-P08-002 switch primary color | Apply API-P08-002, hard refresh homepage. | Buttons, accent headings and portal theme surfaces using CSS variables reflect new color. |
| UI-P08-003 persistence after reload | Close/reopen tab or hard refresh. | Theme remains from backend config, not only in memory. |
| UI-P08-004 cross-page spot check | Visit `/courses`, `/login`, `/admin/settings` after theme update. | Public layout and key controls remain readable; no obvious contrast or broken style regression. Admin page may not be fully theme-driven, but must not visually break. |
| UI-P08-005 invalid color resilience | If invalid color was accepted by API, refresh homepage. | Page must not crash. Record whether browser ignores invalid CSS value or visual styling degrades. |

Browser evidence to collect:

```javascript
getComputedStyle(document.documentElement).getPropertyValue('--portal-primary')
getComputedStyle(document.documentElement).getPropertyValue('--portal-primary-dark')
getComputedStyle(document.documentElement).getPropertyValue('--portal-dark')
```

## 5. Acceptance Steps

1. Start backend and frontend with seeded database.
2. Capture baseline responses for `/portal/home`, `/portal/page-config/home`, `/portal/site-config`, `/admin/page-config/home`, and `/admin/site-config`.
3. Execute P07 API cases for hide, restore, unknown module and fallback behavior.
4. Execute P07 UI cases on homepage, using hard refresh after each config update.
5. Execute P08 API cases for theme read, update, restore and invalid value behavior.
6. Execute P08 UI cases on homepage and spot-check course/admin pages.
7. Restore original page config and theme config.
8. Record result as:
   - `通过`: API persistence, public config propagation and page rendering all pass.
   - `有条件通过`: Core behavior works, but admin UI save or validation is missing and documented.
   - `不通过`: Config does not persist, public portal does not consume it, or page breaks.
   - `阻塞`: Required environment, seed data, admin permission or write API is unavailable.

Minimum evidence:

| Evidence | Requirement |
| --- | --- |
| API logs | Method/path, request body, HTTP status, response `code`, key `data` fields and traceId if present. |
| Screenshots/text notes | Homepage before hide, after hide, after restore; homepage before theme switch and after theme switch. |
| Browser checks | CSS variable values before and after P08 update. |
| Cleanup proof | Restored config responses match baseline or documented accepted test state. |

## 6. Blocking Items And Risks

| ID | Type | Blocking/risk item | Impact | Owner suggestion |
| --- | --- | --- | --- | --- |
| CFG-B01 | 风险 | Admin page config UI now has a save entry for homepage module switches, but it still needs live backend/database verification. | P07 can move forward through UI + API + portal rendering once hide/restore is executed in a seeded environment. | Frontend Agent / QA Agent |
| CFG-B02 | 风险 | Admin settings/theme UI now has a save entry for theme keys, but persistence and reload behavior still need live verification. | P08 can move forward through UI + API + portal rendering once theme switch/restore is executed in a seeded environment. | Frontend Agent / QA Agent |
| CFG-B03 | 风险 | Admin config APIs currently rely on development auth behavior; real permission enforcement is not confirmed. | Final acceptance must retest with authenticated admin and unauthorized user denial. | Backend Agent |
| CFG-B04 | 风险 | Invalid `layoutJson` and invalid CSS color validation is not clearly documented. | Bad CMS data may silently break or degrade portal display. | Backend Agent |
| CFG-B05 | 风险 | `/portal/home` does not currently aggregate `newCourses`, `teachers`, `colleges`, or `friendLinks`; frontend may use mock fallback for those modules. | P07 hide/show can still test visibility, but P13 data authenticity remains limited. | Backend Agent / Frontend Agent |
| CFG-B06 | 风险 | Theme scope is limited to CSS variables consumed by existing styles; admin pages may not be fully theme-aware. | P08 should be scoped to portal theme until product confirms admin theme requirements. | PM Agent |

## 7. Go/No-Go Criteria

P07 can move from `待联调` to `待验收` when:

- `PUT /admin/page-config/home` persists `layoutJson.sections` changes.
- `/portal/home.data.pageConfig` returns the same active config.
- Homepage hides and restores at least `banner`, `news`, `notices`, and `courses` without layout collapse.
- Baseline config can be restored after testing.

P08 can move from `待联调` to `待验收` when:

- `PUT /admin/site-config` persists all three theme keys.
- `/portal/home.data.siteConfig` returns updated theme values.
- Homepage CSS variables update after reload and remain after another reload.
- Invalid theme values are either rejected or documented as a known defect with agreed handling.
