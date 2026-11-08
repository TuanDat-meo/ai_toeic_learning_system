ALTER TABLE vocabulary_item_senses
    ADD COLUMN example_meaning TEXT;

UPDATE vocabulary_item_senses s
SET example_meaning = w.example_meaning
FROM vocabulary_items w
WHERE s.vocabulary_item_id = w.id
  AND s.order_index = (
      SELECT MIN(first_sense.order_index)
      FROM vocabulary_item_senses first_sense
      WHERE first_sense.vocabulary_item_id = w.id
  )
  AND NULLIF(TRIM(w.example_meaning), '') IS NOT NULL;
