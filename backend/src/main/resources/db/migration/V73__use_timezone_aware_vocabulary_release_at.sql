ALTER TABLE vocabulary_test_sets
    ALTER COLUMN release_at TYPE TIMESTAMPTZ
    USING release_at AT TIME ZONE 'Asia/Ho_Chi_Minh';
