# PROJECT_MEMORY

## 2026-05-25 Daily bug scan

- Daily bug scan could not review any commits because `git log` reports the current branch `master` has no commits yet, `git rev-parse HEAD` fails, `.git/refs/heads/master` is absent, and `git status --short` shows the full project tree as untracked files.
- With no commit SHA, diff, PR reference, test regression, or CI signal tied to a recent change, this run skipped bug identification and code fixes to avoid inventing unsupported issues.
- Follow-up prerequisite for future scans: create and retain a baseline Git commit history so the automation can compare changes since the last run or within the last 24 hours.

## 2026-05-22 User Command Memory

- User command `/open` means: open/start the project that corresponds to the current workspace folder. For this workspace, `/open` should be interpreted as starting `D:\work2.0\SICUN-Portal` project services and providing the local access URLs.

## 2026-05-25 GitHub handoff strategy

- Recommended team isolation model: Codex development should keep `SICUN-Portal` as the private development workspace/repository, while Hermes testing should consume only a sanitized delivery repository such as `SICUN-Portal-delivery` or the generated local `D:\work2.0\SICUN-Portal_test` folder.
- User created the GitHub repositories `https://github.com/Fiee0905/SICUN-Portal-dev.git` for Codex development and `https://github.com/Fiee0905/SICUN-Portal-delivery.git` for Hermes test delivery.
- Do not give Hermes read access to the development repository if it contains Codex internal files such as `PROJECT_MEMORY.md`, `TASKS.md`, `AGENTS.md`, `pm/`, local logs, Figma exports, or bug-report work folders. GitHub read access is repository-wide enough that branch separation is not a clean confidentiality boundary.
- Added `.handoffignore`, `.github/ISSUE_TEMPLATE`, `scripts/export-test-drop.ps1`, `scripts/publish-delivery-repo.ps1`, and `docs/GITHUB_HANDOFF.md`. `export-test-drop.ps1 -Zip` regenerates `D:\work2.0\SICUN-Portal_test` and a zip under `D:\work2.0\SICUN-Portal_handoff\releases`, excluding internal files and build/dependency outputs. Hermes should feed bug reports and suggestions back through Issues in `SICUN-Portal-delivery`.
- Current verified clean delivery drop: `D:\work2.0\SICUN-Portal_test` contains only `backend`, `frontend`, `database`, `docs`, `integration`, `qa`, `scripts`, `.gitignore`, `DELIVERY_MANIFEST.md`, `docker-compose.yml`, and `README.md`; the latest zip generated during setup was `D:\work2.0\SICUN-Portal_handoff\releases\test-drop-20260525-172553.zip`.
- GitHub setup completed on 2026-05-25: pushed the development repository to `Fiee0905/SICUN-Portal-dev` branch `main`; pushed the first Hermes delivery drop to `Fiee0905/SICUN-Portal-delivery` branch `test-drop/20260525-01`. Latest local export zip after script fixes: `D:\work2.0\SICUN-Portal_handoff\releases\test-drop-20260525-173653.zip`.

## 2026-05-22 Backend bug-report-20260522 BUG-001/BUG-002

- Backend Agent fixed BUG-001 by removing the CAS callback hard-coded `teacher001/123456` login path. `POST /api/v1/auth/cas/callback` now fails closed with HTTP 401 when CAS ticket validation is not configured, and blank ticket requests fail validation without issuing any token.
- Backend Agent fixed BUG-002 by moving external CAS/LMS URLs into backend configuration. `GET /api/v1/auth/cas/login-url` now requires `portal.integrations.cas.login-url` / `PORTAL_CAS_LOGIN_URL`; missing config returns a clear configuration error. Course launch fallback now requires `portal.integrations.lms.launch-base-url` / `PORTAL_LMS_LAUNCH_BASE_URL`; missing config returns a clear configuration error instead of generating a localhost URL.
- Added backend automated tests under `backend/src/test`: invalid and blank CAS callback, CAS login URL configured/missing, LMS launch fallback missing/configured. Verification: `cd backend && mvn test` ran 6 tests and passed with `BUILD SUCCESS`; backend source scan found no `localhost:7001`, seeded smoke accounts, `123456`, `example.com`, or material mock/stub keywords in `backend/src/main/java`, `backend/src/main/resources`, or `backend/src/test`.
- Addressed the QA P3 configuration finding for the backend runtime datasource password: `spring.datasource.password` now reads `DB_PASSWORD` with no committed password fallback. Local backend runs against docker-compose MySQL must export `DB_PASSWORD` to the local MySQL password before startup.

## 2026-05-22 AI QA bug-report PM 分析与派工

- 已读取 `bug-report-20260522` 测试包，AI QA 最终结论为不通过，不建议交付、不建议上线、不建议进入正式验收交付。
- 当前最高优先级阻塞项为 `BUG-001`：`POST /api/v1/auth/cas/callback` 接受无效 CAS ticket 并签发 `teacher001/internal` token，属于认证绕过，阻塞 P09 统一身份认证、安全验收和最终发布。
- `BUG-002` 为 P2/条件阻塞项：`GET /api/v1/auth/cas/login-url` 与课程 launch fallback 仍硬编码 `localhost:7001` CAS/LMS 地址，影响校园内网、独立域名、CAS/LMS 联调和生产部署。
- 本轮 QA 同时指出后端 `mvn test` 虽 BUILD SUCCESS 但无测试源码，不能作为充分质量门禁；no-mock/no-hardcoded 门禁未通过；CMS CRUD 到前台展示闭环、内网/独立域名/真实 CAS/真实 LMS launch 缺少最终证据。
- PM 派工结论：Backend 先修复 `BUG-001` 和 `BUG-002` 并补认证/配置自动化测试；Frontend 配合 CAS 登录失败提示与课程 launch 配置错误展示；QA 复验 BUG、no-mock/no-localhost 扫描、CMS CRUD 前台同步和部署专项证据；PM 维护任务和风险门禁。

## 2026-05-09 Backend/Docs P0 核查

- 已按 Backend/Docs Agent 范围复核后端 P0：`portal_college` 已具备 `portal_college` 表、`PortalCollege` 实体、Mapper、Service、后台 `GET/POST/PUT/DELETE /api/v1/admin/colleges`、公开 `GET /api/v1/portal/colleges`，`GET /api/v1/portal/home` 也返回 `colleges`。
- 学院口径已从“课程/教师聚合生成”修正为“后台维护 `portal_college` 字典，公开接口只返回启用学院，并按当前访问者可见 `ACTIVE` 课程的 `department` 匹配计算 `count`”；旧文档中关于从课程/教师聚合学院名称的描述已修正。
- 课程 `featured` 已存在于 `course_catalog.featured`、`Course` 实体、创建/更新 DTO、`CourseQuery`、`CourseServiceImpl.pageCourses` 筛选和后台 Dashboard；首页精选课程 `data.courses` 明确使用 `featured=true + ACTIVE + 当前访问者可见 permission` 查询，`newCourses` 仍按最新课程排序。
- `GET /api/v1/admin/dashboard` 返回中文标签和 DB 统计生成的 `stats`、`activities`、`courseSamples`、`chartSeries`，源码未见乱码；接口文档已补齐 `featured` 和 `portal_college` 字段契约。
- `database/schema.sql` 包含最终展示所需的 `portal_college`、`portal_teacher`、`portal_friend_link`、`portal_page_config`、`portal_site_config`、`course_catalog.permission/featured` 等结构；`database/seed.sql` 已包含演示账号、学院、名师、轮播、友情链接、站点主题、首页模块、精选/新课课程等可展示数据。
- 验证结果：`cd backend && mvn test` 通过，Maven 输出 `BUILD SUCCESS`；当前仍无后端测试源码（`No tests to run`）。

## 2026-05-08 multiple Agents 前端业务硬编码清理

- 已开启 multiple Agents 模式，由 PM Agent 先审查前端写死业务数据，结论为 P0 数据真实性问题：生产前端不得继续使用 `@/data/mock`、`@/data/admin`、`@/data/profile` 或业务 mock fallback 展示课程、学院、公告、新闻、教师、友情链接、站点信息、Dashboard 等内容。
- Frontend Agent 已移除生产页面对上述 mock 数据文件和 `withFallback` 的依赖；首页、课程中心、门户页头页脚、个人中心、后台 Dashboard、页面配置、站点设置、课程/教师表单、友情链接表单改为消费后端接口，接口失败或空数据时展示空状态/错误状态，不再展示业务样例；不再使用的 `frontend/src/data/mock.ts`、`frontend/src/data/admin.ts`、`frontend/src/data/profile.ts` 已删除。
- Backend Agent 已补齐去 mock 所需接口：`GET /api/v1/portal/colleges`、`GET /api/v1/portal/course-categories`、`GET /api/v1/portal/course-levels`、`GET /api/v1/portal/external-links`；`GET /api/v1/portal/home` 增加 `colleges` 和 `externalLinks`；`GET /api/v1/admin/dashboard` 改为返回 DB 统计生成的 `stats`、`activities`、`courseSamples`、`chartSeries`。
- QA Agent 已新增 `qa/NO_MOCK_BUSINESS_DATA_ACCEPTANCE.md`，覆盖源码检查和断开接口、清空数据库、禁用内容后的“不得出现假业务数据”专项验收。
- 接口文档已同步 `docs/API.md` 与 `docs/api-spec.md`。主控复验：`frontend/src` 内无 `@/data/mock`、`@/data/admin`、`@/data/profile`、`withFallback`、`FALLBACK_*_CATEGORY`、`categoryId: 数字` 等业务 fallback 命中；`frontend npm.cmd run build` 通过，保留既有 Vite 大 chunk 警告；`backend mvn test` 通过，当前仍无后端测试源码。

## 2026-05-08 后台院系选择约束

- 课程管理新增/编辑表单的“开课院系”已从文本输入改为下拉选择，选项复用前台 `frontend/src/data/mock.ts` 的 `colleges` 列表，不允许自定义院系。
- 名师风采新增/编辑表单的“学院”同样改为下拉选择，复用同一份前台学院列表，保证后台维护数据与前台筛选/展示口径一致。

## 2026-05-08 首页查看更多页面闭环

- 已为首页“教务公告与学术资讯”“新闻资讯”“名师风采”补齐前台查看更多页面，避免首页摘要数量限制导致内容发布多后无法完整浏览。
- 新增前台路由：`/notices`、`/news`、`/teachers`；首页对应入口已从普通按钮改为可点击路由链接。
- `/notices` 页面使用页签分别读取 `GET /api/v1/portal/categories/notice/articles` 与 `GET /api/v1/portal/categories/topic/articles`，覆盖教务公告与学术资讯。
- `/news` 页面读取 `GET /api/v1/portal/categories/news/articles`；`/teachers` 页面读取 `GET /api/v1/portal/teachers`，继续只展示后台启用的真实数据。

## 2026-05-08 首页内容真实数据闭环

- 已去除首页名师风采对 `frontend/src/data/mock.ts` 的回退依赖，首页 `teachers` 只消费 `/api/v1/portal/home` 返回的真实数据；空数据展示空态。
- 已新增名师风采后台闭环：`portal_teacher` 表、`GET/POST/PUT/DELETE /api/v1/admin/teachers`、`GET /api/v1/portal/teachers`，首页聚合接口返回 `teachers`。
- 已新增新闻资讯后台入口 `/admin/news`，复用文章体系并固定 `categoryCode=news`，与公告 `categoryCode=notice` 分离；首页新闻只展示已发布新闻。
- 已补齐首页 `newCourses`：从真实课程表读取 `ACTIVE` 且当前访问者可见的课程，按 `createdAt desc, id desc` 取最新 4 条。
- 验证结果：`backend mvn test` 通过，`frontend npm run build` 通过；真实冒烟结果为 `teacherHit=1 teacherAfterDisable=0 newsHit=1 newsAfterOffline=0 newCourseCount=4`，新课顺序为最新课程 5、4、3、2。

## 2026-05-07 课程封面地址与上传体验修复

- 课程封面地址与轮播图片地址规则一致：浏览器只能加载 URL，不能加载 Windows 本机磁盘路径。`frontend/public/banners/portal-home4.jpg` 对应前台 URL 为 `/banners/portal-home4.jpg`。
- 课程跳转地址 `launchUrl` 可填写第三方完整地址，例如 LMS、雨课堂、Bilibili 或其他课程平台 URL；也可以填写站内路径，例如 `/courses/1`，用于点击课程后跳转。
- 已在课程管理封面地址旁增加上传按钮，上传成功回填 `/api/uploads/courses/{date}/{file}`；保存前也会自动把 `C:\...\frontend\public\...` 转成 `/...`。

## 2026-05-07 友情链接前台排版调整

- 友情链接排序字段用于控制前台展示顺序，后端按 `sortOrder` 升序返回，数字越小越靠前。
- 已将首页友情链接从横向紧挨展示调整为单列列表，每条链接独立成行，并增加卡片间距、边框和 hover 状态，避免多个链接贴在一起。

## 2026-05-07 友情链接新增保存失败修复

- 友情链接新增失败的直接原因是前端表单从编辑/旧数据状态进入新增时没有清理残留 `id`，`POST /admin/friend-links` 携带已有主键，数据库报 `Duplicate entry '1' for key 'portal_friend_link.PRIMARY'`。
- 已修复 `AdminFriendLinksView` 新增保存 payload，不再携带旧 `id`；后端 `createFriendLink` 也会强制 `setId(null)`，避免客户端误传 id 导致新增失败。
- 已复测：故意携带 `id=1` 调用 `POST /api/v1/admin/friend-links` 仍可创建新记录，并能通过 `GET /api/v1/portal/friend-links` 读取。

## 2026-05-07 管理员轮播上传与保存失败修复

- 管理员轮播新增保存失败的直接原因是前端表单从编辑切到新增时旧 `id` 未清除，导致 `POST /admin/banners` 携带已有主键并触发数据库 `Duplicate entry`。已修复新增重置表单时清理残留字段。
- 已新增管理员图片上传接口 `POST /api/v1/admin/uploads/images`，支持 jpg/jpeg/png/webp/gif，单文件最大 5MB；文件保存到后端 `uploads/{folder}/{date}`，通过 `/api/uploads/**` 访问。
- 轮播管理页面已增加“上传”按钮，上传成功后自动回填图片地址；图片地址保存前仍会归一化本机 public 路径和反斜杠路径。
- 排序字段用于控制首页轮播播放顺序，数字越小越靠前，同数字时由后端按 id 倒序辅助排序。

## 2026-05-07 首页轮播图片路径修复

- 发现后台轮播图如果填写 Windows 本机路径，例如 `C:\Users\...\frontend\public\banners\portal-home1.jpg`，浏览器无法作为图片 URL 加载；正确写法应为 Vite public 目录映射后的网页路径，例如 `/banners/portal-home1.jpg`。
- 已将 `frontend/public/banners/portal-home1.jpg`、`portal-home2.jpg`、`portal-home3.jpg` 配置为首页 `HOME_TOP` 启用轮播，`GET /api/v1/portal/home` 当前返回三条有效轮播。
- 已在后台轮播表单保存前增加图片地址归一化：粘贴 `frontend/public/...` 本机路径时会自动转换为 `/...` 网页路径，减少保存后前台不显示的问题。

## 2026-05-07 Backend Worker admin-to-portal data chain check

- Checked the backend data chain for banners, courses, and notices/news from admin write APIs to public portal APIs.
- Banner compatibility was tightened: `/api/v1/admin/banners` create/update now normalizes blank `position` and legacy `home` to `HOME_TOP`; admin list filtering also accepts `position=home`; public banner service normalizes position before querying.
- Confirmed public homepage banners read real `portal_banner` rows through `PortalBannerService.activeBanners("HOME_TOP")` and filter `enabled=true`, `position=HOME_TOP`, and current `startAt/endAt` validity.
- Confirmed admin courses with `status=ACTIVE` and `permission=public` are visible to anonymous users through `/api/v1/portal/courses` and `/api/v1/portal/home.courses`.
- Confirmed admin articles created with `categoryCode=notice` become visible through `/api/v1/portal/home.notices` and `/api/v1/portal/categories/notice/articles` only after `PUBLISHED` status.
- API docs were synchronized in `docs/API.md` and `docs/api-spec.md` for public display fields and filtering contracts. Verification: `backend` `mvn test` passed. After Docker was started, MySQL/Redis were confirmed up, backend jar started on `http://localhost:8080/api`, and real smoke CRUD passed: temp banner `position=home` was stored as `HOME_TOP` and appeared in `/portal/home.banners`; temp `ACTIVE/public` course appeared in `/portal/courses`; temp `categoryCode=notice` article appeared in `/portal/categories/notice/articles` after publish. Smoke rows were deleted after verification.

## 2026-05-07 PM 人工测试报告优先级判断

- 已读取人工测试报告 `C:\Users\86199\Desktop\测试报告-功能项验证.xlsx`，Sheet1 共 19 条功能项验证结果。
- 当前主要验收阻塞集中在 Admin/CMS 可维护闭环，而不是门户展示、认证、检索等前台基础能力。
- 已通过项作为回归保护：门户页面定制、本地化部署、主题切换、统一身份认证、校外注册、课程检索、多维筛选、课程权限、第三方入口。
- P0 阻塞项：CMS 页面配置不可修改、课程模块无详情跳转、课程管理无法 CRUD、通知公告无法 CRUD、新闻资讯无法 CRUD、友情链接无法 CRUD 且前台不展示、站点信息无法维护。
- P1 阻塞项：导航栏管理缺失、操作日志后台窗口缺失、模块管理仅部分通过。
- 下一轮 multiple Agents 聚焦“管理员后台增删改查 -> 前台公开展示/跳转 -> QA 复测通过”的闭环，所有新增或变更接口必须同步 `docs/API.md` 和 `docs/api-spec.md`。

## 2026-05-07 multiple Agents 最小可见闭环实现

- 已进入真正 multiple Agents 实现模式：主线程完成后端友情链接接口、数据库脚本和接口文档；Frontend Worker 完成前端后台友情链接、站点信息展示/保存和课程详情页；QA Worker 完成 `qa/MINIMAL_VISIBLE_CLOSURE_ACCEPTANCE.md`。
- 友情链接闭环：新增 `portal_friend_link` 表、`PortalFriendLink` 实体/Mapper/Service，新增 `GET /api/v1/portal/friend-links` 与 `GET/POST/PUT/DELETE /api/v1/admin/friend-links`；`GET /api/v1/portal/home` 聚合返回 `friendLinks`。`database/seed.sql` 已写入验收样例“四川师范大学官网 https://www.sicnu.edu.cn 排序1 启用”。
- 站点信息闭环：`portal_site_config` 补充 `site.description`、`site.copyright`、`site.icp`、`site.contactPhone`、`site.contactEmail`、`site.address` 等页头/页脚字段；前端后台设置页可保存，门户布局和首页读取展示。
- 课程详情闭环：前端新增 `/courses/:id` 详情页，首页/课程列表课程卡片可跳转详情；详情页调用 `GET /portal/courses/{id}` 展示课程，并通过 `POST /portal/courses/{id}/launch` 进入课程。后端 launch 已调整为未登录返回 401，登录后继续按课程 `permission` 矩阵判断 403/200。
- 接口文档已同步 `docs/API.md` 与 `docs/api-spec.md`。验证结果：`backend` 下 `mvn test` 通过；`frontend` 下 `npm run build` 通过，仍保留既有 Vite 大 chunk 警告。

## 2026-05-07 multiple Agents CMS 管理 CRUD 闭环实现

- 已开启真正 multiple Agents 并行执行：Backend Worker 补齐/核查课程、轮播、公告、用户后端 CRUD；Frontend Worker A 完成课程管理和轮播管理前端 CRUD；Frontend Worker B 完成公告管理和用户管理前端 CRUD；QA Worker 新增 `qa/CMS_ADMIN_CRUD_ACCEPTANCE.md`。
- 课程管理闭环：`/api/v1/admin/courses` 支持列表、创建、详情、更新、删除；前端 `/admin/courses` 支持搜索/状态筛选、创建、编辑、删除/下架；前台 `/portal/courses` 和 `/portal/courses/{id}` 会同步 active 且有权限的课程。
- 轮播管理闭环：`/api/v1/admin/banners` 支持 CRUD 并补默认值；前端 `/admin/banners` 支持创建、编辑、删除、启停；前台 `/portal/home.banners` 只聚合启用且有效期内的轮播。
- 公告管理闭环：`/api/v1/admin/articles` 支持 `categoryCode=notice` 创建/更新公告；公告发布 `publish` 可直接将草稿/审核/下线等状态发布为 `PUBLISHED`，前台 `/portal/home.notices` 与 `/portal/categories/notice/articles` 只展示已发布公告。主控补修了公告创建 `slug` 必填问题，后端会自动生成 slug 并允许公告表单不填写 slug。
- 用户管理闭环：`/api/v1/admin/users` 支持列表、创建、详情、更新、删除，新增 `/api/v1/admin/users/{id}/status` 状态切换；前端 `/admin/users` 支持筛选、创建、编辑、删除、启用/禁用。
- 验证结果：`backend` 下 `mvn test` 通过；`frontend` 下 `npm run build` 通过，保留既有 Vite 大 chunk 警告；主控接口冒烟已通过课程、轮播、公告、用户四类创建/同步/清理流程。

## 2026-05-07 PM 前后台 CRUD 同步阻塞判断

- 用户反馈管理员后台课程、轮播、公告增删改查后前台未同步。PM 判断为 P0 验收阻塞，影响 P01 门户首页、P05 CMS 后台、P11 课程检索、P13 内容模块展示和 QA-P0-02 前后台同步验收。
- 代码事实：后台课程/轮播/公告页面调用真实 `/admin/courses`、`/admin/banners`、`/admin/articles`；前台首页/课程页调用 `/portal/home`、`/portal/courses`，但仍存在 mock fallback 和空数组回退 mock。
- 明确风险：`AdminBannersView` 默认 position 为 `home`，而后端首页只读取 `HOME_TOP`；首页公告/新闻直接使用 mock 字段结构，未对后端 `CmsContent` 字段归一化；课程与公告还受 `ACTIVE/public/PUBLISHED` 等公开过滤规则影响。
- 修复优先级：先修轮播同步，再处理公告字段归一化与发布闭环，最后复测课程同步与权限过滤。验收标准是后台新增/编辑/禁用/删除后，前台硬刷新展示与 `/portal/home`、`/portal/courses` 公开接口一致，且不出现 mock 假数据。

## 2026-05-06 Auth/permission 联调复验结果

- 已完成注册登录与权限区分最小闭环复验：本地 MySQL 已补齐 `admin`/`student001`/`teacher001`/`outside001` 四个演示账号，密码均为 `123456`，角色分别为 `admin`、`internal`、`internal`、`external`。
- 修正 `database/seed.sql` 固定演示 id 的导入策略：当旧库已有 id=2/3/4 的历史账号时，`ON DUPLICATE KEY UPDATE` 现在会同步覆盖 `username`，避免 student/outside 账号缺失。
- 已重启新版后端并完成接口矩阵：不存在账号登录返回 401；`admin` 登录返回 `role=admin`；`student001` 返回 `role=internal`；`outside001` 返回 `role=external`；游客/校外用户只看到 `public` 课程，校内用户看到 `public,internal`，管理员看到 `public,internal,private`；校外用户访问 `/api/v1/admin/site-config` 返回 403，管理员访问返回 200。
- 最终验证：`backend` 下 `mvn test` 通过（当前仍无测试源码）；`frontend` 下 `npm run build` 通过，仍保留既有 Vite 单 chunk 超过 500 kB 提示。

## 2026-05-06 Frontend Auth Worker auth/admin cleanup

- Frontend login now calls `authApi.login` and saves `accessToken`, optional `refreshToken`, user info, permissions, and normalized `role` in `authState`.
- Admin route guard allows `/admin/*` only when the saved role is exactly `admin`; anonymous users are sent to `/login?redirect=...`, and non-admin users are sent to `/403`.
- Legacy CMS frontend has been removed from the active UI: `/cms/*` only redirects to `/admin/dashboard`, the old CMS menu item is gone, and unused legacy CMS layout/view files were deleted.
- Register now captures external-user organization, validates password confirmation, submits `/auth/register`, then shows an external-user success message and routes to `/login`.
- Verification: `npm run build` passed under `frontend`, with the existing Vite large chunk warning.

## 2026-05-06 Backend Auth Worker minimum auth/permission loop

- Backend auth now uses `sys_user` for local login and issues development Bearer tokens through `AuthSession`; `/api/v1/users/me` and profile update resolve the current user from `Authorization: Bearer <token>` instead of the old `X-User-Id` fallback.
- Admin backend protection is enforced by `AdminAuthInterceptor` for `/api/v1/admin/**`: missing token returns 401 and non-`admin` role returns 403.
- User `role` values are fixed as `admin`, `internal`, and `external`; course `permission` values are fixed as `public`, `internal`, and `private`.
- Portal course visibility contract: anonymous/external users see `public`, internal users see `public` and `internal`, admins see all three. Course create/update rejects unsupported `permission` values.
- `database/seed.sql` was repaired as an importable seed script with accounts `admin`/`student001`/`teacher001`/`outside001` and sample courses for all three permission levels. `database/schema.sql` includes ALTER notes for existing local databases missing `sys_user.role` or `course_catalog.permission`.
- API docs updated in both `docs/API.md` and `docs/api-spec.md`. Verification: `mvn test` under `backend` returned BUILD SUCCESS with no test sources.

## 2026-05-06 Frontend Auth Worker 注册登录与旧 CMS 收敛
- 前端已新增/收敛真实会话管理：`authState.saveSession` 保存 `/auth/login` 返回的 `accessToken`、`refreshToken` 和用户信息，并从 `user.role`、`user.roles[0]` 或顶层 `roles[0]` 归一化得到小写 `role`。
- `/admin/*` 路由守卫仅允许已登录且 `role=admin` 的用户访问；未登录访问后台跳 `/login?redirect=...`，普通用户访问后台跳 `/403`。
- 旧版 `/cms/*` 前端路由已从独立 CMS 布局和页面路由收敛为统一重定向 `/admin/dashboard`；新版后台菜单已删除“旧版 CMS”入口。
- 登录页调用 `authApi.login` 后保存真实会话：管理员默认进入 `/admin/dashboard`，普通用户默认进入 `/profile`，带 redirect 时按 redirect 跳转并继续由路由守卫兜底。
- 注册页按校外用户注册闭环补充 `organization` 和确认密码校验，成功后提示校外用户账号已提交并跳转 `/login`。

## 2026-05-06 QA 注册登录与权限专项验收补充

- QA Agent 已新增 `qa/AUTH_PERMISSION_ACCEPTANCE.md`，覆盖注册登录、role 权限、课程 permission、后台 CMS 权限、删除旧版 CMS 的影响评估，并给出手工测试矩阵、阻塞项、证据要求和 Go/No-Go 标准。
- QA 当前结论：注册/登录、`/users/me`、公开课程列表等可先做冒烟；P09/P10 正式验收仍依赖真实密码哈希、token/refresh/logout、CAS 校验、用户状态流转和权限码拦截。
- 后台权限风险继续保持高优先级：`/admin/*`、课程 launch、CMS 配置/内容写接口必须由后端强制 `401/403/200` 权限判定，前端菜单隐藏或 mock fallback 不能作为通过证据。
- 若 Frontend/PM 后续删除或收敛旧版 `/cms/*` 后台入口，QA 必须按 `LEGACY-CMS-*` 矩阵验证旧路由跳转/拒绝、无敏感 mock 数据、无死链、无权限绕过，且 `/admin/*` 配置闭环仍可用。

## 2026-05-06 PM 专项：注册登录、权限区分与旧版 CMS 清理

- PM Agent 已新增专项产物 `pm/AUTH_PERMISSION_CMS_CLEANUP_SCOPE.md`，明确“注册登录和权限区分最小闭环 + 删除旧版 CMS”的一期范围、暂不纳入范围、验收标准、任务拆分和风险处理建议。
- 一期最小闭环口径：校外用户可注册、登录、退出，并可获取当前用户信息；至少区分游客、普通登录用户、管理员三类身份；管理后台和 CMS 配置入口仅管理员可访问；门户首页、课程检索、新闻公告、友情链接等公开能力保持匿名可访问。
- 旧版 CMS 清理口径：验收入口应统一到新版后台/Admin/CMS 路径，删除或下线旧版 CMS 菜单、路由和入口；如暂不能删除，必须标记废弃并提供迁移映射，避免双后台入口和不同配置数据源干扰验收。
- 验收标准已同步进 `TASKS.md`：游客访问后台应登录拦截或 401/403，普通用户访问后台应 403，管理员可访问后台配置；注册-登录-当前用户-退出必须能连续执行；接入鉴权后不得破坏 P01/P07/P08/P11/P12/P13 既有公开门户和配置能力。
- 风险已补充到 `TASKS.md`：R08 注册登录未形成连续闭环、R09 仅前端隐藏菜单但后端未鉴权、R10 旧版 CMS 与新版后台并存、R11 游客公开门户被鉴权误拦截。
- 本次仅维护 PM 任务、项目记忆和 PM 产物，不改业务代码、不新增接口实现；后续 Frontend/Backend/QA 需按该专项口径补实现、接口文档和测试用例。

## 2026-05-06 本地完整环境启动结果

- 已启动并验证完整本地环境：Docker Compose 中 `edu-portal-mysql` 监听 `localhost:3306`，`edu-portal-redis` 监听 `localhost:6379`；Spring Boot 后端监听 `http://localhost:8080/api`；Vite 前端监听 `http://localhost:5173`，当前浏览器可访问 `/courses`。
- 后端启动方式已补充为可执行 jar 后台启动：先在 `backend` 下执行 `mvn -DskipTests package`，再执行 `java -jar backend/target/backend-0.0.1-SNAPSHOT.jar`。保留 `scripts/run-backend.ps1` 作为 Maven `spring-boot:run` 启动脚本，但本次最终采用 jar 方式稳定运行。
- 数据库 Docker volume 中缺少新版门户配置表和数据，已先执行 `database/schema.sql` 补齐表结构，并手动写入 `portal_page_config(home)`、`theme.primary`、`theme.primaryDark`、`theme.dark`、`course.search.keywords` 最小联调数据。`database/seed.sql` 当前存在历史乱码/引号问题，不适合直接整文件导入，后续需要单独修复种子脚本。
- 本次联调修复两个后端运行时问题：`CourseServiceImpl.pageCourses` 在 `termCode=null` 时不再触发空指针；`PortalController.home()` 不再使用不支持 null value 的 `Map.of` 组装响应，避免首页配置为空时 500。
- 为方便排查联调错误，`GlobalExceptionHandler` 已记录未捕获异常堆栈。当前已验证 `GET /api/v1/portal/home`、`GET /api/v1/portal/courses?page=1&size=10`、`GET /api/v1/portal/page-config/home`、`GET /api/v1/portal/search-keywords` 均返回 HTTP 200。

## 2026-05-06 multiple agents 配置闭环推进

- PM Agent 已生成最新项目进度报告：`pm/PROGRESS_REPORT.md`，覆盖总体进度、P01-P13 最新状态、角色任务状态、风险阻塞和下一步并行计划。
- Frontend Agent 已完成前端范围内最小可用 CMS 配置保存入口：`/admin/page-config` 可编辑首页 9 个模块开关和主题色，`/admin/settings` 可编辑并保存站点/主题配置，`/cms/pages` 增加跳转入口。相关进展写入 `frontend/BASELINE.md`。
- Backend Agent 已补齐门户配置保存小缺口：`PUT /admin/site-config` 在 `siteCode` 为空时默认写入 `main`；`GET /admin/page-config/{pageCode}` 后台读取不再受 `enabled=true` 限制，便于 CMS 编辑和恢复已停用页面配置。相关进展写入 `backend/BASELINE.md`，并同步 `docs/api-spec.md`。
- QA Agent 已生成 P07/P08 专项验收清单：`qa/CONFIG_ACCEPTANCE.md`，覆盖模块显示隐藏、主题切换、API 测试、页面测试、数据准备、恢复基线和 Go/No-Go 标准。
- 主控复验：后端 `mvn test` 通过，仍无测试源码；前端 `npm run build` 通过，仍有 Vite 主 chunk 超过 500 kB 提示。
- 当前判断：P07/P08 已具备“后台配置入口 + 后端保存接口 + 前台消费配置 + QA 验收清单”，但尚未在完整 MySQL/Redis/后端/前端环境执行真实 hide/restore/theme 联调，因此仍保持待联调/待验收前状态。

## 2026-05-06 模块开关与主题配置推进

- 前端首页已接入 `home.pageConfig.layoutJson.sections`。支持 `banner`、`quickLinks`、`colleges`、`courses`、`newCourses`、`teachers`、`notices`、`news`、`friendLinks` 模块按 `enabled=false` 或 `visible=false` 隐藏；未配置 sections 时默认全部展示。
- 前端已接入门户主题配置：`theme.primary`、`theme.primaryDark`、`theme.dark` 会分别写入 CSS 变量 `--portal-primary`、`--portal-primary-dark`、`--portal-dark`。`PortalLayout` 和首页加载站点配置后都会应用主题。
- `database/seed.sql` 已将首页 `portal_page_config.layout_json` 调整为模块对象数组，并补充默认主题色配置。
- 已同步 `docs/API.md` 和 `docs/api-spec.md`，明确模块开关 JSON 契约和主题配置键。
- 已更新 `TASKS.md`：FE06 标记为已完成，BE03 标记为部分覆盖，P07/P08 推进到待联调。
- 验证结果：后端 `mvn test` 通过，仍无测试源码；前端 `npm run build` 通过，仍有 Vite 主 chunk 超过 500 kB 提示。

## 2026-05-06 下一步推进结果

- 已处理接口文档口径风险：新增 `docs/API.md` 作为根规则要求的接口文档入口，详细 API 规范继续维护在 `docs/api-spec.md`。
- 已新增预设课程检索关键词接口：`GET /api/v1/portal/search-keywords`，数据来源为 `portal_site_config` 中 `course.search.keywords`，支持英文逗号、中文逗号或换行分隔，最多返回 12 个去重关键词。
- 已在 `database/seed.sql` 增加 `course.search.keywords` 初始配置。
- 已在前端课程中心接入预设关键词展示和点击检索，并增加后端课程字段到前端课程卡片字段的归一化逻辑，避免真实后端字段 `courseName/teacherName/coverUrl/description` 与前端 `title/teacher/cover/summary` 不一致导致卡片空白。
- 已同步 `docs/api-spec.md`，并更新 `TASKS.md`：P12、FE03、BE04 推进为“部分覆盖”，PM03 标记为已完成。
- 验证结果：后端 `mvn test` 通过，仍无测试源码；前端 `npm run build` 通过，仍有 Vite 主 chunk 超过 500 kB 提示。

## 2026-05-06 multiple agents 并行基线结果

- PM Agent 已完成教学门户 13 项功能覆盖矩阵，产物为 `pm/COVERAGE_MATRIX.md`。结论：13 项功能均可追踪，大多处于“部分覆盖”，重点待确认为校园内网、独立域名、统一身份认证、预设检索关键词。
- Frontend Agent 已完成前端基线梳理，产物为 `frontend/BASELINE.md`。现有前端为 Vue 3 + Vite + TypeScript + Element Plus，已有门户、课程中心、登录注册、Admin 后台、CMS 后台和 mock fallback。已执行 `npm run build`，构建成功，但有主 chunk 超过 500 kB 的 Vite 提示。
- Backend Agent 已完成后端基线梳理，产物为 `backend/BASELINE.md`。现有后端为 Spring Boot 3.2.5 + Java 17 + MyBatis-Plus + MySQL/Redis，已有门户聚合、课程查询、CMS 栏目/文章、轮播/快捷入口/站点配置、用户管理、审计日志、课程后台 CRUD 等接口基础。已执行 `mvn test`，结果 BUILD SUCCESS，但当前无测试源码。
- QA Agent 已完成初版验收清单，产物为 `qa/ACCEPTANCE_CHECKLIST.md`。QA 判断 P06 栏目配置、P11 课程关键词检索可优先执行；P03 校园内网、P04 独立域名、P09 统一身份认证、P12 预设检索关键词当前阻塞或待确认。
- 当前项目状态已从“仅任务拆分”推进到“基线已建立、功能部分覆盖、等待真实联调闭环”。下一优先级建议：FE02 门户首页模块化、BE02/BE03 CMS 与门户配置接口、BE04 课程检索补齐、PM03 接口文档口径统一、QA02 接口测试用例。

## 2026-05-06 更新

- 已初始化 `TASKS.md`，补齐教学门户 13 项功能拆分、前后端任务、PM 任务、QA 任务、里程碑和风险清单。
- 已补齐 `frontend/AGENTS.md`、`backend/AGENTS.md`、`pm/AGENTS.md`、`qa/AGENTS.md`，分别约定前端、后端、项目经理、测试验收的专属工作规则。
- 当前存在接口文档命名差异：根 `AGENTS.md` 要求新增接口同步到 `docs/API.md`，但仓库现有接口文档为 `docs/api-spec.md`。在统一口径前，任务文件建议优先维护现有 `docs/api-spec.md`，并将“接口文档命名统一”列为 PM 风险项。

## 项目背景

本项目为四川师范大学教学门户/课程资源平台，需要结合投标文件技术方案落地实现。

## 已确定技术方向

- 前端页面已经完成基础实现。
- 后续重点是功能联调、后台配置、认证、检索、课程展示和验收覆盖。
- 系统需支持本地化部署、校园内网访问、独立域名。
- 门户需支持 CMS 后台配置栏目、模块显示隐藏、主题配色切换。
- 需支持统一身份认证和非校内用户登录/注册。

## 当前模块

### 教学门户模块

必须覆盖：
1. 个性化门户页面
2. 本地化部署
3. 校园内网访问
4. 独立域名
5. CMS 后台
6. 栏目配置
7. 模块显示隐藏
8. 多主题配色
9. 统一身份认证
10. 校外用户登录注册
11. 课程关键字检索
12. 预设检索关键词
13. 课程轮播、课程分类、通知公告、新闻资讯、推荐课程、新课速递、名师风采、友情链接
