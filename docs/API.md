# API Documentation

This project uses `docs/api-spec.md` as the canonical detailed API contract.

Root `AGENTS.md` requires new interfaces to be synchronized to `docs/API.md`.
To avoid split-brain documentation, this file is the stable entry point and
links to the maintained detailed spec:

- Detailed API spec: `docs/api-spec.md`
- Base URL: `http://localhost:8080/api/v1`
- Frontend default API base: `/api/v1`

When adding or changing an API, update `docs/api-spec.md` first and keep this
entry point aligned if base paths, conventions, or documentation ownership
change.

## Latest Additions

- Auth tokens are development Bearer tokens issued by `POST /auth/login`.
  `POST /auth/cas/callback` now fails closed with HTTP 401 until a real CAS
  ticket validation integration is configured; invalid tickets must not issue
  `accessToken` or `refreshToken`. `GET /users/me` and `PUT /users/me/profile`
  require `Authorization: Bearer <token>`.
- `GET /auth/cas/login-url` uses `portal.integrations.cas.login-url` /
  `PORTAL_CAS_LOGIN_URL`; missing CAS login configuration returns a clear
  configuration error instead of a localhost fallback.
- `POST /portal/courses/{id}/launch` uses a course's saved `launchUrl` first.
  When that field is blank, fallback launch URLs require
  `portal.integrations.lms.launch-base-url` /
  `PORTAL_LMS_LAUNCH_BASE_URL`; missing LMS configuration returns a clear
  configuration error.
- User `role` values are `admin`, `internal`, and `external`. `/admin/**`
  endpoints require `role=admin`.
- Course `permission` values are `public`, `internal`, and `private`.
  Anonymous/external users see `public`; internal users see `public` and
  `internal`; admins see all three.
- `GET /portal/search-keywords`: returns preset course search keywords from
  `portal_site_config` key `course.search.keywords`.
- `GET /portal/page-config/home`: homepage `layoutJson.sections` controls module
  visibility for banner, quick links, colleges, courses, new courses, teachers,
  notices, news, and friend links.
- `GET /portal/site-config`: theme keys `theme.primary`, `theme.primaryDark`,
  and `theme.dark` drive frontend CSS variables.
- `GET /portal/friend-links`: returns enabled footer friend links sorted by
  `sortOrder`; `GET/POST/PUT/DELETE /admin/friend-links` manages the same data
  and requires `role=admin`.
- Site config keys now include `site.description`, `site.copyright`, `site.icp`,
  `site.contactPhone`, `site.contactEmail`, and `site.address` for portal
  header/footer display.
- Admin CRUD closure:
  `GET/POST/GET {id}/PUT/DELETE /admin/courses`,
  `GET/POST/PUT/DELETE /admin/banners`,
  `GET/POST/GET {id}/PUT/DELETE /admin/articles` plus
  `/publish` and `/offline`, and
  `GET/POST/GET {id}/PUT/DELETE /admin/users` plus `/status` all require
  `role=admin`.
- Article create/update accepts either `categoryId` or `categoryCode`; notices
  use `categoryCode=notice`. Public homepage notices and
  `/portal/categories/notice/articles` only return `PUBLISHED` content.
- Banner `position` is normalized by backend admin APIs: blank or `home` maps
  to `HOME_TOP`. Public `GET /portal/home` returns `banners` from enabled,
  in-date `HOME_TOP` rows only.
- `GET/POST/PUT/DELETE /admin/teachers` manages homepage faculty profiles;
  `GET /portal/teachers` and `GET /portal/home` return enabled teachers sorted
  by `sortOrder`.
- Homepage `newCourses` is returned by `GET /portal/home` from real active
  course rows, sorted by newest `createdAt`/`id` first and limited to 4 visible
  courses for the current visitor.
- `GET/POST/PUT/DELETE /admin/colleges` manages homepage/filter college
  options in `portal_college`; incoming create `id` is ignored, blank
  `siteCode` defaults to `main`, blank `sortOrder` defaults to `0`, and blank
  `enabled` defaults to `true`.
- `GET /portal/home` now also returns `colleges` from enabled `portal_college`
  rows with active visible course counts, plus `externalLinks` from enabled
  `portal_quick_link` rows with `linkType=EXTERNAL`.
- `GET /portal/colleges`, `GET /portal/course-categories`,
  `GET /portal/course-levels`, and `GET /portal/external-links` provide
  DB-backed option data for replacing frontend mock filters.
- Course `featured` is supported by admin create/update/list query, public
  course query filtering, and homepage `courses`: `GET /portal/home` requests
  `featured=true`, `status=ACTIVE`, and the current visitor's visible
  `permission` values for the featured course module.
- `GET /admin/dashboard` returns DB-backed `stats`, `activities`,
  `courseSamples`, and `chartSeries`; counts and recent entries are generated
  from current database rows rather than fixed sample data.
- News management uses the existing article APIs with `categoryCode=news`;
  published news appears in `GET /portal/home.news` and
  `GET /portal/categories/news/articles`.
- `POST /admin/uploads/images`: uploads an image with multipart field `file`
  and optional `folder=banners`; returns `{ "url": "/api/uploads/banners/{date}/{file}" }`.
  Use the returned URL as banner `imageUrl`. Files are served back through
  `/api/uploads/**`.
- Public portal display fields are aligned for CMS/admin CRUD closure:
  homepage `banners` expose `id`, `title`, `imageUrl`, `linkUrl`, `position`,
  `sortOrder`, `enabled`, `startAt`, and `endAt`; homepage/course list items
  expose course catalog fields such as `id`, `externalCourseId`, `courseName`,
  `courseCode`, `teacherName`, `department`, `category`, `credit`, `coverUrl`,
  `launchUrl`, `status`, `permission`, `featured`, and `description`;
  homepage notices, news, and category article lists expose `id`,
  `categoryCode`, `categoryName`, `title`, `slug`, `summary`, `coverUrl`,
  `author`, `sourceName`, `tags`, `featured`, `pinned`, `status`,
  `publishedAt`, and `viewCount`.
