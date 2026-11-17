CREATE TABLE vocabulary_seed_state (
    seed_key VARCHAR(64) PRIMARY KEY,
    completed_at TIMESTAMP NOT NULL DEFAULT now()
);

INSERT INTO vocabulary_seed_state (seed_key)
SELECT 'default-vocabulary'
WHERE EXISTS (SELECT 1 FROM vocabulary_test_sets)
ON CONFLICT (seed_key) DO NOTHING;
