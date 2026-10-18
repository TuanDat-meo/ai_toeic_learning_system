package com.toeic.ai.toeic_api.billing;

import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.toeic.ai.toeic_api.user.UserAccountService;

@RestController
@RequestMapping("/api/billing/orders")
public class StudentCheckoutController {
    private final PaymentTransactionService transactions;
    private final UserAccountService users;

    public StudentCheckoutController(
            PaymentTransactionService transactions,
            UserAccountService users) {
        this.transactions = transactions;
        this.users = users;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StudentCheckoutResponse create(
            @Valid @RequestBody CreateStudentOrderRequest body,
            Authentication authentication) {
        var student = users.findManagedUser(authentication.getName());
        return transactions.createStudentCheckoutOrder(student.id(), body.planId());
    }

    @PostMapping("/{id}/qr")
    public StudentCheckoutResponse refreshQr(@PathVariable UUID id, Authentication authentication) {
        var student = users.findManagedUser(authentication.getName());
        return transactions.refreshStudentCheckoutQr(id, student.id());
    }

    public record CreateStudentOrderRequest(@NotNull UUID planId) { }
}
