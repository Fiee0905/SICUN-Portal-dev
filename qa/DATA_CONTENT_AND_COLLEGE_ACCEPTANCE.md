# 数据内容与开课单位验收记录

## 范围

- 中文乱码治理：前台、后台、后端返回文案、数据库种子数据。
- 开课单位闭环：后台 CRUD、公开列表、课程管理下拉、课程中心筛选。
- 精选课程闭环：课程管理 `featured` 推荐字段、首页精选课程展示。
- 正式展示数据：学院、课程、新闻公告、名师风采、友情链接、仪表盘统计。

## 自动验证

- `cd backend && mvn test`：通过，当前后端无测试源码，编译链路通过。
- `cd frontend && npm.cmd run build`：通过，保留 Vite 大 chunk 警告。
- 乱码扫描：`frontend/src`、`backend/src/main/java`、`database` 未命中常见 mojibake 模式。

## 手工验收路径

- `/admin/colleges`：新增、编辑、删除/停用开课单位。
- `/admin/courses`：选择开课单位，切换“推荐到精选课程”。
- `/courses`：学院筛选项来自 `/portal/colleges`，筛选请求带 `department` 参数。
- `/`：首页精选课程来自 `featured=true` 的在线课程。
- `/admin/dashboard`：统计和近期课程来自数据库，不显示 mock 数据。

## 通过标准

- 删除或停用开课单位后，前台学院筛选不再出现该单位。
- 课程绑定某开课单位后，课程中心筛选该单位只返回对应课程。
- 课程设置推荐后出现在首页精选课程，取消推荐或下架后消失。
- 导入 `database/schema.sql` 与 `database/seed.sql` 后，关键模块有适合四川师范大学课程门户语境的展示数据。
