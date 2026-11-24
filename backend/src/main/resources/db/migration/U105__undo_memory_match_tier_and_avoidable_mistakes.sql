-- U105: Rollback V105
ALTER TABLE vocabulary_game_sessions
    DROP COLUMN IF EXISTS avoidable_mistakes,
    DROP COLUMN IF EXISTS tier;
