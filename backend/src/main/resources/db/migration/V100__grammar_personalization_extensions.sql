ALTER TABLE grammar_topic_questions
    ADD COLUMN IF NOT EXISTS source_type VARCHAR(32) NOT NULL DEFAULT 'UNKNOWN',
    ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS content_version INT NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS license_note TEXT,
    ADD COLUMN IF NOT EXISTS review_status VARCHAR(16) NOT NULL DEFAULT 'DRAFT',
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

ALTER TABLE grammar_topic_questions
    ADD CONSTRAINT ck_grammar_question_source_type
        CHECK (source_type IN ('ORIGINAL', 'AI_ASSISTED', 'LICENSED', 'IMPORTED', 'UNKNOWN')),
    ADD CONSTRAINT ck_grammar_question_review_status
        CHECK (review_status IN ('DRAFT', 'IN_REVIEW', 'APPROVED', 'REJECTED'));

CREATE TABLE grammar_question_origin (
    question_id VARCHAR(128) PRIMARY KEY,
    source_type VARCHAR(32) NOT NULL DEFAULT 'UNKNOWN',
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    content_version INT NOT NULL DEFAULT 1,
    license_note TEXT,
    review_status VARCHAR(16) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT ck_grammar_origin_source CHECK (source_type IN ('ORIGINAL', 'AI_ASSISTED', 'LICENSED', 'IMPORTED', 'UNKNOWN')),
    CONSTRAINT ck_grammar_origin_review CHECK (review_status IN ('DRAFT', 'IN_REVIEW', 'APPROVED', 'REJECTED'))
);

CREATE TABLE grammar_ai_explanation (
    id BIGSERIAL PRIMARY KEY,
    question_id VARCHAR(128) NOT NULL,
    selected_option VARCHAR(32) NOT NULL,
    model VARCHAR(128) NOT NULL,
    prompt_version VARCHAR(32) NOT NULL,
    content TEXT NOT NULL,
    generated_at TIMESTAMP NOT NULL DEFAULT now(),
    token_count INT,
    cost_estimate DOUBLE PRECISION,
    approved BOOLEAN NOT NULL DEFAULT false,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(question_id, selected_option, prompt_version)
);

CREATE TABLE grammar_ai_feedback (
    id BIGSERIAL PRIMARY KEY,
    explanation_id BIGINT NOT NULL REFERENCES grammar_ai_explanation(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    helpful BOOLEAN NOT NULL,
    inaccurate BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE(explanation_id, user_id)
);

CREATE TABLE grammar_exam_session (
    id VARCHAR(64) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id VARCHAR(64) REFERENCES grammar_topics(id) ON DELETE CASCADE,
    started_at TIMESTAMP NOT NULL DEFAULT now(),
    deadline_at TIMESTAMP NOT NULL,
    submitted_at TIMESTAMP,
    suspicious BOOLEAN NOT NULL DEFAULT false,
    score DOUBLE PRECISION,
    status VARCHAR(16) NOT NULL DEFAULT 'IN_PROGRESS'
        CHECK (status IN ('IN_PROGRESS', 'SUBMITTED', 'EXPIRED'))
);

CREATE TABLE grammar_content_import_batch (
    id VARCHAR(64) PRIMARY KEY,
    source_type VARCHAR(32) NOT NULL,
    source_name TEXT,
    imported_by UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'PREVIEW'
        CHECK (status IN ('PREVIEW', 'COMMITTED', 'UNDONE')),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    undone_at TIMESTAMP
);

CREATE INDEX idx_grammar_report_status ON grammar_question_report(status, created_at);
CREATE INDEX idx_grammar_review_due ON grammar_review_schedule(user_id, due_at);
CREATE INDEX idx_grammar_exam_user_deadline ON grammar_exam_session(user_id, deadline_at);
