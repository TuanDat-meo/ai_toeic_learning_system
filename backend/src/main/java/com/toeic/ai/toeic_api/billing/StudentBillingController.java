package com.toeic.ai.toeic_api.billing;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.toeic.ai.toeic_api.user.UserAccountService;

@RestController
@RequestMapping("/api/billing/me")
public class StudentBillingController {
    private final SubscriptionService subscriptions;
    private final PaymentTransactionService transactions;
    private final UserAccountService users;

    public StudentBillingController(
            SubscriptionService subscriptions,
            PaymentTransactionService transactions,
            UserAccountService users) {
        this.subscriptions = subscriptions;
        this.transactions = transactions;
        this.users = users;
    }

    @GetMapping
    public StudentBillingOverview overview(Authentication authentication) {
        var user = users.findManagedUser(authentication.getName());
        return new StudentBillingOverview(
                subscriptions.findCurrentSubscription(user.id()),
                subscriptions.listUpcomingSubscriptions(user.id()),
                transactions.listTransactionsForUser(user.id()));
    }
}
