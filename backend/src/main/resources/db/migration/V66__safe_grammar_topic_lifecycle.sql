ALTER TABLE grammar_topics
    DROP CONSTRAINT IF EXISTS grammar_topics_parent_topic_id_fkey,
    ADD CONSTRAINT fk_grammar_topics_parent
        FOREIGN KEY (parent_topic_id) REFERENCES grammar_topics(id) ON DELETE RESTRICT,
    ADD COLUMN archived_at TIMESTAMP,
    ADD COLUMN archived_from_status VARCHAR(32);

UPDATE grammar_topics
SET archived_at = COALESCE(updated_at, now()),
    archived_from_status = 'DRAFT'
WHERE status = 'ARCHIVED';

ALTER TABLE grammar_topics
    ADD CONSTRAINT ck_grammar_topics_archive_state
        CHECK (
            (status = 'ARCHIVED' AND archived_at IS NOT NULL AND archived_from_status IS NOT NULL)
            OR (status <> 'ARCHIVED' AND archived_at IS NULL AND archived_from_status IS NULL)
        );

ALTER TABLE user_grammar_progress
    DROP CONSTRAINT IF EXISTS user_grammar_progress_topic_id_fkey,
    ADD CONSTRAINT fk_user_grammar_progress_topic
        FOREIGN KEY (topic_id) REFERENCES grammar_topics(id) ON DELETE RESTRICT;

ALTER TABLE grammar_topic_questions
    DROP CONSTRAINT IF EXISTS grammar_topic_questions_topic_id_fkey,
    ADD CONSTRAINT fk_grammar_topic_questions_topic
        FOREIGN KEY (topic_id) REFERENCES grammar_topics(id) ON DELETE RESTRICT;

ALTER TABLE grammar_topic_vocabulary_words
    DROP CONSTRAINT IF EXISTS grammar_topic_vocabulary_words_topic_id_fkey,
    ADD CONSTRAINT fk_grammar_topic_vocabulary_words_topic
        FOREIGN KEY (topic_id) REFERENCES grammar_topics(id) ON DELETE RESTRICT;

CREATE INDEX idx_grammar_topics_active_order
    ON grammar_topics (order_index, id)
    WHERE status <> 'ARCHIVED';

CREATE INDEX idx_grammar_topics_archived
    ON grammar_topics (archived_at DESC, id)
    WHERE status = 'ARCHIVED';
