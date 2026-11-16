ALTER TABLE toeic_question_bank
    ADD COLUMN option_translations JSONB NOT NULL DEFAULT '{}'::jsonb;
