ALTER TABLE import_batches
    ADD COLUMN release_at TIMESTAMPTZ,
    ADD COLUMN scheduled_by UUID REFERENCES users (id) ON DELETE SET NULL;

ALTER TABLE import_batches
    ADD CONSTRAINT ck_import_batches_vocabulary_release
    CHECK (release_at IS NULL OR content_type = 'VOCABULARY');

CREATE INDEX idx_import_batches_scheduled_release
    ON import_batches (release_at)
    WHERE status = 'SCHEDULED';
