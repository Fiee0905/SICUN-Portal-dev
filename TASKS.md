# TASKS

## 2026-05-22 Backend bug-report-20260522 fixes

- BE-BUG-001 completed: Removed hard-coded CAS callback login for `teacher001/123456`; CAS callback now fails closed when real validation is not configured, and invalid/blank tickets do not issue tokens.
- BE-BUG-002 completed: Removed runtime hard-coded `localhost:7001` from CAS login URL generation and LMS launch fallback; both paths now use environment-backed configuration and return explicit configuration errors when missing.
- BE07 completed for this bugfix scope: Added backend automated tests so `mvn test` runs real tests. Coverage includes invalid CAS callback, blank CAS ticket validation, CAS login URL configured/missing, and LMS fallback missing/configured.
- BE-P3-DB-PASSWORD-CONFIG completed: Removed the committed backend datasource password fallback from `application.yml`; backend now reads `DB_PASSWORD`. Local docker-compose users must export the matching MySQL password before running the backend.
- Verification: `cd backend && mvn test` passed with 6 tests; scan of `backend/src/main/java`, `backend/src/main/resources`, and `backend/src/test` found no `localhost:7001`, seeded smoke accounts, `123456`, `example.com`, or material mock/stub keywords.

## 2026-05-22 AI QA bug-report 整改任务

来源：`bug-report-20260522`，AI QA 最终验收结论为不通过，当前不建议交付。

### P1

- BE-P1-CAS-CALLBACK-VALIDATION completed, pending QA regression: 已修复 `BUG-001`，移除 `/api/v1/auth/cas/callback` 中硬编码 `teacher001/123456` 登录逻辑；当前未配置真实 CAS 校验时 fail closed，invalid ticket 返回 HTTP 401 且不签发 `accessToken`/`refreshToken`。负责人：Backend Agent。验收：QA 复跑 invalid ticket 路径。
- BE-P1-AUTH-REGRESSION-TESTS completed: 已补充后端自动化测试，`cd backend && mvn test` 运行 6 个真实测试，不再是 `No tests to run`；覆盖 invalid/blank CAS callback、CAS login-url 配置/缺配置、课程 launch fallback 缺配置/已配置路径。负责人：Backend Agent。
- QA-P1-CAS-SECURITY-REGRESSION pending: 复验 `BUG-001`，复用 `bug-report-20260522/evidence` 的复现路径，确认无效 ticket 不能换取 internal token。负责人：QA Agent。
- QA-P1-CMS-CRUD-SYNC-EVIDENCE pending: 补齐课程、新闻、公告、轮播、名师、友情链接、页面配置的“后台写入 -> 前台读取 -> 禁用/删除隐藏”证据。负责人：QA Agent。

### P2

- BE-P2-CAS-LMS-CONFIG completed, pending QA regression: 已修复 `BUG-002`，CAS login URL 使用 `portal.integrations.cas.login-url`/`PORTAL_CAS_LOGIN_URL`，LMS fallback 使用 `portal.integrations.lms.launch-base-url`/`PORTAL_LMS_LAUNCH_BASE_URL`；缺配置时返回明确配置错误，不再硬编码 `localhost:7001`。负责人：Backend Agent。
- FE-P2-CAS-LAUNCH-UX pending: 配合后端配置化错误语义，CAS 登录失败或未配置、课程 launch 未配置时给出明确提示，不跳转到错误 localhost 地址。负责人：Frontend Agent。
- QA-P2-NO-MOCK-NO-LOCALHOST pending: 执行 no-mock/no-hardcoded 扫描，重点确认 hardcoded CAS 账号和 `localhost:7001` 外部地址已移除。负责人：QA Agent。
- QA-P2-DEPLOYMENT-EVIDENCE pending: 补齐校园内网、独立域名或 hosts 模拟域名、CAS callback、LMS launch 的可复验证据。负责人：QA Agent。

## 2026-05-09 Backend/Docs P0 核查

- BE-P0-COLLEGE-DICTIONARY completed: 已核查 `portal_college` 表、实体、Mapper、Service、后台 CRUD 和公开列表/首页聚合完整；公开学院列表来自启用的 `portal_college` 字典，并按当前访问者可见 `ACTIVE` 课程的 `department` 匹配计算 `count`。
- BE-P0-FEATURED-COURSES completed: 已核查 `course_catalog.featured`、`Course.featured`、创建/更新 DTO、`CourseQuery.featured` 和 `CourseServiceImpl.pageCourses` 筛选完整；首页精选课程 `data.courses` 使用 `featured=true`，新课速递 `data.newCourses` 继续按最新课程排序。
- BE-P0-DASHBOARD-DATA completed: 已核查 `/api/v1/admin/dashboard` 使用 DB 统计和近期数据生成 `stats`、`activities`、`courseSamples`、`chartSeries`，源码中文标签无乱码。
- DATA-P0-FINAL-DEMO completed: 已核查 `database/schema.sql` 与 `database/seed.sql` 覆盖最终展示所需账号、学院、名师、轮播、友情链接、站点主题、首页模块、精选课程和新课数据。
- DOC-P0-COLLEGE-FEATURED completed: 已更新 `docs/API.md` 与 `docs/api-spec.md`，补齐学院后台接口、`portal_college` 字段契约、`featured` 筛选/首页精选规则，并修正“colleges 聚合自课程/教师”的过时描述。
- Verification: `cd backend && mvn test` 通过，Maven 输出 `BUILD SUCCESS`；当前仍无后端测试源码（`No tests to run`）。

## 2026-05-08 multiple Agents 前端业务硬编码清理

- PM-P0-NO-MOCK-REVIEW completed: PM Agent 已完成前端业务硬编码专项审查，判定首页、PortalLayout、课程中心、后台 Dashboard、页面配置、站点设置、学院下拉、个人中心等位置存在或曾存在业务 mock/fallback 风险。
- FE-P0-NO-MOCK-BUSINESS-DATA completed: 生产前端已移除对 `@/data/mock`、`@/data/admin`、`@/data/profile` 和 `withFallback` 的依赖；业务数据只从后端接口读取，接口失败或空数据时显示空状态/错误状态；不再使用的 `frontend/src/data/mock.ts`、`frontend/src/data/admin.ts`、`frontend/src/data/profile.ts` 已删除。
- BE-P0-DATA-DICTIONARY-ENDPOINTS completed: 后端已新增 `GET /api/v1/portal/colleges`、`GET /api/v1/portal/course-categories`、`GET /api/v1/portal/course-levels`、`GET /api/v1/portal/external-links`；`/portal/home` 已返回 `colleges`、`externalLinks`；`GET /api/v1/admin/dashboard` 已改为 DB 统计数据源。
- QA-P0-NO-MOCK-ACCEPTANCE completed: 新增 `qa/NO_MOCK_BUSINESS_DATA_ACCEPTANCE.md`，覆盖源码禁用 mock import、接口断开、清空 DB、禁用/删除内容后不得出现假业务数据的验收矩阵。
- DOC-P0-NO-MOCK completed: `docs/API.md` 与 `docs/api-spec.md` 已同步新增/变更接口，明确空数据语义和前端不得回退业务样例。
- Verification: `frontend/src` 扫描无 `@/data/mock`、`@/data/admin`、`@/data/profile`、`withFallback`、`FALLBACK_*_CATEGORY`、`categoryId: 数字` 命中；`frontend npm.cmd run build` 通过，保留既有 Vite 大 chunk 警告；`backend mvn test` 通过，当前仍无后端测试源码。

## 2026-05-08 后台院系选择约束

- FE-P13-COLLEGE-SELECT completed: `/admin/courses` 课程表单“开课院系”改为下拉选择，选项来自前台学院列表。
- FE-P13-TEACHER-COLLEGE-SELECT completed: `/admin/teachers` 名师表单“学院”改为下拉选择，选项来自同一份前台学院列表。
- Verification: `frontend npm.cmd run build` 通过，保留既有 Vite 大包警告。

## 2026-05-08 首页查看更多页面闭环

- FE-P13-MORE completed: 首页“教务公告与学术资讯”“新闻资讯”“名师风采”新增查看更多入口，并分别落到 `/notices`、`/news`、`/teachers` 前台列表页。
- BE-P13-MORE completed: 复用现有公开接口，无需新增后端接口。公告页读取 `notice` 与 `topic`，新闻页读取 `news`，名师页读取 `/portal/teachers`。
- QA-P13-MORE pending verification: 访问首页点击三个查看更多入口，确认列表页能加载后台已发布/启用的全部内容，且空数据展示空态。

## 2026-05-08 首页内容真实数据闭环

- BE-P0-06 completed: 新增 `portal_teacher` 数据模型、后台 CRUD、公开查询和首页聚合 `teachers`。
- BE-P0-07 completed: 首页 `newCourses` 改为真实课程数据，按 `createdAt desc, id desc` 取最新 4 条 `ACTIVE` 且当前用户可见课程。
- FE-P0-10 completed: 首页名师风采不再回退 mock，空数组显示真实空态。
- FE-P0-11 completed: 新增 `/admin/teachers` 名师风采管理页面，支持增删改查、启停、排序、头像上传。
- FE-P0-12 completed: 新增 `/admin/news` 新闻资讯管理页面，固定 `categoryCode=news`，支持增删改查、发布、下线、封面上传。
- QA-P0-04 completed: 新增 `qa/CONTENT_REAL_DATA_ACCEPTANCE.md`，覆盖名师、新闻、新课速递真实数据验收。
- DOC-P0-03 completed: `docs/API.md` 与 `docs/api-spec.md` 已同步教师接口、新课速递规则、新闻管理入口。
- Verification: `backend mvn test`、`backend mvn -DskipTests package`、`frontend npm run build` 均通过；接口冒烟 `teacherHit=1 teacherAfterDisable=0 newsHit=1 newsAfterOffline=0 newCourseCount=4`。

## 2026-05-07 课程封面地址体验修复

- FE-P0-09 completed: 课程管理封面地址支持上传图片，上传成功自动回填；保存前归一化本机 public 路径、反斜杠路径和引号包裹路径。
- Verification: `frontend npm run build` 通过；`/banners/portal-home4.jpg` 返回 200。

## 2026-05-07 友情链接前台展示优化

- FE-P0-08 completed: 首页友情链接改为一行一个链接的单列列表，增加间距、边框和 hover 状态。
- Verification: `frontend npm run build` 通过。

## 2026-05-07 友情链接新增保存修复

- FE-P0-07 completed: 友情链接新增表单保存时不再携带残留 `id`，避免新增被当作固定主键插入。
- BE-P0-05 completed: `POST /admin/friend-links` 强制忽略客户端传入 id，服务端兜底防止主键重复。
- Verification: `backend mvn test` 通过；`frontend npm run build` 通过；携带 `id=1` 的新增请求创建了新 id，并可通过 `/portal/friend-links` 读取。

## 2026-05-07 管理员轮播上传闭环

- FE-P0-06 completed: 轮播管理新增上传按钮，上传成功后自动回填图片地址；新增表单会清理旧 `id`，修复从编辑切到新增后保存失败的问题。
- BE-P0-04 completed: 新增 `POST /api/v1/admin/uploads/images` 图片上传接口，上传文件通过 `/api/uploads/**` 静态访问；上传大小上限配置为 5MB。
- DOC-P0-02 completed: `docs/API.md` 与 `docs/api-spec.md` 已同步上传接口和轮播图片 URL 约定。
- Verification: `backend mvn test` 通过；`frontend npm run build` 通过；上传接口返回 `/api/uploads/...` URL，图片访问 200，创建启用轮播后 `GET /api/v1/portal/home` 命中 1 条测试轮播。

## 2026-05-07 首页轮播图片配置修复

- FE-P0-05 completed: 后台轮播表单保存前会将 `frontend/public/...` 本机路径归一化为网页可访问路径，例如 `/banners/portal-home1.jpg`。
- DATA-P0-01 completed: 已把 `frontend/public/banners/portal-home1.jpg`、`portal-home2.jpg`、`portal-home3.jpg` 配置到首页轮播并启用。
- Verification: `/banners/portal-home1.jpg`、`/banners/portal-home2.jpg`、`/banners/portal-home3.jpg` 均返回 200；`GET /api/v1/portal/home` 返回三条 `HOME_TOP` 启用轮播；`frontend npm run build` 通过。

## 2026-05-07 Frontend sync fallback fix final status

- FE-P0-04 advanced to pending QA acceptance: homepage/course page no longer fall back to mock data when real portal APIs return empty arrays; banners use `HOME_TOP`; homepage notices/news normalize real `CmsContent` fields; `/courses` shows real empty state instead of mock courses.
- BE-P0-03 advanced to pending QA acceptance: backend normalizes admin banner `position` blank/`home` to `HOME_TOP`; real CRUD smoke confirmed public hits for banner, course, and notice after admin writes; docs synchronized.
- QA-P0-03 advanced to ready for execution: `qa/CMS_ADMIN_CRUD_ACCEPTANCE.md` now includes the no-mock-fake-sync acceptance rule.
- Verification: `cd backend && mvn test` passed; `cd frontend && npm run build` passed with the existing Vite large chunk warning.

## 2026-05-07 Backend Worker update

- BE-P0-03 advanced to pending QA acceptance: backend now normalizes admin banner `position` blank/`home` to `HOME_TOP`, confirmed code paths for public `HOME_TOP` enabled banners, `ACTIVE/public` courses, and `PUBLISHED categoryCode=notice` articles, and synchronized `docs/API.md` plus `docs/api-spec.md`.
- Verification: `cd backend && mvn test` passed. After Docker was started, MySQL/Redis were up, backend jar started on port 8080, and real CRUD smoke passed with temporary rows: banner public hit `1`, course public hit `1`, notice public hit `1`; temporary smoke rows were deleted.

## 2026-05-07 人工测试报告整改任务

来源：人工测试报告 `C:\Users\86199\Desktop\测试报告-功能项验证.xlsx`，Sheet1 共 19 条功能项。

### P0

- FE-P0-04：修复前台真实数据消费与 mock fallback 干扰。范围：首页、课程页、轮播、公告；统一轮播 position，公告/新闻字段归一化，验收模式不得用空数组回退 mock。状态：阻塞。负责人：Frontend Agent。验收：后台新增/编辑/禁用/删除后，前台硬刷新展示与 `/portal/home`、`/portal/courses` 一致。
- BE-P0-03：核查后台写接口到前台公开接口的数据链。范围：`/admin/banners -> /portal/home.banners`、`/admin/courses -> /portal/courses`、`/admin/articles?categoryCode=notice -> /portal/home.notices`。状态：阻塞。负责人：Backend Agent。验收：提供 curl 闭环记录并同步字段契约到 `docs/api-spec.md`。
- QA-P0-03：执行 CMS CRUD 前后台同步专项复测。范围：课程、轮播、公告三条闭环；必须验证禁用/下线/删除后前台不出现 mock 假数据。状态：未开始。负责人：QA Agent。交付物：更新 `qa/CMS_ADMIN_CRUD_ACCEPTANCE.md` 执行结果。
- FE-P0-01：补齐 Admin/CMS 页面配置、课程管理、通知公告、新闻资讯、友情链接、站点信息管理页面，并接入真实接口。状态：部分覆盖。负责人：Frontend Agent。说明：本轮已完成友情链接后台页和站点信息字段保存；课程/公告/新闻完整 CRUD 待后续继续。
- FE-P0-01-UPDATE：CMS 课程管理、轮播管理、公告管理、用户管理前端 CRUD 已完成。状态：待验收。负责人：Frontend Agent。验证：`cd frontend && npm run build`，页面 `/admin/courses`、`/admin/banners`、`/admin/notices`、`/admin/users`。
- FE-P0-02：新增课程详情页，课程模块卡片/列表支持跳转。状态：待验收。负责人：Frontend Agent。验证：`cd frontend && npm run build`。
- FE-P0-03：首页底部展示友情链接和站点信息；保存“四川师范大学官网 https://www.sicnu.edu.cn 排序1”后前台可见并可跳转。状态：待验收。负责人：Frontend Agent。验证：`/admin/friend-links` 新增/启用后访问 `/`。
- BE-P0-01：补齐 CMS 页面配置、课程、通知公告、新闻资讯、友情链接、站点信息 CRUD 接口和持久化。状态：部分覆盖。负责人：Backend Agent。说明：本轮已完成友情链接 CRUD 和站点信息 key 持久化；课程/公告/新闻完整 CRUD 待后续继续。
- BE-P0-01-UPDATE：CMS 课程、轮播、公告、用户后端 CRUD 已完成或补齐；公告支持 `categoryCode=notice` 创建/更新并自动生成 slug；用户支持 `/admin/users/{id}/status`。状态：待验收。负责人：Backend Agent。验证：`cd backend && mvn test`，接口 `/admin/courses`、`/admin/banners`、`/admin/articles?categoryCode=notice`、`/admin/users`。
- BE-P0-02：补齐门户公开查询接口，确保后台保存后前台可读取。状态：待验收。负责人：Backend Agent。验证：`GET /api/v1/portal/friend-links`、`GET /api/v1/portal/home`、`GET /api/v1/portal/site-config`。
- QA-P0-01：针对 P0 项建立复测矩阵，验证后台 CRUD、前台展示、权限控制和数据持久化。状态：部分覆盖。负责人：QA Agent。产物：`qa/MINIMAL_VISIBLE_CLOSURE_ACCEPTANCE.md`。
- QA-P0-02：CMS 管理 CRUD 验收矩阵已补充，覆盖课程、轮播、公告、用户管理员增删改查和前台同步。状态：待执行。负责人：QA Agent。产物：`qa/CMS_ADMIN_CRUD_ACCEPTANCE.md`。

### P1

- FE-P1-01：新增导航栏管理页面，支持名称、路径、排序、启停。状态：进行中。负责人：Frontend Agent。
- FE-P1-02：新增操作日志后台查询窗口。状态：进行中。负责人：Frontend Agent。
- BE-P1-01：补齐导航栏管理接口和操作日志查询接口；关键后台写操作记录日志。状态：进行中。负责人：Backend Agent。
- QA-P1-01：验证导航栏配置生效、操作日志记录完整、模块管理隐藏/恢复闭环。状态：进行中。负责人：QA Agent。

### P2

- QA-P2-01：对已通过项执行回归：门户页面、本地化部署、主题切换、认证、校外注册、课程检索、多维筛选、课程权限、第三方入口。状态：进行中。负责人：QA Agent。

## 2026-05-06 Auth/permission final verification

- 注册登录与权限区分最小闭环已完成本地联调：`admin/student001/teacher001/outside001` 均可按 `123456` 登录，错误账号返回 401。
- 课程权限矩阵已验证：游客/校外用户仅 `public`，校内用户 `public + internal`，管理员 `public + internal + private`。
- 后台权限已验证：校外用户访问 `/api/v1/admin/site-config` 返回 403，管理员返回 200；前端 `/admin/*` 使用真实 `user.role` 守卫，旧 `/cms/*` 重定向到 `/admin/dashboard`。
- 验证命令：`cd backend && mvn test` 通过；`cd frontend && npm run build` 通过，仍有既有 Vite 大 chunk 警告。

## 2026-05-06 Backend Auth Worker update

- BE05 auth/user loop advanced to partial coverage: local login validates `sys_user`, tokens carry `userId/username/role`, `/users/me` reads Bearer token, and `/api/v1/admin/**` requires `role=admin`.
- BE04 course permission filtering advanced to partial coverage: `course_catalog.permission` supports `public`/`internal`/`private`; portal course list/detail/launch filter by token role.
- BE06 docs advanced to partial coverage: `docs/API.md` and `docs/api-spec.md` document auth token, seed accounts, role values, admin 401/403, and course permission matrix.
- BE07 verification prepared/executed: `cd backend && mvn test` passed with BUILD SUCCESS; current project still has no backend test sources.

## 使用规则

- 所有 Agent 开始工作前必须阅读 `PROJECT_MEMORY.md`、本文件和当前目录下的 `AGENTS.md`。
- 任务状态使用：`未开始`、`进行中`、`待联调`、`待验收`、`已完成`、`阻塞`、`部分覆盖`。
- 完成任务后必须更新本文件；重要结论、接口约定、范围变更必须同步写入 `PROJECT_MEMORY.md`。
- 新增或变更接口时，必须同步更新接口文档。当前仓库已有 `docs/api-spec.md`，根规则提到 `docs/API.md`，需优先统一接口文档命名或在 `PROJECT_MEMORY.md` 中明确最终口径。
- 每个功能交付时必须给出验证命令、接口测试方式或页面验收路径。

## 当前目标

优先形成教学门户模块 13 项功能的可运行闭环，覆盖门户展示、CMS 配置、登录认证配置、课程检索、课程模块展示、新闻公告、推荐课程、新课速递、名师风采、友情链接。

## 当前专项：注册登录、权限区分与旧版 CMS 清理

PM 口径已补充到 `pm/AUTH_PERMISSION_CMS_CLEANUP_SCOPE.md`。本专项不改业务实现，先明确一期最小闭环和验收标准：

- 注册登录闭环：校外用户可注册、登录、退出，并可获取当前用户信息。
- 权限区分闭环：至少区分游客、普通用户、管理员；管理后台和 CMS 配置入口仅管理员可访问。
- 公开门户回归：游客仍可访问首页、课程检索、新闻公告、友情链接等公开内容。
- 旧版 CMS 清理：统一后台验收入口，删除或下线旧版 CMS 菜单、路由、入口；如暂不能删除，必须标记废弃并提供迁移映射。
- 一期不强制完成真实学校统一身份认证，只要求预留配置化/Mock 闭环；真实协议、回调地址、测试账号继续作为 P09 风险跟踪。

## 总体里程碑

| 编号 | 里程碑 | 目标 | 状态 | 负责人 |
| --- | --- | --- | --- | --- |
| M1 | 项目记忆与任务体系补齐 | 补齐任务体系、角色规则、覆盖矩阵、基线梳理和初版验收清单 | 已完成 | PM Agent |
| M2 | 门户前端闭环 | 门户首页、课程展示、检索、主题切换、内容模块可演示 | 进行中 | Frontend Agent |
| M3 | 后端接口闭环 | CMS 配置、课程、新闻公告、认证相关接口可用 | 进行中 | Backend Agent |
| M4 | 前后端联调 | 前端页面接入后端接口，数据字段与接口文档一致 | 未开始 | Frontend Agent / Backend Agent |
| M5 | 验收覆盖 | 13 项功能点逐项验收，形成测试记录和风险清单 | 进行中 | QA Agent |

## 教学门户 13 项功能拆分

| 编号 | 功能点 | 前端任务 | 后端任务 | 验收要点 | 状态 |
| --- | --- | --- | --- | --- | --- |
| P01 | 个性化门户页面 | 首页布局、学校风格视觉、模块区域 | 提供门户配置和首页聚合数据 | 首页可展示课程、公告、资讯、推荐等内容 | 部分覆盖 |
| P02 | 本地化部署 | 确认构建产物、环境变量和部署说明 | 确认服务配置、数据库初始化和运行说明 | 本地环境可启动完整系统 | 部分覆盖 |
| P03 | 校园内网访问 | 前端不依赖公网资源或提供降级方案 | 后端支持内网地址、跨域和反向代理配置 | 内网地址可访问门户与接口 | 阻塞 |
| P04 | 独立域名 | 支持配置 API Base URL 和静态资源路径 | 支持域名、CORS、认证回调配置 | 独立域名下页面和接口正常 | 阻塞 |
| P05 | CMS 后台 | CMS 后台页面、表单、列表、开关控件；清理旧版 CMS 菜单/路由/入口，统一后台验收路径 | CMS 配置 CRUD、权限控制；后台接口必须校验管理员权限 | 管理员可维护门户内容；游客/普通用户不能访问后台；旧版 CMS 不再干扰验收 | 部分覆盖 |
| P06 | 栏目配置 | 栏目菜单、排序、启停配置界面 | 栏目配置接口和持久化 | 栏目名称、顺序、状态可配置并生效 | 部分覆盖 |
| P07 | 模块显示隐藏 | 首页模块开关、空态处理 | 模块启停配置接口 | 隐藏模块不在门户展示，恢复后可显示 | 待联调 |
| P08 | 多主题配色 | 主题切换控件、主题变量落地 | 主题配置接口或配置项 | 不同主题可切换并持久化 | 待联调 |
| P09 | 统一身份认证 | 登录入口、回调状态、用户态展示；一期允许配置化/Mock 闭环 | 统一身份认证配置、回调、会话；真实协议资料未到位前不阻塞校外注册登录 | 校内用户可通过统一认证登录；一期先验收配置化/Mock 能力 | 阻塞 |
| P10 | 校外用户登录注册 | 注册、登录、退出、当前用户状态、无权限提示 | 校外用户注册登录接口、退出/当前用户接口、密码安全、角色权限 | 校外用户可注册登录并访问允许资源；普通用户访问后台返回无权限 | 部分覆盖 |
| P11 | 课程关键词检索 | 搜索框、结果页、筛选排序、空态 | 课程检索接口、关键词匹配 | 输入关键词可返回相关课程 | 部分覆盖 |
| P12 | 预设检索关键词 | 热门关键词入口、点击检索 | 预设关键词配置和查询接口 | 预设词可展示、点击后触发检索 | 部分覆盖 |
| P13 | 课程与内容模块展示 | 课程轮播、分类、通知公告、新闻资讯、推荐课程、新课速递、名师风采、友情链接 | 各模块数据接口或聚合接口 | 模块数据完整展示，CMS 配置可影响展示 | 部分覆盖 |

详见 `pm/COVERAGE_MATRIX.md` 和 `qa/ACCEPTANCE_CHECKLIST.md`。

## Frontend Agent 任务

| 编号 | 任务 | 交付物 | 依赖 | 状态 |
| --- | --- | --- | --- | --- |
| FE01 | 梳理现有前端页面结构和运行命令 | `frontend/BASELINE.md`，验证命令 `npm run build` | 无 | 已完成 |
| FE02 | 建立门户首页模块化结构 | 首页模块组件、数据接入点 | FE01 | 未开始 |
| FE03 | 实现课程检索与结果展示 | 搜索框、结果页、预设关键词入口、空态、加载态 | BE04 | 部分覆盖 |
| FE04 | 实现 CMS 后台基础页面 | `/admin/page-config` 可编辑首页模块开关和主题色；`/admin/settings` 可保存站点/主题配置 | BE02、BE03 | 部分覆盖 |
| FE05 | 实现认证相关页面和用户态 | 登录入口、校外注册登录、退出、当前用户状态、路由守卫、无权限页；旧版 CMS 前端入口清理 | BE05 | 部分覆盖 |
| FE06 | 接入主题切换与模块显示隐藏 | 首页读取 `pageConfig.layoutJson.sections`；主题读取 `theme.*` 配置 | BE03 | 已完成 |
| FE07 | 前端构建与自测 | `npm run build` 或项目实际命令通过 | FE02-FE06 | 未开始 |

## Backend Agent 任务

| 编号 | 任务 | 交付物 | 依赖 | 状态 |
| --- | --- | --- | --- | --- |
| BE01 | 梳理后端技术栈、启动命令和数据模型 | `backend/BASELINE.md`，验证命令 `mvn test` | 无 | 已完成 |
| BE02 | 实现 CMS 栏目与内容配置接口 | 栏目、模块、内容 CRUD 或配置接口 | BE01 | 未开始 |
| BE03 | 实现门户配置接口 | 主题、模块显示隐藏、首页聚合配置；后台读取停用页面配置 | BE02 | 待联调 |
| BE04 | 实现课程检索接口 | 关键词检索、预设关键词、课程分类数据 | BE01 | 部分覆盖 |
| BE05 | 实现认证与用户接口 | 统一身份认证配置、校外登录注册、退出、当前用户、角色级权限控制；后台接口返回 401/403 | BE01 | 未开始 |
| BE06 | 同步接口文档 | 更新 `docs/api-spec.md` 或统一后的接口文档；补充认证字段、角色枚举、权限错误码、旧版 CMS 废弃说明 | BE02-BE05 | 未开始 |
| BE07 | 后端测试与启动验证 | Maven 测试、接口示例请求 | BE02-BE06 | 未开始 |

## PM Agent 任务

| 编号 | 任务 | 交付物 | 状态 |
| --- | --- | --- | --- |
| PM01 | 维护需求拆分和优先级 | `TASKS.md` 持续更新 | 进行中 |
| PM02 | 对齐投标文件功能点和实现任务 | `pm/COVERAGE_MATRIX.md` | 已完成 |
| PM03 | 跟踪跨端接口字段和文档命名 | `docs/API.md` 入口和 `docs/api-spec.md` 详细规范 | 已完成 |
| PM04 | 定义阶段验收标准 | 每个里程碑验收条件 | 部分覆盖 |
| PM05 | 汇总当前进度和阻塞 | `PROJECT_MEMORY.md` 进度更新 | 已完成 |
| PM06 | 定义注册登录、权限区分与旧版 CMS 清理专项范围 | `pm/AUTH_PERMISSION_CMS_CLEANUP_SCOPE.md`，并同步 `TASKS.md`/`PROJECT_MEMORY.md` | 已完成 |

## QA Agent 任务

| 编号 | 任务 | 交付物 | 依赖 | 状态 |
| --- | --- | --- | --- | --- |
| QA01 | 梳理测试范围和验收矩阵 | `qa/ACCEPTANCE_CHECKLIST.md` | PM02 | 已完成 |
| QA02 | 设计接口测试用例 | `qa/CONFIG_ACCEPTANCE.md` 已覆盖 P07/P08 配置接口验收；`qa/AUTH_PERMISSION_ACCEPTANCE.md` 已补游客/普通用户/管理员、role、课程 permission、CMS 权限的 401/403/200 矩阵 | BE06 | 部分覆盖 |
| QA03 | 设计页面测试用例 | `qa/CONFIG_ACCEPTANCE.md` 已覆盖 P07/P08 页面验收；`qa/AUTH_PERMISSION_ACCEPTANCE.md` 已补注册、登录、退出、无权限页、旧版 CMS 下线回归矩阵 | FE07 | 部分覆盖 |
| QA04 | 执行联调回归 | 测试记录、缺陷清单、复测结论 | M4 | 未开始 |
| QA05 | 投标功能点覆盖检查 | 覆盖报告和未覆盖风险 | QA01-QA04 | 未开始 |

## 当前风险

| 编号 | 风险 | 影响 | 处理建议 | 状态 |
| --- | --- | --- | --- | --- |
| R01 | 接口文档名称不一致：根规则写 `docs/API.md`，仓库已有 `docs/api-spec.md` | 新增接口可能同步到不同文档 | 已创建 `docs/API.md` 作为入口索引，详细接口继续维护 `docs/api-spec.md` | 已处理 |
| R02 | 统一身份认证的真实协议、回调地址、测试账号未知 | 认证闭环可能只能先做配置化模拟 | Backend Agent 先实现可配置适配层，PM Agent 补齐外部依赖 | 未处理 |
| R03 | 投标文件中的 13 项之外可能还有细项 | 验收覆盖不足 | QA Agent 对照投标文件建立完整覆盖矩阵 | 未处理 |
| R04 | 校园内网、独立域名、本地化部署依赖实际部署环境 | 本地开发难以完整验证 | 先提供本地验证和配置说明，再补充部署环境验收 | 未处理 |
| R05 | 前端存在 mock fallback，部分功能可演示但未形成真实联调闭环 | 验收时可能被判定为数据未真实落地 | 优先打通 CMS 配置、门户聚合、课程检索真实接口 | 新增 |
| R06 | 后端认证仍是开发桩，管理端接口未强制鉴权 | 登录注册和后台权限验收风险高 | 优先设计 Spring Security/JWT 或会话机制，并补充权限测试 | 新增 |
| R07 | 配置保存已具备接口和前端入口，但尚未完成真实数据库联调验收 | P07/P08 仍不能直接判定通过 | 按 `qa/CONFIG_ACCEPTANCE.md` 启动 MySQL/Redis/后端/前端后执行 hide/restore/theme 验收 | 新增 |
| R08 | 注册登录只完成页面或接口之一，未形成“注册-登录-当前用户-退出”连续闭环 | P10 可能无法验收通过，用户态和权限用例无法执行 | Frontend/Backend 按最小闭环同步推进，QA 以连续流程作为通过标准 | 新增 |
| R09 | 权限只做前端菜单隐藏，后端管理接口未返回 401/403 | 普通用户可能绕过前端直接访问后台接口，验收和安全风险高 | 后端接口鉴权作为硬性验收项，前端路由守卫作为体验补充 | 新增 |
| R10 | 旧版 CMS 与新版 Admin/CMS 入口并存 | 演示入口、配置数据源和验收路径混乱 | 清理旧版 CMS 菜单/路由/入口；无法删除时标记废弃并提供迁移映射 | 新增 |
| R11 | 游客公开门户被鉴权误拦截 | 接入登录后 P01/P11/P13 等公开能力回归失败 | QA 将匿名访问首页、课程检索、公告新闻、友情链接列为认证专项回归必测 | 新增 |

## 最近更新

- 2026-05-06：Frontend Auth Worker 收敛前端登录/注册与后台权限：`/auth/login` 成功后保存 `accessToken/user.role` 会话；`/admin/*` 仅允许 `role=admin`，普通用户跳 `/403`；旧 `/cms/*` 统一重定向 `/admin/dashboard`，后台菜单删除旧版 CMS；注册成功提示校外用户并跳 `/login`。待后端真实 401/403 和账号状态联调后进入验收。

- 2026-05-06：启动 multiple agents 并行基线梳理。PM 完成 `pm/COVERAGE_MATRIX.md`；Frontend 完成 `frontend/BASELINE.md` 并通过 `npm run build`；Backend 完成 `backend/BASELINE.md` 并通过 `mvn test`，但当前无测试源码；QA 完成 `qa/ACCEPTANCE_CHECKLIST.md`。
- 2026-05-06：统一接口文档口径，新增 `docs/API.md` 入口并继续维护 `docs/api-spec.md`；新增 `GET /portal/search-keywords`，前端课程中心展示预设关键词并支持点击检索，P12 推进为部分覆盖。
- 2026-05-06：前端首页接入 `pageConfig.layoutJson.sections` 模块显示隐藏和 `siteConfig theme.*` 主题变量；种子数据补充首页模块开关与默认主题色；P07/P08 推进到待联调，FE06 标记为已完成。
- 2026-05-06：启动 multiple agents 并行进度管理。PM 生成 `pm/PROGRESS_REPORT.md`；Frontend 完成 CMS/管理后台配置保存入口；Backend 补齐 admin 配置读写小缺口并更新文档；QA 生成 `qa/CONFIG_ACCEPTANCE.md`。前端 `npm run build` 与后端 `mvn test` 均通过。
- 2026-05-06：PM 补充“注册登录和权限区分最小闭环 + 删除旧版 CMS”专项范围，新增 `pm/AUTH_PERMISSION_CMS_CLEANUP_SCOPE.md`；明确游客/普通用户/管理员三类权限、旧版 CMS 清理口径、专项验收标准和风险 R08-R11。
- 2026-05-06：QA 补充 `qa/AUTH_PERMISSION_ACCEPTANCE.md`，围绕注册登录、role 权限、课程 permission、后台 CMS 权限、删除旧版 CMS 的影响形成手工测试矩阵；同步更新 `qa/ACCEPTANCE_CHECKLIST.md` 入口和专项结论。
- 2026-05-06：根据项目固定分工和当前优先级，初始化任务拆分、里程碑、风险清单和角色任务。
