ALTER TABLE vocabulary_game_sessions
    ADD COLUMN deck_ids TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
