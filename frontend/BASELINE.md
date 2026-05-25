# Frontend Baseline

## 2026-05-06 注册登录与旧 CMS 收敛更新

- 登录页已改为调用 `authApi.login` 并通过 `authState.saveSession` 保存 `accessToken`、`refreshToken`、当前用户和归一化后的 `role`；管理员默认进入 `/admin/dashboard`，普通用户默认进入 `/profile`。
- `/admin/*` 路由守卫仅允许已登录且 `role=admin` 的会话访问；未登录跳 `/login?redirect=...`，非管理员跳 `/403`。
- 旧 `/cms/*` 独立后台入口已从路由表收敛为 `/admin/dashboard` 重定向，`AdminLayout` 菜单已删除旧版 CMS，并改为展示真实登录用户信息。
- 注册页已补充校外用户单位字段、确认密码校验，提交 `/auth/register` 成功后提示校外用户注册结果并跳转 `/login`。
- 本次验证：`npm run build` 通过，仍保留 Vite 单个 JS chunk 超过 500 kB 的既有提示。

## 2026-05-06 CMS 后台保存闭环进展

- 已在 `src/api/client.ts` 补充 `cmsApi.getPageConfig/savePageConfig/saveSiteConfig`，对接后端已存在的 `GET/PUT /admin/page-config/{pageCode}` 与 `PUT /admin/site-config`。
- `/admin/page-config` 已成为最小可用首页配置入口：可读取/编辑首页 9 个模块开关，并保存到 `portal_page_config.layoutJson.sections`；可编辑 `theme.primary`、`theme.primaryDark`、`theme.dark` 并逐项保存到 `portal_site_config`。
- `/admin/settings` 已补齐站点基础配置、系统集成开关和主题色的表单双向绑定与保存反馈，其中主题色保存后会即时写入前端 CSS 变量用于预览。
- `/cms/pages` 已保留页面列表，并新增跳转 `/admin/page-config` 的首页配置入口，避免 CMS 与 Admin 两套页面重复实现同一保存闭环。
- 本轮只修改 `frontend/` 文件，未修改 `TASKS.md`、`PROJECT_MEMORY.md`、`docs` 或 `backend`。

建议验证：

```bash
cd frontend
npm run build
npm run dev
```

页面验证路径：访问 `/admin/page-config`，切换首页模块并修改主题色后点击保存；再访问 `/`，确认隐藏模块不展示且主题色生效。若后端未启动或未登录，保存会给出失败提示，读取仍会 fallback 到演示数据。

更新时间：2026-05-06

## 任务范围

本文件对应 FE01，用于记录现有前端结构、主要源码入口、页面/组件能力、运行与构建命令，以及教学门户 13 项功能的前端覆盖差距。本轮仅更新 `frontend/BASELINE.md`，未修改 `TASKS.md`、`PROJECT_MEMORY.md` 或其他 Agent 文件。

## 技术栈与工程结构

- 技术栈：Vue 3、Vite 6、TypeScript、Vue Router 4、Element Plus、Axios。
- 包管理：npm，锁文件为 `package-lock.json`。
- 构建产物：`dist/`，当前仓库已有历史构建产物；执行构建会重新生成 `dist/index.html` 与 `dist/assets/*`。
- 接口基础路径：`VITE_API_BASE_URL`，默认 `/api/v1`。
- 本地开发代理：Vite 将 `/api` 代理到 `http://localhost:8080`。

主要目录：

| 路径 | 说明 |
| --- | --- |
| `src/main.ts` | 应用入口，挂载 Vue、Router、Element Plus、全局样式。 |
| `src/App.vue` | 根组件，仅承载 `RouterView`。 |
| `src/router/index.ts` | 路由表与简单后台守卫。 |
| `src/api/client.ts` | Axios 客户端、接口封装、mock fallback 工具。 |
| `src/layouts/PortalLayout.vue` | 门户前台整体页头、导航、页脚、站点配置读取。 |
| `src/layouts/AdminLayout.vue` | `/admin` 管理后台布局。 |
| `src/layouts/CmsLayout.vue` | `/cms` CMS 后台布局。 |
| `src/views/portal/*` | 门户首页、课程中心、个人中心。 |
| `src/views/auth/*` | 登录、注册、403 页面。 |
| `src/views/admin/*` | 新版管理后台仪表盘、页面配置、课程、轮播、公告、用户、站点设置。 |
| `src/views/cms/*` | CMS 仪表盘、页面配置、内容管理、用户管理。 |
| `src/components/CourseCard.vue` | 课程卡片组件。 |
| `src/data/*` | 门户、后台、个人中心 mock 数据。 |
| `src/styles/base.css` | 全局样式和各页面样式。 |

## 路由与页面能力

| 路径 | 页面 | 当前能力 |
| --- | --- | --- |
| `/` | 门户首页 | 轮播、快捷入口、外部服务、站点配置、学院入口、推荐课程、新课速递、名师风采、通知公告、新闻资讯、友情链接；优先读 `/portal/home`，失败回退 mock。 |
| `/courses` | 课程中心 | 课程搜索框、学院/分类/级别筛选、排序、空状态；优先读 `/portal/courses` 与 `/portal/categories/tree`，失败回退 mock。 |
| `/profile` | 个人中心 | 当前用户资料、角色权限、在读课程、学习历史、通知；优先读 `/users/me`，失败回退 mock。 |
| `/login` | 登录 | 校外账号密码登录，写入 `portal_token` 后跳转 CMS。 |
| `/register` | 注册 | 校外用户注册表单，提交 `/auth/register`。 |
| `/admin/dashboard` | 管理后台仪表盘 | 统计卡、访问趋势、活动、待处理课程。 |
| `/admin/page-config` | 页面配置 | 页面列表、主题色展示、SEO 后缀输入；当前更偏展示，未形成保存闭环。 |
| `/admin/courses` | 课程管理 | 课程列表、筛选控件、操作按钮；读 `/admin/courses`。 |
| `/admin/banners` | 轮播管理 | 轮播配置列表能力，细节待继续联调确认。 |
| `/admin/notices` | 公告管理 | 公告列表能力，基于文章接口查询。 |
| `/admin/users` | 用户管理 | 用户列表与角色读取。 |
| `/admin/settings` | 站点设置 | 站点信息、访问域名、维护模式、CAS 与同步开关展示；未形成保存闭环。 |
| `/cms/dashboard` | CMS 仪表盘 | 内容统计、最近内容、后台数据 fallback。 |
| `/cms/pages` | CMS 页面配置 | 页面表单与列表展示；未形成保存闭环。 |
| `/cms/contents` | CMS 内容管理 | 内容列表读取。 |
| `/cms/users` | CMS 用户管理 | 用户列表读取。 |

## 接口封装现状

`src/api/client.ts` 已封装：

- `portalApi`：`/portal/home`、`/portal/courses`、`/portal/courses/{id}`、`/portal/courses/{id}/launch`、`/portal/categories/tree`、`/portal/categories/{code}/articles`、`/portal/articles/search`、`/portal/site-config`、`/portal/quick-links`、`/portal/external-links`、`/portal/friend-links`。
- `authApi`：`/auth/login`、`/auth/register`、`/auth/cas/login-url`。
- `cmsApi`：`/admin/categories/tree`、`/admin/categories`、`/admin/articles`、`/admin/users`、`/admin/dashboard`、`/admin/banners`、`/admin/quick-links`、`/admin/site-config`、`/admin/courses`、`/admin/roles`。
- `userApi`：`/users/me`、`/users/me/profile`。

注意事项：

- `withFallback` 让页面在后端不可用时仍可用 mock 数据展示，适合演示，但会掩盖接口失败；联调阶段需要增加显式 loading/error 状态。
- `cmsApi.getDashboard()` 调用 `/admin/dashboard`，当前 `docs/api-spec.md` 未明确该接口，需与 Backend Agent 对齐。
- `portalApi.getQuickLinks/getExternalLinks/getFriendLinks` 调用独立前台链接接口，当前 `docs/api-spec.md` 的已实现列表未明确这些独立接口，需确认是否由 `/portal/home` 或 `/portal/site-config` 聚合提供。
- 管理端多数写操作按钮尚未绑定接口，CMS 配置闭环不足。

## 运行与构建命令

在 `frontend` 目录执行：

```bash
npm install
npm run dev
npm run build
npm run preview
npm run typecheck
```

本轮已验证：

```bash
npm run build
```

结果：构建成功。Vite 提示主 JS chunk 超过 500 kB，可后续通过路由懒加载或手动分包优化。

本地访问建议：

- 开发服务：`http://localhost:5173/`
- 门户首页：`/`
- 课程中心：`/courses`
- 个人中心：`/profile`
- 登录注册：`/login`、`/register`
- 管理后台：`/admin/dashboard`
- CMS 后台：`/cms/dashboard`

## 13 项功能覆盖差距

| 编号 | 功能点 | 当前前端覆盖 | 差距 |
| --- | --- | --- | --- |
| P01 | 个性化门户页面 | 已有门户首页、站点配置、多个业务模块。 | 个性化配置未完整落到页面结构；文案存在明显编码/显示质量风险。 |
| P02 | 本地化部署 | Vite 构建可生成静态产物，API base 可配置。 | 缺少前端部署说明、环境变量示例、内网静态资源策略说明。 |
| P03 | 校园内网访问 | 页面可在本地构建运行。 | mock 数据使用多处 Unsplash 外链图片，不满足纯内网依赖；需本地化图片或提供降级资源。 |
| P04 | 独立域名 | `VITE_API_BASE_URL` 支持 API base 配置。 | 缺少 `.env` 示例、base/public path 策略、反向代理和跨域部署说明。 |
| P05 | CMS 后台 | 已有 `/cms` 与 `/admin` 两套后台页面。 | 页面体系重复；CRUD 保存、校验、成功/失败反馈、权限细节不完整。 |
| P06 | 栏目配置 | 页面配置和分类读取已出现。 | 栏目新增/编辑/排序/启停没有完整交互闭环。 |
| P07 | 模块显示隐藏 | 首页模块存在固定展示。 | 未读取模块开关并影响首页显示；缺少空状态策略。 |
| P08 | 多主题配色 | 后台有主题色 swatch 展示。 | 未实现真实主题变量切换、持久化、前台即时生效。 |
| P09 | 统一身份认证 | `authApi.casLoginUrl` 已封装，站点设置有 CAS 开关展示。 | 登录页没有统一认证入口和回调处理流程。 |
| P10 | 校外用户登录注册 | 登录和注册页面已存在并调用接口。 | 表单校验、错误提示、注册状态提示、登录态展示/退出闭环不足。 |
| P11 | 课程关键词检索 | `/courses` 有关键词输入和本地过滤，接口支持 keyword 参数。 | 输入未触发服务端检索刷新；缺少加载、异常、分页和结果页 URL 参数同步。 |
| P12 | 预设检索关键词 | 分类/学院/级别筛选存在。 | 未提供热门/预设关键词入口，点击触发检索未实现。 |
| P13 | 课程与内容模块展示 | 首页已有轮播、分类、公告、新闻、推荐课程、新课速递、名师、友情链接。 | 部分模块依赖 mock 或字段猜测；课程轮播/内容详情/新闻公告详情页缺失，CMS 配置影响展示未闭环。 |

## 质量与联调风险

- 多个 `.vue` 和 `.ts` 文件中的中文内容在终端输出中呈现为 mojibake；虽然 `npm run build` 通过，但页面实际展示可能不符合验收，需要浏览器视觉检查并统一文件编码/文案。
- 前端存在 `/admin` 和 `/cms` 两套后台入口，功能边界需要 PM/Frontend 确认后收敛，避免重复建设。
- 当前页面大量使用 mock fallback，适合演示，不适合联调验收；后续需要将接口失败显式暴露。
- 首页与 mock 数据引用公网图片，需替换为本地静态资源或后端媒体资源，才能支撑校园内网访问。
- `dist/` 已存在并可构建，但尚未形成部署文档和环境变量样例。

## 下一步建议

1. FE02：先收敛门户首页模块化结构，把轮播、课程分类、公告、新闻、推荐课程、新课速递、名师、友情链接拆成可配置组件。
2. FE06：补齐主题变量和模块显示隐藏读取逻辑，让 CMS 配置能真实影响前台。
3. FE03：将课程搜索改为服务端检索，补齐预设关键词、URL 参数、loading/error/empty/pagination。
4. FE04/FE05：补齐 CMS 保存闭环和统一认证入口，再与 Backend Agent 对齐接口字段。
5. 技术债：清理中文编码显示问题、替换公网图片、增加 `.env.example` 和前端部署说明。
