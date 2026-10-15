ALTER TABLE content_sources
    DROP CONSTRAINT ck_content_sources_type,
    ADD CONSTRAINT ck_content_sources_type
        CHECK (type IN ('EXCEL', 'WORD', 'PDF', 'CSV', 'JSON', 'MANUAL', 'AI', 'SYSTEM'));

ALTER TABLE import_batches
    ADD COLUMN content_type VARCHAR(30),
    ADD COLUMN uploaded_by UUID REFERENCES users (id) ON DELETE SET NULL,
    ADD COLUMN file_size_bytes BIGINT;

ALTER TABLE import_items
    ADD COLUMN row_number INT,
    ADD COLUMN normalized_data JSONB,
    ADD COLUMN validation_errors JSONB,
    ADD COLUMN dedupe_key VARCHAR(1000),
    ADD COLUMN title VARCHAR(500),
    ADD COLUMN duplicate_of_content_id UUID;

ALTER TABLE import_batches
    ADD CONSTRAINT ck_import_batches_content_type
        CHECK (content_type IS NULL OR content_type IN ('VOCABULARY', 'GRAMMAR', 'LISTENING', 'READING', 'QUESTION', 'MOCK_TEST'));

ALTER TABLE import_items
    DROP CONSTRAINT ck_import_items_status,
    ADD CONSTRAINT ck_import_items_status
        CHECK (status IN ('SUCCESS', 'FAILED', 'DUPLICATE', 'MERGED', 'VALID', 'INVALID', 'PUBLISHED'));

CREATE TABLE imported_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type VARCHAR(30) NOT NULL,
    dedupe_key VARCHAR(1000) NOT NULL,
    title VARCHAR(500) NOT NULL,
    payload_json JSONB NOT NULL,
    source_import_item_id UUID NOT NULL UNIQUE,
    created_by UUID REFERENCES users (id) ON DELETE SET NULL,
    published_at TIMESTAMP NOT NULL DEFAULT now(),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT fk_imported_content_item
        FOREIGN KEY (source_import_item_id) REFERENCES import_items (id) ON DELETE RESTRICT,
    CONSTRAINT ck_imported_content_type
        CHECK (content_type IN ('VOCABULARY', 'GRAMMAR', 'LISTENING', 'READING', 'QUESTION', 'MOCK_TEST'))
);

ALTER TABLE import_items
    ADD CONSTRAINT fk_import_item_duplicate_content
        FOREIGN KEY (duplicate_of_content_id) REFERENCES imported_content (id) ON DELETE SET NULL;

CREATE UNIQUE INDEX uq_imported_content_type_dedupe
    ON imported_content (content_type, dedupe_key);

CREATE INDEX idx_import_batches_created_at
    ON import_batches (created_at DESC);

CREATE INDEX idx_import_items_batch_row
    ON import_items (import_batch_id, row_number);

CREATE INDEX idx_imported_content_type_published
    ON imported_content (content_type, published_at DESC);
