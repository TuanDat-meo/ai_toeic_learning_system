ALTER TABLE vocabulary_learning_events
    DROP CONSTRAINT IF EXISTS chk_vocabulary_game_question_index;

ALTER TABLE vocabulary_learning_events
    ADD CONSTRAINT chk_vocabulary_game_question_index
        CHECK (game_question_index IS NULL OR game_question_index >= 0);
