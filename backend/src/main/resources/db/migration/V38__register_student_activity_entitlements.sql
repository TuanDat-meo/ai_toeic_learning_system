UPDATE learning_feature_catalog
SET control_type = 'METERED',
    allowed_units = '["sessions"]'::jsonb,
    allowed_periods = '["DAY","WEEK","MONTH","PLAN_TERM"]'::jsonb,
    updated_at = now()
WHERE feature_key IN ('VOCABULARY', 'GRAMMAR', 'MOCK_TEST');

INSERT INTO learning_feature_catalog (
    feature_key, name, category, description, lifecycle_status, control_type,
    allowed_units, allowed_periods, config_fields, parent_feature_key
) VALUES
    ('VOCABULARY_FLASHCARDS', 'Flashcard', 'Từ vựng',
     'Bắt đầu một phiên ôn từ bằng flashcard; dùng chung quota Từ vựng.',
     'AVAILABLE', 'TOGGLE', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 'VOCABULARY'),
    ('VOCABULARY_GAME', 'Mini-game', 'Từ vựng',
     'Bắt đầu một phiên mini-game từ vựng; dùng chung quota Từ vựng.',
     'AVAILABLE', 'TOGGLE', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 'VOCABULARY'),
    ('GRAMMAR_QUIZ', 'Luyện trắc nghiệm', 'Ngữ pháp',
     'Bắt đầu một phiên quiz ngữ pháp; dùng chung quota Ngữ pháp.',
     'AVAILABLE', 'TOGGLE', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 'GRAMMAR'),
    ('MOCK_TEST_EXAM', 'Thi có tính giờ', 'Thi thử',
     'Bắt đầu một lần thi thử; dùng chung quota Thi thử.',
     'AVAILABLE', 'TOGGLE', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 'MOCK_TEST'),
    ('MOCK_TEST_PRACTICE', 'Luyện tập theo phần', 'Thi thử',
     'Bắt đầu một phiên luyện đề theo phần; dùng chung quota Thi thử.',
     'AVAILABLE', 'TOGGLE', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 'MOCK_TEST')
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

DO $$
DECLARE
    parent_key TEXT;
    child_key TEXT;
BEGIN
    FOREACH parent_key IN ARRAY ARRAY['LISTENING', 'VOCABULARY', 'GRAMMAR', 'MOCK_TEST']
    LOOP
        UPDATE subscription_plans
        SET entitlements = jsonb_set(
            entitlements,
            ARRAY[parent_key],
            (COALESCE(entitlements -> parent_key, '{"enabled":false,"limit":null,"config":{}}'::jsonb)
                || jsonb_build_object(
                    'unit', COALESCE(entitlements -> parent_key ->> 'unit', 'sessions'),
                    'period', COALESCE(entitlements -> parent_key ->> 'period', 'DAY'))),
            true
        )
        WHERE entitlements ? parent_key;

        UPDATE user_subscriptions
        SET entitlements_snapshot = jsonb_set(
            entitlements_snapshot,
            ARRAY[parent_key],
            (COALESCE(entitlements_snapshot -> parent_key, '{"enabled":false,"limit":null,"config":{}}'::jsonb)
                || jsonb_build_object(
                    'unit', COALESCE(entitlements_snapshot -> parent_key ->> 'unit', 'sessions'),
                    'period', COALESCE(entitlements_snapshot -> parent_key ->> 'period', 'DAY'))),
            true
        )
        WHERE entitlements_snapshot ? parent_key;
    END LOOP;

    FOR child_key, parent_key IN
        SELECT pairs.child_key, pairs.parent_key
        FROM (VALUES
            ('LISTENING_DICTATION', 'LISTENING'),
            ('LISTENING_PART_PRACTICE', 'LISTENING'),
            ('VOCABULARY_FLASHCARDS', 'VOCABULARY'),
            ('VOCABULARY_GAME', 'VOCABULARY'),
            ('GRAMMAR_QUIZ', 'GRAMMAR'),
            ('READING_PRACTICE', 'READING'),
            ('MOCK_TEST_EXAM', 'MOCK_TEST'),
            ('MOCK_TEST_PRACTICE', 'MOCK_TEST')
        ) AS pairs(child_key, parent_key)
    LOOP
        UPDATE subscription_plans
        SET entitlements = jsonb_set(
            entitlements, ARRAY[child_key],
            COALESCE(entitlements -> child_key, jsonb_build_object(
                'enabled', COALESCE((entitlements -> parent_key ->> 'enabled')::boolean, false),
                'limit', NULL,
                'unit', CASE WHEN child_key = 'READING_PRACTICE' THEN 'sessions' ELSE NULL END,
                'period', CASE WHEN child_key = 'READING_PRACTICE' THEN 'DAY' ELSE NULL END,
                'config', '{}'::jsonb
            )), true)
        WHERE entitlements ? parent_key;

        UPDATE user_subscriptions
        SET entitlements_snapshot = jsonb_set(
            entitlements_snapshot, ARRAY[child_key],
            COALESCE(entitlements_snapshot -> child_key, jsonb_build_object(
                'enabled', COALESCE((entitlements_snapshot -> parent_key ->> 'enabled')::boolean, false),
                'limit', NULL,
                'unit', CASE WHEN child_key = 'READING_PRACTICE' THEN 'sessions' ELSE NULL END,
                'period', CASE WHEN child_key = 'READING_PRACTICE' THEN 'DAY' ELSE NULL END,
                'config', '{}'::jsonb
            )), true)
        WHERE entitlements_snapshot ? parent_key;
    END LOOP;
END;
$$;
