ALTER TABLE listening_dictation_cards
    ADD COLUMN IF NOT EXISTS publication_status VARCHAR(16) NOT NULL DEFAULT 'PUBLISHED';

UPDATE listening_dictation_cards
SET publication_status = 'PUBLISHED'
WHERE publication_status IS NULL OR publication_status NOT IN ('DRAFT', 'PUBLISHED');

ALTER TABLE listening_dictation_cards
    DROP CONSTRAINT IF EXISTS ck_listening_dictation_card_pub_status;

ALTER TABLE listening_dictation_cards
    ADD CONSTRAINT ck_listening_dictation_card_pub_status
        CHECK (publication_status IN ('DRAFT', 'PUBLISHED'));

UPDATE listening_part_units
SET status = CASE
    WHEN upper(status) = 'DRAFT' OR status = 'Bản nháp' THEN 'DRAFT'
    ELSE 'PUBLISHED'
END;

ALTER TABLE listening_part_units
    DROP CONSTRAINT IF EXISTS ck_listening_part_units_status;

ALTER TABLE listening_part_units
    ADD CONSTRAINT ck_listening_part_units_status
        CHECK (status IN ('DRAFT', 'PUBLISHED'));

