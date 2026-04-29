CREATE TABLE IF NOT EXISTS words (
  id VARCHAR(191) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  english VARCHAR(255) NOT NULL,
  chinese VARCHAR(255) NOT NULL,
  level VARCHAR(64) NULL,
  theme VARCHAR(128) NULL,
  example_text TEXT NULL,
  example_translation TEXT NULL,
  image_reason TEXT NULL,
  scene VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_words_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NULL,
  auth_provider ENUM('email', 'wechat') NOT NULL DEFAULT 'email',
  wechat_open_id VARCHAR(191) NULL,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  avatar_url TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login_at DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_wechat_open_id (wechat_open_id),
  KEY idx_users_auth_provider (auth_provider)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_sessions (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  session_token_hash CHAR(64) NOT NULL,
  user_agent VARCHAR(255) NULL,
  last_ip VARCHAR(64) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  last_used_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_sessions_session_token_hash (session_token_hash),
  KEY idx_user_sessions_user_id (user_id),
  KEY idx_user_sessions_expires_at (expires_at),
  CONSTRAINT fk_user_sessions_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS email_verification_codes (
  id BIGINT NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  purpose ENUM('register') NOT NULL,
  code_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  consumed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_email_verification_codes_email_purpose (email, purpose, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS word_images (
  id BIGINT NOT NULL AUTO_INCREMENT,
  word_id VARCHAR(191) NOT NULL,
  storage_type ENUM('external', 'local', 'oss') NOT NULL,
  storage_key VARCHAR(255) NULL,
  public_url TEXT NULL,
  source_label VARCHAR(128) NULL,
  source_credit VARCHAR(255) NULL,
  status ENUM('active', 'deleted') NOT NULL DEFAULT 'active',
  sort_order INT NOT NULL DEFAULT 0,
  created_by_user_id BIGINT NULL,
  deleted_by_user_id BIGINT NULL,
  deleted_at DATETIME NULL,
  purge_after_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_word_images_word_id_status (word_id, status),
  KEY idx_word_images_purge_after_at (purge_after_at),
  KEY idx_word_images_storage_key (storage_key),
  CONSTRAINT fk_word_images_word
    FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE,
  CONSTRAINT fk_word_images_created_by_user
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_word_images_deleted_by_user
    FOREIGN KEY (deleted_by_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS image_operation_logs (
  id BIGINT NOT NULL AUTO_INCREMENT,
  word_image_id BIGINT NULL,
  word_id VARCHAR(191) NOT NULL,
  action ENUM('seed', 'delete', 'restore', 'purge') NOT NULL,
  actor_type VARCHAR(32) NOT NULL DEFAULT 'system',
  note TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
