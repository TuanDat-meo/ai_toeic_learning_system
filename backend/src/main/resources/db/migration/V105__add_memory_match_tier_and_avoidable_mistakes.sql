-- V105: Add tier and avoidable mistakes for Memory Match game sessions
ALTER TABLE vocabulary_game_sessions
    ADD COLUMN IF NOT EXISTS tier VARCHAR(16),
    ADD COLUMN IF NOT EXISTS avoidable_mistakes INT DEFAULT 0;
