package com.toeic.ai.toeic_api.billing;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PaymentTransactionService {
    private static final Logger log = LoggerFactory.getLogger(PaymentTransactionService.class);
    private static final Duration PAYMENT_LIFETIME = Duration.ofMinutes(30);
    private static final Set<String> PAYMENT_METHODS = Set.of("MOMO", "VNPAY", "BANK_TRANSFER", "CREDIT_CARD");
    private static final Set<String> STATUSES = Set.of(
            "SUCCESS", "PENDING", "FAILED", "REFUNDED", "EXPIRED", "REVIEW_REQUIRED");
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
        expireUnpaidStudentOrders();
        return jdbc.query(SELECT_COLUMNS + " ORDER BY created_at DESC, id DESC", this::mapTransaction);
    }

    public List<StudentPaymentTransaction> listTransactionsForUser(UUID userId) {
        expireUnpaidStudentOrders();
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
        List<UUID> students = jdbc.query(
                "SELECT id FROM users WHERE id=? AND role='STUDENT' FOR UPDATE",
                (rs, row) -> rs.getObject("id", UUID.class), userId);
        if (students.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy học viên.");
        }
        boolean hasLifetimeSubscription = Boolean.TRUE.equals(jdbc.queryForObject("""
                SELECT EXISTS (
                    SELECT 1
                    FROM user_subscriptions s
                    JOIN subscription_plans p ON p.id = s.plan_id
                    WHERE s.user_id = ? AND s.status IN ('ACTIVE', 'SCHEDULED')
                      AND p.plan_category <> 'FREE' AND p.billing_cycle = 'LIFETIME'
                )
                """, Boolean.class, userId));
        if (hasLifetimeSubscription) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Bạn đang có gói trọn đời nên không thể đăng ký thêm gói trả phí.");
        }

        long price = jdbc.query("""
                SELECT promotional_price
                FROM subscription_plans
                WHERE id = ? AND status = 'ACTIVE'
                  AND plan_category <> 'FREE'
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
                  AND p.id = ? AND p.status = 'ACTIVE' AND p.plan_category <> 'FREE'
                  AND p.promotional_price > 0
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
                SET status = 'SUCCESS', paid_at = COALESCE(paid_at, ?), updated_at = now()
                WHERE id = ? AND status IN ('PENDING', 'REVIEW_REQUIRED')
                """, timestamp(paidAt), id);
        if (updated == 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Giao dịch không tồn tại hoặc không thể xác nhận ở trạng thái hiện tại.");
        }
        subscriptions.activatePaidSubscription(id);
        return findById(id);
    }

    @Transactional
    public boolean confirmSePayPayment(String description, long transferAmount, Instant transferAt) {
        List<SePayPaymentMatch> matches = jdbc.query("""
                SELECT t.id, t.amount, t.status, t.created_at
                FROM payment_qr_sessions q
                JOIN payment_transactions t ON t.id = q.transaction_id
                WHERE UPPER(?) ~ ('(^|[^A-Z0-9])' || UPPER(q.qr_reference) || '([^A-Z0-9]|$)')
                FOR UPDATE OF t
                """, (rs, row) -> new SePayPaymentMatch(
                rs.getObject("id", UUID.class), rs.getLong("amount"), rs.getString("status"),
                rs.getTimestamp("created_at").toInstant()), description);
        if (matches.size() != 1) return false;

        SePayPaymentMatch match = matches.getFirst();
        if ("SUCCESS".equals(match.status())) return true;
        if (match.amount() != transferAmount) {
            if (!Set.of("PENDING", "EXPIRED", "REVIEW_REQUIRED").contains(match.status())) return false;
            if ("REVIEW_REQUIRED".equals(match.status())) return true;
            int updated = jdbc.update("""
                    UPDATE payment_transactions
                    SET status = 'REVIEW_REQUIRED',
                        paid_at = COALESCE(?, paid_at),
                        note = CONCAT_WS(E'\\n', NULLIF(note, ''), 'Đã nhận giao dịch khớp mã nhưng số tiền không khớp hóa đơn; cần admin kiểm tra.'),
                        updated_at = now()
                    WHERE id = ? AND status IN ('PENDING', 'EXPIRED')
                    """, timestamp(transferAt), match.id());
            return updated > 0;
        }
        if ("REVIEW_REQUIRED".equals(match.status())
                && !isVerifiedOnTime(match, transferAt, Instant.now())) return true;
        if (!Set.of("PENDING", "EXPIRED", "REVIEW_REQUIRED").contains(match.status())) return false;

        Instant receivedAt = Instant.now();
        if (isVerifiedOnTime(match, transferAt, receivedAt)) {
            int updated = jdbc.update("""
                UPDATE payment_transactions
                SET status = 'SUCCESS', paid_at = ?, updated_at = now()
                WHERE id = ? AND status IN ('PENDING', 'EXPIRED', 'REVIEW_REQUIRED') AND amount = ?
                """, timestamp(transferAt == null ? receivedAt : transferAt), match.id(), transferAmount);
            if (updated == 0) return false;
            subscriptions.activatePaidSubscription(match.id());
            return true;
        }

        if ("REVIEW_REQUIRED".equals(match.status())) return true;
        int updated = jdbc.update("""
                UPDATE payment_transactions
                SET status = 'REVIEW_REQUIRED',
                    paid_at = COALESCE(?, paid_at),
                    note = CONCAT_WS(E'\\n', NULLIF(note, ''), ?),
                    updated_at = now()
                WHERE id = ? AND status IN ('PENDING', 'EXPIRED') AND amount = ?
                """,
                timestamp(transferAt),
                transferAt == null
                        ? "Đã nhận giao dịch khớp mã sau hạn nhưng không xác minh được thời điểm chuyển tiền; cần admin kiểm tra."
                        : "Giao dịch khớp mã được chuyển sau hạn thanh toán; cần admin kiểm tra.",
                match.id(), transferAmount);
        if (updated == 0) return false;
        return true;
    }

    @Scheduled(fixedDelayString = "${app.payment.expiration-scan-interval-ms:15000}")
    public void expireUnpaidStudentOrders() {
        int expired = jdbc.update("""
                UPDATE payment_transactions t
                SET status = 'EXPIRED',
                    note = CONCAT_WS(E'\\n', NULLIF(note, ''), 'Hóa đơn hết hạn sau 30 phút, chưa ghi nhận thanh toán.'),
                    updated_at = now()
                WHERE t.status = 'PENDING'
                  AND t.payment_method = 'BANK_TRANSFER'
                  AND t.created_at <= now() - INTERVAL '30 minutes'
                  AND EXISTS (
                      SELECT 1
                      FROM payment_qr_sessions q
                      WHERE q.transaction_id = t.id
                  )
                """);
        if (expired > 0) {
            log.info("Expired {} unpaid VietQR order(s)", expired);
        }
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

    private static boolean isVerifiedOnTime(SePayPaymentMatch match, Instant transferAt, Instant receivedAt) {
        Instant expiresAt = match.createdAt().plus(PAYMENT_LIFETIME);
        if (transferAt == null) return receivedAt.isBefore(expiresAt);
        return !transferAt.isBefore(match.createdAt()) && !transferAt.isAfter(expiresAt);
    }

    record SePayPaymentMatch(UUID id, long amount, String status, Instant createdAt) { }
}
