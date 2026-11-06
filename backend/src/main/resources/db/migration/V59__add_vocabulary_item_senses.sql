CREATE TABLE vocabulary_item_senses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vocabulary_item_id VARCHAR(64) NOT NULL REFERENCES vocabulary_items(id) ON DELETE CASCADE,
    part_of_speech VARCHAR(64) NOT NULL,
    sub_category VARCHAR(128),
    meaning TEXT NOT NULL,
    example TEXT,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_vocabulary_item_senses_item_order
    ON vocabulary_item_senses (vocabulary_item_id, order_index);

INSERT INTO vocabulary_item_senses (
    vocabulary_item_id, part_of_speech, meaning, example, order_index
)
SELECT id, COALESCE(NULLIF(trim(part_of_speech), ''), 'Noun'), meaning, example, 0
FROM vocabulary_items
WHERE meaning IS NOT NULL AND trim(meaning) <> '';

ALTER TABLE vocabulary_items
    ADD COLUMN IF NOT EXISTS word_family TEXT NOT NULL DEFAULT '';
