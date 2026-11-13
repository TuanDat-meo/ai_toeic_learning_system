ALTER TABLE reading_exercise_cards
    ADD COLUMN status VARCHAR(16) NOT NULL DEFAULT 'published'
        CHECK (status IN ('draft', 'published'));
