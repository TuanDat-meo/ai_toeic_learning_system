CREATE TABLE listening_dictation_cards (
    id VARCHAR(64) PRIMARY KEY,
    test_number INT NOT NULL,
    part VARCHAR(32) NOT NULL,
    year VARCHAR(16) NOT NULL DEFAULT '2024',
    total_questions INT NOT NULL DEFAULT 6,
    status VARCHAR(32) NOT NULL DEFAULT 'Chưa bắt đầu',
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE listening_dictation_questions (
    id BIGSERIAL PRIMARY KEY,
    card_id VARCHAR(64) NOT NULL REFERENCES listening_dictation_cards(id) ON DELETE CASCADE,
    question_index INT NOT NULL,
    part VARCHAR(32) NOT NULL,
    audio_url TEXT NOT NULL,
    image_url TEXT,
    full_transcript TEXT NOT NULL,
    vietnamese_translation TEXT,
    options JSONB,
    option_translations JSONB,
    correct_answer VARCHAR(8),
    explanation TEXT,
    trap_note TEXT,
    vocab_list JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_listening_questions_card_index
    ON listening_dictation_questions (card_id, question_index);

CREATE TABLE user_listening_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_id VARCHAR(64) NOT NULL REFERENCES listening_dictation_cards(id) ON DELETE CASCADE,
    completed_questions INT NOT NULL DEFAULT 0,
    total_questions INT NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'Chưa bắt đầu',
    last_question_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_listening_card UNIQUE (user_id, card_id)
);

CREATE INDEX idx_user_listening_progress_user
    ON user_listening_progress (user_id);
