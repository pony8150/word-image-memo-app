CREATE TABLE IF NOT EXISTS words (
  id TEXT PRIMARY KEY,
  sort_order INTEGER NOT NULL DEFAULT 0,
  english TEXT NOT NULL,
  chinese TEXT NOT NULL,
  level TEXT,
  theme TEXT,
  example_text TEXT,
  example_translation TEXT,
  image_reason TEXT,
  scene TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS word_images (
  id BIGSERIAL PRIMARY KEY,
  word_id TEXT NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  storage_type TEXT NOT NULL CHECK (storage_type IN ('external', 'local', 'oss')),
  storage_key TEXT,
  public_url TEXT,
  source_label TEXT,
  source_credit TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deleted')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  deleted_at TIMESTAMPTZ,
  purge_after_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT word_images_location_check CHECK (
    (storage_type = 'local' AND storage_key IS NOT NULL)
    OR (storage_type IN ('external', 'oss') AND public_url IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_words_sort_order ON words(sort_order);
CREATE INDEX IF NOT EXISTS idx_word_images_word_id_status ON word_images(word_id, status);
CREATE INDEX IF NOT EXISTS idx_word_images_purge_after_at ON word_images(purge_after_at);
CREATE INDEX IF NOT EXISTS idx_word_images_storage_key ON word_images(storage_key);

CREATE TABLE IF NOT EXISTS image_operation_logs (
  id BIGSERIAL PRIMARY KEY,
  word_image_id BIGINT,
  word_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('seed', 'delete', 'restore', 'purge')),
  actor_type TEXT NOT NULL DEFAULT 'system',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
