ALTER TABLE vocabulary_game_sessions
    ADD COLUMN play_mode VARCHAR(16) NOT NULL DEFAULT 'CLASSIC'
        CHECK (play_mode IN ('CLASSIC', 'TIME_ATTACK')),
    ADD COLUMN time_limit_seconds INT
        CHECK (time_limit_seconds IS NULL OR time_limit_seconds IN (60, 90, 120));

CREATE TABLE vocabulary_game_session_questions (
    session_id UUID NOT NULL REFERENCES vocabulary_game_sessions(id) ON DELETE CASCADE,
    question_index INT NOT NULL CHECK (question_index >= 0),
    word_id VARCHAR(64) NOT NULL REFERENCES vocabulary_items(id) ON DELETE CASCADE,
    option_word_ids TEXT[] NOT NULL,
    PRIMARY KEY (session_id, question_index),
    UNIQUE (session_id, word_id),
    CHECK (cardinality(option_word_ids) = 4)
);
