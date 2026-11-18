ALTER TABLE listening_dictation_questions
    ADD COLUMN IF NOT EXISTS question_text TEXT;

CREATE TABLE IF NOT EXISTS user_listening_unit_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    unit_id VARCHAR(64) NOT NULL REFERENCES listening_part_units(id) ON DELETE CASCADE,
    completed_questions INT NOT NULL DEFAULT 0,
    total_questions INT NOT NULL DEFAULT 0,
    correct_count INT NOT NULL DEFAULT 0,
    wrong_count INT NOT NULL DEFAULT 0,
    wrong_question_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    answered_question_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    status VARCHAR(32) NOT NULL DEFAULT 'NOT_STARTED',
    last_question_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_listening_unit UNIQUE (user_id, unit_id),
    CONSTRAINT ck_user_listening_unit_status CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'))
);

CREATE INDEX IF NOT EXISTS idx_user_listening_unit_progress_user
    ON user_listening_unit_progress (user_id);

UPDATE listening_dictation_cards
SET part = 'Part ' || substring(part from 6)
WHERE part LIKE 'PART_%';

UPDATE listening_dictation_questions
SET part = 'Part ' || substring(part from 6)
WHERE part LIKE 'PART_%';

UPDATE listening_part_units
SET part = 'Part ' || substring(part from 6)
WHERE part LIKE 'PART_%';

