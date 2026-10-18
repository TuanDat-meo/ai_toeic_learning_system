package com.toeic.ai.toeic_api.billing;

import java.util.List;

public record StudentBillingOverview(
        StudentSubscription currentSubscription,
        List<StudentSubscription> upcomingSubscriptions,
        List<StudentPaymentTransaction> transactions) { }
