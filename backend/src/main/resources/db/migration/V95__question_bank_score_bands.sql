ALTER TABLE toeic_question_bank
    ADD COLUMN source_difficulty TEXT,
    ADD COLUMN source_audio_path TEXT,
    ADD COLUMN source_image_path TEXT;

ALTER TABLE toeic_question_bank
    DROP CONSTRAINT IF EXISTS ck_toeic_question_bank_difficulty;

UPDATE toeic_question_bank
SET difficulty = CASE upper(difficulty)
    WHEN 'EASY' THEN '450-550'
    WHEN 'MEDIUM' THEN '650-750'
    WHEN 'HARD' THEN '850-900+'
    ELSE difficulty
END,
source_difficulty = COALESCE(source_difficulty, 'Legacy: ' || difficulty);

ALTER TABLE toeic_question_bank
    ADD CONSTRAINT ck_toeic_question_bank_difficulty
    CHECK (difficulty IN ('450-550', '550-650', '650-750', '750-850', '850-900+'));

ALTER TABLE toeic_question_bank
    ALTER COLUMN difficulty SET DEFAULT '650-750';
