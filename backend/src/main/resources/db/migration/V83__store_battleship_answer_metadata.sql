ALTER TABLE vocabulary_learning_events
    ADD COLUMN game_result VARCHAR(16),
    ADD COLUMN used_hint BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN used_item VARCHAR(24),
    ADD COLUMN enemy_type VARCHAR(16),
    ADD COLUMN damage NUMERIC(4, 1),
    ADD COLUMN game_mode VARCHAR(20),
    ADD COLUMN word_level VARCHAR(16);

ALTER TABLE vocabulary_learning_events
    ADD CONSTRAINT chk_vocabulary_game_result
        CHECK (game_result IS NULL OR game_result IN ('correct', 'near', 'wrong', 'timeout')),
    ADD CONSTRAINT chk_vocabulary_game_damage
        CHECK (damage IS NULL OR damage >= 0),
    ADD CONSTRAINT chk_vocabulary_game_used_item
        CHECK (used_item IS NULL OR used_item IN ('shield', 'repair', 'double_shot', 'hint'));
