# Backend Baseline

更新日期：2026-05-06

## BE01 范围

本文件记录后端当前基线：技术栈、源码结构、启动/测试命令、数据模型、现有接口或控制器，以及对 CMS、课程检索、认证闭环的差距判断。

本次只梳理现状并新增本文件，未修改 `PROJECT_MEMORY.md`、`TASKS.md`、接口文档或其他 Agent 文件。

## 技术栈

- Java 17。
- Spring Boot 3.2.5。
- Spring Web：REST API。
- Spring Validation：请求参数校验。
- MyBatis-Plus 3.5.6：实体、Mapper、分页、逻辑删除。
- MySQL 8.x：业务数据持久化。
- Redis 7.x：已配置连接与序列化 Bean，当前未看到登录会话或业务缓存落地使用。
- Lombok：实体、服务、控制器样板代码简化。
- Maven：构建与测试。

## 运行配置

- 服务端口：`8080`。
- Servlet context path：`/api`。
- Controller 版本前缀：`/v1`。
- 实际 API 基础路径：`http://localhost:8080/api/v1`。
- MySQL 默认连接：`jdbc:mysql://localhost:3306/edu_portal`，用户名 `edu`，密码 `edu123456`。
- Redis 默认连接：`localhost:6379`，database `0`。

## 源码结构

```text
backend/
  pom.xml
  src/main/resources/application.yml
  src/main/java/com/edu/portal/
    EducationPortalApplication.java
    common/        统一响应、基础实体、异常处理、分页查询
    config/        MyBatis-Plus、MetaObjectHandler、Redis 配置
    auth/          CAS/本地登录/注册开发接口
    user/          用户实体、DTO、Mapper、Service、后台用户与当前用户接口
    cms/           栏目、文章实体、DTO、Mapper、Service、后台 CMS 接口
    portal/        门户首页聚合、前台查询、轮播、快捷入口、站点/页面配置
    course/        课程实体、DTO、Mapper、Service、后台课程接口
    integration/   课程同步开发接口
    audit/         审计日志实体、Mapper、Service、查询和 CSV 导出接口
database/
  schema.sql
  seed.sql
docs/
  api-spec.md
```

当前没有 `backend/src/test` 测试源码目录，`mvn test` 只执行编译与 Surefire 空测试。

## 启动与测试命令

基础设施：

```powershell
docker compose up -d mysql redis
```

后端启动：

```powershell
cd backend
mvn spring-boot:run
```

编译/测试：

```powershell
cd backend
mvn test
```

本次验证结果：

- `mvn test`：通过，BUILD SUCCESS。
- 说明：无测试源码，输出 `No tests to run`；命令结束后终端额外输出 `Access is denied.`，但 Maven 本身退出码为 0。

可用冒烟请求示例：

```powershell
curl http://localhost:8080/api/v1/portal/home
curl http://localhost:8080/api/v1/portal/courses
curl http://localhost:8080/api/v1/portal/articles/search?keyword=门户
curl http://localhost:8080/api/v1/portal/categories/tree
curl http://localhost:8080/api/v1/portal/site-config
curl http://localhost:8080/api/v1/auth/cas/login-url?redirectUri=http://localhost:5173/callback
```

## 数据模型

数据库脚本位于 `database/schema.sql` 和 `database/seed.sql`。

核心表：

- 用户与权限：`sys_user`、`sys_role`、`sys_permission`、`sys_user_role`、`sys_role_permission`、`external_identity`。
- CMS：`cms_category`、`cms_article`、`cms_article_version`、`cms_media_asset`、`cms_article_asset`、`cms_audit_log`。
- 门户配置：`portal_banner`、`portal_quick_link`、`portal_site_config`、`portal_page_config`。
- 课程：`course_term`、`course_catalog`、`course_user_mapping`、`course_sync_job`。

已映射实体：

- `User` -> `sys_user`
- `CmsCategory` -> `cms_category`
- `CmsContent` -> `cms_article`
- `PortalBanner` -> `portal_banner`
- `PortalQuickLink` -> `portal_quick_link`
- `PortalSiteConfig` -> `portal_site_config`
- `PortalPageConfig` -> `portal_page_config`
- `Course` -> `course_catalog`
- `AuditLog` -> `cms_audit_log`

脚本中存在但暂未看到实体/控制器完整落地的表：

- `sys_role`、`sys_permission`、`sys_user_role`、`sys_role_permission`：可查询用户角色/权限码，但未提供角色权限后台 CRUD。
- `external_identity`：CAS 身份绑定表存在，但 CAS 回调当前未落库或校验。
- `cms_article_version`、`cms_media_asset`、`cms_article_asset`：版本和媒体表存在，但当前媒体接口未实现。
- `course_term`、`course_user_mapping`、`course_sync_job`：课程同步相关表存在，但后台同步任务接口未按文档完整实现。

## 现有接口与控制器

### 认证与用户

- `AuthController`，路径 `/api/v1/auth`
  - `GET /cas/login-url`
  - `POST /cas/callback`
  - `POST /login`
  - `POST /register`
  - `POST /refresh`
  - `POST /logout`
- `UserProfileController`，路径 `/api/v1/users`
  - `GET /me`
  - `PUT /me/profile`
- `UserController`，路径 `/api/v1/admin/users`
  - `GET /`
  - `GET /{id}`
  - `POST /`
  - `PUT /{id}`
  - `DELETE /{id}`

### 门户前台

- `PortalController`，路径 `/api/v1/portal`
  - `GET /home`
  - `GET /courses`
  - `GET /courses/{id}`
  - `POST /courses/{id}/launch`
  - `GET /articles/search`
  - `GET /categories/{code}/articles`
  - `GET /articles/{id}`
  - `GET /categories/tree`
  - `GET /site-config`
  - `GET /page-config/{pageCode}`

### CMS 与门户后台配置

- `CmsCategoryController`，路径 `/api/v1/admin/categories`
  - `GET /tree`
  - `POST /`
  - `PUT /{id}`
  - `PUT /{id}/status`
  - `DELETE /{id}`
- `CmsContentController`，路径 `/api/v1/admin/articles`
  - `GET /`
  - `GET /{id}`
  - `POST /`
  - `PUT /{id}`
  - `POST /{id}/submit`
  - `POST /{id}/approve`
  - `POST /{id}/reject`
  - `POST /{id}/publish`
  - `POST /{id}/offline`
  - `DELETE /{id}`
- `PortalAdminController`，路径 `/api/v1/admin`
  - `GET/POST/PUT/DELETE /banners`
  - `GET/POST/PUT/DELETE /quick-links`
  - `GET/PUT /site-config`
  - `GET/PUT /page-config/{pageCode}`
- `AuditLogController`，路径 `/api/v1/admin/logs`
  - `GET /`
  - `GET /export`

### 课程

- `CourseController`，路径 `/api/v1/admin/courses`
  - `GET /`
  - `GET /{id}`
  - `POST /`
  - `PUT /{id}`
  - `DELETE /{id}`
- `CourseIntegrationController`，路径 `/api/v1/integration`
  - `POST /courses/sync`

## 现有能力

- 门户首页聚合已可从数据库读取站点配置、页面配置、轮播、快捷入口、新闻、公告、专题和课程。
- CMS 栏目、文章 CRUD 和文章状态流转已有基础实现，文章状态支持 `DRAFT -> PENDING_REVIEW -> APPROVED/REJECTED -> PUBLISHED -> OFFLINE` 等核心路径。
- 栏目可见性、启停、排序字段已具备持久化基础。
- 门户运营配置已有轮播、快捷入口、站点配置、页面配置接口。
- 课程目录支持后台 CRUD 和前台分页查询，前台默认筛选 `ACTIVE` 状态课程。
- 课程检索支持 `CourseQuery` 的关键字、分类、状态、学期等查询字段，具体匹配逻辑在 `CourseServiceImpl`。
- 用户管理支持基础 CRUD，当前用户接口通过 `Authorization: Bearer <token>` 解析 `AuthSession`，再读取用户、角色码和权限码。
- 审计日志支持查询和 CSV 导出，文章变更服务中已有部分审计记录使用。
- `docs/api-spec.md` 已记录大量接口规范，并包含部分已实现说明。

## 与 CMS/课程检索/认证闭环的差距

### CMS 闭环差距

- 后台接口当前没有统一鉴权和权限码拦截，文档中的权限要求尚未由 Spring Security 或拦截器强制执行。
- 媒体资源接口 `/admin/media` 未实现，尽管数据库表已存在。
- CMS 文章版本表未被服务层使用，暂不支持版本历史和回滚。
- 模块显示隐藏与多主题配置目前可通过 `portal_site_config`、`portal_page_config` 承载，但缺少明确 DTO、字段约定和验收样例。
- 文章搜索使用 LIKE 和子查询，未封装稳定的搜索 DTO 响应，前端卡片字段仍需对齐。

### 课程检索闭环差距

- 前台 `/portal/courses` 可查询课程，但缺少预设搜索关键词接口。
- 课程分类列表接口未单独提供，前端若要展示分类筛选需要从课程结果或新增接口获取。
- `/portal/courses/{id}/launch` 已要求登录并继续按课程 `permission` 矩阵授权；当前仍未生成真实一次性跳转令牌。
- 文档中的 `/admin/course-sync/jobs`、`/admin/course-users/mappings` 尚未实现；现有 `/integration/courses/sync` 是开发导入接口，不等同于正式同步任务闭环。
- `course_term`、`course_sync_job`、`course_user_mapping` 表尚未形成完整服务和控制器。

### 认证闭环差距

- 未引入 Spring Security/JWT 依赖，`Authorization: Bearer <token>` 未被校验。
- `/auth/login` 已查询 `sys_user` 并校验 `{noop}`/`{sha256}` 密码哈希；当前返回开发 token。
- `/auth/register` 已保存密码哈希，注册用户默认 `role=external`、`userType=GUEST`、`status=ACTIVE`。
- `/auth/cas/callback` 仍未调用真实 CAS 校验接口；当前使用 `teacher001` 作为本地 CAS stub 闭环账号。
- `/auth/refresh`、`/auth/logout` 没有 refresh token 存储、黑名单、Redis 会话或过期策略。
- 管理端接口无需登录即可访问，尚不能满足后台权限验收。

## 下一步建议

1. BE02/BE03 先固定 CMS 配置 DTO 和门户聚合响应字段，补齐模块开关、主题配置、栏目排序的读写样例。
2. BE04 增加预设关键词、课程分类、稳定课程卡片响应 DTO，并对齐 `docs/api-spec.md`。
3. BE05 引入 Spring Security/JWT 或等价拦截机制，实现本地用户密码哈希、CAS 适配层、refresh/logout 会话闭环。
4. BE06 在接口字段确定后同步维护 `docs/api-spec.md`；接口文档命名仍需 PM 统一 `docs/API.md` 与 `docs/api-spec.md` 的最终口径。
5. BE07 增加最小化集成测试或 MockMvc 测试，至少覆盖门户首页、课程查询、CMS 栏目/文章、登录注册核心路径。

## 2026-05-06 CMS/portal config save loop check

Scope: checked whether `/admin/site-config` and `/admin/page-config/{pageCode}`
are enough for the frontend to edit portal theme colors and homepage module
switches, without touching frontend code.

Conclusion:

- Theme color editing is supported by `portal_site_config` and
  `GET/PUT /api/v1/admin/site-config`. The required keys remain
  `theme.primary`, `theme.primaryDark`, and `theme.dark`; frontend public reads
  use `GET /api/v1/portal/site-config`.
- Homepage module switches are supported by `portal_page_config.layout_json` and
  `GET/PUT /api/v1/admin/page-config/home`. The public portal reads the enabled
  config through `GET /api/v1/portal/page-config/home`, and the homepage hides
  known sections when `enabled=false` or `visible=false`.
- Small backend gap fixed: admin page-config read now returns saved configs
  regardless of the page config `enabled` flag, so CMS can edit or re-enable a
  disabled page config. Public page-config read still only exposes enabled pages.
- Small backend compatibility fix: admin site-config upsert defaults blank or
  omitted `siteCode` to `main`, matching the existing read defaults and seed
  data.
- API contract added to `docs/api-spec.md` with theme keys, homepage section
  codes, and admin/public read behavior.

Remaining risks:

- Admin endpoints are protected by `AdminAuthInterceptor`; missing Bearer token returns 401 and non-admin role returns 403. Fine-grained permission-code enforcement remains future work.
- `layoutJson` is still accepted as a raw JSON string mapped to the database JSON
  column; malformed JSON is expected to fail at database/write time rather than
  through a typed DTO validation layer.
- Site config saves one key per request; bulk theme editing would require
  multiple `PUT /admin/site-config` calls or a future batch endpoint.

Suggested verification:

```powershell
cd backend
mvn test
```

Manual smoke examples after starting backend and loading seed data:

```powershell
curl http://localhost:8080/api/v1/admin/site-config
curl -X PUT http://localhost:8080/api/v1/admin/site-config -H "Content-Type: application/json" -d "{\"configKey\":\"theme.primary\",\"configValue\":\"#0f766e\",\"valueType\":\"STRING\",\"description\":\"Portal primary theme color\"}"
curl http://localhost:8080/api/v1/admin/page-config/home
curl -X PUT "http://localhost:8080/api/v1/admin/page-config/home?siteCode=main" -H "Content-Type: application/json" -d "{\"pageTitle\":\"门户首页\",\"layoutJson\":\"{\\\"sections\\\":[{\\\"code\\\":\\\"banner\\\",\\\"enabled\\\":true},{\\\"code\\\":\\\"courses\\\",\\\"enabled\\\":false}]}\",\"seoJson\":\"{\\\"title\\\":\\\"四川师范大学课程教学门户\\\"}\",\"enabled\":true}"
curl http://localhost:8080/api/v1/portal/home
```
