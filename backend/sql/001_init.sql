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

CREATE TABLE IF NOT EXISTS books (
  id BIGINT NOT NULL AUTO_INCREMENT,
  code VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_books_code (code),
  KEY idx_books_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS book_words (
  id BIGINT NOT NULL AUTO_INCREMENT,
  book_id BIGINT NOT NULL,
  word_id VARCHAR(191) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_book_words_book_word (book_id, word_id),
  KEY idx_book_words_word_id (word_id),
  KEY idx_book_words_book_sort (book_id, sort_order),
  CONSTRAINT fk_book_words_book
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  CONSTRAINT fk_book_words_word
    FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
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

CREATE TABLE IF NOT EXISTS image_assets (
  id BIGINT NOT NULL AUTO_INCREMENT,
  storage_type ENUM('external', 'local', 'oss') NOT NULL,
  storage_key VARCHAR(255) NULL,
  public_url TEXT NULL,
  sha256_hash CHAR(64) NULL,
  mime_type VARCHAR(128) NULL,
  file_size_bytes BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_image_assets_sha256_hash (sha256_hash),
  KEY idx_image_assets_storage_key (storage_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS word_images (
  id BIGINT NOT NULL AUTO_INCREMENT,
  word_id VARCHAR(191) NOT NULL,
  image_asset_id BIGINT NOT NULL,
  scope ENUM('default', 'private') NOT NULL DEFAULT 'default',
  owner_user_id BIGINT NULL,
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
  KEY idx_word_images_word_scope_status (word_id, scope, status),
  KEY idx_word_images_owner_scope_status (owner_user_id, scope, status),
  KEY idx_word_images_asset_id (image_asset_id),
  KEY idx_word_images_purge_after_at (purge_after_at),
  CONSTRAINT fk_word_images_word
    FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE,
  CONSTRAINT fk_word_images_asset
    FOREIGN KEY (image_asset_id) REFERENCES image_assets(id) ON DELETE CASCADE,
  CONSTRAINT fk_word_images_owner_user
    FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_word_images_created_by_user
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_word_images_deleted_by_user
    FOREIGN KEY (deleted_by_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_hidden_word_images (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  word_image_id BIGINT NOT NULL,
  hidden_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_hidden_word_images_user_image (user_id, word_image_id),
  KEY idx_user_hidden_word_images_word_image_id (word_image_id),
  CONSTRAINT fk_user_hidden_word_images_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_hidden_word_images_word_image
    FOREIGN KEY (word_image_id) REFERENCES word_images(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS image_operation_logs (
  id BIGINT NOT NULL AUTO_INCREMENT,
  word_image_id BIGINT NULL,
  word_id VARCHAR(191) NOT NULL,
  action ENUM('seed', 'hide', 'unhide', 'delete', 'restore', 'purge') NOT NULL,
  actor_type VARCHAR(32) NOT NULL DEFAULT 'system',
  note TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_image_operation_logs_word_id_created_at (word_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS community_posts (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  word_id VARCHAR(191) NOT NULL,
  word_image_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NULL,
  status ENUM('active', 'deleted') NOT NULL DEFAULT 'active',
  like_count INT NOT NULL DEFAULT 0,
  favorite_count INT NOT NULL DEFAULT 0,
  comment_count INT NOT NULL DEFAULT 0,
  share_count INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_community_posts_status_created_at (status, created_at),
  KEY idx_community_posts_user_id_created_at (user_id, created_at),
  KEY idx_community_posts_word_id_created_at (word_id, created_at),
  CONSTRAINT fk_community_posts_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_community_posts_word
    FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE,
  CONSTRAINT fk_community_posts_word_image
    FOREIGN KEY (word_image_id) REFERENCES word_images(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS community_post_likes (
  id BIGINT NOT NULL AUTO_INCREMENT,
  post_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_community_post_likes_post_user (post_id, user_id),
  KEY idx_community_post_likes_user_id_created_at (user_id, created_at),
  CONSTRAINT fk_community_post_likes_post
    FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_community_post_likes_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS community_post_favorites (
  id BIGINT NOT NULL AUTO_INCREMENT,
  post_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_community_post_favorites_post_user (post_id, user_id),
  KEY idx_community_post_favorites_user_id_created_at (user_id, created_at),
  CONSTRAINT fk_community_post_favorites_post
    FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_community_post_favorites_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS community_comments (
  id BIGINT NOT NULL AUTO_INCREMENT,
  post_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  status ENUM('active', 'deleted') NOT NULL DEFAULT 'active',
  like_count INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_community_comments_post_status_created_at (post_id, status, created_at),
  KEY idx_community_comments_user_id_created_at (user_id, created_at),
  CONSTRAINT fk_community_comments_post
    FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_community_comments_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS community_comment_likes (
  id BIGINT NOT NULL AUTO_INCREMENT,
  comment_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_community_comment_likes_comment_user (comment_id, user_id),
  KEY idx_community_comment_likes_user_id_created_at (user_id, created_at),
  CONSTRAINT fk_community_comment_likes_comment
    FOREIGN KEY (comment_id) REFERENCES community_comments(id) ON DELETE CASCADE,
  CONSTRAINT fk_community_comment_likes_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
