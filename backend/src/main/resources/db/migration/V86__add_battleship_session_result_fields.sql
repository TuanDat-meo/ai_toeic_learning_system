-- V86: Add result metrics to vocabulary_game_sessions for Battleship
ALTER TABLE vocabulary_game_sessions
    ADD COLUMN IF NOT EXISTS stars INT CHECK (stars IS NULL OR stars BETWEEN 1 AND 3),
    ADD COLUMN IF NOT EXISTS won BOOLEAN,
    ADD COLUMN IF NOT EXISTS player_hp_remaining INT CHECK (player_hp_remaining IS NULL OR player_hp_remaining >= 0),
    ADD COLUMN IF NOT EXISTS fleet_hp_remaining INT CHECK (fleet_hp_remaining IS NULL OR fleet_hp_remaining >= 0);
