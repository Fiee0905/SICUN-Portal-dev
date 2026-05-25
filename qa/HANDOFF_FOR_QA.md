# QA 验收交付入口

本文档用于交付给 `qa-team/qa-pm`，由测试负责人统一安排测试设计、手工测试、自动化测试、Bug 复核和最终验收。

测试团队应以本文档列出的材料作为验收入口，不默认阅读开发团队过程文件。

## 必读文件

### 1. 测试文档

- `qa/ACCEPTANCE_CHECKLIST.md`
- `qa/checklists/final-13-feature-traceability.md`
- `qa/checklists/functional-completeness.md`
- `qa/CMS_ADMIN_CRUD_ACCEPTANCE.md`
- `qa/AUTH_PERMISSION_ACCEPTANCE.md`
- `qa/CONFIG_ACCEPTANCE.md`
- `qa/CONTENT_REAL_DATA_ACCEPTANCE.md`
- `qa/NO_MOCK_BUSINESS_DATA_ACCEPTANCE.md`

### 2. 接口与运行资料

- `README.md`
- `docs/API.md`
- `docs/api-spec.md`
- `docs/test-plan.md`
- `database/schema.sql`
- `database/seed.sql`

## 非默认阅读文件

以下文件属于开发团队协作、任务流转或历史记忆，不作为测试团队默认验收依据：

- `AGENTS.md`
- `PROJECT_MEMORY.md`
- `TASKS.md`
- `pm/`
- `frontend/AGENTS.md`
- `backend/AGENTS.md`

如验收过程中需要追溯开发背景、确认历史决策或定位争议问题，再由项目方单独提供。

## 角色分工建议

- `qa-pm`：读取本文档和必读文件，制定验收计划，分配任务，汇总风险和结论。
- `test-designer`：基于测试文档补充用例，重点覆盖 13 项功能、权限、CMS 闭环和真实数据展示。
- `manual-tester`：执行页面流程、后台配置、前台展示和权限访问测试。
- `automation`：执行接口测试、构建验证、冒烟脚本和可重复回归检查。
- `bug-reviewer`：复核缺陷是否可复现，确认严重级别和影响范围。
- `acceptance`：根据测试结果给出最终验收结论。

## 验收重点

- 教学门户 13 项功能覆盖。
- CMS 后台增删改查后，前台公开页面能同步展示。
- 登录、注册、游客、普通用户、管理员权限边界正确。
- 课程检索、课程分类、推荐课程、新课速递等课程模块可用。
- 新闻公告、名师风采、友情链接等内容模块来自真实接口数据。
- 禁止使用 mock 业务数据作为验收通过依据。
- 接口返回字段与 `docs/API.md`、`docs/api-spec.md` 一致。

## 启动与验证命令

```powershell
docker compose up -d mysql redis
```

```powershell
cd backend
mvn test
mvn spring-boot:run
```

```powershell
cd frontend
npm install
npm run build
npm run dev
```

默认地址：

- 前端：`http://localhost:5173`
- 后端：`http://localhost:8080/api`

## 最终输出要求

测试团队最终应输出：

- 验收结论：通过 / 有条件通过 / 不通过。
- 13 项功能覆盖结果。
- 页面测试结果。
- 接口测试结果。
- 权限测试结果。
- Bug 清单、严重级别和复现步骤。
- 阻塞项和剩余风险。
- 是否建议交付验收。
