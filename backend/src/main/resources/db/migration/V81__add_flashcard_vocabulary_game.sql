ALTER TABLE vocabulary_game_sessions
    DROP CONSTRAINT vocabulary_game_sessions_game_type_check;

ALTER TABLE vocabulary_game_sessions
    ADD CONSTRAINT vocabulary_game_sessions_game_type_check
        CHECK (game_type IN ('RUNNER', 'MATCHING', 'BATTLE', 'SENTENCE', 'FLASHCARD'));
