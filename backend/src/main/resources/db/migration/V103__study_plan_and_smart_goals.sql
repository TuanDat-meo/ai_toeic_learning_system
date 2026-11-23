-- V100: Study Plan and Smart Goals Architecture
-- Bảng kế hoạch học tập cá nhân hóa được tự động tính toán từ Onboarding Profile & Lịch sử học

CREATE TABLE study_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    source VARCHAR(32) NOT NULL DEFAULT 'ONBOARDING'
        CHECK (source IN ('ONBOARDING', 'DIAGNOSTIC_TEST', 'MANUAL_ADJUSTED', 'SYSTEM_ADAPTIVE')),
    target_score INT NOT NULL
        CHECK (target_score BETWEEN 10 AND 990),
    baseline_score INT
        CHECK (baseline_score IS NULL OR baseline_score BETWEEN 0 AND 990),
    baseline_source VARCHAR(32) DEFAULT 'SELF_REPORTED'
        CHECK (baseline_source IS NULL OR baseline_source IN ('SELF_REPORTED', 'DIAGNOSTIC_TEST', 'MOCK_TEST', 'SYSTEM_ESTIMATED')),
    exam_date DATE,
    days_remaining INT
        CHECK (days_remaining IS NULL OR days_remaining >= 0),
    daily_study_minutes INT NOT NULL DEFAULT 30
        CHECK (daily_study_minutes > 0 AND daily_study_minutes <= 360),
    weekly_study_days INT NOT NULL DEFAULT 5
        CHECK (weekly_study_days BETWEEN 1 AND 7),
    recommended_new_words_per_day INT NOT NULL DEFAULT 10
        CHECK (recommended_new_words_per_day >= 0 AND recommended_new_words_per_day <= 200),
    recommended_review_per_day INT NOT NULL DEFAULT 20
        CHECK (recommended_review_per_day >= 0 AND recommended_review_per_day <= 500),
    recommended_grammar_per_day INT NOT NULL DEFAULT 5
        CHECK (recommended_grammar_per_day >= 0 AND recommended_grammar_per_day <= 100),
    recommended_listening_minutes INT NOT NULL DEFAULT 15
        CHECK (recommended_listening_minutes >= 0 AND recommended_listening_minutes <= 240),
    recommended_reading_minutes INT NOT NULL DEFAULT 15
        CHECK (recommended_reading_minutes >= 0 AND recommended_reading_minutes <= 240),
    recommended_mock_tests_per_week INT NOT NULL DEFAULT 1
        CHECK (recommended_mock_tests_per_week >= 0 AND recommended_mock_tests_per_week <= 14),
    focus_areas TEXT[] DEFAULT ARRAY[]::TEXT[],
    plan_explanation TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_study_plans_user_active
    ON study_plans (user_id, is_active);

-- Mục tiêu phân bổ theo từng tuần của lộ trình
CREATE TABLE study_plan_weekly_targets (
    id BIGSERIAL PRIMARY KEY,
    plan_id UUID NOT NULL REFERENCES study_plans(id) ON DELETE CASCADE,
    week_number INT NOT NULL CHECK (week_number >= 1),
    focus_skill VARCHAR(32) NOT NULL
        CHECK (focus_skill IN ('VOCABULARY', 'GRAMMAR', 'LISTENING', 'READING', 'MOCK_TEST', 'GENERAL_REVIEW')),
    target_items INT NOT NULL DEFAULT 0 CHECK (target_items >= 0),
    completed_items INT NOT NULL DEFAULT 0 CHECK (completed_items >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_plan_week_skill UNIQUE (plan_id, week_number, focus_skill)
);

CREATE INDEX idx_study_plan_weekly_plan
    ON study_plan_weekly_targets (plan_id, week_number);

-- Lịch sử điều chỉnh kế hoạch học tập
CREATE TABLE study_plan_adjustments (
    id BIGSERIAL PRIMARY KEY,
    plan_id UUID NOT NULL REFERENCES study_plans(id) ON DELETE CASCADE,
    reason VARCHAR(64) NOT NULL
        CHECK (reason IN ('ONBOARDING_INITIAL', 'USER_EDIT', 'MOCK_TEST_UPDATE', 'SCHEDULE_CHANGE', 'SYSTEM_REBALANCE')),
    before_json JSONB,
    after_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_study_plan_adjustments_plan
    ON study_plan_adjustments (plan_id, created_at DESC);
