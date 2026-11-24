ALTER TABLE grammar_topics
    DROP CONSTRAINT IF EXISTS ck_grammar_topics_status,
    DROP CONSTRAINT IF EXISTS ck_grammar_review_status,
    DROP CONSTRAINT IF EXISTS ck_grammar_source_type,
    DROP COLUMN IF EXISTS deleted_at,
    DROP COLUMN IF EXISTS original_parent_id,
    DROP COLUMN IF EXISTS review_status,
    DROP COLUMN IF EXISTS license_note,
    DROP COLUMN IF EXISTS content_version,
    DROP COLUMN IF EXISTS reviewer_id,
    DROP COLUMN IF EXISTS author_id,
    DROP COLUMN IF EXISTS source_type;

DROP TABLE IF EXISTS grammar_learning_event;
DROP TABLE IF EXISTS grammar_content_revision;
DROP TABLE IF EXISTS grammar_question_report;
DROP TABLE IF EXISTS grammar_bookmark;
DROP TABLE IF EXISTS grammar_review_schedule;
DROP TABLE IF EXISTS grammar_question_passage;
DROP TABLE IF EXISTS grammar_passage;
DROP TABLE IF EXISTS grammar_question_rule;
DROP TABLE IF EXISTS grammar_rule;
DROP TABLE IF EXISTS grammar_audit_log;
DROP TABLE IF EXISTS grammar_attempt;
DROP TABLE IF EXISTS grammar_learning_config;

ALTER TABLE users DROP CONSTRAINT IF EXISTS ck_users_role;
ALTER TABLE users ADD CONSTRAINT ck_users_role CHECK (role IN ('ADMIN', 'STUDENT', 'TEACHER'));
