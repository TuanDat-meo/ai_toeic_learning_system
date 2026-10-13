package com.toeic.ai.toeic_api.billing;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
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
@RequestMapping("/api/admin/billing")
public class SubscriptionAdminController {
    private final SubscriptionService service;
    private final AuditLogService audit;
    private final UserAccountService users;
    public SubscriptionAdminController(SubscriptionService service, AuditLogService audit, UserAccountService users) { this.service=service; this.audit=audit; this.users=users; }

    @GetMapping("/plans") List<SubscriptionPlan> plans() { return service.listPlans(); }
    @PostMapping("/plans") @ResponseStatus(HttpStatus.CREATED) SubscriptionPlan create(@Valid @RequestBody PlanRequest body, Authentication auth, jakarta.servlet.http.HttpServletRequest req) {
        SubscriptionPlan result=service.create(body); record(auth,req,"CREATE","SUBSCRIPTION_PLAN",result.id(),"Tạo gói " + result.code()); return result;
    }
    @PatchMapping("/plans/{id}") SubscriptionPlan update(@PathVariable UUID id,@Valid @RequestBody PlanRequest body,Authentication auth,jakarta.servlet.http.HttpServletRequest req) {
        SubscriptionPlan result=service.update(id,body); record(auth,req,"UPDATE","SUBSCRIPTION_PLAN",id,"Cập nhật gói " + result.code()); return result;
    }
    @DeleteMapping("/plans/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) void delete(@PathVariable UUID id,Authentication auth,jakarta.servlet.http.HttpServletRequest req) {
        service.delete(id); record(auth,req,"DELETE","LEARNING_PLAN",id,"Xóa gói học.");
    }
    @GetMapping("/subscriptions") List<UserSubscription> subscriptions() { return service.listSubscriptions(); }
    @PatchMapping("/subscriptions/{id}/cancel") @ResponseStatus(HttpStatus.NO_CONTENT) void cancel(@PathVariable UUID id,Authentication auth,jakarta.servlet.http.HttpServletRequest req) {
        service.cancelSubscription(id); record(auth,req,"REVOKE_LEARNING_ACCESS","LEARNING_PLAN_PURCHASE",id,"Thu hồi quyền học.");
    }
    @PostMapping("/subscriptions/{id}/extend") @ResponseStatus(HttpStatus.NO_CONTENT) void extend(@PathVariable UUID id,Authentication auth,jakarta.servlet.http.HttpServletRequest req) {
        service.extendSubscription(id); record(auth,req,"EXTEND_LEARNING_ACCESS","LEARNING_PLAN_PURCHASE",id,"Cộng thêm 30 ngày sử dụng.");
    }
    private void record(Authentication auth,jakarta.servlet.http.HttpServletRequest req,String action,String type,UUID id,String summary) {
        audit.record(users.findManagedUser(auth.getName()).id(),action,type,id,summary,req.getRemoteAddr());
    }
}
