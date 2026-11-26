package com.toeic.ai.toeic_api.learning;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.toeic.ai.toeic_api.user.ManagedUser;
import com.toeic.ai.toeic_api.user.UserAccountService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/study-plan")
public class StudyPlanController {

    private final StudyPlanService studyPlanService;
    private final UserAccountService userAccountService;

    public StudyPlanController(StudyPlanService studyPlanService, UserAccountService userAccountService) {
        this.studyPlanService = studyPlanService;
        this.userAccountService = userAccountService;
    }

    @GetMapping
    public StudyPlanService.StudyPlanResponse getPlan(Authentication authentication) {
        return studyPlanService.getStudyPlan(currentStudent(authentication));
    }

    @GetMapping("/summary")
    public StudyPlanService.StudyPlanSummary getPlanSummary(Authentication authentication) {
        return studyPlanService.getStudyPlanSummary(currentStudent(authentication));
    }

    @PostMapping("/generate")
    public StudyPlanService.StudyPlanResponse generatePlan(Authentication authentication) {
        return studyPlanService.generateOrRefreshStudyPlan(currentStudent(authentication));
    }

    @PutMapping
    public StudyPlanService.StudyPlanResponse updatePlan(
            @RequestBody StudyPlanService.UpdateStudyPlanRequest request,
            Authentication authentication) {
        return studyPlanService.updateStudyPlan(currentStudent(authentication), request);
    }

    private UUID currentStudent(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.");
        }
        ManagedUser user = userAccountService.findManagedUser(authentication.getName());
        return user.id();
    }
}
