CREATE TABLE support_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_code VARCHAR(20) NOT NULL UNIQUE,
    reporter_id UUID NOT NULL,
    category VARCHAR(30) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    source VARCHAR(40) NOT NULL,
    question_ref VARCHAR(120),
    question_snapshot JSONB,
    related_content VARCHAR(500),
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    admin_reply TEXT,
    correction JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    replied_at TIMESTAMP,
    CONSTRAINT fk_support_reports_reporter
        FOREIGN KEY (reporter_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT ck_support_reports_category
        CHECK (category IN ('QUESTION_ERROR', 'SYSTEM_BUG', 'UI_FEEDBACK', 'ACCOUNT_ISSUE', 'OTHER')),
    CONSTRAINT ck_support_reports_priority
        CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    CONSTRAINT ck_support_reports_status
        CHECK (status IN ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED')),
    CONSTRAINT ck_support_reports_source
        CHECK (source IN ('READING', 'LISTENING', 'MOCK_TEST', 'QUESTION_BANK', 'OTHER'))
);

CREATE INDEX idx_support_reports_status_created
    ON support_reports (status, created_at DESC);
CREATE INDEX idx_support_reports_reporter_created
    ON support_reports (reporter_id, created_at DESC);
CREATE INDEX idx_support_reports_question_ref
    ON support_reports (question_ref) WHERE question_ref IS NOT NULL;

CREATE TABLE question_corrections (
    question_ref VARCHAR(120) PRIMARY KEY,
    corrected_content JSONB NOT NULL,
    corrected_by UUID NOT NULL,
    report_id UUID NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT fk_question_corrections_user
        FOREIGN KEY (corrected_by) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_question_corrections_report
        FOREIGN KEY (report_id) REFERENCES support_reports (id) ON DELETE RESTRICT
);
