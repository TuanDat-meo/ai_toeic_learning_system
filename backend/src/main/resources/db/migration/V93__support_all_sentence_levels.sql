ALTER TABLE vocabulary_game_sessions
    DROP CONSTRAINT IF EXISTS vocabulary_game_sessions_difficulty_check,
    ADD CONSTRAINT vocabulary_game_sessions_difficulty_check
        CHECK (difficulty IN ('ALL', 'EASY', 'MEDIUM', 'HARD'));
