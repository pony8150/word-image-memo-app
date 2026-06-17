SET @has_users_is_admin = EXISTS(
  SELECT 1
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'users'
    AND column_name = 'is_admin'
);
SET @add_users_is_admin_sql = IF(
  @has_users_is_admin = 1,
  "SELECT 1",
  "ALTER TABLE users ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE AFTER avatar_url"
);
PREPARE add_users_is_admin_stmt FROM @add_users_is_admin_sql;
EXECUTE add_users_is_admin_stmt;
DEALLOCATE PREPARE add_users_is_admin_stmt;

UPDATE users
SET is_admin = TRUE
WHERE username = '马文煜'
   OR display_name = '马文煜'
   OR email = '马文煜'
   OR email LIKE '马文煜@%';
