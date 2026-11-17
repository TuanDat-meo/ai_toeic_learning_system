CREATE UNIQUE INDEX uq_vocabulary_game_session_word
    ON vocabulary_learning_events (game_session_id, word_id)
    WHERE game_session_id IS NOT NULL;
