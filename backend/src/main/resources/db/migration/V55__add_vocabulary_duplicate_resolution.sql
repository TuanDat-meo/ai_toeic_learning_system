ALTER TABLE import_items
    ADD COLUMN duplicate_resolution VARCHAR(20);

ALTER TABLE import_items
    ADD CONSTRAINT ck_import_items_duplicate_resolution
        CHECK (duplicate_resolution IS NULL OR duplicate_resolution IN ('ADD_MEANING', 'CREATE_NEW'));

CREATE INDEX idx_imported_content_vocabulary_word
    ON imported_content (lower(payload_json ->> 'word'))
    WHERE content_type = 'VOCABULARY';
