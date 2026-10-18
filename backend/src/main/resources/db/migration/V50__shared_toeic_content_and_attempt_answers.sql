CREATE TABLE toeic_question_bank (
    id BIGSERIAL PRIMARY KEY,
    external_code VARCHAR(128) UNIQUE,
    part VARCHAR(16) NOT NULL,
    question_text TEXT NOT NULL,
    passage TEXT,
    bilingual_passage TEXT,
    audio_url TEXT,
    image_url TEXT,
    options JSONB NOT NULL DEFAULT '{}'::jsonb,
    correct_answer VARCHAR(8) NOT NULL,
    explanation TEXT,
    transcript TEXT,
    translation TEXT,
    vocab_list JSONB,
    difficulty VARCHAR(16) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(16) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT ck_toeic_question_bank_part
        CHECK (part IN ('PART_1', 'PART_2', 'PART_3', 'PART_4', 'PART_5', 'PART_6', 'PART_7')),
    CONSTRAINT ck_toeic_question_bank_difficulty
        CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    CONSTRAINT ck_toeic_question_bank_status
        CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED'))
);

CREATE TABLE grammar_topic_questions (
    topic_id VARCHAR(64) NOT NULL REFERENCES grammar_topics(id) ON DELETE CASCADE,
    question_id BIGINT NOT NULL REFERENCES toeic_question_bank(id) ON DELETE RESTRICT,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT pk_grammar_topic_questions PRIMARY KEY (topic_id, question_id),
    CONSTRAINT uq_grammar_topic_question_order UNIQUE (topic_id, order_index)
);

CREATE TABLE mock_test_question_links (
    test_id INT NOT NULL REFERENCES mock_test_items(id) ON DELETE CASCADE,
    question_id BIGINT NOT NULL REFERENCES toeic_question_bank(id) ON DELETE RESTRICT,
    question_num INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT pk_mock_test_question_links PRIMARY KEY (test_id, question_id),
    CONSTRAINT uq_mock_test_question_number UNIQUE (test_id, question_num)
);

INSERT INTO toeic_question_bank (
    external_code, part, question_text, passage, bilingual_passage, audio_url, image_url,
    options, correct_answer, explanation, transcript, translation, vocab_list, status
)
SELECT 'LEGACY-' || q.test_id || '-' || q.question_num,
       CASE WHEN q.part LIKE 'Part %' THEN 'PART_' || substring(q.part from 6) ELSE q.part END,
       q.question_text, q.passage, q.bilingual_passage, q.audio_url, q.image_url,
       q.options, q.correct_answer, q.explanation, q.transcript, q.translation, q.vocab_list,
       'PUBLISHED'
FROM mock_test_questions q
ON CONFLICT (external_code) DO NOTHING;

INSERT INTO mock_test_question_links (test_id, question_id, question_num)
SELECT q.test_id, b.id, q.question_num
FROM mock_test_questions q
JOIN toeic_question_bank b ON b.external_code = 'LEGACY-' || q.test_id || '-' || q.question_num
ON CONFLICT DO NOTHING;

UPDATE listening_dictation_cards
SET part = 'PART_' || substring(part from 6)
WHERE part LIKE 'Part %';

UPDATE listening_dictation_questions
SET part = 'PART_' || substring(part from 6)
WHERE part LIKE 'Part %';

UPDATE grammar_topics
SET part = 'PART_' || substring(part from 6)
WHERE part LIKE 'Part %';

ALTER TABLE listening_dictation_questions
    ADD COLUMN bank_question_id BIGINT REFERENCES toeic_question_bank(id) ON DELETE SET NULL;

CREATE TABLE vocabulary_set_words (
    set_id VARCHAR(64) NOT NULL REFERENCES vocabulary_test_sets(id) ON DELETE CASCADE,
    word_id VARCHAR(64) NOT NULL REFERENCES vocabulary_items(id) ON DELETE CASCADE,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT pk_vocabulary_set_words PRIMARY KEY (set_id, word_id)
);

INSERT INTO vocabulary_set_words (set_id, word_id, order_index)
SELECT set_id, id, order_index
FROM vocabulary_items
ON CONFLICT DO NOTHING;

CREATE INDEX idx_vocabulary_set_words_order ON vocabulary_set_words (set_id, order_index);
CREATE INDEX idx_vocabulary_set_words_word ON vocabulary_set_words (word_id);

CREATE TABLE media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storage_key VARCHAR(512) NOT NULL UNIQUE,
    original_name VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    duration_seconds INT,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT ck_media_assets_size CHECK (size_bytes > 0),
    CONSTRAINT ck_media_assets_duration CHECK (duration_seconds IS NULL OR duration_seconds > 0)
);

ALTER TABLE mock_test_items
    ADD COLUMN description TEXT,
    ADD COLUMN duration_minutes INT NOT NULL DEFAULT 120,
    ADD COLUMN status VARCHAR(16) NOT NULL DEFAULT 'PUBLISHED',
    ADD CONSTRAINT ck_mock_test_items_duration CHECK (duration_minutes BETWEEN 1 AND 600),
    ADD CONSTRAINT ck_mock_test_items_status CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED'));

CREATE SEQUENCE mock_test_items_id_seq;
SELECT setval('mock_test_items_id_seq', COALESCE((SELECT MAX(id) + 1 FROM mock_test_items), 1), false);
ALTER TABLE mock_test_items ALTER COLUMN id SET DEFAULT nextval('mock_test_items_id_seq');

UPDATE mock_test_items SET vol_id = 'vol1' WHERE vol_id = 'ets2024';

ALTER TABLE user_mock_test_attempts
    ADD COLUMN assessment_id UUID UNIQUE REFERENCES assessments(id) ON DELETE SET NULL;

CREATE TABLE user_mock_test_answers (
    attempt_id UUID NOT NULL REFERENCES user_mock_test_attempts(id) ON DELETE CASCADE,
    question_id BIGINT NOT NULL REFERENCES toeic_question_bank(id) ON DELETE RESTRICT,
    question_num INT NOT NULL,
    selected_answer VARCHAR(8),
    is_correct BOOLEAN NOT NULL,
    response_time_ms INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT pk_user_mock_test_answers PRIMARY KEY (attempt_id, question_id),
    CONSTRAINT ck_user_mock_test_answers_response_time CHECK (response_time_ms >= 0)
);

CREATE INDEX idx_user_mock_test_answers_question ON user_mock_test_answers (question_id);
