ALTER TABLE listening_dictation_cards
    ADD COLUMN title TEXT NOT NULL DEFAULT '';

CREATE TABLE listening_part_units (
    id VARCHAR(64) PRIMARY KEY,
    part VARCHAR(32) NOT NULL,
    unit_type VARCHAR(16) NOT NULL CHECK (unit_type IN ('level', 'category')),
    title TEXT NOT NULL,
    target_level VARCHAR(32),
    total_questions INT NOT NULL DEFAULT 0 CHECK (total_questions >= 0),
    theory_summary TEXT NOT NULL DEFAULT '',
    rules JSONB NOT NULL DEFAULT '[]'::jsonb,
    vocab_bag JSONB NOT NULL DEFAULT '[]'::jsonb,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    status VARCHAR(32) NOT NULL DEFAULT 'PUBLISHED',
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_listening_part_units_part_type
    ON listening_part_units (part, unit_type, created_at DESC);
