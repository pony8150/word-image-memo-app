SET @has_image_asset_id = EXISTS(
  SELECT 1
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'word_images'
    AND column_name = 'image_asset_id'
);
SET @add_image_asset_id_sql = IF(
  @has_image_asset_id = 1,
  "SELECT 1",
  "ALTER TABLE word_images ADD COLUMN image_asset_id BIGINT NULL AFTER word_id"
);
PREPARE add_image_asset_id_stmt FROM @add_image_asset_id_sql;
EXECUTE add_image_asset_id_stmt;
DEALLOCATE PREPARE add_image_asset_id_stmt;

SET @has_scope = EXISTS(
  SELECT 1
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'word_images'
    AND column_name = 'scope'
);
SET @add_scope_sql = IF(
  @has_scope = 1,
  "SELECT 1",
  "ALTER TABLE word_images ADD COLUMN scope ENUM('default', 'private') NOT NULL DEFAULT 'default' AFTER image_asset_id"
);
PREPARE add_scope_stmt FROM @add_scope_sql;
EXECUTE add_scope_stmt;
DEALLOCATE PREPARE add_scope_stmt;

SET @has_owner_user_id = EXISTS(
  SELECT 1
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'word_images'
    AND column_name = 'owner_user_id'
);
SET @add_owner_user_id_sql = IF(
  @has_owner_user_id = 1,
  "SELECT 1",
  "ALTER TABLE word_images ADD COLUMN owner_user_id BIGINT NULL AFTER scope"
);
PREPARE add_owner_user_id_stmt FROM @add_owner_user_id_sql;
EXECUTE add_owner_user_id_stmt;
DEALLOCATE PREPARE add_owner_user_id_stmt;

UPDATE word_images
SET
  scope = CASE
    WHEN created_by_user_id IS NULL THEN 'default'
    ELSE 'private'
  END,
  owner_user_id = CASE
    WHEN created_by_user_id IS NULL THEN NULL
    ELSE created_by_user_id
  END
WHERE image_asset_id IS NULL;

SET @has_legacy_storage_type = EXISTS(
  SELECT 1
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'word_images'
    AND column_name = 'storage_type'
);
SET @has_legacy_storage_key = EXISTS(
  SELECT 1
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'word_images'
    AND column_name = 'storage_key'
);
SET @has_legacy_public_url = EXISTS(
  SELECT 1
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'word_images'
    AND column_name = 'public_url'
);
SET @can_migrate_legacy_word_images = IF(
  @has_legacy_storage_type = 1
  AND @has_legacy_storage_key = 1
  AND @has_legacy_public_url = 1,
  1,
  0
);

SET @insert_legacy_assets_sql = IF(
  @can_migrate_legacy_word_images = 1,
  "
    INSERT INTO image_assets (
      storage_type,
      storage_key,
      public_url,
      sha256_hash,
      mime_type,
      file_size_bytes
    )
    SELECT DISTINCT
      wi.storage_type,
      wi.storage_key,
      wi.public_url,
      NULL,
      NULL,
      NULL
    FROM word_images wi
    WHERE wi.image_asset_id IS NULL
      AND (wi.storage_key IS NOT NULL OR wi.public_url IS NOT NULL)
      AND NOT EXISTS (
        SELECT 1
        FROM image_assets ia
        WHERE ia.storage_type = wi.storage_type
          AND ia.storage_key <=> wi.storage_key
          AND ia.public_url <=> wi.public_url
      )
  ",
  "SELECT 1"
);
PREPARE insert_legacy_assets_stmt FROM @insert_legacy_assets_sql;
EXECUTE insert_legacy_assets_stmt;
DEALLOCATE PREPARE insert_legacy_assets_stmt;

SET @link_legacy_assets_sql = IF(
  @can_migrate_legacy_word_images = 1,
  "
    UPDATE word_images wi
    INNER JOIN image_assets ia
      ON ia.storage_type = wi.storage_type
     AND ia.storage_key <=> wi.storage_key
     AND ia.public_url <=> wi.public_url
    SET wi.image_asset_id = ia.id
    WHERE wi.image_asset_id IS NULL
      AND (wi.storage_key IS NOT NULL OR wi.public_url IS NOT NULL)
  ",
  "SELECT 1"
);
PREPARE link_legacy_assets_stmt FROM @link_legacy_assets_sql;
EXECUTE link_legacy_assets_stmt;
DEALLOCATE PREPARE link_legacy_assets_stmt;

SET @has_idx_word_scope_status = EXISTS(
  SELECT 1
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'word_images'
    AND index_name = 'idx_word_images_word_scope_status'
);
SET @add_idx_word_scope_status_sql = IF(
  @has_idx_word_scope_status = 1,
  "SELECT 1",
  "ALTER TABLE word_images ADD KEY idx_word_images_word_scope_status (word_id, scope, status)"
);
PREPARE add_idx_word_scope_status_stmt FROM @add_idx_word_scope_status_sql;
EXECUTE add_idx_word_scope_status_stmt;
DEALLOCATE PREPARE add_idx_word_scope_status_stmt;

SET @has_idx_owner_scope_status = EXISTS(
  SELECT 1
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'word_images'
    AND index_name = 'idx_word_images_owner_scope_status'
);
SET @add_idx_owner_scope_status_sql = IF(
  @has_idx_owner_scope_status = 1,
  "SELECT 1",
  "ALTER TABLE word_images ADD KEY idx_word_images_owner_scope_status (owner_user_id, scope, status)"
);
PREPARE add_idx_owner_scope_status_stmt FROM @add_idx_owner_scope_status_sql;
EXECUTE add_idx_owner_scope_status_stmt;
DEALLOCATE PREPARE add_idx_owner_scope_status_stmt;

SET @has_idx_asset_id = EXISTS(
  SELECT 1
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'word_images'
    AND index_name = 'idx_word_images_asset_id'
);
SET @add_idx_asset_id_sql = IF(
  @has_idx_asset_id = 1,
  "SELECT 1",
  "ALTER TABLE word_images ADD KEY idx_word_images_asset_id (image_asset_id)"
);
PREPARE add_idx_asset_id_stmt FROM @add_idx_asset_id_sql;
EXECUTE add_idx_asset_id_stmt;
DEALLOCATE PREPARE add_idx_asset_id_stmt;
