CREATE DATABASE IF NOT EXISTS edu_portal
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE edu_portal;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS sys_user (
  id BIGINT NOT NULL AUTO_INCREMENT,
  username VARCHAR(64) NOT NULL,
  password_hash VARCHAR(255) NULL,
  display_name VARCHAR(100) NOT NULL,
  email VARCHAR(128) NULL,
  mobile VARCHAR(32) NULL,
  user_type VARCHAR(32) NOT NULL DEFAULT 'GUEST',
  role VARCHAR(20) NOT NULL DEFAULT 'external',
  source VARCHAR(32) NOT NULL DEFAULT 'LOCAL',
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING_REVIEW',
  organization VARCHAR(128) NULL,
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  deleted TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uk_sys_user_username (username),
  UNIQUE KEY uk_sys_user_email (email),
  KEY idx_sys_user_status (status),
  KEY idx_sys_user_role (role),
  KEY idx_sys_user_source (source)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sys_role (
  id BIGINT NOT NULL AUTO_INCREMENT,
  code VARCHAR(64) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255) NULL,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  deleted TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uk_sys_role_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sys_permission (
  id BIGINT NOT NULL AUTO_INCREMENT,
  code VARCHAR(128) NOT NULL,
  name VARCHAR(100) NOT NULL,
  resource_type VARCHAR(32) NOT NULL DEFAULT 'API',
  description VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  deleted TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uk_sys_permission_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sys_user_role (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  role_id BIGINT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by BIGINT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_sys_user_role (user_id, role_id),
  KEY idx_sys_user_role_role (role_id),
  CONSTRAINT fk_sys_user_role_user FOREIGN KEY (user_id) REFERENCES sys_user (id),
  CONSTRAINT fk_sys_user_role_role FOREIGN KEY (role_id) REFERENCES sys_role (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sys_role_permission (
  id BIGINT NOT NULL AUTO_INCREMENT,
  role_id BIGINT NOT NULL,
  permission_id BIGINT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by BIGINT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_sys_role_permission (role_id, permission_id),
  KEY idx_sys_role_permission_permission (permission_id),
  CONSTRAINT fk_sys_role_permission_role FOREIGN KEY (role_id) REFERENCES sys_role (id),
  CONSTRAINT fk_sys_role_permission_permission FOREIGN KEY (permission_id) REFERENCES sys_permission (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS external_identity (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  provider VARCHAR(32) NOT NULL,
  external_id VARCHAR(128) NOT NULL,
  external_username VARCHAR(128) NULL,
  attributes_json JSON NULL,
  bound_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  deleted TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uk_external_identity_provider_id (provider, external_id),
  KEY idx_external_identity_user (user_id),
  CONSTRAINT fk_external_identity_user FOREIGN KEY (user_id) REFERENCES sys_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cms_category (
  id BIGINT NOT NULL AUTO_INCREMENT,
  parent_id BIGINT NULL,
  code VARCHAR(64) NOT NULL,
  name VARCHAR(100) NOT NULL,
  path VARCHAR(255) NOT NULL,
  site_code VARCHAR(64) NOT NULL DEFAULT 'main',
  sort_order INT NOT NULL DEFAULT 0,
  visible TINYINT(1) NOT NULL DEFAULT 1,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  template VARCHAR(64) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  deleted TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uk_cms_category_code (site_code, code),
  UNIQUE KEY uk_cms_category_path (site_code, path),
  KEY idx_cms_category_parent (parent_id),
  CONSTRAINT fk_cms_category_parent FOREIGN KEY (parent_id) REFERENCES cms_category (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cms_article (
  id BIGINT NOT NULL AUTO_INCREMENT,
  category_id BIGINT NOT NULL,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NULL,
  summary VARCHAR(500) NULL,
  content LONGTEXT NOT NULL,
  cover_url VARCHAR(500) NULL,
  author VARCHAR(100) NULL,
  source_name VARCHAR(100) NULL,
  tags VARCHAR(255) NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
  featured TINYINT(1) NOT NULL DEFAULT 0,
  pinned TINYINT(1) NOT NULL DEFAULT 0,
  allow_comment TINYINT(1) NOT NULL DEFAULT 0,
  view_count BIGINT NOT NULL DEFAULT 0,
  published_at DATETIME NULL,
  offline_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  deleted TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uk_cms_article_slug (slug),
  KEY idx_cms_article_category_status (category_id, status),
  KEY idx_cms_article_published (published_at),
  FULLTEXT KEY ft_cms_article_search (title, summary, content),
  CONSTRAINT fk_cms_article_category FOREIGN KEY (category_id) REFERENCES cms_category (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cms_article_version (
  id BIGINT NOT NULL AUTO_INCREMENT,
  article_id BIGINT NOT NULL,
  version_no INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  summary VARCHAR(500) NULL,
  content LONGTEXT NOT NULL,
  status VARCHAR(32) NOT NULL,
  change_note VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by BIGINT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_cms_article_version (article_id, version_no),
  CONSTRAINT fk_cms_article_version_article FOREIGN KEY (article_id) REFERENCES cms_article (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cms_media_asset (
  id BIGINT NOT NULL AUTO_INCREMENT,
  asset_type VARCHAR(32) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  mime_type VARCHAR(128) NULL,
  file_size BIGINT NULL,
  checksum VARCHAR(128) NULL,
  metadata_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  deleted TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_cms_media_asset_type (asset_type),
  KEY idx_cms_media_asset_checksum (checksum)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cms_article_asset (
  id BIGINT NOT NULL AUTO_INCREMENT,
  article_id BIGINT NOT NULL,
  asset_id BIGINT NOT NULL,
  relation_type VARCHAR(32) NOT NULL DEFAULT 'ATTACHMENT',
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by BIGINT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_cms_article_asset (article_id, asset_id, relation_type),
  KEY idx_cms_article_asset_asset (asset_id),
  CONSTRAINT fk_cms_article_asset_article FOREIGN KEY (article_id) REFERENCES cms_article (id),
  CONSTRAINT fk_cms_article_asset_asset FOREIGN KEY (asset_id) REFERENCES cms_media_asset (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cms_audit_log (
  id BIGINT NOT NULL AUTO_INCREMENT,
  actor_user_id BIGINT NULL,
  action VARCHAR(64) NOT NULL,
  target_type VARCHAR(64) NOT NULL,
  target_id BIGINT NULL,
  ip_address VARCHAR(64) NULL,
  user_agent VARCHAR(500) NULL,
  before_json JSON NULL,
  after_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_cms_audit_log_actor (actor_user_id),
  KEY idx_cms_audit_log_target (target_type, target_id),
  KEY idx_cms_audit_log_created (created_at),
  CONSTRAINT fk_cms_audit_log_actor FOREIGN KEY (actor_user_id) REFERENCES sys_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS portal_banner (
  id BIGINT NOT NULL AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  link_url VARCHAR(500) NULL,
  position VARCHAR(64) NOT NULL DEFAULT 'HOME_TOP',
  sort_order INT NOT NULL DEFAULT 0,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  start_at DATETIME NULL,
  end_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  deleted TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_portal_banner_position (position, enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS portal_quick_link (
  id BIGINT NOT NULL AUTO_INCREMENT,
  title VARCHAR(100) NOT NULL,
  icon_url VARCHAR(500) NULL,
  link_url VARCHAR(500) NOT NULL,
  link_type VARCHAR(32) NOT NULL DEFAULT 'EXTERNAL',
  sort_order INT NOT NULL DEFAULT 0,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  deleted TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_portal_quick_link_enabled (enabled, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS portal_friend_link (
  id BIGINT NOT NULL AUTO_INCREMENT,
  site_code VARCHAR(64) NOT NULL DEFAULT 'main',
  title VARCHAR(100) NOT NULL,
  url VARCHAR(500) NOT NULL,
  logo_url VARCHAR(500) NULL,
  description VARCHAR(255) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  deleted TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_portal_friend_link_site_enabled (site_code, enabled, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS portal_site_config (
  id BIGINT NOT NULL AUTO_INCREMENT,
  site_code VARCHAR(64) NOT NULL DEFAULT 'main',
  config_key VARCHAR(128) NOT NULL,
  config_value TEXT NULL,
  value_type VARCHAR(32) NOT NULL DEFAULT 'STRING',
  description VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  deleted TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uk_portal_site_config (site_code, config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS portal_page_config (
  id BIGINT NOT NULL AUTO_INCREMENT,
  site_code VARCHAR(64) NOT NULL DEFAULT 'main',
  page_code VARCHAR(64) NOT NULL,
  page_title VARCHAR(200) NOT NULL,
  layout_json JSON NULL,
  seo_json JSON NULL,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  deleted TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uk_portal_page_config (site_code, page_code),
  KEY idx_portal_page_config_enabled (enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS portal_teacher (
  id BIGINT NOT NULL AUTO_INCREMENT,
  site_code VARCHAR(64) NOT NULL DEFAULT 'main',
  name VARCHAR(100) NOT NULL,
  title VARCHAR(150) NULL,
  college VARCHAR(150) NULL,
  achievement VARCHAR(500) NULL,
  research VARCHAR(500) NULL,
  course_count INT NOT NULL DEFAULT 0,
  avatar_url VARCHAR(500) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  deleted TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_portal_teacher_site_enabled (site_code, enabled, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS portal_college (
  id BIGINT NOT NULL AUTO_INCREMENT,
  site_code VARCHAR(64) NOT NULL DEFAULT 'main',
  name VARCHAR(150) NOT NULL,
  code VARCHAR(64) NULL,
  description VARCHAR(500) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  deleted TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uk_portal_college_site_name (site_code, name),
  KEY idx_portal_college_site_enabled (site_code, enabled, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS course_term (
  id BIGINT NOT NULL AUTO_INCREMENT,
  term_code VARCHAR(64) NOT NULL,
  term_name VARCHAR(100) NOT NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  current_term TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  deleted TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uk_course_term_code (term_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS course_catalog (
  id BIGINT NOT NULL AUTO_INCREMENT,
  external_course_id VARCHAR(128) NOT NULL,
  term_id BIGINT NULL,
  course_code VARCHAR(64) NULL,
  course_name VARCHAR(200) NOT NULL,
  teacher_name VARCHAR(100) NULL,
  department VARCHAR(128) NULL,
  category VARCHAR(100) NULL,
  credit DECIMAL(4,1) NULL,
  cover_url VARCHAR(500) NULL,
  launch_url VARCHAR(500) NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
  permission VARCHAR(20) NOT NULL DEFAULT 'public',
  featured TINYINT(1) NOT NULL DEFAULT 0,
  description TEXT NULL,
  last_synced_at DATETIME NULL,
  raw_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  deleted TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uk_course_catalog_external (external_course_id),
  KEY idx_course_catalog_term (term_id),
  KEY idx_course_catalog_status (status),
  KEY idx_course_catalog_permission (permission),
  KEY idx_course_catalog_featured (featured, status),
  FULLTEXT KEY ft_course_catalog_search (course_name, teacher_name, department, description),
  CONSTRAINT fk_course_catalog_term FOREIGN KEY (term_id) REFERENCES course_term (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS course_user_mapping (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  external_user_id VARCHAR(128) NOT NULL,
  external_username VARCHAR(128) NULL,
  mapping_status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
  last_synced_at DATETIME NULL,
  raw_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  deleted TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uk_course_user_mapping_user (user_id),
  UNIQUE KEY uk_course_user_mapping_external (external_user_id),
  CONSTRAINT fk_course_user_mapping_user FOREIGN KEY (user_id) REFERENCES sys_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS course_sync_job (
  id BIGINT NOT NULL AUTO_INCREMENT,
  sync_type VARCHAR(64) NOT NULL,
  mode VARCHAR(32) NOT NULL DEFAULT 'INCREMENTAL',
  term_code VARCHAR(64) NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  started_at DATETIME NULL,
  finished_at DATETIME NULL,
  total_count INT NOT NULL DEFAULT 0,
  success_count INT NOT NULL DEFAULT 0,
  failure_count INT NOT NULL DEFAULT 0,
  error_message TEXT NULL,
  request_json JSON NULL,
  response_summary_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  deleted TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_course_sync_job_status (status),
  KEY idx_course_sync_job_type_created (sync_type, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- Compatibility migration notes for existing local databases:
-- ALTER TABLE sys_user ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'external' AFTER user_type;
-- ALTER TABLE sys_user ADD KEY idx_sys_user_role (role);
-- UPDATE sys_user SET role = 'admin' WHERE username = 'admin';
-- UPDATE sys_user SET role = 'internal' WHERE username IN ('student001', 'teacher001');
-- UPDATE sys_user SET role = 'external' WHERE role IS NULL OR role = '';
-- ALTER TABLE course_catalog ADD COLUMN permission VARCHAR(20) NOT NULL DEFAULT 'public' AFTER status;
-- ALTER TABLE course_catalog ADD KEY idx_course_catalog_permission (permission);
-- UPDATE course_catalog SET permission = 'public' WHERE permission IS NULL OR permission = '';
-- ALTER TABLE course_catalog ADD COLUMN featured TINYINT(1) NOT NULL DEFAULT 0 AFTER permission;
-- ALTER TABLE course_catalog ADD KEY idx_course_catalog_featured (featured, status);
-- Run the portal_college CREATE TABLE statement above before importing seed data on an existing database.
-- CREATE TABLE IF NOT EXISTS portal_friend_link (
--   id BIGINT NOT NULL AUTO_INCREMENT,
--   site_code VARCHAR(64) NOT NULL DEFAULT 'main',
--   title VARCHAR(100) NOT NULL,
--   url VARCHAR(500) NOT NULL,
--   logo_url VARCHAR(500) NULL,
--   description VARCHAR(255) NULL,
--   sort_order INT NOT NULL DEFAULT 0,
--   enabled TINYINT(1) NOT NULL DEFAULT 1,
--   created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--   created_by BIGINT NULL,
--   updated_by BIGINT NULL,
--   deleted TINYINT(1) NOT NULL DEFAULT 0,
--   PRIMARY KEY (id),
--   KEY idx_portal_friend_link_site_enabled (site_code, enabled, sort_order)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
