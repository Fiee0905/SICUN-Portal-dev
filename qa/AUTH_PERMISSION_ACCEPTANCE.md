# 注册登录与权限专项 QA 验收清单

Version: v0.1
Owner: QA Agent
Date: 2026-05-06
Scope: 注册登录、role 权限、课程 permission、后台 CMS 权限、删除旧版 CMS 的影响评估。

## 1. 验收目标

本清单用于补齐 P05、P09、P10、P11、P13 相关的认证与授权验收口径。当前后端基线明确存在开发态认证风险：`/auth/login`、`/auth/register`、CAS callback、refresh/logout 和后台 `/admin/*` 权限拦截尚未形成真实闭环，因此本文件先定义可执行矩阵、证据要求和阻塞判定，待 Backend/Frontend 完成权限实现后直接执行回归。

验收原则：

- 后端权限判定是准入标准，前端隐藏菜单只能作为体验校验。
- 任意未登录访问后台或课程受限操作，必须返回 `401` 或等价 `AUTH_REQUIRED`。
- 任意已登录但缺少权限访问后台、CMS、课程管理或课程跳转，必须返回 `403` 或等价 `FORBIDDEN`。
- 被拒绝的写操作不得改变数据库状态；重要拒绝应在运行日志或安全日志中可追踪。
- 删除或收敛旧版 CMS 页面后，入口、路由、菜单、接口调用、mock fallback 和历史文档都不得继续指向废弃闭环。

## 2. 角色与权限基线

| Persona | 用户状态 | 角色/权限要求 | 主要验收用途 |
| --- | --- | --- | --- |
| Anonymous | 未登录 | 无 token | 公开门户可读；后台和受限课程操作拒绝。 |
| External Pending | `PENDING_REVIEW` | 无后台权限 | 注册成功后不得访问受限资源。 |
| Portal User | `ACTIVE` | 基础门户权限，可选课程跳转权限 | 课程浏览、课程详情、允许范围内 launch。 |
| Course Manager | `ACTIVE` | `course:read`、`course:update`、必要时 `course:sync` | 后台课程列表、编辑、同步入口。 |
| CMS Editor | `ACTIVE` | `cms:category:read`、`cms:article:create/update/submit`、部分 `portal:config:read` | CMS 内容编辑和提交审核。 |
| CMS Reviewer | `ACTIVE` | `cms:article:read/approve/publish` | 审核、发布、下线，不应编辑系统权限。 |
| Portal Config Admin | `ACTIVE` | `portal:config:read/update` | 首页模块开关、主题、轮播、快捷入口。 |
| Super Admin | `ACTIVE` | `sys:*`、`cms:*`、`portal:*`、`course:*` | 全量后台、用户、角色、权限验收。 |
| Disabled User | `DISABLED` | 任意历史权限均失效 | 登录、刷新 token、已签发 token 访问均拒绝。 |

执行前必须确认测试账号、用户 ID、角色码、权限码和初始状态。若仍使用 `X-User-Id` 或开发 token 替代真实认证，结论只能记为“阻塞/开发态冒烟”，不能记为正式通过。

## 3. 手工测试矩阵

### 3.1 注册登录与会话

| ID | 场景 | 前置条件 | 步骤 | 预期结果 | 当前判定 |
| --- | --- | --- | --- | --- | --- |
| AUTH-001 | 校外用户注册成功 | 用户名、邮箱、手机号不存在 | 打开 `/register` 或调用 `POST /api/v1/auth/register`，提交强密码和必填资料。 | 返回统一 envelope；用户状态为 `PENDING_REVIEW`；密码不明文返回或存储；可在后台用户列表看到待审核用户。 | 待执行；需真实密码存储口径。 |
| AUTH-002 | 注册唯一性 | 已存在用户名/邮箱/手机号 | 使用重复字段再次注册。 | 返回 `409 CONFLICT` 或字段校验错误；不新增重复用户。 | 待执行。 |
| AUTH-003 | 注册弱密码/缺字段 | 无 | 提交弱密码、空用户名、非法邮箱/手机号。 | 返回 `400 VALIDATION_FAILED`；错误提示可定位字段；无脏数据。 | 待执行。 |
| AUTH-004 | 待审核用户登录 | AUTH-001 用户未审核 | 调用 `POST /auth/login`。 | 登录被拒或仅返回受限状态；不得获得可访问后台/课程受限资源的 token。 | 阻塞；当前登录为开发态。 |
| AUTH-005 | 审核通过后登录 | 管理员将用户改为 `ACTIVE` | 登录并调用 `GET /users/me`。 | 返回 token；`/users/me` 返回正确 user、roles、permissions；前端展示登录态。 | 待执行。 |
| AUTH-006 | 禁用用户登录 | 用户状态 `DISABLED` | 调用登录、refresh，并使用旧 token 访问 `/users/me`。 | 全部拒绝；旧会话失效或按策略不可继续访问。 | 阻塞；需会话/黑名单策略。 |
| AUTH-007 | 登出 | ACTIVE 用户已登录 | 调用 `POST /auth/logout`，再访问 `/users/me` 和后台接口。 | logout 成功；access/refresh token 失效；后续访问返回 `401`。 | 阻塞；当前 logout 未落会话。 |
| AUTH-008 | CAS 登录 URL | CAS 配置存在 | 调用 `GET /auth/cas/login-url?redirectUri=...`。 | 返回编码正确的 CAS 登录地址；service 与独立域名/本地域名匹配。 | 可冒烟。 |
| AUTH-009 | CAS callback 正常 | CAS mock 或真实 ticket | 调用 `POST /auth/cas/callback`。 | 校验 ticket，绑定或创建本地用户，返回 token 和用户信息。 | 阻塞；当前 callback 未真实校验。 |
| AUTH-010 | CAS ticket 负向 | 无效、过期、重放 ticket | 分别调用 callback。 | 返回 `401` 或 `502`；不创建异常用户；日志不泄露 ticket/token。 | 阻塞；需 CAS mock/真实协议。 |

### 3.2 Role 与 Permission

| ID | 场景 | 前置条件 | 步骤 | 预期结果 | 当前判定 |
| --- | --- | --- | --- | --- | --- |
| PERM-001 | 未登录访问后台 API | 无 token | 调用 `GET /admin/users`、`GET /admin/page-config/home`、`GET /admin/articles`。 | 全部返回 `401 AUTH_REQUIRED`；不返回敏感数据。 | 阻塞；当前后台接口可能无鉴权。 |
| PERM-002 | 普通门户用户访问后台 | Portal User token | 调用后台读写接口。 | 返回 `403 FORBIDDEN`；数据库无变化。 | 阻塞。 |
| PERM-003 | `GET /users/me` 权限声明 | 各 persona token | 分别调用 `/users/me`。 | 返回角色码和权限码与数据库 `sys_user_role/sys_role_permission` 一致。 | 可部分验证；当前支持 `X-User-Id`。 |
| PERM-004 | 角色权限变更生效 | Super Admin；目标用户已登录 | 修改用户角色或角色权限后复查目标用户后台访问。 | 权限按约定在重新登录、刷新 token 或缓存失效后生效；旧权限不无限期保留。 | 阻塞；角色权限 CRUD 待确认。 |
| PERM-005 | 缺失权限默认拒绝 | 构造无权限角色 | 访问未授予的后台接口。 | 默认拒绝，而不是默认放行。 | 阻塞。 |
| PERM-006 | 前端路由守卫 | 各 persona 登录前端 | 直接访问 `/admin/*`、`/cms/*`、`/forbidden`。 | 无权限用户看不到敏感数据，跳转登录或 403；刷新页面行为一致。 | 待执行；需警惕 mock auth。 |
| PERM-007 | 菜单可见性 | 各 persona 登录前端 | 查看后台菜单和操作按钮。 | 菜单/按钮与权限匹配；隐藏不替代后端拒绝。 | 待执行。 |

### 3.3 课程 Permission

| ID | 场景 | 前置条件 | 步骤 | 预期结果 | 当前判定 |
| --- | --- | --- | --- | --- | --- |
| COURSE-PERM-001 | 公开课程列表 | 存在 ACTIVE/INACTIVE 课程 | 匿名和登录用户调用 `GET /portal/courses`。 | 只返回可公开 ACTIVE 课程；停用/隐藏课程不泄露。 | 可测。 |
| COURSE-PERM-002 | 课程详情过滤 | 存在 ACTIVE 与非 ACTIVE 课程 | 分别访问 `/portal/courses/{id}`。 | ACTIVE 正常；非公开课程返回 404 或无权限，不泄露详情。 | 可测。 |
| COURSE-PERM-003 | 课程 launch 未登录 | 无 token | 调用 `POST /portal/courses/{id}/launch`。 | 返回 `401`；不生成跳转 token。 | 阻塞；当前未校验登录态。 |
| COURSE-PERM-004 | 课程 launch 无映射 | Portal User 无 course mapping | 调用 launch。 | 返回 `403` 或业务拒绝；不返回 LMS launch URL。 | 阻塞；映射校验待实现。 |
| COURSE-PERM-005 | 课程 launch 有权限 | Portal User 有映射/选课 | 调用 launch。 | 返回短期有效 `launchUrl` 和 `expiresAt`；URL 不泄露长期凭据。 | 阻塞；当前为开发 URL。 |
| COURSE-PERM-006 | 后台课程只读 | Course Manager 只有 `course:read` | 访问列表、尝试编辑。 | 列表允许；编辑返回 `403`。 | 阻塞。 |
| COURSE-PERM-007 | 后台课程编辑 | Course Manager 有 `course:update` | 修改课程展示字段后查看门户。 | 写入成功并持久化；门户按公开状态展示；审计/日志可追踪。 | 待执行。 |
| COURSE-PERM-008 | 课程同步权限 | 不同角色访问同步接口 | 调用正式同步接口或当前开发同步入口。 | 只有 `course:sync` 允许；开发入口不能在正式环境绕过权限。 | 阻塞；正式接口待实现。 |

### 3.4 后台 CMS 权限

| ID | 场景 | 前置条件 | 步骤 | 预期结果 | 当前判定 |
| --- | --- | --- | --- | --- | --- |
| CMS-PERM-001 | 栏目读写权限 | CMS Editor、Portal User | 分别调用栏目 tree、create、update、delete/status。 | `cms:category:*` 按码放行；无权限返回 401/403。 | 阻塞；接口有，权限未强制。 |
| CMS-PERM-002 | 文章编辑提交 | CMS Editor | 创建草稿、编辑、submit。 | 编辑者可到 `PENDING_REVIEW`；不能 approve/publish，除非授权。 | 待执行。 |
| CMS-PERM-003 | 审核发布 | CMS Reviewer | approve、reject、publish、offline。 | 审核员按权限流转状态；不能越权编辑系统配置。 | 待执行。 |
| CMS-PERM-004 | 门户配置权限 | Portal Config Admin | 修改 `page-config/home` 与 `site-config`。 | 有 `portal:config:update` 才能保存；公共门户读取最新配置。 | 待联调；P07/P08 已有专项清单。 |
| CMS-PERM-005 | 轮播/快捷入口权限 | Portal Config Admin | CRUD `/admin/banners`、`/admin/quick-links`。 | 按 `portal:config:*` 放行；门户首页同步变化。 | 待执行。 |
| CMS-PERM-006 | 用户与角色权限 | Super Admin vs 其他角色 | 调用 `/admin/users`、`/admin/roles`、角色权限更新。 | 仅 `sys:*` 权限可管理用户/角色；普通 CMS 角色拒绝。 | 阻塞；部分接口待确认。 |
| CMS-PERM-007 | 审计与导出 | Super Admin、CMS Editor | 查询 `/admin/logs`、导出 `/admin/logs/export`。 | 按权限范围返回；导出不泄露密码/token；关键写操作有审计记录。 | 可部分验证。 |
| CMS-PERM-008 | 后台写入失败回滚 | 任意写接口 | 用无效 payload 或无权限 token 写入。 | 返回校验/权限错误；数据库、门户展示和审计记录符合策略。 | 待执行。 |

## 4. 删除旧版 CMS 的影响测试矩阵

当前前端基线显示存在 `/admin` 与 `/cms` 两套后台入口。若后续删除或收敛旧版 CMS，QA 必须执行以下回归，避免移除页面时破坏已可运行闭环。

| ID | 影响面 | 操作 | 预期结果 |
| --- | --- | --- | --- |
| LEGACY-CMS-001 | 路由入口 | 访问旧路由 `/cms/dashboard`、`/cms/pages`、`/cms/contents`、`/cms/users`。 | 要么 301/路由跳转到新 `/admin/*`，要么展示明确不可用页；不得白屏或显示过时 mock 数据。 |
| LEGACY-CMS-002 | 导航菜单 | 检查门户、后台菜单、快捷入口、文档链接。 | 所有后台入口指向保留版本；无死链。 |
| LEGACY-CMS-003 | 权限守卫 | 直接输入旧路由和新路由。 | 新旧入口执行同一套鉴权；旧路由不能绕过 `/admin` 权限。 |
| LEGACY-CMS-004 | API 调用 | 打开浏览器 Network。 | 不再调用已删除页面专属 mock 或废弃 API；正式保存接口仍为 `/admin/page-config`、`/admin/site-config` 等当前约定。 |
| LEGACY-CMS-005 | 数据闭环 | 在保留后台修改文章、页面配置、主题、用户状态。 | 门户展示和接口数据仍同步；删除旧版页面不影响 P05/P07/P08/P13。 |
| LEGACY-CMS-006 | 文档一致性 | 检查 `frontend/BASELINE.md`、QA 清单、用户操作说明。 | 明确保留后台入口和废弃入口处理策略。 |
| LEGACY-CMS-007 | 构建回归 | 执行前端构建。 | 删除旧页面后无 orphan import、路由引用、类型错误或 chunk 异常新增。 |
| LEGACY-CMS-008 | 回滚预案 | 确认旧版 CMS 删除 PR/变更记录。 | 若新后台阻塞验收，可定位受影响路由和恢复方案。 |

旧版 CMS 删除的 Go/No-Go：

- Go：新后台覆盖旧后台所有验收路径，旧入口跳转或明确拒绝，权限不被绕过，构建通过，P07/P08 配置闭环仍可执行。
- No-Go：旧路由仍能展示敏感 mock 数据、删除后核心配置入口缺失、菜单死链、或旧入口可绕过权限访问后台数据。

## 5. 执行证据要求

| 证据 | 最低要求 |
| --- | --- |
| API 证据 | method/path、token persona、请求体、HTTP status、统一响应 code/message、关键 data 字段。 |
| 页面证据 | `/login`、`/register`、`/users/me` 展示、后台首页、课程页、403/登录跳转结果。 |
| 数据证据 | 用户状态、角色权限表、课程状态/映射、CMS 状态变更前后查询。 |
| 日志证据 | 权限拒绝、登录失败、CAS 失败、后台写操作审计或运行日志。 |
| 清理证据 | 测试用户、角色权限、CMS 配置、课程状态恢复到基线或记录为保留测试数据。 |

## 6. 阻塞项与风险

| ID | 风险 | 影响 | 建议责任方 |
| --- | --- | --- | --- |
| AUTH-B01 | 本地登录、注册、CAS、refresh/logout 仍是开发态闭环。 | P09/P10 无法正式通过，只能做接口冒烟。 | Backend Agent |
| AUTH-B02 | 后台接口尚未强制 `Authorization` 与权限码。 | P05、CMS 权限、课程后台权限均不能正式通过。 | Backend Agent |
| AUTH-B03 | 前端存在 mock fallback 和 `/admin`、`/cms` 双后台入口。 | 页面验收可能误判为已联调，旧入口可能绕过新权限。 | Frontend Agent / PM Agent |
| AUTH-B04 | 角色权限后台 CRUD 与缓存生效策略不完整。 | 无法验证权限变更后实时性、撤权和禁用用户旧 token 失效。 | Backend Agent |
| AUTH-B05 | 课程 launch 未校验登录态、课程映射或授权范围。 | 课程 permission 验收阻塞，可能泄露 LMS 跳转能力。 | Backend Agent |

## 7. 推荐验证命令

```powershell
cd backend
mvn test
```

```powershell
curl http://localhost:8080/api/v1/users/me
curl -H "X-User-Id: 1" http://localhost:8080/api/v1/users/me
curl http://localhost:8080/api/v1/admin/users
curl http://localhost:8080/api/v1/admin/page-config/home
curl -X POST http://localhost:8080/api/v1/portal/courses/1/launch
```

以上命令若在未登录状态仍返回后台敏感数据或课程 launch 成功，应记录为权限阻塞缺陷，而不是正式通过。
