ALTER TABLE vocabulary_item_senses
    ADD COLUMN synonyms TEXT NOT NULL DEFAULT '',
    ADD COLUMN antonyms TEXT NOT NULL DEFAULT '';
