ALTER TABLE user_vocabulary_progress
    ADD COLUMN srs_ease_factor NUMERIC(4, 2) NOT NULL DEFAULT 2.50
        CHECK (srs_ease_factor >= 1.30),
    ADD COLUMN srs_interval_days INT NOT NULL DEFAULT 0
        CHECK (srs_interval_days >= 0),
    ADD COLUMN srs_repetitions INT NOT NULL DEFAULT 0
        CHECK (srs_repetitions >= 0),
    ADD COLUMN correct_count INT NOT NULL DEFAULT 0
        CHECK (correct_count >= 0),
    ADD COLUMN incorrect_count INT NOT NULL DEFAULT 0
        CHECK (incorrect_count >= 0),
    ADD COLUMN next_review_at TIMESTAMPTZ;

CREATE INDEX idx_user_vocabulary_progress_due
    ON user_vocabulary_progress (user_id, next_review_at)
    WHERE next_review_at IS NOT NULL;

UPDATE user_vocabulary_progress
SET srs_interval_days = CASE
        WHEN status = 'MASTERED' THEN 30
        ELSE GREATEST(1, LEAST(review_count, 7))
    END,
    srs_repetitions = review_count,
    next_review_at = COALESCE(last_reviewed_at, updated_at) + (
        CASE WHEN status = 'MASTERED' THEN 30 ELSE GREATEST(1, LEAST(review_count, 7)) END
    ) * INTERVAL '1 day'
WHERE review_count > 0 OR status = 'MASTERED';

CREATE TABLE vocabulary_learning_events (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    word_id VARCHAR(64) NOT NULL REFERENCES vocabulary_items(id) ON DELETE CASCADE,
    request_id UUID NOT NULL,
    activity_type VARCHAR(24) NOT NULL
        CHECK (activity_type IN ('LEARN', 'FLASHCARD', 'PRACTICE', 'REVIEW', 'GAME')),
    question_type VARCHAR(32) NOT NULL
        CHECK (question_type IN ('ENGLISH_TO_VIETNAMESE', 'VIETNAMESE_TO_ENGLISH', 'FILL_IN_BLANK', 'TYPE_WORD', 'AUDIO', 'FLASHCARD_RATING')),
    student_answer TEXT NOT NULL DEFAULT '',
    correct_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    rating VARCHAR(8)
        CHECK (rating IS NULL OR rating IN ('AGAIN', 'HARD', 'GOOD', 'EASY')),
    response_time_ms INT NOT NULL DEFAULT 0
        CHECK (response_time_ms BETWEEN 0 AND 600000),
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_vocabulary_learning_event_request UNIQUE (user_id, request_id)
);

CREATE INDEX idx_vocabulary_learning_events_user_attempted
    ON vocabulary_learning_events (user_id, attempted_at DESC);

CREATE INDEX idx_vocabulary_learning_events_user_word_attempted
    ON vocabulary_learning_events (user_id, word_id, attempted_at DESC);
