ALTER TABLE vocabulary_items
    ADD COLUMN IF NOT EXISTS audio_url TEXT;

ALTER TABLE vocabulary_test_sets
    ADD COLUMN IF NOT EXISTS release_at TIMESTAMP;
