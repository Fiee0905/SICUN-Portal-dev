USE edu_portal;

SET NAMES utf8mb4;

INSERT INTO sys_user (id, username, password_hash, display_name, email, mobile, user_type, role, source, status, organization)
VALUES
  (1, 'admin', '{noop}123456', '系统管理员', 'admin@sicnu.edu.cn', '028-84760000', 'STAFF', 'admin', 'LOCAL', 'ACTIVE', '信息化建设与管理处'),
  (2, 'student001', '{noop}123456', '师大学生', 'student001@sicnu.edu.cn', '13800000001', 'STUDENT', 'internal', 'CAS', 'ACTIVE', '计算机科学学院'),
  (3, 'teacher001', '{noop}123456', '任课教师', 'teacher001@sicnu.edu.cn', '13800000002', 'TEACHER', 'internal', 'CAS', 'ACTIVE', '教育科学学院'),
  (4, 'outside001', '{noop}123456', '访客用户', 'outside001@example.com', '13800000003', 'GUEST', 'external', 'LOCAL', 'ACTIVE', '继续教育学习者')
ON DUPLICATE KEY UPDATE
  username = VALUES(username),
  password_hash = VALUES(password_hash),
  display_name = VALUES(display_name),
  email = VALUES(email),
  mobile = VALUES(mobile),
  user_type = VALUES(user_type),
  role = VALUES(role),
  source = VALUES(source),
  status = VALUES(status),
  organization = VALUES(organization);

INSERT INTO sys_role (id, code, name, description, enabled)
VALUES
  (1, 'SUPER_ADMIN', '超级管理员', '拥有课程门户全部管理权限', 1),
  (2, 'PORTAL_INTERNAL', '校内用户', '通过统一身份认证访问校内课程资源', 1),
  (3, 'PORTAL_EXTERNAL', '校外访客', '访问公开课程与门户资讯', 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  enabled = VALUES(enabled);

INSERT INTO sys_permission (code, name, resource_type, description)
VALUES
  ('portal:course:public', '公开课程访问', 'API', '访问公开课程资源'),
  ('portal:course:internal', '校内课程访问', 'API', '访问校内课程资源'),
  ('portal:course:private', '受限课程访问', 'API', '访问受限课程资源'),
  ('portal:config:read', '门户配置读取', 'API', '读取门户配置'),
  ('portal:config:update', '门户配置维护', 'API', '维护门户配置'),
  ('cms:category:read', '栏目读取', 'API', '读取 CMS 栏目'),
  ('cms:article:read', '内容读取', 'API', '读取新闻公告内容'),
  ('course:read', '课程读取', 'API', '读取课程信息'),
  ('course:update', '课程维护', 'API', '维护课程信息'),
  ('sys:user:read', '用户读取', 'API', '读取用户信息')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  resource_type = VALUES(resource_type),
  description = VALUES(description);

INSERT INTO sys_user_role (user_id, role_id)
VALUES
  (1, 1),
  (2, 2),
  (3, 2),
  (4, 3)
ON DUPLICATE KEY UPDATE user_id = VALUES(user_id);

INSERT INTO sys_role_permission (role_id, permission_id)
SELECT 1, id FROM sys_permission
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

INSERT INTO sys_role_permission (role_id, permission_id)
SELECT 2, id FROM sys_permission
WHERE code IN ('portal:course:public', 'portal:course:internal')
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

INSERT INTO sys_role_permission (role_id, permission_id)
SELECT 3, id FROM sys_permission
WHERE code IN ('portal:course:public')
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

INSERT INTO cms_category (id, parent_id, code, name, path, site_code, sort_order, visible, enabled)
VALUES
  (1, NULL, 'news', '新闻资讯', '/news', 'main', 10, 1, 1),
  (2, NULL, 'notice', '通知公告', '/notice', 'main', 20, 1, 1),
  (4, NULL, 'topic', '专题动态', '/topics', 'main', 30, 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  path = VALUES(path),
  sort_order = VALUES(sort_order),
  visible = VALUES(visible),
  enabled = VALUES(enabled);

INSERT INTO cms_article (id, category_id, title, slug, summary, content, author, source_name, tags, status, featured, pinned, published_at, created_by, updated_by)
VALUES
  (1, 1, '四川师范大学课程教学门户上线试运行', 'portal-online-trial', '学校课程教学门户完成门户展示、课程检索、资源入口和后台内容维护能力建设，面向师生试运行。', '<p>课程教学门户聚合课程资源、通知公告、新闻资讯、名师风采与友情链接，为师生提供统一的课程资源访问入口。</p>', '课程门户建设组', '信息化建设与管理处', '门户,上线,课程资源', 'PUBLISHED', 1, 1, NOW(), 1, 1),
  (2, 1, '智慧教学资源建设专题培训顺利开展', 'smart-teaching-training', '学校围绕课程资源建设、在线教学活动设计和教学数据应用开展专题培训。', '<p>培训面向各学院教学秘书、课程负责人和一线教师，重点讲解课程资源上传、课程推荐和门户内容维护流程。</p>', '教学发展中心', '教务处', '智慧教学,培训', 'PUBLISHED', 1, 0, NOW(), 1, 1),
  (3, 2, '关于做好本学期课程资源维护工作的通知', 'course-resource-maintenance', '请各开课单位及时核对课程基本信息、任课教师、课程分类和访问权限。', '<p>各学院应在规定时间内完成课程信息核验，确保课程中心筛选、首页推荐和后台统计数据准确。</p>', '教务处', '教务处', '课程维护,通知', 'PUBLISHED', 0, 1, NOW(), 1, 1),
  (4, 2, '课程推荐与精选展示规则说明', 'featured-course-rule', '课程被设置为推荐后，将进入首页精选课程模块；下架或取消推荐后不再展示。', '<p>管理员可在课程管理中维护推荐状态。推荐课程需保证课程名称、教师、开课单位、分类等字段完整。</p>', '课程门户建设组', '信息化建设与管理处', '精选课程,规则', 'PUBLISHED', 0, 0, NOW(), 1, 1),
  (5, 4, '师范教育数字化转型专题', 'teacher-education-digital-topic', '聚焦师范教育数字化、课程资源共建共享和课堂教学质量提升。', '<p>专题汇集教育技术、教师专业发展、课堂评价等方向课程与资讯。</p>', '教学发展中心', '教务处', '专题,师范教育', 'PUBLISHED', 1, 0, NOW(), 1, 1)
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id),
  title = VALUES(title),
  slug = VALUES(slug),
  summary = VALUES(summary),
  content = VALUES(content),
  author = VALUES(author),
  source_name = VALUES(source_name),
  tags = VALUES(tags),
  status = VALUES(status),
  featured = VALUES(featured),
  pinned = VALUES(pinned),
  published_at = VALUES(published_at),
  updated_by = VALUES(updated_by);

INSERT INTO portal_college (id, site_code, name, code, description, sort_order, enabled)
VALUES
  (1, 'main', '教育科学学院', 'EDU', '负责教育学、心理学与教师教育相关课程建设。', 10, 1),
  (2, 'main', '计算机科学学院', 'CS', '负责计算机基础、人工智能与教育信息技术相关课程建设。', 20, 1),
  (3, 'main', '文学院', 'CHN', '负责中国语言文学、写作与传统文化相关课程建设。', 30, 1),
  (4, 'main', '数学科学学院', 'MATH', '负责数学基础、数学教育与数据素养相关课程建设。', 40, 1),
  (5, 'main', '外国语学院', 'FL', '负责大学英语、英语教育与跨文化交流相关课程建设。', 50, 1),
  (6, 'main', '马克思主义学院', 'MARX', '负责思想政治理论课与课程思政资源建设。', 60, 1)
ON DUPLICATE KEY UPDATE
  site_code = VALUES(site_code),
  name = VALUES(name),
  code = VALUES(code),
  description = VALUES(description),
  sort_order = VALUES(sort_order),
  enabled = VALUES(enabled);

INSERT INTO portal_teacher (id, site_code, name, title, college, achievement, research, course_count, avatar_url, sort_order, enabled)
VALUES
  (1, 'main', '张明', '教授、省级教学名师', '计算机科学学院', '长期承担人工智能基础与计算机公共课建设，主持多项省级教改项目。', '人工智能教育应用、计算机基础教学', 6, '/assets/logo.png', 10, 1),
  (2, 'main', '李雪', '教授', '教育科学学院', '主持教师教育课程群建设，获校级教学成果一等奖。', '课程与教学论、教师专业发展', 8, '/assets/logo.png', 20, 1),
  (3, 'main', '王蕾', '副教授', '文学院', '主讲大学写作与中华优秀传统文化课程，参与省级一流课程建设。', '现当代文学、写作教学', 5, '/assets/logo.png', 30, 1)
ON DUPLICATE KEY UPDATE
  site_code = VALUES(site_code),
  name = VALUES(name),
  title = VALUES(title),
  college = VALUES(college),
  achievement = VALUES(achievement),
  research = VALUES(research),
  course_count = VALUES(course_count),
  avatar_url = VALUES(avatar_url),
  sort_order = VALUES(sort_order),
  enabled = VALUES(enabled);

INSERT INTO portal_banner (id, title, image_url, link_url, position, sort_order, enabled, start_at, end_at)
VALUES
  (1, '四川师范大学课程教学门户', '/assets/banners/portal-home.jpg', '/courses', 'HOME_TOP', 10, 1, NOW(), NULL)
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  image_url = VALUES(image_url),
  link_url = VALUES(link_url),
  position = VALUES(position),
  sort_order = VALUES(sort_order),
  enabled = VALUES(enabled);

INSERT INTO portal_quick_link (id, title, icon_url, link_url, link_type, sort_order, enabled)
VALUES
  (1, '课程中心', '/assets/icons/course.svg', '/courses', 'INTERNAL', 10, 1),
  (2, '通知公告', '/assets/icons/notice.svg', '/notices', 'INTERNAL', 20, 1),
  (3, '统一登录', '/assets/icons/cas.svg', '/login', 'INTERNAL', 30, 1)
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  icon_url = VALUES(icon_url),
  link_url = VALUES(link_url),
  link_type = VALUES(link_type),
  sort_order = VALUES(sort_order),
  enabled = VALUES(enabled);

INSERT INTO portal_friend_link (id, site_code, title, url, logo_url, description, sort_order, enabled)
VALUES
  (1, 'main', '四川师范大学官网', 'https://www.sicnu.edu.cn', NULL, '学校官方网站', 1, 1),
  (2, 'main', '教务处', '#', NULL, '本科教学运行与教务服务入口', 10, 1),
  (3, 'main', '图书馆', '#', NULL, '图书文献与学习空间服务入口', 20, 1),
  (4, 'main', '教学发展中心', '#', NULL, '教师教学发展与培训资源入口', 30, 1)
ON DUPLICATE KEY UPDATE
  site_code = VALUES(site_code),
  title = VALUES(title),
  url = VALUES(url),
  logo_url = VALUES(logo_url),
  description = VALUES(description),
  sort_order = VALUES(sort_order),
  enabled = VALUES(enabled);

INSERT INTO portal_site_config (site_code, config_key, config_value, value_type, description)
VALUES
  ('main', 'site.name', '四川师范大学课程教学门户', 'STRING', '站点名称'),
  ('main', 'site.logo', '/assets/logo.png', 'STRING', '站点 Logo'),
  ('main', 'site.description', '汇聚四川师范大学课程资源、新闻公告、名师风采与教学服务入口，支撑师生便捷获取课程教学资源。', 'STRING', '门户简介'),
  ('main', 'site.copyright', '© 2026 四川师范大学 版权所有', 'STRING', '页脚版权'),
  ('main', 'site.icp', '蜀ICP备12345678号-1', 'STRING', 'ICP备案号'),
  ('main', 'site.contactPhone', '028-84760000', 'STRING', '联系电话'),
  ('main', 'site.contactEmail', 'course-support@sicnu.edu.cn', 'STRING', '联系邮箱'),
  ('main', 'site.address', '四川省成都市锦江区静安路5号', 'STRING', '联系地址'),
  ('main', 'home.news.limit', '6', 'NUMBER', '首页新闻数量'),
  ('main', 'home.notice.limit', '6', 'NUMBER', '首页公告数量'),
  ('main', 'course.search.keywords', '教师教育,人工智能,课程思政,大学写作,数学素养', 'STRING', '课程搜索推荐关键词'),
  ('main', 'theme.primary', '#e51f09', 'STRING', '门户主色'),
  ('main', 'theme.primaryDark', '#b91c1c', 'STRING', '门户深主色'),
  ('main', 'theme.dark', '#111827', 'STRING', '门户深色文字')
ON DUPLICATE KEY UPDATE
  config_value = VALUES(config_value),
  value_type = VALUES(value_type),
  description = VALUES(description);

INSERT INTO portal_page_config (site_code, page_code, page_title, layout_json, seo_json, enabled)
VALUES
  ('main', 'home', '课程教学门户首页',
   JSON_OBJECT('sections', JSON_ARRAY(
     JSON_OBJECT('code', 'banner', 'enabled', TRUE),
     JSON_OBJECT('code', 'quickLinks', 'enabled', TRUE),
     JSON_OBJECT('code', 'colleges', 'enabled', TRUE),
     JSON_OBJECT('code', 'courses', 'enabled', TRUE),
     JSON_OBJECT('code', 'newCourses', 'enabled', TRUE),
     JSON_OBJECT('code', 'teachers', 'enabled', TRUE),
     JSON_OBJECT('code', 'notices', 'enabled', TRUE),
     JSON_OBJECT('code', 'news', 'enabled', TRUE),
     JSON_OBJECT('code', 'friendLinks', 'enabled', TRUE)
   )),
   JSON_OBJECT('title', '四川师范大学课程教学门户', 'description', '统一课程教学资源门户首页'),
   1)
ON DUPLICATE KEY UPDATE
  page_title = VALUES(page_title),
  layout_json = VALUES(layout_json),
  seo_json = VALUES(seo_json),
  enabled = VALUES(enabled);

INSERT INTO course_term (id, term_code, term_name, start_date, end_date, current_term)
VALUES
  (1, '2026-SPRING', '2026年春季学期', '2026-02-23', '2026-07-10', 1)
ON DUPLICATE KEY UPDATE
  term_name = VALUES(term_name),
  start_date = VALUES(start_date),
  end_date = VALUES(end_date),
  current_term = VALUES(current_term);

INSERT INTO course_catalog (id, external_course_id, term_id, course_code, course_name, teacher_name, department, category, credit, cover_url, launch_url, status, permission, featured, description, last_synced_at, raw_json)
VALUES
  (1, 'LMS-EDU101-2026-SPRING', 1, 'EDU101', '教育学原理', '李雪', '教育科学学院', '教师教育', 3.0, '/assets/courses/edu101.jpg', 'https://lms.sicnu.edu.cn/course/EDU101', 'ACTIVE', 'public', 1, '面向师范生的教育学基础课程，系统讲授教育目的、课程、教学、评价与学校制度。', NOW(), JSON_OBJECT('source', 'seed')),
  (2, 'LMS-CS201-2026-SPRING', 1, 'CS201', '人工智能基础与教育应用', '张明', '计算机科学学院', '新工科与智慧教育', 2.5, '/assets/courses/cs201.jpg', 'https://lms.sicnu.edu.cn/course/CS201', 'ACTIVE', 'public', 1, '介绍人工智能基本概念、典型算法与教育场景应用，适合跨专业学习。', NOW(), JSON_OBJECT('source', 'seed')),
  (3, 'LMS-CHN105-2026-SPRING', 1, 'CHN105', '大学写作与表达', '王蕾', '文学院', '通识课程', 2.0, '/assets/courses/chn105.jpg', 'https://lms.sicnu.edu.cn/course/CHN105', 'ACTIVE', 'public', 1, '围绕学术写作、应用写作与课堂表达训练，提升学生书面和口头表达能力。', NOW(), JSON_OBJECT('source', 'seed')),
  (4, 'LMS-MATH120-2026-SPRING', 1, 'MATH120', '数学思想与方法', '陈立', '数学科学学院', '通识课程', 2.0, '/assets/courses/math120.jpg', 'https://lms.sicnu.edu.cn/course/MATH120', 'ACTIVE', 'public', 0, '以问题为导向介绍函数、模型、证明与数学文化，培养数学思维。', NOW(), JSON_OBJECT('source', 'seed')),
  (5, 'LMS-FL210-2026-SPRING', 1, 'FL210', '跨文化交际与大学英语', '周雅', '外国语学院', '语言文化', 2.0, '/assets/courses/fl210.jpg', 'https://lms.sicnu.edu.cn/course/FL210', 'ACTIVE', 'public', 0, '结合真实语境开展英语交流、文化比较与跨文化沟通训练。', NOW(), JSON_OBJECT('source', 'seed')),
  (6, 'LMS-MARX301-2026-SPRING', 1, 'MARX301', '课程思政教学设计', '刘俊', '马克思主义学院', '课程思政', 2.0, '/assets/courses/marx301.jpg', 'https://lms.sicnu.edu.cn/course/MARX301', 'ACTIVE', 'internal', 1, '面向教师开展课程思政目标提炼、案例设计和课堂实施方法训练。', NOW(), JSON_OBJECT('source', 'seed')),
  (7, 'LMS-EDU220-2026-SPRING', 1, 'EDU220', '课堂观察与教学评价', '李雪', '教育科学学院', '教师教育', 2.0, '/assets/courses/edu220.jpg', 'https://lms.sicnu.edu.cn/course/EDU220', 'ACTIVE', 'internal', 0, '通过课堂案例分析和评价工具训练，提升师范生教学诊断能力。', NOW(), JSON_OBJECT('source', 'seed')),
  (8, 'LMS-CS110-2026-SPRING', 1, 'CS110', '大学计算机基础', '张明', '计算机科学学院', '公共基础', 2.0, '/assets/courses/cs110.jpg', 'https://lms.sicnu.edu.cn/course/CS110', 'ACTIVE', 'public', 0, '面向全校学生开设，覆盖信息素养、办公协同、数据处理和网络安全基础。', NOW(), JSON_OBJECT('source', 'seed'))
ON DUPLICATE KEY UPDATE
  term_id = VALUES(term_id),
  course_code = VALUES(course_code),
  course_name = VALUES(course_name),
  teacher_name = VALUES(teacher_name),
  department = VALUES(department),
  category = VALUES(category),
  credit = VALUES(credit),
  cover_url = VALUES(cover_url),
  launch_url = VALUES(launch_url),
  status = VALUES(status),
  permission = VALUES(permission),
  featured = VALUES(featured),
  description = VALUES(description),
  last_synced_at = VALUES(last_synced_at),
  raw_json = VALUES(raw_json);

INSERT INTO course_user_mapping (user_id, external_user_id, external_username, mapping_status, last_synced_at, raw_json)
VALUES
  (1, 'LMS-U-ADMIN', 'admin', 'ACTIVE', NOW(), JSON_OBJECT('source', 'seed')),
  (2, 'LMS-U-STUDENT001', 'student001', 'ACTIVE', NOW(), JSON_OBJECT('source', 'seed')),
  (3, 'LMS-U-TEACHER001', 'teacher001', 'ACTIVE', NOW(), JSON_OBJECT('source', 'seed')),
  (4, 'LMS-U-OUTSIDE001', 'outside001', 'ACTIVE', NOW(), JSON_OBJECT('source', 'seed'))
ON DUPLICATE KEY UPDATE
  external_username = VALUES(external_username),
  mapping_status = VALUES(mapping_status),
  last_synced_at = VALUES(last_synced_at),
  raw_json = VALUES(raw_json);
