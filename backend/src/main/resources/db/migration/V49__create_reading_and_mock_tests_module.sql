-- 1. READING EXERCISE CARDS
CREATE TABLE reading_exercise_cards (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(32) NOT NULL,
    sub_category VARCHAR(64),
    subtitle VARCHAR(255),
    tag VARCHAR(64),
    total_questions INT NOT NULL DEFAULT 0,
    passage_text TEXT,
    passage_text_vi TEXT,
    passages JSONB,
    theory JSONB,
    sample_questions JSONB,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_reading_cards_category ON reading_exercise_cards (category, sub_category);

-- 2. USER READING PROGRESS
CREATE TABLE user_reading_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id VARCHAR(64) NOT NULL REFERENCES reading_exercise_cards(id) ON DELETE CASCADE,
    studied_questions INT NOT NULL DEFAULT 0,
    correct_answers INT NOT NULL DEFAULT 0,
    wrong_answers INT NOT NULL DEFAULT 0,
    bookmarked BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_reading_card UNIQUE (user_id, exercise_id)
);

CREATE INDEX idx_user_reading_progress_user ON user_reading_progress (user_id);

-- 3. MOCK TEST ITEMS
CREATE TABLE mock_test_items (
    id INT PRIMARY KEY,
    vol_id VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    difficulty VARCHAR(32) NOT NULL DEFAULT 'Vừa sức',
    key_vocab JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 4. MOCK TEST QUESTIONS
CREATE TABLE mock_test_questions (
    id BIGSERIAL PRIMARY KEY,
    test_id INT NOT NULL REFERENCES mock_test_items(id) ON DELETE CASCADE,
    question_num INT NOT NULL,
    part VARCHAR(32) NOT NULL,
    question_text TEXT NOT NULL,
    passage TEXT,
    bilingual_passage TEXT,
    audio_url TEXT,
    image_url TEXT,
    options JSONB NOT NULL,
    correct_answer VARCHAR(8) NOT NULL,
    explanation TEXT,
    transcript TEXT,
    translation TEXT,
    vocab_list JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_mock_questions_test_num ON mock_test_questions (test_id, question_num);

-- 5. USER MOCK TEST ATTEMPTS
CREATE TABLE user_mock_test_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    test_id INT NOT NULL REFERENCES mock_test_items(id) ON DELETE CASCADE,
    score INT NOT NULL,
    listening_score INT NOT NULL,
    reading_score INT NOT NULL,
    correct_count INT NOT NULL,
    total_count INT NOT NULL,
    duration_seconds INT NOT NULL DEFAULT 0,
    completed_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_mock_attempts_user_test ON user_mock_test_attempts (user_id, test_id, completed_at DESC);
