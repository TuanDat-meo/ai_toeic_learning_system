package com.toeic.ai.toeic_api.billing;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/learning-plans")
public class LearningPlanPublicController {
    private final SubscriptionService service;

    public LearningPlanPublicController(SubscriptionService service) {
        this.service = service;
    }

    @GetMapping
    public List<SubscriptionPlan> listAvailablePlans() {
        return service.listAvailablePlans();
    }
}
