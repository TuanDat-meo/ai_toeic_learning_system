ALTER TABLE vocabulary_game_sessions
    ADD COLUMN max_combo INT NOT NULL DEFAULT 0 CHECK (max_combo >= 0);

ALTER TABLE vocabulary_learning_events
    ADD COLUMN game_question_index INT;

ALTER TABLE vocabulary_learning_events
    ADD CONSTRAINT chk_vocabulary_game_question_index
        CHECK (game_question_index IS NULL OR game_question_index BETWEEN 0 AND 19);

CREATE UNIQUE INDEX uq_vocabulary_game_session_question
    ON vocabulary_learning_events (game_session_id, game_question_index)
    WHERE game_session_id IS NOT NULL;
