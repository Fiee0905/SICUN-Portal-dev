# 教育门户系统 RESTful API 规范

## 1. 通用约定

基础路径：

```text
/api/v1
```

请求头：

| Header | 必填 | 说明 |
| --- | --- | --- |
| `Authorization: Bearer <token>` | 部分接口 | 登录态访问令牌 |
| `Content-Type: application/json` | 写接口 | JSON 请求体 |
| `X-Request-Id` | 否 | 客户端请求追踪 ID |

统一响应：

```json
{
  "code": "0",
  "message": "OK",
  "data": {},
  "traceId": "202604301230000001"
}
```

分页响应：

```json
{
  "code": "0",
  "message": "OK",
  "data": {
    "records": [],
    "page": 1,
    "size": 20,
    "total": 0
  },
  "traceId": "202604301230000001"
}
```

常用错误码：

| code | HTTP | 说明 |
| --- | --- | --- |
| `0` | 200 | 成功 |
| `AUTH_REQUIRED` | 401 | 未登录或 token 失效 |
| `FORBIDDEN` | 403 | 无权限 |
| `VALIDATION_FAILED` | 400 | 参数校验失败 |
| `RESOURCE_NOT_FOUND` | 404 | 资源不存在 |
| `CONFLICT` | 409 | 状态冲突或唯一约束冲突 |
| `EXTERNAL_SERVICE_ERROR` | 502 | CAS 或课程平台异常 |
| `INTERNAL_ERROR` | 500 | 系统异常 |

## 2. 认证与用户接口

### 2.1 CAS 登录

```http
GET /api/v1/auth/cas/login-url?redirectUri=https://portal.example.edu/callback
```

返回 CAS 登录地址。后端从 `portal.integrations.cas.login-url` 或环境变量
`PORTAL_CAS_LOGIN_URL` 读取 CAS 登录入口；未配置时返回 HTTP 500 和
`CAS login URL is not configured`，不得回退到 `localhost:7001`。

```http
POST /api/v1/auth/cas/callback
```

请求体：

```json
{
  "ticket": "ST-xxx",
  "service": "https://portal.example.edu/callback"
}
```

当前后端在未接入真实 CAS ticket validation 前采用 fail-closed 策略：
无效、空、过期、重复或 service mismatch ticket 不得签发 token。未配置
真实 CAS 校验时，`POST /api/v1/auth/cas/callback` 返回 HTTP 401 和
`CAS ticket validation is not configured`；响应体不得包含 `accessToken`
或 `refreshToken`。后续接入真实 CAS 时，必须服务端校验 ticket 与 service
绑定关系，并仅为通过校验的本地活动用户签发 token。

响应：

```json
{
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token",
  "expiresIn": 7200,
  "user": {
    "id": 10001,
    "username": "zhangsan",
    "displayName": "张三",
    "userType": "STAFF",
    "source": "CAS"
  }
}
```

### 2.2 校外用户注册与登录

```http
POST /api/v1/auth/register
```

请求体：

```json
{
  "username": "guest001",
  "password": "StrongPassword123",
  "displayName": "校外访客",
  "email": "guest@example.com",
  "mobile": "13800000000",
  "organization": "合作单位"
}
```

说明：注册成功后用户状态为 `PENDING_REVIEW`，审核通过后可访问受限资源。

```http
POST /api/v1/auth/login
```

请求体：

```json
{
  "username": "guest001",
  "password": "StrongPassword123"
}
```

### 2.3 Token 与当前用户

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `POST` | `/auth/refresh` | 使用 refresh token 换取新 access token |
| `POST` | `/auth/logout` | 注销当前会话 |
| `GET` | `/users/me` | 获取当前用户资料、角色和权限 |
| `PUT` | `/users/me/profile` | 更新当前用户可编辑资料 |

## 3. 门户前台接口

### 3.1 首页聚合

```http
GET /api/v1/portal/home
```

响应数据包含：

- `banners`：轮播图。
- `quickLinks`：快捷入口。
- `news`：新闻列表。
- `notices`：公告列表。
- `topics`：专题内容。
- `courses`：推荐课程。

### 3.2 栏目与内容

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/portal/categories/tree` | 获取门户可见栏目树 |
| `GET` | `/portal/categories/{code}/articles?page=1&size=20` | 获取栏目文章列表 |
| `GET` | `/portal/articles/{id}` | 获取已发布文章详情 |
| `GET` | `/portal/articles/search?keyword=&categoryCode=&page=1&size=20` | 搜索已发布内容 |

文章摘要字段：

```json
{
  "id": 20001,
  "categoryCode": "news",
  "title": "学校新闻标题",
  "summary": "摘要",
  "coverUrl": "/assets/news.png",
  "publishedAt": "2026-04-30T10:00:00+08:00",
  "viewCount": 128
}
```

### 3.3 课程前台

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/portal/courses?page=1&size=20&termCode=2026-SPRING&keyword=` | 查询课程目录 |
| `GET` | `/portal/courses/{id}` | 获取课程详情 |
| `POST` | `/portal/courses/{id}/launch` | 生成课程平台跳转链接，需登录 |

课程跳转响应：

```json
{
  "launchUrl": "https://lms.example.edu/course/CS101?token=xxx",
  "expiresAt": "2026-04-30T12:45:00+08:00"
}
```

课程跳转 URL 规则：

- 如果课程已维护 `launchUrl`，后端直接返回该地址。
- 如果 `launchUrl` 为空，后端使用 `portal.integrations.lms.launch-base-url`
  或环境变量 `PORTAL_LMS_LAUNCH_BASE_URL` 生成 fallback。
- 如果缺少 LMS fallback 配置，返回 HTTP 500 和
  `LMS launch base URL is not configured`，不得生成 localhost fallback。

## 4. CMS 后台接口

后台接口均需登录，并根据权限码控制访问。

### 4.1 栏目管理

| 方法 | 路径 | 权限 | 说明 |
| --- | --- | --- | --- |
| `GET` | `/admin/categories/tree` | `cms:category:read` | 查询栏目树 |
| `POST` | `/admin/categories` | `cms:category:create` | 新建栏目 |
| `PUT` | `/admin/categories/{id}` | `cms:category:update` | 更新栏目 |
| `DELETE` | `/admin/categories/{id}` | `cms:category:delete` | 软删除栏目 |
| `PUT` | `/admin/categories/{id}/status` | `cms:category:update` | 启用或停用栏目 |

栏目请求体：

```json
{
  "parentId": 0,
  "code": "news",
  "name": "新闻动态",
  "path": "/news",
  "sortOrder": 10,
  "visible": true
}
```

### 4.2 文章管理

| 方法 | 路径 | 权限 | 说明 |
| --- | --- | --- | --- |
| `GET` | `/admin/articles?page=1&size=20&status=&categoryId=&categoryCode=notice` | `cms:article:read` | 查询文章，公告使用 `categoryCode=notice` |
| `POST` | `/admin/articles` | `cms:article:create` | 创建草稿 |
| `GET` | `/admin/articles/{id}` | `cms:article:read` | 获取文章详情 |
| `PUT` | `/admin/articles/{id}` | `cms:article:update` | 更新文章 |
| `POST` | `/admin/articles/{id}/submit` | `cms:article:submit` | 提交审核 |
| `POST` | `/admin/articles/{id}/approve` | `cms:article:approve` | 审核通过 |
| `POST` | `/admin/articles/{id}/reject` | `cms:article:approve` | 审核驳回 |
| `POST` | `/admin/articles/{id}/publish` | `cms:article:publish` | 发布 |
| `POST` | `/admin/articles/{id}/offline` | `cms:article:publish` | 下线 |
| `DELETE` | `/admin/articles/{id}` | `cms:article:delete` | 软删除 |

文章创建/更新请求体支持 `categoryId` 或 `categoryCode` 二选一定位栏目；通知公告栏目固定使用 `categoryCode=notice`。示例：

```json
{
  "categoryCode": "notice",
  "title": "教学安排通知",
  "slug": "teaching-arrangement-notice",
  "summary": "教学安排通知摘要",
  "content": "<p>通知正文</p>",
  "status": "DRAFT",
  "pinned": true
}
```

发布闭环说明：`POST /admin/articles/{id}/publish` 可将 `DRAFT`、`PENDING_REVIEW`、`REJECTED`、`APPROVED`、`OFFLINE` 状态发布为 `PUBLISHED` 并写入 `publishedAt`；`POST /admin/articles/{id}/offline` 将 `PUBLISHED` 下线为 `OFFLINE` 并写入 `offlineAt`。前台 `GET /portal/home.notices` 与 `GET /portal/categories/notice/articles` 只返回 `PUBLISHED` 公告。

文章状态：

| 状态 | 说明 |
| --- | --- |
| `DRAFT` | 草稿 |
| `PENDING_REVIEW` | 待审核 |
| `REJECTED` | 已驳回 |
| `APPROVED` | 审核通过待发布 |
| `PUBLISHED` | 已发布 |
| `OFFLINE` | 已下线 |

### 4.3 媒体与运营配置

| 方法 | 路径 | 权限 | 说明 |
| --- | --- | --- | --- |
| `POST` | `/admin/media` | `cms:media:create` | 上传或登记媒体资源 |
| `GET` | `/admin/media?page=1&size=20&type=` | `cms:media:read` | 查询媒体资源 |
| `DELETE` | `/admin/media/{id}` | `cms:media:delete` | 删除媒体资源 |
| `GET` | `/admin/banners` | `portal:config:read` | 查询轮播图 |
| `POST` | `/admin/banners` | `portal:config:update` | 新增轮播图 |
| `PUT` | `/admin/banners/{id}` | `portal:config:update` | 更新轮播图 |
| `DELETE` | `/admin/banners/{id}` | `portal:config:update` | 删除轮播图 |
| `GET` | `/admin/quick-links` | `portal:config:read` | 查询快捷入口 |
| `POST` | `/admin/quick-links` | `portal:config:update` | 新增快捷入口 |

## 5. 用户与权限后台接口

| 方法 | 路径 | 权限 | 说明 |
| --- | --- | --- | --- |
| `GET` | `/admin/users?page=1&size=20&status=&source=` | `sys:user:read` | 查询用户 |
| `POST` | `/admin/users` | `sys:user:create` | 创建用户 |
| `GET` | `/admin/users/{id}` | `sys:user:read` | 查询用户详情 |
| `PUT` | `/admin/users/{id}` | `sys:user:update` | 更新用户资料、角色和状态 |
| `DELETE` | `/admin/users/{id}` | `sys:user:delete` | 软删除用户 |
| `PUT` | `/admin/users/{id}/status` | `sys:user:update` | 启用、停用、审核通过或驳回 |
| `PUT` | `/admin/users/{id}/roles` | `sys:user:role` | 设置用户角色 |
| `GET` | `/admin/roles` | `sys:role:read` | 查询角色 |
| `POST` | `/admin/roles` | `sys:role:create` | 创建角色 |
| `PUT` | `/admin/roles/{id}/permissions` | `sys:role:permission` | 设置角色权限 |

用户状态：

| 状态 | 说明 |
| --- | --- |
| `ACTIVE` | 正常 |
| `PENDING_REVIEW` | 待审核 |
| `REJECTED` | 审核拒绝 |
| `DISABLED` | 停用 |

## 6. 课程平台对接后台接口

| 方法 | 路径 | 权限 | 说明 |
| --- | --- | --- | --- |
| `GET` | `/admin/courses?page=1&size=20&termCode=&status=&featured=` | `course:read` | 查询课程，支持精选课程筛选 |
| `POST` | `/admin/courses` | `course:create` | 创建本地课程 |
| `GET` | `/admin/courses/{id}` | `course:read` | 查询课程详情 |
| `PUT` | `/admin/courses/{id}` | `course:update` | 本地维护课程展示字段 |
| `DELETE` | `/admin/courses/{id}` | `course:delete` | 软删除课程，前台课程列表和详情不再展示 |
| `POST` | `/admin/course-sync/jobs` | `course:sync` | 手动创建同步任务 |
| `GET` | `/admin/course-sync/jobs?page=1&size=20` | `course:sync:read` | 查询同步任务 |
| `GET` | `/admin/course-sync/jobs/{id}` | `course:sync:read` | 查询同步任务详情 |
| `POST` | `/admin/course-users/mappings` | `course:mapping:update` | 维护用户课程平台映射 |

同步任务请求体：

```json
{
  "syncType": "COURSE_CATALOG",
  "mode": "INCREMENTAL",
  "termCode": "2026-SPRING"
}
```

同步类型：

- `COURSE_CATALOG`：课程目录同步。
- `USER_MAPPING`：用户映射同步。
- `FULL`：课程与用户映射全量同步。

## 7. 接口版本与兼容策略

- 新增字段必须向后兼容，客户端应忽略未知字段。
- 删除或重命名字段需进入 `/api/v2`，不得破坏 `/api/v1`。
- 管理端写接口使用幂等语义时应支持业务唯一键，例如栏目 `code`、学期 `termCode`。
- 所有时间字段使用 ISO 8601，默认时区 `Asia/Shanghai`。

## Backend phase 3 implementation notes

Base path is `/api/v1`: `server.servlet.context-path=/api`, controllers use `/v1`.

Implemented public portal endpoints:

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/portal/home` | DB-backed banners, quick links, colleges, site config, home page config, published news/notices/topics, featured courses, new courses, teachers, and friend/external links. |
| GET | `/portal/categories/tree` | Visible and enabled CMS category tree. |
| GET | `/portal/categories/{code}/articles` | Published articles by category code. |
| GET | `/portal/articles/search` | Published article search. |
| GET | `/portal/articles/{id}` | Published article detail, increments `viewCount`. |
| GET | `/portal/courses` | Active course list with paging, keyword, category, status, and `termCode` filters. |
| GET | `/portal/courses/{id}` | Active course detail. |
| POST | `/portal/courses/{id}/launch` | Launch URL with 15-minute expiry. |
| GET | `/portal/site-config` | Typed site config map. |
| GET | `/portal/friend-links` | Enabled footer friend links sorted by `sortOrder`. |
| GET | `/portal/colleges` | Enabled `portal_college` rows for the requested site, enriched with active visible course counts by matching `course_catalog.department`. |
| GET | `/portal/course-categories` | Distinct active visible course `category` values for frontend filters. |
| GET | `/portal/course-levels` | Backend-supported level options; currently distinct active visible course `category` values because there is no independent level field. |
| GET | `/portal/external-links` | Enabled `portal_quick_link` rows with `linkType=EXTERNAL`, sorted by `sortOrder ASC, id DESC`. |
| GET | `/portal/search-keywords` | Preset course search keywords from `portal_site_config.course.search.keywords`. |
| GET | `/portal/page-config/{pageCode}` | Enabled page config. |

Implemented admin/content endpoints:

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/admin/articles/{id}/submit` | `DRAFT/REJECTED/OFFLINE -> PENDING_REVIEW`. |
| POST | `/admin/articles/{id}/approve` | `PENDING_REVIEW -> APPROVED`. |
| POST | `/admin/articles/{id}/reject` | `PENDING_REVIEW -> REJECTED`. |
| POST | `/admin/articles/{id}/publish` | `DRAFT/PENDING_REVIEW/REJECTED/APPROVED/OFFLINE -> PUBLISHED`, sets `publishedAt`. |
| POST | `/admin/articles/{id}/offline` | `PUBLISHED -> OFFLINE`, sets `offlineAt`. |
| GET/POST/PUT/DELETE | `/admin/banners` | Banner CRUD. |
| GET/POST/GET {id}/PUT/DELETE | `/admin/courses` | Course CRUD; logical delete removes the course from public portal queries. |
| GET/POST/GET {id}/PUT/DELETE and PUT status | `/admin/users` | User CRUD and status updates. |
| GET/POST/PUT/DELETE | `/admin/quick-links` | Quick link CRUD. |
| GET/POST/PUT/DELETE | `/admin/colleges` | College option CRUD backed by `portal_college`. |
| GET/POST/PUT/DELETE | `/admin/friend-links` | Footer friend link CRUD. |
| GET/PUT | `/admin/site-config` | Site config read/upsert. |
| GET/PUT | `/admin/page-config/{pageCode}` | Page config read/upsert. |
| GET | `/admin/dashboard` | DB-backed admin dashboard aggregation: `stats`, `activities`, `courseSamples`, `chartSeries`. |
| GET | `/admin/logs` | Audit log query by action, target type, actor, and created time range. |
| GET | `/admin/logs/export` | CSV export for audit logs. |

Implemented user endpoints:

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/users/me` | Requires Bearer token, resolves the current `sys_user`, and returns role/permission codes. |
| PUT | `/users/me/profile` | Updates editable profile fields: displayName, email, mobile, organization. |

### Admin dashboard

`GET /api/v1/admin/dashboard` requires `role=admin` through the admin
interceptor.

Response `data`:

```json
{
  "stats": [
    { "label": "课程总数", "value": "128", "trend": "+4.2%", "tone": "blue" }
  ],
  "activities": [
    { "title": "课程更新：课程名称", "time": "09:30:00", "type": "课程", "occurredAt": "2026-05-08T09:30:00" }
  ],
  "courseSamples": [
    { "id": 1, "code": "CS101", "name": "课程名称", "department": "学院", "teacher": "教师", "credit": 3.0, "status": "ACTIVE", "category": "分类", "permission": "public", "featured": true }
  ],
  "chartSeries": [
    { "label": "05-08", "date": "2026-05-08", "courses": 2, "articles": 3, "users": 1 }
  ]
}
```

All values are generated from database counts, audit logs, recent courses,
recent articles, and recent users. The endpoint does not return fixed business
sample rows.

Database additions:

| Table | Notes |
| --- | --- |
| `portal_page_config` | Page title, layout JSON, SEO JSON, enabled flag keyed by `site_code + page_code`. |
| `portal_site_config.course.search.keywords` | Comma or newline separated preset course search keywords for the portal course center. |
| `portal_site_config.theme.primary` | CSS color applied to `--portal-primary` on the frontend. |
| `portal_site_config.theme.primaryDark` | CSS color applied to `--portal-primary-dark` on the frontend. |
| `portal_site_config.theme.dark` | CSS color applied to `--portal-dark` on the frontend. |
| `portal_college` | College option dictionary managed by admins and exposed publicly through `/portal/colleges` and `/portal/home.colleges`. |
| `portal_friend_link` | Footer friend links managed by admins and exposed publicly through `/portal/friend-links` and `/portal/home.friendLinks`. |
| `cms_audit_log` | Existing table now used by article mutation audit records and log query/export endpoints. |

### Friend Links

`GET /portal/friend-links?siteCode=main`

Returns only enabled friend links, sorted by `sortOrder ASC, id DESC`.

Response `data` item:

```json
{
  "id": 1,
  "siteCode": "main",
  "title": "四川师范大学官网",
  "url": "https://www.sicnu.edu.cn",
  "logoUrl": null,
  "description": "学校官方网站",
  "sortOrder": 1,
  "enabled": true
}
```

Admin endpoints require `role=admin`:

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/admin/friend-links?siteCode=main` | Returns all friend links, including disabled links. |
| POST | `/admin/friend-links` | Creates a friend link. |
| PUT | `/admin/friend-links/{id}` | Updates a friend link. |
| DELETE | `/admin/friend-links/{id}` | Deletes a friend link. |

Request body:

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

### Site Info Keys

The portal header/footer consumes these public `GET /portal/site-config` keys:

| Key | Type | Purpose |
| --- | --- | --- |
| `site.name` | `STRING` | Portal display name. |
| `site.logo` | `STRING` | Logo URL. |
| `site.description` | `STRING` | Portal description. |
| `site.copyright` | `STRING` | Footer copyright text. |
| `site.icp` | `STRING` | ICP record text. |
| `site.contactPhone` | `STRING` | Contact phone. |
| `site.contactEmail` | `STRING` | Contact email. |
| `site.address` | `STRING` | Contact address. |

Portal page config layout contract:

```json
{
  "sections": [
    { "code": "banner", "enabled": true },
    { "code": "quickLinks", "enabled": true },
    { "code": "colleges", "enabled": true },
    { "code": "courses", "enabled": true },
    { "code": "newCourses", "enabled": true },
    { "code": "teachers", "enabled": true },
    { "code": "notices", "enabled": true },
    { "code": "news", "enabled": true },
    { "code": "friendLinks", "enabled": true }
  ]
}
```

The portal homepage hides any known section whose `enabled` or `visible` value is `false`.

## Backend phase 4 CMS/portal config save contract

The following contract is the current backend-supported closed loop for CMS-driven
portal theme colors and homepage module switches. Base path remains `/api/v1`.

### Admin site config

`GET /admin/site-config?siteCode=main`

Returns a typed key/value map from `portal_site_config`. Values with
`valueType=NUMBER` are returned as numbers when parseable; values with
`valueType=BOOLEAN` are returned as booleans; other values are returned as
strings.

Example response `data`:

```json
{
  "course.search.keywords": "Python,人工智能,教育技术",
  "site.name": "四川师范大学课程教学门户",
  "theme.dark": "#111827",
  "theme.primary": "#b91c1c",
  "theme.primaryDark": "#991b1b"
}
```

`PUT /admin/site-config`

Upserts one site config item by `siteCode + configKey`. If `siteCode` is blank or
omitted, backend defaults it to `main`.

Request body for theme color editing:

```json
{
  "siteCode": "main",
  "configKey": "theme.primary",
  "configValue": "#b91c1c",
  "valueType": "STRING",
  "description": "Portal primary theme color"
}
```

Required frontend theme keys:

| Key | Type | Purpose |
| --- | --- | --- |
| `theme.primary` | `STRING` | Frontend CSS variable `--portal-primary`. |
| `theme.primaryDark` | `STRING` | Frontend CSS variable `--portal-primary-dark`. |
| `theme.dark` | `STRING` | Frontend CSS variable `--portal-dark`. |

### Admin page config

`GET /admin/page-config/{pageCode}?siteCode=main`

Returns the saved page config for editing, including disabled page configs. This
differs from public `GET /portal/page-config/{pageCode}`, which only returns
enabled page configs.

`PUT /admin/page-config/{pageCode}?siteCode=main`

Upserts one page config by `siteCode + pageCode`. Path `pageCode` and query
`siteCode` are authoritative; backend overwrites conflicting values in the body.
If `siteCode` is blank or omitted, backend defaults it to `main`.

Request body for homepage module switches:

```json
{
  "pageTitle": "门户首页",
  "layoutJson": "{\"sections\":[{\"code\":\"banner\",\"enabled\":true},{\"code\":\"quickLinks\",\"enabled\":true},{\"code\":\"colleges\",\"enabled\":true},{\"code\":\"courses\",\"enabled\":true},{\"code\":\"newCourses\",\"enabled\":true},{\"code\":\"teachers\",\"enabled\":true},{\"code\":\"notices\",\"enabled\":true},{\"code\":\"news\",\"enabled\":true},{\"code\":\"friendLinks\",\"enabled\":true}]}",
  "seoJson": "{\"title\":\"四川师范大学课程教学门户\"}",
  "enabled": true
}
```

Supported homepage section codes:

| Code | Switch fields | Portal behavior |
| --- | --- | --- |
| `banner` | `enabled` or `visible` | `false` hides banner. |
| `quickLinks` | `enabled` or `visible` | `false` hides quick links. |
| `colleges` | `enabled` or `visible` | `false` hides college module. |
| `courses` | `enabled` or `visible` | `false` hides recommended courses. |
| `newCourses` | `enabled` or `visible` | `false` hides new courses. |
| `teachers` | `enabled` or `visible` | `false` hides teacher module. |
| `notices` | `enabled` or `visible` | `false` hides notices. |
| `news` | `enabled` or `visible` | `false` hides news. |
| `friendLinks` | `enabled` or `visible` | `false` hides friend links. |

`layoutJson` is persisted as the raw JSON string mapped to MySQL JSON column.
Public portal consumers should tolerate unknown section codes and unknown fields.

## Backend auth and course permission contract

Current backend auth scope is a local minimum closed loop, not production SSO:

- `POST /api/v1/auth/login` validates `sys_user.username` and `sys_user.password_hash`.
- Password hashes currently support `{noop}<plain>` and `{sha256}<hex>`.
- Successful login returns development Bearer tokens in the form `dev.<base64>`.
- `POST /api/v1/auth/cas/callback` fails closed until real CAS ticket
  validation is configured; invalid tickets return HTTP 401 and do not issue
  tokens.
- `GET /api/v1/users/me` and `PUT /api/v1/users/me/profile` require
  `Authorization: Bearer <token>` and resolve the current user from the token.
- `/api/v1/admin/**` endpoints require a valid token with `user.role = admin`;
  missing token returns HTTP 401, non-admin token returns HTTP 403.

User `role` values:

| role | Meaning | Backend behavior |
| --- | --- | --- |
| `admin` | Administrator | Can access `/admin/**` and all course permission levels. |
| `internal` | School/internal user | Can access public and internal courses. |
| `external` | Outside registered user | Can access public courses only. |

Seed accounts:

| Username | Password | role | Notes |
| --- | --- | --- | --- |
| `admin` | `123456` | `admin` | Admin backend smoke account. |
| `student001` | `123456` | `internal` | Internal student smoke account. |
| `teacher001` | `123456` | `internal` | Internal teacher smoke account; not used as a CAS callback fallback. |
| `outside001` | `123456` | `external` | Outside user smoke account. |

Course `permission` values:

| permission | Visible to |
| --- | --- |
| `public` | Anonymous users, external users, internal users, admins |
| `internal` | Internal users and admins |
| `private` | Admins only |

`GET /api/v1/portal/courses`, `GET /api/v1/portal/courses/{id}`, and
`POST /api/v1/portal/courses/{id}/launch` apply this permission matrix based
on the optional Bearer token. Admin course create/update normalizes
`permission`; unsupported values return HTTP 400.

Course launch URL rules:

- If `course_catalog.launch_url` has text, `POST /portal/courses/{id}/launch`
  returns that saved URL.
- If `launch_url` is blank, backend builds a fallback from
  `portal.integrations.lms.launch-base-url` or `PORTAL_LMS_LAUNCH_BASE_URL`.
- If the fallback base URL is missing, backend returns HTTP 500 with
  `LMS launch base URL is not configured`; it must not generate a localhost
  fallback URL.

## CMS admin to public portal data chain contract

This section is the current acceptance contract for admin CRUD data becoming
visible through public portal APIs.

### Homepage banners

Admin APIs:

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/admin/banners?position=home` | `home` is normalized to `HOME_TOP` before filtering. |
| `POST` | `/admin/banners` | Blank `position` or legacy `home` is stored as `HOME_TOP`. |
| `PUT` | `/admin/banners/{id}` | Blank `position` or legacy `home` is stored as `HOME_TOP`. |
| `DELETE` | `/admin/banners/{id}` | Deleted rows no longer appear publicly. |
| `POST` | `/admin/uploads/images` | Multipart image upload. Field `file` is required; optional `folder` defaults to `banners`. Returns `data.url`. |

Public API:

- `GET /portal/home` returns `data.banners` from real `portal_banner` rows only.
- `GET /portal/home` returns `data.colleges` from enabled `portal_college` rows
  for `siteCode=main`. Each item has `id`, `siteCode`, `name`, `code`,
  `description`, `sortOrder`, `enabled`, and `count`; `count` is the number of
  active visible courses whose `department` matches the college name.
- `GET /portal/home` returns `data.externalLinks` from enabled quick links with
  `linkType=EXTERNAL`.
- Public banner rows must satisfy `enabled=true`, `position=HOME_TOP`,
  `startAt is null or startAt <= now`, and `endAt is null or endAt >= now`.
- Display fields: `id`, `title`, `imageUrl`, `linkUrl`, `position`,
  `sortOrder`, `enabled`, `startAt`, `endAt`, `createdAt`, `updatedAt`.
- Uploaded banner images are served by `GET /api/uploads/**`; the returned
  upload URL should be saved as `imageUrl`.

### Courses

Admin APIs:

| Method | Path | Notes |
| --- | --- | --- |
| `GET/POST/GET {id}/PUT/DELETE` | `/admin/courses` | Admin course CRUD. |

Public APIs:

- `GET /portal/home` returns `data.courses` with `featured=true`,
  `status=ACTIVE`, and the current visitor's visible `permission` values. This
  is the homepage featured-course module.
- `GET /portal/home` returns `data.newCourses` from active visible course rows,
  sorted by newest `createdAt` then newest `id`, limited to 4.
- `GET /portal/courses` returns active visible course rows with paging and
  keyword/category/term/department/college/featured filters.
- `GET /portal/course-categories` returns distinct `category` values from
  active course rows visible to the current visitor.
- `GET /portal/course-levels` currently returns the same DB-backed distinct
  `category` values because `course_catalog` has no independent level/type
  column. If a future level field is added, this endpoint should switch to that
  field without changing its array response shape.
- A course created through `POST /admin/courses` with `status=ACTIVE` and
  `permission=public` is visible to anonymous users in both public APIs.
- Display fields: `id`, `externalCourseId`, `termId`, `courseCode`,
  `courseName`, `teacherName`, `department`, `category`, `credit`, `coverUrl`,
  `launchUrl`, `status`, `permission`, `featured`, `description`, `lastSyncedAt`,
  `createdAt`, `updatedAt`.

### Colleges

Admin APIs:

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/admin/colleges?siteCode=main` | Returns all college options for the site, including disabled rows. |
| `POST` | `/admin/colleges` | Creates a college option; incoming `id` is ignored. Blank `siteCode` defaults to `main`, blank `sortOrder` defaults to `0`, and blank `enabled` defaults to `true`. |
| `PUT` | `/admin/colleges/{id}` | Updates a college option using the same normalization rules. |
| `DELETE` | `/admin/colleges/{id}` | Deleted colleges no longer appear in public option lists or homepage `colleges`. |

Public APIs:

- `GET /portal/colleges?siteCode=main` returns enabled `portal_college` rows,
  sorted by `sortOrder ASC, id DESC`.
- `GET /portal/home` includes the same `colleges` payload.
- Public response fields: `id`, `siteCode`, `name`, `code`, `description`,
  `sortOrder`, `enabled`, and `count`.
- College `count` is derived from active course rows visible to the current
  visitor and matching `course_catalog.department = portal_college.name`.

### Teachers

Admin APIs:

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/admin/teachers?siteCode=main` | Admin teacher list. |
| `POST` | `/admin/teachers` | Creates a homepage teacher profile; incoming `id` is ignored. |
| `PUT` | `/admin/teachers/{id}` | Updates a teacher profile. |
| `DELETE` | `/admin/teachers/{id}` | Deleted teachers no longer appear publicly. |

Public APIs:

- `GET /portal/teachers` returns enabled teachers for `siteCode=main` by default.
- `GET /portal/home` returns `data.teachers` from enabled `portal_teacher` rows.
- Public teacher rows are sorted by `sortOrder` ascending and `id` descending.
- Display fields: `id`, `siteCode`, `name`, `title`, `college`, `achievement`,
  `research`, `courseCount`, `avatarUrl`, `sortOrder`, `enabled`, `createdAt`,
  `updatedAt`.

### Portal option data

These public endpoints are DB-backed replacements for frontend mock option
lists. They are anonymous-readable and apply the same course visibility matrix
as `GET /portal/courses` when course data is involved.

| Method | Path | Response data |
| --- | --- | --- |
| `GET` | `/portal/colleges` | `[{ "id": 1, "siteCode": "main", "name": "College name", "code": "COL", "description": "...", "sortOrder": 10, "enabled": true, "count": 12 }]`; names come from enabled `portal_college` rows and `count` comes from visible active courses in the matching department. |
| `GET` | `/portal/course-categories` | `["Category A", "Category B"]` from distinct active visible `course_catalog.category` values. |
| `GET` | `/portal/course-levels` | `["Category A", "Category B"]`; this is the backend-supported level enum while no independent level column exists. |
| `GET` | `/portal/external-links` | Enabled `portal_quick_link` rows where `linkType=EXTERNAL`. |

`GET /portal/home` includes the same `colleges` and `externalLinks` payloads.

### Notices and news

Admin APIs:

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/admin/articles?categoryCode=notice` | Admin notice list. |
| `GET` | `/admin/articles?categoryCode=news` | Admin news list. |
| `POST` | `/admin/articles` | Accepts `categoryCode=notice` or `categoryCode=news`; slug may be omitted. |
| `PUT` | `/admin/articles/{id}` | Accepts `categoryId` or `categoryCode`. |
| `POST` | `/admin/articles/{id}/publish` | Publishes `DRAFT/PENDING_REVIEW/REJECTED/APPROVED/OFFLINE` as `PUBLISHED`. |
| `POST` | `/admin/articles/{id}/offline` | Offline content is hidden from public APIs. |
| `DELETE` | `/admin/articles/{id}` | Deleted content is hidden from public APIs. |

Public APIs:

- `GET /portal/home` returns `data.notices` from `PUBLISHED`
  `categoryCode=notice` rows and `data.news` from `PUBLISHED`
  `categoryCode=news` rows.
- `GET /portal/categories/notice/articles` returns only `PUBLISHED` notices.
- `GET /portal/categories/news/articles` returns only `PUBLISHED` news.
- Display fields: `id`, `categoryId`, `categoryCode`, `categoryName`, `title`,
  `slug`, `summary`, `content`, `coverUrl`, `author`, `sourceName`, `tags`,
  `featured`, `pinned`, `allowComment`, `status`, `publishedAt`, `offlineAt`,
  `viewCount`, `createdAt`, `updatedAt`.
