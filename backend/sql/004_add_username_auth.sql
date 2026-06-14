SET @has_users_username = EXISTS(
  SELECT 1
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'users'
    AND column_name = 'username'
);
SET @add_users_username_sql = IF(
  @has_users_username = 1,
  "SELECT 1",
  "ALTER TABLE users ADD COLUMN username VARCHAR(64) NULL AFTER email"
);
PREPARE add_users_username_stmt FROM @add_users_username_sql;
EXECUTE add_users_username_stmt;
DEALLOCATE PREPARE add_users_username_stmt;

SET @current_users_auth_provider_type = (
  SELECT COLUMN_TYPE
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'users'
    AND column_name = 'auth_provider'
);
SET @upgrade_users_auth_provider_sql = IF(
  @current_users_auth_provider_type = "enum('email','wechat','username')",
  "SELECT 1",
  "ALTER TABLE users MODIFY COLUMN auth_provider ENUM('email', 'wechat', 'username') NOT NULL DEFAULT 'email'"
);
PREPARE upgrade_users_auth_provider_stmt FROM @upgrade_users_auth_provider_sql;
EXECUTE upgrade_users_auth_provider_stmt;
DEALLOCATE PREPARE upgrade_users_auth_provider_stmt;

SET @has_uq_users_username = EXISTS(
  SELECT 1
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'users'
    AND index_name = 'uq_users_username'
);
SET @add_uq_users_username_sql = IF(
  @has_uq_users_username = 1,
  "SELECT 1",
  "ALTER TABLE users ADD UNIQUE KEY uq_users_username (username)"
);
PREPARE add_uq_users_username_stmt FROM @add_uq_users_username_sql;
EXECUTE add_uq_users_username_stmt;
DEALLOCATE PREPARE add_uq_users_username_stmt;
