ALTER TABLE payment_transactions
    DROP CONSTRAINT payment_transactions_status_check;

ALTER TABLE payment_transactions
    ADD CONSTRAINT ck_payment_transactions_status
        CHECK (status IN ('SUCCESS', 'PENDING', 'FAILED', 'REFUNDED', 'EXPIRED', 'REVIEW_REQUIRED'));

UPDATE payment_qr_sessions q
SET expires_at = t.created_at + INTERVAL '30 minutes'
FROM payment_transactions t
WHERE t.id = q.transaction_id;

UPDATE payment_transactions t
SET status = 'EXPIRED',
    note = CONCAT_WS(E'\n', NULLIF(note, ''), 'Hóa đơn hết hạn sau 30 phút, chưa ghi nhận thanh toán.'),
    updated_at = now()
WHERE t.status = 'PENDING'
  AND t.payment_method = 'BANK_TRANSFER'
  AND t.created_at <= now() - INTERVAL '30 minutes'
  AND EXISTS (
      SELECT 1
      FROM payment_qr_sessions q
      WHERE q.transaction_id = t.id
  );
