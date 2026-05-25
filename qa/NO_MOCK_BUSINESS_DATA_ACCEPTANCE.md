# 无 mock/fallback 业务数据专项验收

Version: v0.1
Owner: QA Agent
Date: 2026-05-08
Scope: 门户首页、课程中心、课程详情、PortalLayout 页脚、后台 Dashboard、站点设置、课程/教师表单、新闻/公告来源与分类。

## 1. 验收目标

本专项用于确认生产页面只展示后端接口、数据库或后台配置产生的真实业务数据。接口断开、数据库为空、内容被禁用/下线/删除、模块被隐藏时，页面必须展示空态、错误态或无内容状态，不得使用前端内置 mock、fallback 或默认业务样例伪装成真实数据。

以下内容一旦来自假数据，直接判定 No-Go：

- 课程、推荐课程、新课速递、课程详情、课程分类/学院。
- 教师、名师风采、教师头像/学院/职称。
- 公告、新闻、学术资讯、文章来源、文章分类。
- 友情链接、站点页脚、站点名称/版权/备案/联系方式。
- 后台 Dashboard 统计、最近内容、待办、快捷概览。

## 2. 源码检查

生产页面、布局、组件和接口适配层不得 import 以下数据源：

- `@/data/mock`
- `@/data/admin`
- `@/data/profile`

允许范围仅限明确的测试文件、文档、废弃示例或被构建入口完全排除的 fixture；若存在例外，必须在验收记录中说明文件路径、用途和不进入生产包的证据。

### 2.1 推荐检查命令

优先使用 `rg`：

```powershell
rg -n "from ['""]@/data/(mock|admin|profile)|import .*['""]@/data/(mock|admin|profile)" frontend/src
```

若当前环境 `rg` 不可用，使用 PowerShell：

```powershell
$patterns = '@/data/mock','@/data/admin','@/data/profile'
$hits = Get-ChildItem -Recurse -File -Path frontend/src -Include *.vue,*.ts,*.tsx,*.js,*.jsx |
  Select-String -SimpleMatch -Pattern $patterns
$hits | Select-Object Path,LineNumber,Line
if ($hits) { throw 'No-mock source check failed.' }
```

### 2.2 重点文件范围

| 范围 | 必查对象 |
| --- | --- |
| 门户首页 | 首页 view、首页模块组件、home API adapter |
| 课程中心 | 课程列表 view、搜索/筛选组件、课程 API adapter |
| 课程详情 | `/courses/:id` view、launch 入口、权限空态 |
| PortalLayout 页脚 | layout、footer、siteConfig/friendLinks 消费逻辑 |
| 后台 Dashboard | dashboard view、统计卡片、最近内容、快捷入口 |
| 站点设置 | admin settings view、site config API adapter |
| 课程/教师表单 | admin course form、admin teacher form、下拉选项来源 |
| 新闻/公告 | admin news/notices view、category/source 字段映射 |

通过标准：命令无命中，或命中均为非生产路径并有明确证据。生产路径任何命中均为 No-Go。

## 3. 运行时反假数据矩阵

| ID | 场景 | 操作 | 期望结果 |
| --- | --- | --- | --- |
| NM-RUN-001 | 接口断开：首页 | 停止后端或把前端 API Base URL 指向不可达地址，打开 `/`。 | 首页不得出现课程、教师、公告、新闻、友情链接、学院等默认样例；应显示空态、错误态或模块级加载失败提示。 |
| NM-RUN-002 | 接口断开：课程中心 | 接口不可达时打开 `/courses` 并执行搜索。 | 不得显示默认课程卡片、默认学院筛选或推荐课程；列表为空态或错误态。 |
| NM-RUN-003 | 接口断开：课程详情 | 直接访问 `/courses/{id}`。 | 不得拼出本地课程详情；应显示加载失败、404/无权限或错误态。 |
| NM-RUN-004 | 接口断开：页脚 | 接口不可达时打开任意门户页。 | 页脚不得展示默认友情链接、默认学校联系方式或硬编码学院列表；允许展示静态版权壳但不得伪造后台配置数据。 |
| NM-RUN-005 | 接口断开：后台 Dashboard | 登录态失效或接口不可达时打开 `/admin/dashboard`。 | 不得展示本地统计、最近课程/公告/教师假数据；应显示 401/403、加载失败或空统计。 |
| NM-RUN-006 | 清空 DB：首页 | 在测试库清空或隔离课程、教师、文章、友情链接、站点配置表后打开首页。 | 所有业务模块为空态；不得恢复 mock 课程、教师、公告、新闻、友情链接、学院。 |
| NM-RUN-007 | 清空 DB：课程中心/详情 | 清空课程数据后打开 `/courses` 和历史课程详情 URL。 | 课程列表为空；详情返回 404/空态；不得展示内置课程。 |
| NM-RUN-008 | 清空 DB：后台 | 清空内容表后打开 Dashboard、站点设置、课程/教师/新闻/公告管理。 | 列表和统计反映真实空数据；表单下拉不得用 mock 学院/教师/来源兜底。 |
| NM-RUN-009 | 禁用内容：首页 | 后台禁用/下线所有课程、教师、公告、新闻、友情链接，刷新首页。 | 禁用内容全部消失；不得由 fallback 补出任何同类业务数据。 |
| NM-RUN-010 | 禁用内容：课程详情 | 将课程改为非 `ACTIVE` 或无权限状态，直接访问详情。 | 不泄露课程标题、简介、教师、封面、launchUrl；不得展示旧缓存或 mock 详情。 |
| NM-RUN-011 | 禁用内容：页脚 | 禁用全部友情链接并清空可选站点配置。 | 页脚友情链接区域为空或隐藏；不得显示默认友情链接。 |
| NM-RUN-012 | 模块隐藏 | 在后台关闭首页相关模块后刷新首页。 | 被关闭模块不渲染，不得以 mock 内容保持占位。 |

## 4. 页面专项验收

### 4.1 首页

必验模块：轮播、推荐课程、新课速递、名师风采、公告、新闻、友情链接、学院/分类入口。

通过标准：

- 页面展示条目必须能在 `GET /api/v1/portal/home` 或对应公开接口响应中找到同一 `id/title/name/url/status`。
- 公开接口数组为空时，模块为空态、隐藏或显示无内容提示。
- 禁用、下线、删除、过期内容刷新后不再出现。
- DevTools Network 中必须能看到真实 `/api/v1/portal/*` 请求；仅页面截图不能作为通过证据。

### 4.2 课程中心

通过标准：

- `/courses` 列表与 `GET /api/v1/portal/courses` 的 `records/total` 一致。
- 搜索无结果时只显示空态，不显示默认课程。
- 筛选项若来自后端分类/学院接口，接口为空时不得回退到 `@/data/mock` 的学院列表。
- 匿名、校外、校内、管理员课程可见性仍遵守 `public/internal/private` 权限矩阵。

### 4.3 课程详情

通过标准：

- 详情页字段来自 `GET /api/v1/portal/courses/{id}`。
- 404、403、接口错误、课程禁用时，不展示本地课程标题、教师、简介、封面或默认 launch 入口。
- launch 入口只能使用真实接口响应；不得在无接口响应时生成默认跳转 URL。

### 4.4 PortalLayout 页脚

通过标准：

- 站点信息来自 `GET /api/v1/portal/site-config` 或 `/portal/home.siteConfig`。
- 友情链接来自 `GET /api/v1/portal/friend-links` 或 `/portal/home.friendLinks`。
- 禁用/删除友情链接后，页脚不显示该链接。
- 清空站点配置时，不展示伪造的电话、邮箱、地址、备案号、学校链接。

### 4.5 后台 Dashboard

通过标准：

- 统计卡片、最近课程、最近文章、教师/用户/友情链接概览必须来自 admin API。
- admin API 返回空数组或 0 时，Dashboard 显示 0 或空态。
- 非管理员访问仍按 401/403 处理，不得展示本地 Dashboard 假数据。

### 4.6 站点设置

通过标准：

- 表单初始值来自 admin site-config API。
- 保存后 public site-config、PortalLayout 页脚和首页聚合响应同步变化。
- 接口失败时，表单不得自动填入默认业务配置并允许误保存。

### 4.7 课程/教师表单

通过标准：

- 课程表单的学院、教师、分类、权限、状态选项来源必须明确；业务数据型选项不得来自 `@/data/mock`。
- 教师表单的学院/院系、职称、头像、排序、启用状态保存后必须能通过 admin API 和 portal API 验证。
- 清空或禁用教师后，首页名师风采和教师列表不得显示默认教师。

### 4.8 新闻/公告来源与分类

通过标准：

- 新闻固定或选择的分类必须写入真实 `categoryCode=news`，公告必须写入 `categoryCode=notice` 或当前约定公告分类。
- 文章来源、分类名称、发布时间、摘要、封面均来自真实文章字段或真实分类字段。
- 草稿、待审、下线、删除文章不得出现在首页、新闻列表、公告列表或详情页。
- 分类接口为空或分类禁用时，不得显示默认新闻/公告分类假数据。

## 5. 证据要求

每次专项验收至少保留：

- 源码检查命令和输出。
- 后端构建/测试：`cd backend && mvn test`。
- 前端构建：`cd frontend && npm run build`。
- 关键接口响应：`/portal/home`、`/portal/courses`、`/portal/courses/{id}`、`/portal/site-config`、`/portal/friend-links`、`/portal/categories/news/articles`、`/portal/categories/notice/articles`。
- 后台接口响应：Dashboard、site-config、courses、teachers、articles、friend-links。
- 页面证据：路由、账号、操作步骤、Network 请求、刷新后的可见结果。
- 数据清理记录：测试数据 id、标题、删除/恢复方式。

## 6. Go / No-Go

Go：

- 生产源码无禁止 import，或命中均有非生产证据。
- 首页、课程中心、课程详情、页脚、后台 Dashboard、站点设置、课程/教师表单、新闻/公告均能证明数据来自真实接口。
- 接口断开、清空 DB、禁用内容时，页面只显示空态/错误态/无权限态，不出现业务假数据。

No-Go：

- 生产页面 import `@/data/mock`、`@/data/admin` 或 `@/data/profile`。
- 任一公开接口为空、失败或过滤后无数据，但页面仍显示课程、教师、公告、新闻、友情链接、学院等默认内容。
- 后台保存失败或接口不可达时，页面仍显示看似保存成功的本地业务数据。
- 禁用/下线/删除内容仍在公开页面、Dashboard 或表单选项中出现。
- 仅提供页面截图，缺少接口响应或 Network 证据。
