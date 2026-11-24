ALTER TABLE listening_dictation_questions
    ADD COLUMN IF NOT EXISTS segments JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE user_listening_progress
    ADD COLUMN IF NOT EXISTS correct_count INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS wrong_count INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS answered_question_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS wrong_question_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS flagged_question_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS user_notes JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS self_assessments JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE user_listening_unit_progress
    ADD COLUMN IF NOT EXISTS flagged_question_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS user_notes JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS user_listening_attempts (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(32) NOT NULL CHECK (target_type IN ('DICTATION', 'UNIT')),
    target_id VARCHAR(64) NOT NULL,
    target_title TEXT NOT NULL DEFAULT '',
    part VARCHAR(32) NOT NULL DEFAULT 'Part 1',
    mode VARCHAR(32) NOT NULL DEFAULT 'PRACTICE',
    total_questions INT NOT NULL DEFAULT 0,
    completed_questions INT NOT NULL DEFAULT 0,
    correct_count INT NOT NULL DEFAULT 0,
    wrong_count INT NOT NULL DEFAULT 0,
    accuracy_percent INT NOT NULL DEFAULT 0,
    duration_seconds INT NOT NULL DEFAULT 0,
    xp_earned INT NOT NULL DEFAULT 0,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_listening_attempts_user
    ON user_listening_attempts (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_listening_attempts_target
    ON user_listening_attempts (user_id, target_type, target_id, created_at DESC);

