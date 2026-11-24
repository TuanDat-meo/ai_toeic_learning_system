DROP TABLE IF EXISTS grammar_content_import_batch;
DROP TABLE IF EXISTS grammar_exam_session;
DROP TABLE IF EXISTS grammar_ai_feedback;
DROP TABLE IF EXISTS grammar_ai_explanation;
DROP TABLE IF EXISTS grammar_question_origin;

ALTER TABLE grammar_topic_questions
    DROP CONSTRAINT IF EXISTS ck_grammar_question_review_status,
    DROP CONSTRAINT IF EXISTS ck_grammar_question_source_type,
    DROP COLUMN IF EXISTS deleted_at,
    DROP COLUMN IF EXISTS review_status,
    DROP COLUMN IF EXISTS license_note,
    DROP COLUMN IF EXISTS content_version,
    DROP COLUMN IF EXISTS reviewer_id,
    DROP COLUMN IF EXISTS author_id,
    DROP COLUMN IF EXISTS source_type;
