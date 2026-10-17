package com.toeic.ai.toeic_api.billing;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PaymentTransactionService {
    private static final Set<String> PAYMENT_METHODS = Set.of("MOMO", "VNPAY", "BANK_TRANSFER", "CREDIT_CARD");
    private static final Set<String> STATUSES = Set.of("SUCCESS", "PENDING", "FAILED", "REFUNDED");
    private static final String SELECT_COLUMNS = """
            SELECT id, transaction_code, order_code, user_id, user_name, user_email,
                   plan_id, plan_name, amount, payment_method, status, paid_at, note, created_at
            FROM payment_transactions
            """;

    private final JdbcTemplate jdbc;
    private final SubscriptionService subscriptions;
    private final VietQrPaymentService vietQr;

    public PaymentTransactionService(
            JdbcTemplate jdbc,
            SubscriptionService subscriptions,
            VietQrPaymentService vietQr) {
        this.jdbc = jdbc;
        this.subscriptions = subscriptions;
        this.vietQr = vietQr;
    }

    public List<PaymentTransaction> listTransactions() {
        return jdbc.query(SELECT_COLUMNS + " ORDER BY created_at DESC, id DESC", this::mapTransaction);
    }

    public List<StudentPaymentTransaction> listTransactionsForUser(UUID userId) {
        return jdbc.query("""
                SELECT id, plan_id, transaction_code, order_code, plan_name, amount, payment_method,
                       status, paid_at, created_at
                FROM payment_transactions
                WHERE user_id = ?
                ORDER BY created_at DESC, id DESC
                """, (rs, row) -> {
            Timestamp paidAt = rs.getTimestamp("paid_at");
            return new StudentPaymentTransaction(
                    rs.getObject("id", UUID.class),
                    rs.getObject("plan_id", UUID.class),
                    rs.getString("transaction_code"),
                    rs.getString("order_code"),
                    rs.getString("plan_name"),
                    rs.getLong("amount"),
                    rs.getString("payment_method"),
                    rs.getString("status"),
                    paidAt == null ? null : paidAt.toInstant(),
                    rs.getTimestamp("created_at").toInstant());
        }, userId);
    }

    @Transactional
    public PaymentTransaction create(PaymentTransactionRequest request) {
        validate(request);
        try {
            int inserted = jdbc.update("""
                    INSERT INTO payment_transactions (
                        transaction_code, order_code, user_id, plan_id, user_name, user_email,
                        plan_name, amount, payment_method, status, paid_at, note
                    )
                    SELECT ?, ?, u.id, p.id, u.full_name, u.email, p.name, ?, ?, ?, ?, ?
                    FROM users u CROSS JOIN subscription_plans p
                    WHERE u.id = ? AND p.id = ?
                    """,
                    request.transactionCode().trim(), request.orderCode().trim(), request.amount(),
                    request.paymentMethod(), request.status(), timestamp(request.paidAt()), blankToNull(request.note()),
                    request.userId(), request.planId());
            if (inserted == 0) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy học viên hoặc gói học.");
            }
            PaymentTransaction transaction = findByCode(request.transactionCode().trim());
            if ("SUCCESS".equals(transaction.status())) {
                subscriptions.activatePaidSubscription(transaction.id());
            }
            return transaction;
        } catch (DuplicateKeyException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Mã giao dịch hoặc mã đơn hàng đã tồn tại.");
        }
    }

    @Transactional
    public PaymentTransaction createStudentOrder(UUID userId, UUID planId) {
        long price = jdbc.query("""
                SELECT promotional_price
                FROM subscription_plans
                WHERE id = ? AND status = 'ACTIVE'
                  AND (plan_category <> 'PROMOTION'
                       OR (offer_starts_at <= now() AND offer_ends_at > now()))
                """, (rs, row) -> rs.getLong("promotional_price"), planId)
                .stream().findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Gói học không tồn tại hoặc đã ngừng phát hành."));
        if (price <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Gói miễn phí không cần thanh toán. Vui lòng chọn gói Free đang hoạt động.");
        }

        String transactionCode = "VQR-" + UUID.randomUUID().toString().replace("-", "").toUpperCase();
        String orderCode = "TOEIC-" + UUID.randomUUID().toString().replace("-", "").toUpperCase();
        int inserted = jdbc.update("""
                INSERT INTO payment_transactions (
                    transaction_code, order_code, user_id, plan_id, user_name, user_email,
                    plan_name, amount, payment_method, status, note
                )
                SELECT ?, ?, u.id, p.id, u.full_name, u.email, p.name, p.promotional_price,
                       'BANK_TRANSFER', 'PENDING', 'Thanh toán VietQR qua SePay'
                FROM users u CROSS JOIN subscription_plans p
                WHERE u.id = ? AND u.role = 'STUDENT'
                  AND p.id = ? AND p.status = 'ACTIVE' AND p.promotional_price > 0
                  AND (p.plan_category <> 'PROMOTION'
                       OR (p.offer_starts_at <= now() AND p.offer_ends_at > now()))
                """, transactionCode, orderCode, userId, planId);
        if (inserted == 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Gói học vừa thay đổi hoặc tài khoản không thể tạo đơn thanh toán. Vui lòng tải lại trang.");
        }
        return findByCode(transactionCode);
    }

    @Transactional
    public StudentCheckoutResponse createStudentCheckoutOrder(UUID userId, UUID planId) {
        vietQr.requireConfigured();
        return vietQr.createQr(createStudentOrder(userId, planId));
    }

    @Transactional
    public StudentCheckoutResponse refreshStudentCheckoutQr(UUID transactionId, UUID userId) {
        vietQr.requireConfigured();
        return vietQr.createQr(findPendingStudentOrder(transactionId, userId));
    }

    public PaymentTransaction findPendingStudentOrder(UUID transactionId, UUID userId) {
        List<PaymentTransaction> matches = jdbc.query(
                SELECT_COLUMNS + " WHERE id = ? AND user_id = ? AND status = 'PENDING'",
                this::mapTransaction, transactionId, userId);
        if (matches.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Đơn thanh toán không tồn tại, không thuộc tài khoản của bạn hoặc đã được xử lý.");
        }
        return matches.getFirst();
    }

    @Transactional
    public PaymentTransaction confirm(UUID id) {
        return confirm(id, Instant.now());
    }

    @Transactional
    public PaymentTransaction confirm(UUID id, Instant paidAt) {
        int updated = jdbc.update("""
                UPDATE payment_transactions
                SET status = 'SUCCESS', paid_at = ?, updated_at = now()
                WHERE id = ? AND status = 'PENDING'
                """, timestamp(paidAt), id);
        if (updated == 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Giao dịch không tồn tại hoặc không còn ở trạng thái chờ thanh toán.");
        }
        subscriptions.activatePaidSubscription(id);
        return findById(id);
    }

    @Transactional
    public boolean confirmSePayPayment(String description, long transferAmount) {
        List<SePayPaymentMatch> matches = jdbc.query("""
                SELECT t.id, t.amount, t.status
                FROM payment_qr_sessions q
                JOIN payment_transactions t ON t.id = q.transaction_id
                WHERE POSITION(LOWER(q.qr_reference) IN LOWER(?)) > 0
                ORDER BY q.created_at DESC
                LIMIT 1
                FOR UPDATE OF t
                """, (rs, row) -> new SePayPaymentMatch(
                rs.getObject("id", UUID.class), rs.getLong("amount"), rs.getString("status")), description);
        if (matches.isEmpty()) return false;

        SePayPaymentMatch match = matches.getFirst();
        if (match.amount() != transferAmount) return false;
        if ("SUCCESS".equals(match.status())) return true;
        if (!"PENDING".equals(match.status())) return false;

        int updated = jdbc.update("""
                UPDATE payment_transactions
                SET status = 'SUCCESS', paid_at = now(), updated_at = now()
                WHERE id = ? AND status = 'PENDING' AND amount = ?
                """, match.id(), transferAmount);
        if (updated == 0) return false;
        subscriptions.activatePaidSubscription(match.id());
        return true;
    }

    @Transactional
    public PaymentTransaction refund(UUID id) {
        int updated = jdbc.update("""
                UPDATE payment_transactions
                SET status = 'REFUNDED',
                    note = CONCAT_WS(E'\\n', NULLIF(note, ''), 'Đã ghi nhận hoàn tiền bởi Admin'),
                    updated_at = now()
                WHERE id = ? AND status = 'SUCCESS'
                """, id);
        if (updated == 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Giao dịch không tồn tại hoặc chưa ở trạng thái thành công.");
        }
        subscriptions.revokePaidSubscription(id);
        return findById(id);
    }

    private PaymentTransaction findById(UUID id) {
        return jdbc.queryForObject(SELECT_COLUMNS + " WHERE id = ?", this::mapTransaction, id);
    }

    private PaymentTransaction findByCode(String transactionCode) {
        return jdbc.queryForObject(SELECT_COLUMNS + " WHERE transaction_code = ?", this::mapTransaction, transactionCode);
    }

    private PaymentTransaction mapTransaction(ResultSet rs, int rowNum) throws SQLException {
        Timestamp paidAt = rs.getTimestamp("paid_at");
        return new PaymentTransaction(
                rs.getObject("id", UUID.class),
                rs.getString("transaction_code"),
                rs.getString("order_code"),
                rs.getObject("user_id", UUID.class).toString(),
                rs.getString("user_name"),
                rs.getString("user_email"),
                rs.getObject("plan_id", UUID.class).toString(),
                rs.getString("plan_name"),
                rs.getLong("amount"),
                rs.getString("payment_method"),
                rs.getString("status"),
                paidAt == null ? null : paidAt.toInstant(),
                rs.getString("note"),
                rs.getTimestamp("created_at").toInstant());
    }

    private static Timestamp timestamp(Instant instant) {
        return instant == null ? null : Timestamp.from(instant);
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static void validate(PaymentTransactionRequest request) {
        if (!PAYMENT_METHODS.contains(request.paymentMethod())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phương thức thanh toán không hợp lệ.");
        }
        if (!STATUSES.contains(request.status())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trạng thái giao dịch không hợp lệ.");
        }
        if ("REFUNDED".equals(request.status())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Giao dịch chỉ có thể chuyển sang hoàn tiền sau khi được ghi nhận thành công.");
        }
        if ("SUCCESS".equals(request.status()) && request.paidAt() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Giao dịch thành công phải có thời điểm thanh toán thực tế.");
        }
    }

    private record SePayPaymentMatch(UUID id, long amount, String status) { }
}
