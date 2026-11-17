CREATE TABLE vocabulary_game_sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    set_id VARCHAR(64) NOT NULL REFERENCES vocabulary_test_sets(id) ON DELETE CASCADE,
    game_type VARCHAR(16) NOT NULL
        CHECK (game_type IN ('RUNNER', 'MATCHING', 'BATTLE', 'SENTENCE')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    score INT NOT NULL DEFAULT 0 CHECK (score >= 0),
    correct_count INT NOT NULL DEFAULT 0 CHECK (correct_count >= 0),
    wrong_count INT NOT NULL DEFAULT 0 CHECK (wrong_count >= 0),
    total_questions INT NOT NULL DEFAULT 0 CHECK (total_questions >= 0),
    duration_seconds INT NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0)
);

ALTER TABLE vocabulary_learning_events
    ADD COLUMN game_session_id UUID REFERENCES vocabulary_game_sessions(id) ON DELETE SET NULL;

CREATE INDEX idx_vocabulary_game_sessions_user_set_game
    ON vocabulary_game_sessions (user_id, set_id, game_type, completed_at DESC);

CREATE INDEX idx_vocabulary_learning_events_game_session
    ON vocabulary_learning_events (game_session_id)
    WHERE game_session_id IS NOT NULL;
