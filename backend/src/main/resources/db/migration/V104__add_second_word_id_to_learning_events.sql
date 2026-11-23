ALTER TABLE vocabulary_learning_events
    ADD COLUMN IF NOT EXISTS second_word_id VARCHAR(64);
