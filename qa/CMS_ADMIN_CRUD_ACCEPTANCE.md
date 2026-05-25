# CMS Admin CRUD Acceptance

Version: v0.1
Owner: QA Worker
Date: 2026-05-07
Scope: CMS 管理端 CRUD 验收，覆盖课程管理、轮播管理、公告管理、用户管理，以及后台写入后前台同步更新。

## 1. 验收目标

本清单用于验证管理员通过新版 `/admin/*` 后台维护门户内容时，数据能真实写入后端并同步到公开门户。前端 mock、仅本地状态变化、仅菜单可见或仅页面表单可操作，均不能作为通过证据。

通过口径：

- 管理员 `admin` 可以对课程、轮播、公告、用户执行约定范围内的增删改查和状态操作。
- 后台写入后，管理员查询接口、公开门户接口、前台页面三方结果一致。
- 未发布、下线、禁用、删除或无权限内容不得在前台泄露。
- `anonymous`、`outside001`、`student001` 不能访问后台 CRUD 接口；必须由后端返回 401/403，前端路由守卫只作为补充证据。
- 所有写操作需记录请求体、响应、变更前后查询结果和清理/恢复方式。

## 2. 环境、账号与基础命令

Base URLs:

| Target | URL |
| --- | --- |
| Backend API | `http://localhost:8080/api/v1` |
| Frontend portal | `http://localhost:5173/` |
| Admin UI | `http://localhost:5173/admin` |
| Course list | `http://localhost:5173/courses` |
| Notice list | `http://localhost:5173/notices` or configured article/category route |

Seed accounts:

| Persona | Username | Password | Expected role |
| --- | --- | --- | --- |
| Admin | `admin` | `123456` | `admin` |
| Outside user | `outside001` | `123456` | `external` |
| Student | `student001` | `123456` | `internal` |
| Anonymous | none | none | no token |

Backend test:

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

Local manual acceptance:

```powershell
docker compose up -d mysql redis
cd backend
mvn spring-boot:run
cd ..\frontend
npm run dev
```

Token preparation:

```powershell
$admin = Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/v1/auth/login -ContentType application/json -Body '{"username":"admin","password":"123456"}'
$adminToken = $admin.data.accessToken
$outside = Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/v1/auth/login -ContentType application/json -Body '{"username":"outside001","password":"123456"}'
$outsideToken = $outside.data.accessToken
$student = Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/v1/auth/login -ContentType application/json -Body '{"username":"student001","password":"123456"}'
$studentToken = $student.data.accessToken
```

Portal smoke:

```powershell
curl http://localhost:8080/api/v1/portal/home
curl "http://localhost:8080/api/v1/portal/courses?page=1&size=10"
curl http://localhost:8080/api/v1/portal/categories/tree
curl "http://localhost:8080/api/v1/portal/categories/notices/articles?page=1&size=10"
```

Admin smoke:

```powershell
curl -H "Authorization: Bearer $adminToken" "http://localhost:8080/api/v1/admin/courses?page=1&size=10"
curl -H "Authorization: Bearer $adminToken" http://localhost:8080/api/v1/admin/banners
curl -H "Authorization: Bearer $adminToken" "http://localhost:8080/api/v1/admin/articles?page=1&size=10&categoryCode=notices"
curl -H "Authorization: Bearer $adminToken" "http://localhost:8080/api/v1/admin/users?page=1&size=10"
```

## 3. 课程 CRUD 前后台同步验收

数据口径：

- 后台课程接口以 `GET/POST/PUT/DELETE /api/v1/admin/courses` 或当前实现等价接口为准；若当前仅支持 `GET /admin/courses` 和 `PUT /admin/courses/{id}`，新增和删除应记录为实现缺口。
- 前台课程同步以 `GET /api/v1/portal/courses`、`GET /api/v1/portal/courses/{id}`、首页 `GET /api/v1/portal/home` 和 `/courses` 页面为准。
- 课程权限字段必须使用 `public`、`internal`、`private`。

| ID | 场景 | 步骤 | 预期结果 |
| --- | --- | --- | --- |
| COURSE-CRUD-001 | 管理员查询课程 | `admin` 调用 `GET /admin/courses?page=1&size=10`，打开后台课程管理页。 | 返回 200；列表字段包含 id、课程名称、教师、状态、permission、推荐/新课等展示字段；后台页面与接口一致。 |
| COURSE-CRUD-002 | 新增公开课程 | `admin` 新增一门 `permission=public`、`status=ACTIVE` 的 QA 课程。 | 写接口返回 200；后台列表可查；`GET /portal/courses?keyword=QA课程名` 可见；匿名 `/courses` 页面可见并可进入详情。若无新增接口，记为阻塞。 |
| COURSE-CRUD-003 | 编辑课程展示字段 | 修改课程标题、简介、封面、教师、分类、排序或推荐字段。 | 管理端查询返回新值；公开课程列表、详情页、首页推荐/新课模块同步更新；无旧 mock 文案残留。 |
| COURSE-CRUD-004 | 权限改为 internal | 将同一课程 `permission` 改为 `internal`。 | 匿名和 `outside001` 在列表/详情不可见或返回 403/404；`student001` 与 `admin` 可见；前台页面不泄露详情内容。 |
| COURSE-CRUD-005 | 权限改为 private | 将课程 `permission` 改为 `private`。 | 仅 `admin` 可见；匿名、`outside001`、`student001` 列表不可见，直接访问详情/launch 返回 401/403/404。 |
| COURSE-CRUD-006 | 停用或删除课程 | 将课程 `status` 改为非 ACTIVE，或执行删除。 | 后台按约定可查到停用/删除状态；公开课程列表、首页模块和详情页不再展示；删除后直接访问返回 404 或等价不可用结果。 |
| COURSE-CRUD-007 | 负向校验 | 新增/编辑时提交空标题、非法 permission、非法 URL、超长文本。 | 返回 400/409 等校验错误；数据库无脏数据；前台无异常展示。 |
| COURSE-CRUD-008 | 前端后台操作 | 登录 `admin`，在课程管理页执行新增、编辑、停用/删除。 | 页面保存成功后刷新仍存在；公开门户硬刷新后同步变化；Network 请求指向真实 `/api/v1/admin/courses`，不是 mock。 |

## 4. 轮播 CRUD 首页同步验收

数据口径：

- 后台接口：`GET/POST/PUT/DELETE /api/v1/admin/banners`。
- 前台同步：`GET /api/v1/portal/home.data.banners` 和首页首屏轮播模块。
- 只展示启用、有效期内、排序符合规则的轮播。

| ID | 场景 | 步骤 | 预期结果 |
| --- | --- | --- | --- |
| BANNER-CRUD-001 | 管理员查询轮播 | `admin` 调用 `GET /admin/banners`，打开后台轮播管理页。 | 返回 200；后台可看到所有轮播，包括禁用项；字段包含标题、图片、链接、排序、启用状态。 |
| BANNER-CRUD-002 | 新增启用轮播 | 新增标题含 `QA轮播`、有效图片 URL、跳转链接、`enabled=true`、较小排序值的轮播。 | 后台列表出现；`/portal/home` 返回该轮播；首页首屏显示该图或标题，排序正确。 |
| BANNER-CRUD-003 | 编辑轮播 | 修改标题、图片、链接、排序。 | 后台查询、`/portal/home`、首页展示同步更新；点击跳转到配置链接，不出现死链。 |
| BANNER-CRUD-004 | 禁用轮播 | 将 `enabled=false`。 | 后台仍可见；`/portal/home.data.banners` 和首页轮播不再展示。 |
| BANNER-CRUD-005 | 删除轮播 | 删除测试轮播。 | 后台列表不再出现，或按软删除规则标记；前台首页不展示；刷新后仍不恢复。 |
| BANNER-CRUD-006 | 负向校验 | 提交空图片、非法链接、重复排序、超长标题。 | 返回明确校验错误或可接受排序策略；无破图污染首页。 |

## 5. 公告 CRUD、发布、下线同步验收

数据口径：

- 公告使用文章管理接口，类别为 `notices` 或当前约定公告栏目。
- 后台接口：`GET/POST/PUT/DELETE /admin/articles`，状态流转接口 `submit/approve/reject/publish/offline`。
- 前台同步：首页公告模块、公告列表页、公告详情页和 `GET /portal/categories/{code}/articles`。
- 只有 `PUBLISHED` 公告允许公开展示。

| ID | 场景 | 步骤 | 预期结果 |
| --- | --- | --- | --- |
| NOTICE-CRUD-001 | 管理员查询公告 | `admin` 查询 `/admin/articles?categoryCode=notices` 或等价公告筛选。 | 后台可看到草稿、待审、已发布、已下线等状态；公开接口只返回已发布公告。 |
| NOTICE-CRUD-002 | 新增草稿公告 | 新增标题含 `QA公告`、摘要、正文、封面可选，状态保持 `DRAFT`。 | 后台可查；首页公告、公告列表和公开搜索均不可见。 |
| NOTICE-CRUD-003 | 编辑草稿公告 | 修改标题、摘要、正文、排序或置顶字段。 | 后台详情返回新值；公开端仍不可见。 |
| NOTICE-CRUD-004 | 发布公告 | 按当前流程执行 `submit -> approve -> publish`，或管理员直接 publish。 | 状态变为 `PUBLISHED`，`publishedAt` 有值；首页公告模块、公告列表、公告详情同步可见。 |
| NOTICE-CRUD-005 | 更新已发布公告 | 修改已发布公告标题/摘要/正文。 | 若业务允许直接修改，公开端同步新值；若要求重新审核，公开端保持旧发布版本并记录规则，不得展示未审核草稿。 |
| NOTICE-CRUD-006 | 下线公告 | 调用 `POST /admin/articles/{id}/offline`。 | 状态变为 `OFFLINE`；首页公告、公告列表、详情公开访问不再展示或返回 404/403。 |
| NOTICE-CRUD-007 | 删除公告 | 删除测试公告。 | 后台按删除规则处理；公开端不可见；直接访问详情不泄露正文。 |
| NOTICE-CRUD-008 | 发布流转负向 | 对 DRAFT 直接 offline、对 PUBLISHED 重复 publish、对不存在 id 操作。 | 返回 400/404/409 等明确错误；状态不被错误流转。 |
| NOTICE-CRUD-009 | 前端后台操作 | 登录 `admin` 在公告管理页完成新增、编辑、发布、下线。 | 页面操作与 API 状态一致；首页和公告列表硬刷新后同步更新；Network 无 mock fallback。 |

## 6. 用户 CRUD、状态、角色验收

数据口径：

- 用户接口：`GET /admin/users`、`GET /admin/users/{id}`、`PUT /admin/users/{id}/status`、`PUT /admin/users/{id}/roles`；若实现包含新增/编辑/删除用户接口，也纳入 CRUD 验收。
- 注册外部用户接口 `POST /auth/register` 可作为用户新增来源；管理员需能审核、禁用、恢复、调整角色。

| ID | 场景 | 步骤 | 预期结果 |
| --- | --- | --- | --- |
| USER-CRUD-001 | 管理员查询用户 | `admin` 调用 `GET /admin/users?page=1&size=10`，打开用户管理页。 | 返回 200；列表含 username、displayName、role、status、userType/source 等关键字段。 |
| USER-CRUD-002 | 新增外部用户 | 调用 `POST /auth/register` 注册 `qa_outside_*`，或后台新增用户。 | 新用户出现在后台用户列表；初始状态符合约定，通常为 `PENDING_REVIEW`；密码不在响应中泄露。 |
| USER-CRUD-003 | 审核通过/启用 | `admin` 调用 `PUT /admin/users/{id}/status` 改为 `ACTIVE`。 | 用户可登录；`GET /users/me` 返回正确 role/status；公开权限按 persona 生效。 |
| USER-CRUD-004 | 禁用用户 | 将用户状态改为 `DISABLED`。 | 新登录被拒绝；已有 token 应失效或在下一次鉴权时被拒绝；后台接口、课程 launch 不可继续访问。若当前开发 token 未失效，记录为风险。 |
| USER-CRUD-005 | 拒绝/恢复审核 | 将待审用户改为 `REJECTED`，再按规则恢复为 `ACTIVE` 或重新待审。 | 被拒用户不能登录或只能看到明确拒绝状态；恢复后按角色权限可用。 |
| USER-CRUD-006 | 修改角色为 external/internal/admin | 对测试用户依次设置角色。 | `/users/me.role` 与后台一致；课程可见性和后台访问权限同步变化；角色变为 admin 后才可访问 `/admin/**`。 |
| USER-CRUD-007 | 删除用户或软删除 | 如有删除接口，删除测试用户。 | 用户无法登录；后台按规则不可见或标记删除；历史内容引用不产生 500。若无删除接口，记录为不支持并以 status 禁用作为替代验收。 |
| USER-CRUD-008 | 保护内置账号 | 尝试删除/禁用最后一个 admin 或当前登录 admin。 | 系统应拒绝危险操作，避免无管理员可用；返回 400/409 或明确业务错误。 |
| USER-CRUD-009 | 负向校验 | 重复用户名、非法 role/status、空密码、非法邮箱手机号。 | 返回 400/409；无脏数据；密码和 token 不在错误信息中泄露。 |

## 7. Persona 权限矩阵

后端 HTTP 状态是决定性证据；前端隐藏菜单、跳转登录或 403 页面只作为体验补充。

| Resource/action | Anonymous | outside001 external | student001 internal | admin |
| --- | --- | --- | --- | --- |
| `GET /portal/home` | 200 | 200 | 200 | 200 |
| `GET /portal/courses` | public only | public only | public + internal | public + internal + private |
| `GET /portal/categories/notices/articles` | published only | published only | published only | published only |
| `GET /portal/articles/{publishedNoticeId}` | 200 | 200 | 200 | 200 |
| `GET /portal/articles/{draftOrOfflineNoticeId}` | 404/403 | 404/403 | 404/403 | 404/403 public endpoint; admin uses admin endpoint |
| `GET /admin/courses` | 401 | 403 | 403 | 200 |
| `POST/PUT/DELETE /admin/courses` | 401 | 403 | 403 | 200 |
| `GET /admin/banners` | 401 | 403 | 403 | 200 |
| `POST/PUT/DELETE /admin/banners` | 401 | 403 | 403 | 200 |
| `GET /admin/articles` | 401 | 403 | 403 | 200 |
| `POST/PUT/DELETE /admin/articles` | 401 | 403 | 403 | 200 |
| `POST /admin/articles/{id}/publish` | 401 | 403 | 403 | 200 |
| `POST /admin/articles/{id}/offline` | 401 | 403 | 403 | 200 |
| `GET /admin/users` | 401 | 403 | 403 | 200 |
| `PUT /admin/users/{id}/status` | 401 | 403 | 403 | 200 |
| `PUT /admin/users/{id}/roles` | 401 | 403 | 403 | 200 |
| Frontend `/admin/*` | redirect login | 403 page | 403 page | accessible |
| Legacy `/cms/*` | redirect login or `/admin/dashboard` guarded | 403 or guarded redirect | 403 or guarded redirect | redirect to `/admin/dashboard` or equivalent |

## 8. 接口冒烟命令

Anonymous denial:

```powershell
curl -i http://localhost:8080/api/v1/admin/courses
curl -i http://localhost:8080/api/v1/admin/banners
curl -i "http://localhost:8080/api/v1/admin/articles?page=1&size=10"
curl -i "http://localhost:8080/api/v1/admin/users?page=1&size=10"
```

Non-admin denial:

```powershell
curl -i -H "Authorization: Bearer $outsideToken" http://localhost:8080/api/v1/admin/banners
curl -i -H "Authorization: Bearer $studentToken" "http://localhost:8080/api/v1/admin/users?page=1&size=10"
```

Admin read smoke:

```powershell
curl -i -H "Authorization: Bearer $adminToken" "http://localhost:8080/api/v1/admin/courses?page=1&size=10"
curl -i -H "Authorization: Bearer $adminToken" http://localhost:8080/api/v1/admin/banners
curl -i -H "Authorization: Bearer $adminToken" "http://localhost:8080/api/v1/admin/articles?page=1&size=10"
curl -i -H "Authorization: Bearer $adminToken" "http://localhost:8080/api/v1/admin/users?page=1&size=10"
```

Public sync smoke:

```powershell
curl -i http://localhost:8080/api/v1/portal/home
curl -i "http://localhost:8080/api/v1/portal/courses?page=1&size=10"
curl -i "http://localhost:8080/api/v1/portal/categories/notices/articles?page=1&size=10"
```

Example banner write smoke:

```powershell
$body = '{"siteCode":"main","title":"QA轮播","imageUrl":"/assets/qa-banner.png","linkUrl":"/courses","sortOrder":1,"enabled":true}'
curl -i -X POST -H "Authorization: Bearer $adminToken" -H "Content-Type: application/json" -d $body http://localhost:8080/api/v1/admin/banners
curl -i http://localhost:8080/api/v1/portal/home
```

Example notice publish smoke:

```powershell
curl -i -X POST -H "Authorization: Bearer $adminToken" http://localhost:8080/api/v1/admin/articles/{id}/submit
curl -i -X POST -H "Authorization: Bearer $adminToken" http://localhost:8080/api/v1/admin/articles/{id}/approve
curl -i -X POST -H "Authorization: Bearer $adminToken" http://localhost:8080/api/v1/admin/articles/{id}/publish
curl -i "http://localhost:8080/api/v1/portal/categories/notices/articles?page=1&size=10"
curl -i -X POST -H "Authorization: Bearer $adminToken" http://localhost:8080/api/v1/admin/articles/{id}/offline
```

## 9. 前台不得 mock 假同步专项复测

本专项用于验证后台 CRUD 数据确实由公开接口驱动前台页面，而不是前台在接口为空、接口失败或过滤后为空时继续展示默认 mock 数据。复测必须同时保留三类证据：后台写接口响应、公开读接口响应、浏览器页面和 Network 记录。

### 9.1 轮播同步复测

| ID | 场景 | 步骤 | 通过标准 |
| --- | --- | --- | --- |
| NO-MOCK-BANNER-001 | 新增 `HOME_TOP` 后首页展示 | 1. 使用 `admin` 登录并新增轮播，标题包含唯一标识 `QA-HOME-TOP-{timestamp}`，`position=HOME_TOP`，`enabled=true`，图片 URL 使用可访问资源，排序值设为最靠前。2. 调用 `GET /api/v1/admin/banners` 确认后台存在该记录。3. 调用 `GET /api/v1/portal/home`，检查 `data.banners` 包含该标题、图片、链接、position/status/enabled 等关键字段。4. 打开首页 `/`，强制刷新，查看首屏轮播。5. 在 DevTools Network 中保留 `/api/v1/portal/home` 响应截图或复制响应片段。 | 首页展示新增轮播，且页面内容与 `/portal/home.data.banners` 字段一致；Network 证明数据来自真实公开接口，不允许只凭页面出现文案判定通过。 |
| NO-MOCK-BANNER-002 | 禁用后首页消失 | 1. 将该轮播更新为 `enabled=false`。2. 复查 `GET /api/v1/admin/banners` 中仍可见且为禁用。3. 复查 `GET /api/v1/portal/home` 的 `data.banners` 不再包含该记录。4. 硬刷新首页。 | 首页不再展示该轮播；若公开接口已过滤为空但首页仍展示该轮播或默认轮播 mock，则不通过。 |
| NO-MOCK-BANNER-003 | 删除后首页消失 | 1. 删除该测试轮播。2. 复查后台列表不存在或按软删除规则标记。3. 复查 `/portal/home.data.banners` 不包含该记录。4. 硬刷新首页并查看 Network。 | 删除后首页不恢复该轮播；Network 响应和页面展示一致。 |

### 9.2 公告同步复测

| ID | 场景 | 步骤 | 通过标准 |
| --- | --- | --- | --- |
| NO-MOCK-NOTICE-001 | 草稿不显示 | 1. 使用 `POST /api/v1/admin/articles` 创建 `categoryCode=notice`、`status=DRAFT` 的公告，标题包含 `QA-NOTICE-DRAFT-{timestamp}`。2. 调用 `GET /api/v1/admin/articles?categoryCode=notice` 确认后台可见。3. 调用 `GET /api/v1/portal/home` 和 `GET /api/v1/portal/categories/notice/articles?page=1&size=10`。4. 打开首页公告模块和公告列表页。 | 草稿只在后台可见，公开接口和前台页面均不可见。 |
| NO-MOCK-NOTICE-002 | 发布后显示且字段真实 | 1. 对同一公告执行 `POST /api/v1/admin/articles/{id}/publish`。2. 复查 `/portal/home.data.notices` 和 `/portal/categories/notice/articles`。3. 打开首页公告模块、公告列表和详情页。4. 对照接口字段记录页面展示来源。 | 发布后前台可见；标题、摘要、正文、封面、发布时间等页面字段必须来自 `CmsContent` 真实字段，如 `title`、`summary`、`content`、`coverUrl`、`publishedAt`、`viewCount`，不得展示固定 mock 文案或旧字段假数据。 |
| NO-MOCK-NOTICE-003 | 下线/删除后消失 | 1. 调用 `POST /api/v1/admin/articles/{id}/offline`。2. 复查公开接口和页面均不可见。3. 再删除测试公告。4. 复查详情公开访问返回 404/403 或等价不可见结果。 | 下线或删除后首页、公告列表、详情均不泄露正文；若公开接口为空但页面仍显示默认公告 mock，则不通过。 |

### 9.3 课程同步复测

| ID | 场景 | 步骤 | 通过标准 |
| --- | --- | --- | --- |
| NO-MOCK-COURSE-001 | 新增 `ACTIVE/public` 后 `/courses` 显示 | 1. 使用 `POST /api/v1/admin/courses` 新增标题含 `QA-COURSE-PUBLIC-{timestamp}` 的课程，设置 `status=ACTIVE`、`permission=public`。2. 调用 `GET /api/v1/admin/courses` 确认后台存在。3. 调用 `GET /api/v1/portal/courses?page=1&size=10&keyword=QA-COURSE-PUBLIC`。4. 匿名打开 `/courses` 并按标题搜索。 | 公开接口和 `/courses` 页面均显示该课程；课程卡片字段来自接口中的真实课程字段，不得用默认 mock 课程替代。 |
| NO-MOCK-COURSE-002 | 删除或 `INACTIVE` 后消失 | 1. 将测试课程更新为 `status=INACTIVE`，或执行删除。2. 复查后台状态。3. 复查 `GET /api/v1/portal/courses?keyword=QA-COURSE-PUBLIC` 为空或不含该课程。4. 硬刷新 `/courses` 并搜索同一关键词。 | 公开接口过滤后页面同步消失；详情公开访问返回 404/403 或等价不可见结果。 |
| NO-MOCK-COURSE-003 | 空列表展示空态而不是 mock 课程 | 1. 使用一个确认不存在的关键词，如 `QA-NO-COURSE-{timestamp}`，调用 `GET /api/v1/portal/courses?page=1&size=10&keyword=...`。2. 打开 `/courses` 搜索同一关键词并查看 Network。 | 公开接口 `records=[]` 或 `total=0` 时，前台必须展示空态提示；若仍显示默认课程、推荐课程 mock 或本地假数据，即不通过。 |

### 9.4 明确失败判定

以下任一情况直接判定本专项不通过：

- 公开接口 `/api/v1/portal/home`、`/api/v1/portal/courses` 或 `/api/v1/portal/categories/notice/articles` 返回空列表、过滤后不含测试数据，但页面仍显示默认 mock 轮播、mock 公告或 mock 课程。
- 后台写入成功后，后台查询可见，但公开接口不可见且前台仍用本地默认数据伪装为同步成功。
- DevTools Network 未出现真实 `/api/v1/portal/*` 请求，或请求失败后页面仍展示看似正常的默认内容且没有明确空态/错误态。
- 公告页面字段不是 `CmsContent` 真实字段映射，而是固定标题、固定摘要、固定发布时间或旧 mock 字段结构。
- 仅提供页面截图，未提供公开接口响应和 Network 证据。

### 9.5 专项冒烟命令

```powershell
# 1. Prepare admin token
$admin = Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/v1/auth/login -ContentType application/json -Body '{"username":"admin","password":"123456"}'
$adminToken = $admin.data.accessToken
$headers = @{ Authorization = "Bearer $adminToken" }

# 2. Public baseline: responses must be saved before and after admin writes
Invoke-RestMethod -Method Get -Uri http://localhost:8080/api/v1/portal/home
Invoke-RestMethod -Method Get -Uri "http://localhost:8080/api/v1/portal/courses?page=1&size=10&keyword=QA-NO-COURSE"
Invoke-RestMethod -Method Get -Uri "http://localhost:8080/api/v1/portal/categories/notice/articles?page=1&size=10"

# 3. Admin read smoke
Invoke-RestMethod -Method Get -Uri "http://localhost:8080/api/v1/admin/banners" -Headers $headers
Invoke-RestMethod -Method Get -Uri "http://localhost:8080/api/v1/admin/articles?page=1&size=10&categoryCode=notice" -Headers $headers
Invoke-RestMethod -Method Get -Uri "http://localhost:8080/api/v1/admin/courses?page=1&size=10" -Headers $headers

# 4. Empty-list anti-mock smoke: frontend /courses must show empty state for this keyword
Invoke-RestMethod -Method Get -Uri "http://localhost:8080/api/v1/portal/courses?page=1&size=10&keyword=QA-NO-COURSE-$([DateTimeOffset]::Now.ToUnixTimeSeconds())"
```

页面冒烟：

```text
http://localhost:5173/
http://localhost:5173/courses
http://localhost:5173/admin/banners
http://localhost:5173/admin/notices
http://localhost:5173/admin/courses
```

## 10. 证据与清理要求

最小证据：

| Evidence | Requirement |
| --- | --- |
| Build/test | `backend mvn test` 结果、`frontend npm run build` 结果，记录是否仅有既有警告。 |
| API | method/path、persona/token、request body、HTTP status、response code/message、关键 data 字段。 |
| Admin page | 后台路由、账号、操作步骤、保存前后截图或文字记录、Network 真实接口。 |
| Portal page | 首页、课程列表/详情、公告列表/详情刷新后的可见变化。 |
| Data sync | 写入前 baseline、写入后 admin read、public read、页面表现三方一致。 |
| Permission | anonymous/outside001/student001/admin 四类账号的 401/403/200 矩阵结果。 |
| Cleanup | 删除测试数据或恢复原状态；无法清理时记录保留数据 id、标题和原因。 |

## 11. Go/No-Go

Go:

- 管理员课程 CRUD 可改变前台课程列表、详情和首页课程模块，且 permission/status 过滤正确。
- 管理员轮播 CRUD 可改变首页轮播展示，禁用/删除后前台消失。
- 管理员公告 CRUD、publish、offline 可改变首页公告、公告列表和详情可见性，非发布状态不公开。
- 管理员可管理用户 status/role，用户登录、后台访问和课程可见性随状态/角色变化。
- 权限矩阵中所有非管理员后台访问均由后端返回 401/403。
- `mvn test`、`npm run build` 通过，接口冒烟符合统一响应和权限预期。

No-Go:

- 公开接口为空或过滤后不含测试数据，但前台仍显示默认 mock 轮播、mock 公告或 mock 课程。
- 任一后台保存只在前端本地生效，公开 API 或公开页面不同步。
- 未发布/下线公告、禁用/删除课程、禁用轮播仍在前台展示。
- `outside001` 或 `student001` 可以成功调用任一后台写接口。
- 匿名用户可以读取后台敏感列表或执行课程/公告/轮播/用户写操作。
- 用户禁用或角色变更后权限不变化，且无明确的重新登录/刷新 token 生效策略。
