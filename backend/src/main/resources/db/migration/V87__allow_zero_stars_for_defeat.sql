-- V87: Update stars check constraint to allow 0 stars for defeated sessions
ALTER TABLE vocabulary_game_sessions
    DROP CONSTRAINT IF EXISTS vocabulary_game_sessions_stars_check;

ALTER TABLE vocabulary_game_sessions
    ADD CONSTRAINT vocabulary_game_sessions_stars_check
        CHECK (stars IS NULL OR stars BETWEEN 0 AND 3);
