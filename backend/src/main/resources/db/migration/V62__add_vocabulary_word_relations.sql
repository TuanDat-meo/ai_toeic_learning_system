CREATE TABLE vocabulary_item_relations (
    source_word_id VARCHAR(64) NOT NULL REFERENCES vocabulary_items(id) ON DELETE CASCADE,
    related_word_id VARCHAR(64) NOT NULL REFERENCES vocabulary_items(id) ON DELETE CASCADE,
    relation_type VARCHAR(24) NOT NULL CHECK (relation_type IN ('WORD_FAMILY', 'INFLECTION')),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    PRIMARY KEY (source_word_id, related_word_id),
    CHECK (source_word_id <> related_word_id)
);

CREATE INDEX idx_vocabulary_item_relations_related
    ON vocabulary_item_relations (related_word_id);

INSERT INTO vocabulary_item_relations (source_word_id, related_word_id, relation_type)
SELECT DISTINCT source.id, target.id, 'WORD_FAMILY'
FROM vocabulary_items source
CROSS JOIN LATERAL regexp_split_to_table(COALESCE(source.word_family, ''), '[,;|]') AS family_term(value)
JOIN vocabulary_items target
    ON target.set_id = source.set_id
   AND lower(trim(target.word)) = lower(trim(family_term.value))
   AND target.id <> source.id
WHERE trim(family_term.value) <> ''
ON CONFLICT (source_word_id, related_word_id) DO NOTHING;
