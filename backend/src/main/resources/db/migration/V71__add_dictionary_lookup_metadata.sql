ALTER TABLE vocabulary_items
    ADD COLUMN term_type VARCHAR(32),
    ADD COLUMN dictionary_source_url TEXT;

ALTER TABLE vocabulary_item_senses
    ADD COLUMN definition_en TEXT;
