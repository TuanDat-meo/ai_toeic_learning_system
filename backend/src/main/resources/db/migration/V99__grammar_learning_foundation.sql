ALTER TABLE users DROP CONSTRAINT IF EXISTS ck_users_role;
ALTER TABLE users ADD CONSTRAINT ck_users_role CHECK (role IN ('ADMIN', 'STUDENT', 'TEACHER', 'AUTHOR', 'REVIEWER'));

CREATE TABLE grammar_learning_config (
    id BIGSERIAL PRIMARY KEY,
    topic_id VARCHAR(64) UNIQUE REFERENCES grammar_topics(id) ON DELETE CASCADE,
    pass_threshold INT NOT NULL DEFAULT 80 CHECK (pass_threshold BETWEEN 50 AND 100),
    srs_initial_days INT NOT NULL DEFAULT 3 CHECK (srs_initial_days BETWEEN 1 AND 7),
    shuffle_questions BOOLEAN NOT NULL DEFAULT true,
    shuffle_options BOOLEAN NOT NULL DEFAULT true,
    show_explanation_immediately BOOLEAN NOT NULL DEFAULT true,
    exam_mode BOOLEAN NOT NULL DEFAULT false,
    min_questions_to_publish INT NOT NULL DEFAULT 10,
    mastery_streak INT NOT NULL DEFAULT 3,
    mastery_min_gap_days INT NOT NULL DEFAULT 2,
    difficulty_low_threshold DOUBLE PRECISION NOT NULL DEFAULT 0.40,
    report_auto_hide_threshold INT NOT NULL DEFAULT 3,
    behavior_retention_days INT NOT NULL DEFAULT 365,
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

INSERT INTO grammar_learning_config (topic_id)
SELECT NULL
WHERE NOT EXISTS (SELECT 1 FROM grammar_learning_config WHERE topic_id IS NULL);

CREATE TABLE grammar_attempt (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id VARCHAR(128) NOT NULL,
    topic_id VARCHAR(64) NOT NULL REFERENCES grammar_topics(id) ON DELETE RESTRICT,
    selected_option VARCHAR(32) NOT NULL,
    is_correct BOOLEAN NOT NULL,
    attempt_no INT NOT NULL DEFAULT 1,
    mode VARCHAR(16) NOT NULL CHECK (mode IN ('PRACTICE', 'RETRY_WRONG', 'EXAM', 'REVIEW', 'MIXED')),
    time_spent_ms BIGINT NOT NULL DEFAULT 0 CHECK (time_spent_ms >= 0),
    client_event_id VARCHAR(128) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_grammar_attempt_event UNIQUE (user_id, client_event_id)
);
CREATE INDEX idx_grammar_attempt_user_topic ON grammar_attempt(user_id, topic_id);
CREATE INDEX idx_grammar_attempt_question ON grammar_attempt(question_id);

CREATE TABLE grammar_audit_log (
    id BIGSERIAL PRIMARY KEY,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(64) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(128) NOT NULL,
    before_json JSONB,
    after_json JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE grammar_rule (
    id VARCHAR(64) PRIMARY KEY,
    topic_id VARCHAR(64) NOT NULL REFERENCES grammar_topics(id) ON DELETE CASCADE,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(160) NOT NULL,
    description TEXT,
    learning_objective TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_grammar_rule_topic_code UNIQUE(topic_id, code)
);

CREATE TABLE grammar_question_rule (
    question_id VARCHAR(128) NOT NULL,
    rule_id VARCHAR(64) NOT NULL REFERENCES grammar_rule(id) ON DELETE CASCADE,
    PRIMARY KEY(question_id, rule_id)
);

CREATE TABLE grammar_passage (
    id VARCHAR(64) PRIMARY KEY,
    type VARCHAR(16) NOT NULL CHECK (type IN ('PART6', 'PART7')),
    content TEXT NOT NULL,
    translation TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE grammar_question_passage (
    question_id VARCHAR(128) PRIMARY KEY,
    passage_id VARCHAR(64) NOT NULL REFERENCES grammar_passage(id) ON DELETE CASCADE
);

CREATE TABLE grammar_review_schedule (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id VARCHAR(128) NOT NULL,
    due_at TIMESTAMP NOT NULL,
    interval_days INT NOT NULL DEFAULT 1,
    ease DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    streak INT NOT NULL DEFAULT 0,
    last_result BOOLEAN,
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    PRIMARY KEY(user_id, question_id)
);

CREATE TABLE grammar_bookmark (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(16) NOT NULL CHECK (target_type IN ('QUESTION', 'TOPIC')),
    target_id VARCHAR(128) NOT NULL,
    note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    PRIMARY KEY(user_id, target_type, target_id)
);

CREATE TABLE grammar_question_report (
    id BIGSERIAL PRIMARY KEY,
    question_id VARCHAR(128) NOT NULL,
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(64) NOT NULL,
    message TEXT,
    status VARCHAR(16) NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'IN_REVIEW', 'FIXED', 'REJECTED')),
    handled_by UUID REFERENCES users(id) ON DELETE SET NULL,
    handled_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_grammar_question_reporter UNIQUE(reporter_id, question_id)
);

CREATE TABLE grammar_content_revision (
    id BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(32) NOT NULL,
    entity_id VARCHAR(128) NOT NULL,
    version INT NOT NULL,
    content_json JSONB NOT NULL,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_grammar_revision UNIQUE(entity_type, entity_id, version)
);

CREATE TABLE grammar_learning_event (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(48) NOT NULL,
    topic_id VARCHAR(64) REFERENCES grammar_topics(id) ON DELETE CASCADE,
    ref_id VARCHAR(128),
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_grammar_learning_event_user_created ON grammar_learning_event(user_id, created_at);

ALTER TABLE grammar_topics
    ADD COLUMN IF NOT EXISTS source_type VARCHAR(32) DEFAULT 'UNKNOWN',
    ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS content_version INT NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS license_note TEXT,
    ADD COLUMN IF NOT EXISTS review_status VARCHAR(16) DEFAULT 'DRAFT',
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS original_parent_id VARCHAR(64) REFERENCES grammar_topics(id) ON DELETE SET NULL;

UPDATE grammar_topics
SET source_type = 'UNKNOWN',
    review_status = CASE WHEN status = 'PUBLISHED' THEN 'APPROVED' ELSE 'DRAFT' END
WHERE source_type IS NULL OR review_status IS NULL;

ALTER TABLE grammar_topics
    ALTER COLUMN source_type SET NOT NULL,
    ALTER COLUMN review_status SET NOT NULL,
    ADD CONSTRAINT ck_grammar_source_type CHECK (source_type IN ('ORIGINAL', 'AI_ASSISTED', 'LICENSED', 'IMPORTED', 'UNKNOWN')),
    ADD CONSTRAINT ck_grammar_review_status CHECK (review_status IN ('DRAFT', 'IN_REVIEW', 'APPROVED', 'REJECTED'));

ALTER TABLE grammar_topics DROP CONSTRAINT IF EXISTS ck_grammar_topics_status;
ALTER TABLE grammar_topics ADD CONSTRAINT ck_grammar_topics_status CHECK (status IN ('DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED'));
