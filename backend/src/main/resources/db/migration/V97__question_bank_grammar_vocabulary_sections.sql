ALTER TABLE toeic_question_bank
    DROP CONSTRAINT IF EXISTS ck_toeic_question_bank_part;

ALTER TABLE toeic_question_bank
    ADD CONSTRAINT ck_toeic_question_bank_part
    CHECK (part IN ('PART_1', 'PART_2', 'PART_3', 'PART_4', 'PART_5', 'PART_6', 'PART_7', 'GRAMMAR', 'VOCABULARY'));
