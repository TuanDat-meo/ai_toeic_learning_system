package com.toeic.ai.toeic_api.auth;

import java.io.IOException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/api/auth/google")
class GoogleOAuthController {
    static final String FLOW_SESSION_ATTRIBUTE = GoogleOAuthController.class.getName() + ".flow";

    @GetMapping("/login")
    void login(HttpServletRequest request, HttpServletResponse response) throws IOException {
        startOAuthFlow(request, response, "login");
    }

    @GetMapping("/signup")
    void signup(HttpServletRequest request, HttpServletResponse response) throws IOException {
        startOAuthFlow(request, response, "signup");
    }

    private void startOAuthFlow(HttpServletRequest request, HttpServletResponse response, String flow)
            throws IOException {
        request.getSession(true).setAttribute(FLOW_SESSION_ATTRIBUTE, flow);
        response.sendRedirect(request.getContextPath() + "/oauth2/authorization/google");
    }
}
