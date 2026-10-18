-- =============================================================================
-- V44: Listening stimuli – shared audio/transcript for grouped questions (Part 3-4)
--      + vocabulary canonical migration
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. BẢNG listening_stimuli
--    Mỗi stimulus là một đoạn audio/hội thoại mà nhiều câu hỏi cùng dùng chung.
--    Part 1-2: thường 1 stimulus – 1 câu hỏi.
--    Part 3-4: 1 stimulus – 2 đến 3 câu hỏi.
-- ---------------------------------------------------------------------------
CREATE TABLE listening_stimuli (
    id          BIGSERIAL    PRIMARY KEY,
    card_id     VARCHAR(64)  NOT NULL REFERENCES listening_dictation_cards(id) ON DELETE CASCADE,
    media_id    UUID         REFERENCES media_assets(id) ON DELETE SET NULL,
    audio_url   TEXT,
    transcript  TEXT,
    translation TEXT,
    image_url   TEXT,
    order_index INT          NOT NULL DEFAULT 0,
    created_at  TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE INDEX idx_listening_stimuli_card ON listening_stimuli (card_id, order_index);

-- ---------------------------------------------------------------------------
-- 2. THÊM stimulus_id vào listening_dictation_questions
--    NULL-able để tương thích ngược với câu hỏi đã có audio riêng.
-- ---------------------------------------------------------------------------
ALTER TABLE listening_dictation_questions
    ADD COLUMN IF NOT EXISTS stimulus_id BIGINT REFERENCES listening_stimuli(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_listening_q_stimulus ON listening_dictation_questions (stimulus_id);

-- ---------------------------------------------------------------------------
-- 3. BACKFILL: tạo stimulus cho mỗi câu hỏi hiện có (1-1 để tương thích ngược)
--    Chỉ tạo khi audio_url không null và câu hỏi chưa có stimulus
-- ---------------------------------------------------------------------------
INSERT INTO listening_stimuli (card_id, audio_url, transcript, translation, image_url, order_index)
SELECT DISTINCT ON (q.card_id, q.audio_url)
       q.card_id, q.audio_url, q.full_transcript, q.vietnamese_translation, q.image_url, q.question_index
FROM listening_dictation_questions q
WHERE q.audio_url IS NOT NULL
ORDER BY q.card_id, q.audio_url, q.question_index ASC;

UPDATE listening_dictation_questions q
SET stimulus_id = s.id
FROM listening_stimuli s
WHERE s.card_id = q.card_id
  AND s.audio_url = q.audio_url
  AND q.stimulus_id IS NULL;

-- ---------------------------------------------------------------------------
-- 4. VOCABULARY CANONICAL MIGRATION
--    Chuyển vocabulary_items → vocabularies (nguồn chuẩn từ V5)
--    Bước này an toàn: chỉ INSERT nếu từ chưa tồn tại theo normalized_word
-- ---------------------------------------------------------------------------
INSERT INTO vocabularies (id, word, normalized_word, ipa, part_of_speech, status, created_at, updated_at)
SELECT
    gen_random_uuid(),
    vi.word,
    lower(trim(vi.word)),
    vi.ipa,
    vi.part_of_speech,
    'PUBLISHED',
    vi.created_at,
    vi.updated_at
FROM vocabulary_items vi
WHERE NOT EXISTS (
    SELECT 1 FROM vocabularies v WHERE lower(trim(v.word)) = lower(trim(vi.word))
)
ON CONFLICT DO NOTHING;

-- Gán canonical_vocab_id
UPDATE vocabulary_items vi
SET canonical_vocab_id = v.id
FROM vocabularies v
WHERE lower(trim(v.word)) = lower(trim(vi.word))
  AND vi.canonical_vocab_id IS NULL;

-- ---------------------------------------------------------------------------
-- 5. SEED vocabulary_meanings từ vocabulary_items
--    (đa nghĩa: mỗi từ trong vocabulary_items có 1 meaning chính)
-- ---------------------------------------------------------------------------
INSERT INTO vocabulary_meanings (vocabulary_id, meaning, normalized_meaning, example)
SELECT
    vi.canonical_vocab_id,
    vi.meaning,
    lower(trim(vi.meaning)),
    vi.example
FROM vocabulary_items vi
WHERE vi.canonical_vocab_id IS NOT NULL
  AND vi.meaning IS NOT NULL
ON CONFLICT (vocabulary_id, normalized_meaning) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 6. THÊM CỘT canonical_word_id vào vocabulary_set_words
--    Để bảng liên kết dần trỏ về vocabularies thay vì vocabulary_items
-- ---------------------------------------------------------------------------
ALTER TABLE vocabulary_set_words
    ADD COLUMN IF NOT EXISTS canonical_word_id UUID REFERENCES vocabularies(id) ON DELETE RESTRICT;

UPDATE vocabulary_set_words sw
SET canonical_word_id = vi.canonical_vocab_id
FROM vocabulary_items vi
WHERE vi.id = sw.word_id
  AND vi.canonical_vocab_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_vocab_set_words_canonical ON vocabulary_set_words (canonical_word_id);

-- ---------------------------------------------------------------------------
-- 7. THÊM level CEFR vào vocabulary_items (tách khỏi difficulty_levels taxonomy)
--    Đây là trình độ CEFR riêng của từ vựng
-- ---------------------------------------------------------------------------
UPDATE vocabulary_items
SET level = 'B1'
WHERE level IS NOT NULL AND level NOT IN ('A1','A2','B1','B2','C1','C2');

ALTER TABLE vocabulary_items
    ADD CONSTRAINT ck_vocab_items_level
        CHECK (level IS NULL OR level IN ('A1','A2','B1','B2','C1','C2'));
