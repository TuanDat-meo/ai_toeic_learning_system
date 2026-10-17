ALTER TABLE learning_feature_catalog
    ADD COLUMN parent_feature_key VARCHAR(80)
        REFERENCES learning_feature_catalog(feature_key) ON DELETE RESTRICT;

UPDATE learning_feature_catalog
SET lifecycle_status = 'AVAILABLE',
    control_type = CASE WHEN feature_key = 'LISTENING' THEN 'METERED' ELSE 'TOGGLE' END,
    allowed_units = CASE WHEN feature_key = 'LISTENING' THEN '["sessions"]'::jsonb ELSE '[]'::jsonb END,
    allowed_periods = CASE WHEN feature_key = 'LISTENING'
        THEN '["DAY","WEEK","MONTH","PLAN_TERM"]'::jsonb ELSE '[]'::jsonb END,
    category = CASE feature_key
        WHEN 'VOCABULARY' THEN 'Từ vựng'
        WHEN 'GRAMMAR' THEN 'Ngữ pháp'
        WHEN 'LISTENING' THEN 'Listening'
        WHEN 'READING' THEN 'Reading'
        WHEN 'MOCK_TEST' THEN 'Thi thử'
        ELSE category
    END,
    description = CASE feature_key
        WHEN 'VOCABULARY' THEN 'Truy cập các bộ từ, flashcard và mini-game.'
        WHEN 'GRAMMAR' THEN 'Xem chuyên đề và bắt đầu làm bài tập ngữ pháp.'
        WHEN 'LISTENING' THEN 'Quota chung cho Dictation và luyện Listening Part 1–4.'
        WHEN 'READING' THEN 'Quyền truy cập khu vực luyện Reading.'
        WHEN 'MOCK_TEST' THEN 'Làm bài thi thử TOEIC.'
        WHEN 'AI_ASSISTANT' THEN 'Tính năng AI chưa có API nghiệp vụ thực tế.'
        ELSE description
    END
WHERE feature_key IN ('VOCABULARY','GRAMMAR','LISTENING','READING','MOCK_TEST','AI_ASSISTANT');

INSERT INTO learning_feature_catalog (
    feature_key, name, category, description, lifecycle_status, control_type,
    allowed_units, allowed_periods, config_fields, parent_feature_key
) VALUES
    ('LISTENING_DICTATION', 'Dictation', 'Listening',
     'Chép chính tả; lượt này dùng chung quota Listening.', 'AVAILABLE', 'TOGGLE',
     '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 'LISTENING'),
    ('LISTENING_PART_PRACTICE', 'Luyện Part 1–4', 'Listening',
     'Luyện nghe theo Part; lượt này dùng chung quota Listening.', 'AVAILABLE', 'TOGGLE',
     '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 'LISTENING'),
    ('READING_PRACTICE', 'Luyện Reading', 'Reading',
     'Bắt đầu một lượt luyện các bài Reading.', 'AVAILABLE', 'METERED',
     '["sessions"]'::jsonb, '["DAY","WEEK","MONTH","PLAN_TERM"]'::jsonb, '[]'::jsonb, 'READING'),
    ('READING_AI_ASK', 'Hỏi AI về Reading', 'Reading',
     'Quota riêng cho mỗi lần gửi câu hỏi đến Trợ lý AI Reading; tích hợp AI chưa sẵn sàng.',
     'PLANNED', 'METERED', '["requests"]'::jsonb,
     '["DAY","WEEK","MONTH","PLAN_TERM"]'::jsonb, '[]'::jsonb, 'READING'),
    ('COMMUNITY', 'Cộng đồng', 'Cộng đồng',
     'Đọc, đăng bài và bình luận trong cộng đồng học viên.', 'AVAILABLE', 'TOGGLE',
     '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, NULL)
ON CONFLICT (feature_key) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    lifecycle_status = EXCLUDED.lifecycle_status,
    control_type = EXCLUDED.control_type,
    allowed_units = EXCLUDED.allowed_units,
    allowed_periods = EXCLUDED.allowed_periods,
    config_fields = EXCLUDED.config_fields,
    parent_feature_key = EXCLUDED.parent_feature_key,
    updated_at = now();

UPDATE learning_feature_catalog
SET lifecycle_status = 'PLANNED',
    updated_at = now()
WHERE feature_key = 'AI_ASSISTANT';

CREATE INDEX ix_learning_feature_catalog_parent
    ON learning_feature_catalog(parent_feature_key, category, name);
