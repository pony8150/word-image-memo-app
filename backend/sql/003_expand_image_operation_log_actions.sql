SET @current_image_operation_action_type = (
  SELECT COLUMN_TYPE
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'image_operation_logs'
    AND column_name = 'action'
);

SET @upgrade_image_operation_action_sql = IF(
  @current_image_operation_action_type = "enum('seed','hide','unhide','delete','restore','purge')",
  "SELECT 1",
  "ALTER TABLE image_operation_logs MODIFY COLUMN action ENUM('seed', 'hide', 'unhide', 'delete', 'restore', 'purge') NOT NULL"
);
PREPARE upgrade_image_operation_action_stmt FROM @upgrade_image_operation_action_sql;
EXECUTE upgrade_image_operation_action_stmt;
DEALLOCATE PREPARE upgrade_image_operation_action_stmt;

SET @has_idx_image_operation_logs_word_id_created_at = EXISTS(
  SELECT 1
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'image_operation_logs'
    AND index_name = 'idx_image_operation_logs_word_id_created_at'
);
SET @add_idx_image_operation_logs_word_id_created_at_sql = IF(
  @has_idx_image_operation_logs_word_id_created_at = 1,
  "SELECT 1",
  "ALTER TABLE image_operation_logs ADD KEY idx_image_operation_logs_word_id_created_at (word_id, created_at)"
);
PREPARE add_idx_image_operation_logs_word_id_created_at_stmt FROM @add_idx_image_operation_logs_word_id_created_at_sql;
EXECUTE add_idx_image_operation_logs_word_id_created_at_stmt;
DEALLOCATE PREPARE add_idx_image_operation_logs_word_id_created_at_stmt;
