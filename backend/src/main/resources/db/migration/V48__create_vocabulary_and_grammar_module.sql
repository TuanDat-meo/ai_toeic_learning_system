-- 1. VOCABULARY TEST SETS
CREATE TABLE vocabulary_test_sets (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    year VARCHAR(16) NOT NULL DEFAULT '2024',
    category VARCHAR(64) NOT NULL DEFAULT '2024',
    word_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 2. VOCABULARY ITEMS
CREATE TABLE vocabulary_items (
    id VARCHAR(64) PRIMARY KEY,
    set_id VARCHAR(64) NOT NULL REFERENCES vocabulary_test_sets(id) ON DELETE CASCADE,
    word VARCHAR(128) NOT NULL,
    ipa VARCHAR(128),
    part_of_speech VARCHAR(64),
    meaning TEXT NOT NULL,
    example TEXT,
    example_meaning TEXT,
    level VARCHAR(16) DEFAULT 'B1',
    starred BOOLEAN DEFAULT false,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_vocabulary_items_set_order
    ON vocabulary_items (set_id, order_index);

-- 3. USER VOCABULARY PROGRESS
CREATE TABLE user_vocabulary_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    word_id VARCHAR(64) NOT NULL REFERENCES vocabulary_items(id) ON DELETE CASCADE,
    status VARCHAR(32) NOT NULL DEFAULT 'LEARNING',
    starred BOOLEAN NOT NULL DEFAULT false,
    review_count INT NOT NULL DEFAULT 0,
    last_reviewed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_word_progress UNIQUE (user_id, word_id)
);

CREATE INDEX idx_user_vocab_progress_user
    ON user_vocabulary_progress (user_id);

-- 4. GRAMMAR TOPICS
CREATE TABLE grammar_topics (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(32) NOT NULL,
    title VARCHAR(255) NOT NULL,
    english_title VARCHAR(255),
    part VARCHAR(32) DEFAULT 'Part 5',
    target_score VARCHAR(64) DEFAULT '350-500',
    status VARCHAR(32) NOT NULL DEFAULT 'PUBLISHED',
    summary TEXT,
    formula TEXT,
    signal_words JSONB,
    traps JSONB,
    examples JSONB,
    questions JSONB,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 5. USER GRAMMAR PROGRESS
CREATE TABLE user_grammar_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id VARCHAR(64) NOT NULL REFERENCES grammar_topics(id) ON DELETE CASCADE,
    completed_questions INT NOT NULL DEFAULT 0,
    total_questions INT NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'Chưa học',
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_grammar_topic UNIQUE (user_id, topic_id)
);

CREATE INDEX idx_user_grammar_progress_user
    ON user_grammar_progress (user_id);
