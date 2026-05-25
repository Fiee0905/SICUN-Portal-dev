# QA 验收总结与 AI 开发团队交付包

项目：SICUN-Portal

测试工作区：`D:\work2.0\SICUN-Portal_test` / `/mnt/d/work2.0/SICUN-Portal_test`

开发工作区边界：本轮 QA 不修改 `D:\work2.0\SICUN-Portal`

结论时间：2026-05-21

---

## 1. 最终验收结论

**结论：不通过。**

**交付建议：不建议交付、不建议上线、不建议进入正式验收交付。**

主要原因：

1. 存在未解决 P1：`BUG-001`，CAS callback 接受无效 ticket 并签发 `teacher001/internal` token，属于核心认证绕过。
2. 存在 P2：`BUG-002`，后端运行路径硬编码 `localhost:7001` CAS/LMS 地址，影响内网、独立域名、CAS/LMS 联调和生产部署。
3. no-mock / no-hardcoded 门禁未通过。
4. CMS CRUD 到前台展示闭环证据不足。
5. 校园内网、独立域名、真实 CAS、真实 LMS launch 缺少最终验收环境和证据。
6. 后端 `mvn test` 虽然 BUILD SUCCESS，但 `No tests to run`，不能作为充分质量回归依据。

---

## 2. 本轮已完成事项

### 2.1 环境修复与启动

已修复 Docker Compose 启动问题。

原问题：旧项目 `C:\Users\86199\Documents\New project` 遗留同名容器 `edu-portal-mysql` / `edu-portal-redis`，导致 Docker 仍尝试挂载旧路径：

```text
C:\Users\86199\Documents\New project\database\schema.sql
```

处理方式：

```bash
docker rm -f edu-portal-mysql edu-portal-redis
COMPOSE_PROJECT_NAME=sicun_portal_test docker compose up -d mysql redis
```

处理后：

- `edu-portal-mysql` 启动成功；
- `edu-portal-redis` 启动成功；
- MySQL 初始化脚本执行成功；
- 数据库表已创建。

### 2.2 后端启动与构建

由于 WSL 内无 Linux Java，使用 Windows JDK/Maven 执行：

```cmd
set JAVA_HOME=D:\Java\jdk-17
set PATH=D:\Java\jdk-17\bin;D:\Maven\apache-maven-3.9.11\bin;%PATH%
cd /d D:\work2.0\SICUN-Portal_test\backend
mvn.cmd test
mvn.cmd spring-boot:run
```

结果：

- `mvn test`：BUILD SUCCESS，但 No tests to run；
- Spring Boot 启动成功；
- Tomcat started on port 8080 with context path `/api`。

### 2.3 前端构建与访问

执行：

```bash
cd /mnt/d/work2.0/SICUN-Portal_test/frontend
npm install
npm run build
```

结果：

- `npm install` 成功；
- `npm run build` 成功；
- 存在 chunk 体积 warning，但不阻塞验收。

### 2.4 页面与接口冒烟

已验证：

- 首页可访问；
- 首页核心模块由 `/portal/home` 返回；
- 课程中心可访问；
- 搜索“人工智能”返回正确课程；
- 预设搜索关键词接口可用；
- 管理员 `admin/123456` 可登录；
- 未登录访问后台返回 401 或跳登录；
- 普通用户访问后台返回 403；
- automation 接口/权限冒烟：13 PASS / 0 FAIL / 0 BLOCKED。

---

## 3. 实际调用的子 profile

| 子 profile | 是否调用 | 任务摘要 | 返回结论 |
|---|---:|---|---|
| test-designer | 已调用 | 设计 13 项功能验收矩阵、权限/CMS/no-mock/接口自动化覆盖建议 | 指出 CAS、后台权限、no-mock、课程 launch、CMS CRUD、部署环境为重点风险 |
| automation | 已调用 | 执行接口/权限自动化冒烟和 no-mock 扫描 | 接口/权限基础冒烟通过；no-mock/安全门禁失败，发现 P1 |
| manual-tester | 已调用 | 执行首页、课程中心、搜索、后台登录等手工验收汇总 | 基础页面阶段性通过；CAS/no-mock、部署、CMS CRUD 阻塞 |
| bug-reviewer | 已调用 | 复核缺陷严重级别并写入正式 Bug 报告和修复建议 patch | `BUG-001` P1 成立并阻塞验收；`BUG-002` P2 成立 |
| acceptance | 已调用 | 最终质量门禁判断和交付建议 | 最终验收不通过，不建议交付 |

未调用的要求内子 profile：无。

---

## 4. Bug 清单

### BUG-001：CAS callback 接受无效 ticket 并签发内部用户 token

文件：

```text
qa/bug-reports/BUG-001.md
qa/bugfixes/BUG-001.patch
```

严重级别：**P1**

是否阻塞：**阻塞最终验收 / 阻塞发布**

复现：

```bash
curl -i -X POST 'http://172.19.192.1:8080/api/v1/auth/cas/callback' \
  -H 'Content-Type: application/json' \
  -d '{"ticket":"INVALID_QA_REVIEW_20260521","service":"http://qa.local/callback"}'
```

实际结果：

- HTTP 200；
- 返回 accessToken / refreshToken；
- 用户为 `teacher001`；
- 角色为 `internal`。

预期结果：

- 无效 ticket 必须拒绝；
- 不得签发 token；
- 应返回 400/401 或明确业务错误码。

最低修复要求：

1. 移除 `teacher001 / 123456` 硬编码 CAS 登录逻辑。
2. 接入真实 CAS serviceValidate 或可信 CAS mock。
3. 无效、空、过期、重放、service mismatch ticket 均必须拒绝。
4. 增加自动化回归。

---

### BUG-002：后端运行路径硬编码 localhost:7001 外部 CAS/LMS 地址

文件：

```text
qa/bug-reports/BUG-002.md
qa/bugfixes/BUG-002.patch
```

严重级别：**P2**

是否阻塞：

- 若验收包含 CAS/LMS 集成链路，则阻塞；
- 即使不单独阻塞，也必须在交付前修复。

问题表现：

- `/auth/cas/login-url` 返回 `http://localhost:7001/cas/login`；
- 课程 launch fallback 使用 `http://localhost:7001/course-platform/...`。

最低修复要求：

1. CAS base URL 配置化。
2. LMS base URL 配置化。
3. 非 local profile 不允许默认 `localhost:7001`。
4. redirectUri/service 需要编码和域名白名单校验。
5. 补充 no-localhost/no-mock 扫描和接口回归。

---

## 5. 阻塞项

| 阻塞项 | 影响 |
|---|---|
| BUG-001 P1 未修复 | 阻塞统一身份认证、安全验收、最终交付 |
| CAS 真实 ticket validation 缺失 | 阻塞 P09 统一身份认证 |
| hard-coded localhost:7001 | 影响 P03/P04/P09/LMS launch |
| CMS CRUD 前台同步未完整验证 | 阻塞 CMS 闭环验收 |
| 缺校园内网环境 | 阻塞 P03 |
| 缺独立域名环境 | 阻塞 P04 |
| 缺真实 LMS launch 环境 | 阻塞课程启动最终验收 |
| 后端无测试用例 | 影响自动化质量门禁 |

---

## 6. 应交付给 AI 开发团队的材料

建议直接把以下文件和说明交给 AI 开发团队。

### 6.1 必交付文件

```text
qa/QA_ACCEPTANCE_SUMMARY.md
qa/bug-reports/BUG-001.md
qa/bug-reports/BUG-002.md
qa/bugfixes/BUG-001.patch
qa/bugfixes/BUG-002.patch
qa/evidence/api_permission_smoke_result.json
qa/evidence/api_permission_smoke_raw.json
qa/evidence/api_permission_smoke_stdout.txt
qa/evidence/no_mock_scan_result.json
qa/evidence/no_mock_scan_summary.txt
qa/evidence/cas_callback_probe.txt
qa/bug-reports/automation-smoke-defect-candidates.md
```

### 6.2 建议附带说明

请 AI 开发团队优先处理：

1. 先修复 `BUG-001`，这是 P1 阻塞项。
2. 再修复 `BUG-002`，确保 CAS/LMS 地址配置化。
3. 修复后必须提供回归证据：
   - invalid ticket 返回 400/401；
   - 不返回 token；
   - valid ticket 在可信 CAS/mock 环境下正常；
   - `/auth/cas/login-url` 不再返回 localhost；
   - 课程 launch fallback 不再硬编码 localhost。
4. 补充后端自动化测试，因为当前 `mvn test` 显示 `No tests to run`。
5. 补齐 CMS CRUD 到前台同步测试。
6. 补齐内网、独立域名、CAS callback、LMS launch 环境配置和验证证据。

---

## 7. 建议给 AI 开发团队的任务单

### 任务 1：修复 CAS callback 认证绕过

优先级：P1 / 必须先修

目标：

- 移除硬编码 `teacher001 / 123456`；
- 接入 CAS ticket 校验；
- 无效 ticket 必须 fail closed；
- 补充回归测试。

验收标准：

```text
POST /auth/cas/callback invalid ticket -> 400/401
响应体不得包含 accessToken / refreshToken
valid ticket 在可信 CAS/mock 环境下可登录
```

### 任务 2：CAS/LMS 外部地址配置化

优先级：P2 / 发布前必须修

目标：

- 移除 `localhost:7001` 硬编码；
- 使用环境变量或 profile 配置；
- 非 local profile 禁止默认 localhost。

验收标准：

```text
/auth/cas/login-url 不返回 localhost:7001
course launch fallback 不返回 localhost:7001
缺少 LMS_BASE_URL 时返回明确配置错误，而不是生成错误跳转
```

### 任务 3：补充自动化测试

优先级：P1

目标：

- 认证测试；
- 权限测试；
- CAS invalid/valid/expired/replay/service mismatch；
- 后台 401/403；
- 课程 launch 权限；
- no-mock/no-localhost 扫描。

验收标准：

```text
mvn test 不再是 No tests to run
认证和权限核心测试全部通过
```

### 任务 4：补齐 CMS CRUD 前台同步闭环

优先级：P1

目标：

- 课程；
- 新闻；
- 公告；
- 轮播；
- 名师风采；
- 友情链接；
- 页面配置。

验收标准：

```text
后台新增/编辑/禁用/删除后，前台公开页面同步展示或隐藏
未授权用户访问后台写接口返回 401/403
```

### 任务 5：补齐部署验收配置

优先级：P2

目标：

- 校园内网地址；
- 独立域名或 hosts 模拟域名；
- CORS / 反向代理；
- CAS callback service；
- LMS launch 地址。

验收标准：

```text
内网/域名下前端、接口、静态资源、CAS/LMS 跳转均正常
无 localhost 硬编码泄露
```

---

## 8. 复验建议

开发修复后，QA 复验顺序建议：

1. 回归 BUG-001；
2. 回归 BUG-002；
3. 运行后端自动化测试；
4. 运行接口/权限矩阵；
5. 执行 no-mock/no-localhost 扫描；
6. 执行 CMS CRUD 前台同步专项；
7. 执行内网/独立域名/CAS/LMS 部署专项；
8. acceptance 重新给出最终验收结论。

---

## 9. 当前交付状态

```text
当前状态：QA 已完成本轮验收
最终结论：不通过
是否建议交付：否
必须先修复：BUG-001 P1
建议同时修复：BUG-002 P2
```
