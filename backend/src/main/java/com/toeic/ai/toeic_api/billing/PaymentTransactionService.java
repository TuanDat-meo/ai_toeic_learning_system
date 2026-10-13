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

    public PaymentTransactionService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<PaymentTransaction> listTransactions() {
        return jdbc.query(SELECT_COLUMNS + " ORDER BY created_at DESC, id DESC", this::mapTransaction);
    }

    public List<StudentPaymentTransaction> listTransactionsForUser(UUID userId) {
        return jdbc.query("""
                SELECT id, transaction_code, order_code, plan_name, amount, payment_method,
                       status, paid_at, created_at
                FROM payment_transactions
                WHERE user_id = ?
                ORDER BY created_at DESC, id DESC
                """, (rs, row) -> {
            Timestamp paidAt = rs.getTimestamp("paid_at");
            return new StudentPaymentTransaction(
                    rs.getObject("id", UUID.class),
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
            return findByCode(request.transactionCode().trim());
        } catch (DuplicateKeyException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Mã giao dịch hoặc mã đơn hàng đã tồn tại.");
        }
    }

    @Transactional
    public PaymentTransaction confirm(UUID id) {
        int updated = jdbc.update("""
                UPDATE payment_transactions
                SET status = 'SUCCESS', updated_at = now()
                WHERE id = ? AND status = 'PENDING'
                """, id);
        if (updated == 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Giao dịch không tồn tại hoặc không còn ở trạng thái chờ thanh toán.");
        }
        return findById(id);
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
}
