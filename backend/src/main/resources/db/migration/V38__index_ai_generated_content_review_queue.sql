CREATE INDEX idx_ai_generated_content_pending_review
    ON ai_generated_content (created_at DESC)
    WHERE validation_status = 'PENDING';
