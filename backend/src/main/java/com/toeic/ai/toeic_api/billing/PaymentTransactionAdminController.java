package com.toeic.ai.toeic_api.billing;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import com.toeic.ai.toeic_api.audit.AuditLogService;
import com.toeic.ai.toeic_api.user.UserAccountService;

@RestController
@RequestMapping("/api/admin/billing/transactions")
public class PaymentTransactionAdminController {
    private final PaymentTransactionService service;
    private final AuditLogService audit;
    private final UserAccountService users;

    public PaymentTransactionAdminController(
            PaymentTransactionService service,
            AuditLogService audit,
            UserAccountService users) {
        this.service = service;
        this.audit = audit;
        this.users = users;
    }

    @GetMapping
    public List<PaymentTransaction> list() {
        return service.listTransactions();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentTransaction create(
            @Valid @RequestBody PaymentTransactionRequest body,
            Authentication authentication,
            HttpServletRequest request) {
        PaymentTransaction transaction = service.create(body);
        record(authentication, request, "RECORD_PAYMENT_TRANSACTION", transaction,
                "Ghi nhận giao dịch " + transaction.transactionCode());
        return transaction;
    }

    @PatchMapping("/{id}/confirm")
    public PaymentTransaction confirm(
            @PathVariable UUID id,
            Authentication authentication,
            HttpServletRequest request) {
        PaymentTransaction transaction = service.confirm(id);
        record(authentication, request, "CONFIRM_PAYMENT_TRANSACTION", transaction,
                "Xác nhận giao dịch " + transaction.transactionCode());
        return transaction;
    }

    @PatchMapping("/{id}/refund")
    public PaymentTransaction refund(
            @PathVariable UUID id,
            Authentication authentication,
            HttpServletRequest request) {
        PaymentTransaction transaction = service.refund(id);
        record(authentication, request, "RECORD_PAYMENT_REFUND", transaction,
                "Ghi nhận hoàn tiền giao dịch " + transaction.transactionCode());
        return transaction;
    }

    private void record(
            Authentication authentication,
            HttpServletRequest request,
            String action,
            PaymentTransaction transaction,
            String summary) {
        audit.record(
                users.findManagedUser(authentication.getName()).id(),
                action,
                "PAYMENT_TRANSACTION",
                transaction.id(),
                summary,
                request.getRemoteAddr());
    }
}
