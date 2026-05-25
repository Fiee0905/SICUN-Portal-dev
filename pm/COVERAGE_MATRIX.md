# 教学门户 13 项功能覆盖矩阵

更新日期：2026-05-06  
责任角色：PM Agent  
适用范围：教学门户模块 P01-P13 投标/项目功能点覆盖追踪。

## 状态口径

| 状态 | 含义 |
| --- | --- |
| 已覆盖 | 前端、后端、配置来源与 QA 验收方式均已有明确交付物或可执行路径。 |
| 部分覆盖 | 已有部分设计、接口、页面或数据基础，但仍需联调、补页、补接口或补验收证据。 |
| 待确认 | 依赖外部环境、真实协议、部署资源或投标细项，需要 PM/相关 Agent 进一步确认。 |
| 未覆盖 | 当前未看到可追踪交付物。 |

## 覆盖矩阵

| 功能编号 | 投标/项目要求 | 前端交付物 | 后端接口/数据 | 配置来源 | QA 验收方式 | 当前状态 | 风险/待确认 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P01 | 个性化门户页面，首页可聚合展示课程、公告、资讯、推荐内容等。 | 门户首页；轮播、快捷入口、新闻公告、推荐课程、新课、名师、友情链接等模块；空态/加载态。 | `GET /api/v1/portal/home`；`portal_banner`、`portal_quick_link`、`portal_site_config`、`portal_page_config`、CMS 发布内容、课程数据。 | CMS 后台首页配置、站点配置、栏目/文章发布状态、课程展示字段。 | 启动前后端后访问首页；校验首页模块展示、禁用内容不展示；接口校验 `curl http://localhost:8080/api/v1/portal/home`。 | 部分覆盖 | 后端聚合接口已有文档/实现记录，前端页面接入与真实数据展示证据待 FE/QA 补齐。 |
| P02 | 本地化部署，系统可在本地环境完整启动和运行。 | 构建产物、环境变量说明、前端本地启动命令。 | Spring Boot 服务、MySQL/Redis 初始化、数据库 schema/seed、运行配置。 | `.env` 或前端环境变量；后端 `application*.yml`；`docker-compose.yml`；数据库初始化脚本。 | 按 `docker compose up -d mysql redis`、后端启动、前端启动顺序进行冒烟；验证首页/API/后台可访问。 | 部分覆盖 | 需确认最终部署说明责任文件；真实投标环境可能要求离线包、服务器规格、Nginx/域名配置。 |
| P03 | 校园内网访问，门户和接口可在校园网环境访问。 | 前端静态资源不依赖公网；API Base URL 可配置；外部图片/字体有本地或降级方案。 | 内网地址绑定、CORS、反向代理、CAS/LMS 内网连通配置。 | Nginx/网关配置；前端 API Base URL；后端 allowed origins；校园网 DNS/IP。 | 在内网地址访问门户和 `/api/v1/portal/home`；断公网资源后进行页面冒烟。 | 待确认 | 依赖真实校园网、DNS、反向代理和外部系统白名单，本地只能做配置级验证。 |
| P04 | 独立域名访问，页面、接口、认证回调在独立域名下正常运行。 | 支持配置 API Base URL、静态资源 public path、登录回调地址。 | 域名、CORS、Cookie/Token、CAS service/redirectUri、课程跳转回调配置。 | 域名 DNS；Nginx/网关；后端 CORS/Auth 配置；CAS/LMS 白名单。 | 使用独立域名访问门户；验证登录回调、接口请求、静态资源加载无跨域错误。 | 待确认 | 真实域名、HTTPS 证书、CAS 回调白名单未确认；需 BE/运维协同。 |
| P05 | CMS 后台，管理员可维护门户内容与运营配置。 | CMS 后台页面：栏目、文章、轮播、快捷入口、配置、审核/发布操作。 | 栏目 CRUD：`/api/v1/admin/categories*`；文章工作流：`/api/v1/admin/articles*`；媒体、轮播、快捷入口、审计日志接口。 | CMS 数据库表；角色权限；后台运营配置。 | 管理员登录后新增/编辑/提交/审核/发布文章；验证前台只展示已发布内容；检查审计日志。 | 部分覆盖 | 接口文档与实现记录较完整；后台权限是否真实强制、前端后台页面覆盖度待确认。 |
| P06 | 栏目配置，栏目名称、顺序、启停等可维护并影响门户展示。 | 栏目管理页；栏目树、排序、启用/停用、路径/编码配置。 | `GET/POST/PUT/DELETE /api/v1/admin/categories`；`PUT /api/v1/admin/categories/{id}/status`；前台 `GET /api/v1/portal/categories/tree`。 | `cms_category`；栏目 `code/name/path/sortOrder/visible/status`。 | 调整栏目名称、顺序、启停后刷新前台栏目树和文章列表；接口断言隐藏栏目不返回。 | 部分覆盖 | 栏目字段命名需与前端表单、接口文档保持一致；删除/禁用对已发布内容影响需确认。 |
| P07 | 模块显示/隐藏，首页模块可通过后台开关控制展示。 | 首页模块根据配置动态渲染；隐藏模块空位处理；CMS 模块开关页。 | `GET /api/v1/portal/page-config/{pageCode}`；`GET/PUT /api/v1/admin/page-config/{pageCode}`；首页聚合接口读取配置。 | `portal_page_config.layoutJson`、站点配置、模块 enabled/visible 字段。 | 在 CMS 关闭新闻/推荐课程等模块后，前台首页不展示；恢复后重新展示。 | 部分覆盖 | 模块配置 JSON schema 需明确；FE/BE 对模块编码、默认值、空态处理需联调。 |
| P08 | 多主题配色，门户可切换并持久化不同主题。 | 主题切换控件；CSS 变量/主题样式；门户和后台基础适配。 | 站点配置接口：`GET /api/v1/portal/site-config`、`GET/PUT /api/v1/admin/site-config`；可扩展主题配置字段。 | `portal_site_config` 或前端本地存储；主题 token 配置。 | 切换主题后刷新页面仍生效；检查门户首页、列表页、后台主要控件无明显样式异常。 | 部分覆盖 | 当前接口可承载配置，但主题字段、主题数量、是否按用户持久化待确认。 |
| P09 | 统一身份认证，校内用户可通过学校统一认证登录。 | 登录入口；CAS 跳转/回调页；用户状态展示；登录失败提示。 | `GET /api/v1/auth/cas/login-url`；`POST /api/v1/auth/cas/callback`；`GET /api/v1/users/me`；集成 Mock：`POST /mock/cas/login`、`POST /mock/cas/serviceValidate`。 | CAS 服务地址、service/redirectUri、Token 配置、用户映射规则。 | 使用集成 Mock 获取 ticket 并回调登录；验证过期/重放/错误 ticket；登录后调用 `/users/me`。 | 部分覆盖 | 真实 CAS 协议、回调地址、测试账号、用户字段映射未确认；当前可能仍有开发 stub。 |
| P10 | 校外用户登录/注册，校外用户可注册、登录并按权限访问资源。 | 注册页、登录页、找回/错误提示、待审核状态提示。 | `POST /api/v1/auth/register`；`POST /api/v1/auth/login`；`POST /api/v1/auth/refresh`；`POST /api/v1/auth/logout`；后台用户审核 `/api/v1/admin/users/{id}/status`。 | `sys_user`、角色权限、用户状态 `PENDING_REVIEW/ACTIVE/REJECTED/DISABLED`。 | 注册校外用户后验证待审核；管理员审核通过后登录；禁用用户登录失败；访问受限资源校验权限。 | 部分覆盖 | 密码策略、验证码/短信/邮箱验证、找回密码是否纳入一期范围待确认。 |
| P11 | 课程关键词检索，输入关键词可返回相关课程并支持筛选。 | 搜索框、课程结果页、分页、分类/学期筛选、排序、空态。 | `GET /api/v1/portal/courses?page=&size=&termCode=&keyword=`；课程详情 `GET /api/v1/portal/courses/{id}`；课程数据 `course_catalog`。 | 课程同步数据、课程分类/学期、课程展示状态。 | 用课程名、教师名、课程编码等关键词检索；验证分页、空结果、停用课程不展示。 | 部分覆盖 | 关键词匹配字段和排序规则需 BE/FE/QA 明确；是否需要全文搜索引擎暂未确认。 |
| P12 | 预设检索关键词，前台展示热门/预设关键词，点击触发检索。 | 热门关键词入口；点击后带关键词跳转/刷新课程结果。 | 可通过站点配置或专门接口返回预设关键词；当前可暂挂 `GET /api/v1/portal/site-config`。 | `portal_site_config` 中的 preset/hot keywords，或后续独立配置表。 | CMS 修改预设关键词后前台展示更新；点击关键词后调用课程检索并展示结果。 | 待确认 | 当前接口文档未明确独立关键词接口和字段；需确认配置结构、排序、数量上限。 |
| P13 | 课程与内容模块展示：课程轮播、课程分类、通知公告、新闻资讯、推荐课程、新课速递、名师风采、友情链接。 | 首页各内容模块；课程分类/轮播/列表；新闻公告列表与详情；名师与友情链接展示。 | 首页聚合 `GET /api/v1/portal/home`；栏目/文章接口；课程列表/详情/launch；轮播/快捷入口后台接口。 | CMS 栏目与文章；`portal_banner`；`portal_quick_link`；课程目录；页面模块配置。 | 逐模块准备测试数据，验证前台展示、排序、跳转、隐藏开关、空态；课程 launch 需登录后验证。 | 部分覆盖 | P13 是组合项，需拆分为 QA 子用例；名师风采、友情链接与快捷入口/文章栏目之间的数据归属需确认。 |

## 关键结论

1. 13 项功能均已建立可追踪的前端、后端、配置与 QA 验收映射，没有发现完全无法映射的功能点。
2. 当前整体状态以“部分覆盖”为主：后端接口文档和部分实现记录较完整，前端页面接入、真实权限、联调证据和 QA 执行记录仍需补齐。
3. P03、P04、P09、P12 是 PM 侧需要重点跟踪的待确认项，分别依赖校园网/域名环境、真实统一认证协议与预设关键词配置口径。
4. 接口文档路径仍存在命名风险：项目规则要求 `docs/API.md`，仓库当前主要维护 `docs/api-spec.md`。本矩阵暂以现有 `docs/api-spec.md` 为接口追踪来源，不变更其他文件。

