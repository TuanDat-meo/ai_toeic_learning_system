ALTER TABLE support_reports DROP CONSTRAINT IF EXISTS ck_support_reports_source;
ALTER TABLE support_reports
    ADD CONSTRAINT ck_support_reports_source
    CHECK (source IN ('READING', 'LISTENING', 'MOCK_TEST', 'QUESTION_BANK', 'GRAMMAR', 'OTHER'));
