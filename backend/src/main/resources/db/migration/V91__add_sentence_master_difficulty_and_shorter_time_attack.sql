ALTER TABLE vocabulary_game_sessions
    ADD COLUMN difficulty VARCHAR(16) NOT NULL DEFAULT 'MEDIUM'
        CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD'));

ALTER TABLE vocabulary_game_sessions
    DROP CONSTRAINT vocabulary_game_sessions_time_limit_seconds_check,
    ADD CONSTRAINT vocabulary_game_sessions_time_limit_seconds_check
        CHECK (time_limit_seconds IS NULL OR time_limit_seconds IN (30, 60, 90, 120));
