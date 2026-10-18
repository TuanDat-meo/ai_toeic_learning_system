-- =============================================================================
-- V43: Normalize enum values, extend toeic_question_bank, add part scores
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. CHUẨN HÓA STATUS: listening_dictation_cards
-- ---------------------------------------------------------------------------
UPDATE listening_dictation_cards
SET status = CASE status
    WHEN 'Chưa bắt đầu'   THEN 'NOT_STARTED'
    WHEN 'Đang luyện tập' THEN 'IN_PROGRESS'
    WHEN 'Đã hoàn thành'   THEN 'COMPLETED'
    ELSE 'NOT_STARTED'
END;

ALTER TABLE listening_dictation_cards
    ALTER COLUMN status SET DEFAULT 'NOT_STARTED',
    ADD CONSTRAINT ck_listening_card_status
        CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'));

-- ---------------------------------------------------------------------------
-- 2. CHUẨN HÓA STATUS: user_listening_progress
-- ---------------------------------------------------------------------------
UPDATE user_listening_progress
SET status = CASE status
    WHEN 'Chưa bắt đầu'   THEN 'NOT_STARTED'
    WHEN 'Đang luyện tập' THEN 'IN_PROGRESS'
    WHEN 'Đã hoàn thành'   THEN 'COMPLETED'
    ELSE 'NOT_STARTED'
END;

ALTER TABLE user_listening_progress
    ALTER COLUMN status SET DEFAULT 'NOT_STARTED',
    ADD CONSTRAINT ck_user_listening_status
        CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'));

-- ---------------------------------------------------------------------------
-- 3. CHUẨN HÓA STATUS: user_grammar_progress
-- ---------------------------------------------------------------------------
UPDATE user_grammar_progress
SET status = CASE status
    WHEN 'Chưa học'       THEN 'NOT_STARTED'
    WHEN 'Đang học'       THEN 'IN_PROGRESS'
    WHEN 'Đã hoàn thành'  THEN 'COMPLETED'
    ELSE 'NOT_STARTED'
END;

ALTER TABLE user_grammar_progress
    ALTER COLUMN status SET DEFAULT 'NOT_STARTED',
    ADD CONSTRAINT ck_user_grammar_status
        CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'));

-- ---------------------------------------------------------------------------
-- 4. CHUẨN HÓA DIFFICULTY: mock_test_items
-- ---------------------------------------------------------------------------
UPDATE mock_test_items
SET difficulty = CASE difficulty
    WHEN 'Dễ'      THEN 'EASY'
    WHEN 'Vừa sức' THEN 'MEDIUM'
    WHEN 'Khó'     THEN 'HARD'
    ELSE 'MEDIUM'
END;

ALTER TABLE mock_test_items
    ALTER COLUMN difficulty SET DEFAULT 'MEDIUM',
    ADD CONSTRAINT ck_mock_test_difficulty
        CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD'));

-- ---------------------------------------------------------------------------
-- 5. MỞ RỘNG toeic_question_bank: thêm trap_note và question_translation
--    (đây là các trường UI grammar đang cần nhưng chưa có trong bank)
-- ---------------------------------------------------------------------------
ALTER TABLE toeic_question_bank
    ADD COLUMN IF NOT EXISTS trap_note          TEXT,
    ADD COLUMN IF NOT EXISTS question_translation TEXT;

-- ---------------------------------------------------------------------------
-- 6. THÊM BẢNG user_mock_test_part_scores
--    Lưu điểm theo từng Part để phục vụ analytics
-- ---------------------------------------------------------------------------
CREATE TABLE user_mock_test_part_scores (
    attempt_id  UUID        NOT NULL REFERENCES user_mock_test_attempts(id) ON DELETE CASCADE,
    part        VARCHAR(16) NOT NULL,
    correct     INT         NOT NULL DEFAULT 0,
    total       INT         NOT NULL DEFAULT 0,
    CONSTRAINT pk_mock_part_scores PRIMARY KEY (attempt_id, part),
    CONSTRAINT ck_mock_part_scores_correct CHECK (correct >= 0),
    CONSTRAINT ck_mock_part_scores_total   CHECK (total >= 0),
    CONSTRAINT ck_mock_part_scores_part
        CHECK (part IN ('PART_1','PART_2','PART_3','PART_4','PART_5','PART_6','PART_7'))
);

CREATE INDEX idx_mock_part_scores_attempt ON user_mock_test_part_scores (attempt_id);

-- ---------------------------------------------------------------------------
-- 7. THÊM COLUMN level vào vocabulary_test_sets
--    (CEFR level A1–C2 cho bộ từ vựng, tách biệt khỏi difficulty câu hỏi)
-- ---------------------------------------------------------------------------
ALTER TABLE vocabulary_test_sets
    ADD COLUMN IF NOT EXISTS status VARCHAR(16) NOT NULL DEFAULT 'PUBLISHED';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ck_vocab_test_set_status'
    ) THEN
        ALTER TABLE vocabulary_test_sets
            ADD CONSTRAINT ck_vocab_test_set_status
            CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED'));
    END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 8. THÊM COLUMN canonical_vocab_id vào vocabulary_items
--    (mapping trung gian để migrate sang bảng vocabularies chuẩn)
-- ---------------------------------------------------------------------------
ALTER TABLE vocabulary_items
    ADD COLUMN IF NOT EXISTS canonical_vocab_id UUID REFERENCES vocabularies(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_vocabulary_items_canonical
    ON vocabulary_items (canonical_vocab_id);
