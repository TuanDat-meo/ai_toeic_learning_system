package com.toeic.ai.toeic_api.auth;

import java.io.IOException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import com.toeic.ai.toeic_api.user.EmailAlreadyRegisteredException;
import com.toeic.ai.toeic_api.user.UserAccountService;

@Component
public class GoogleLoginSuccessHandler implements AuthenticationSuccessHandler, AuthenticationFailureHandler {
    private final UserAccountService userAccountService;
    private final SecurityContextRepository contextRepository;
    private final String frontendUrl;

    public GoogleLoginSuccessHandler(
            UserAccountService userAccountService,
            SecurityContextRepository contextRepository,
            @Value("${app.frontend-url}") String frontendUrl) {
        this.userAccountService = userAccountService;
        this.contextRepository = contextRepository;
        this.frontendUrl = frontendUrl.replaceAll("/+$", "");
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException {
        OAuth2User googleUser = (OAuth2User) authentication.getPrincipal();
        String email = googleUser.getAttribute("email");
        Boolean emailVerified = googleUser.getAttribute("email_verified");
        String name = googleUser.getAttribute("name");
        boolean signupFlow = consumeSignupFlow(request);

        if (email == null || !Boolean.TRUE.equals(emailVerified)) {
            redirectWithError(response, "unverified_email");
            return;
        }

        try {
            UserDetails account = signupFlow
                    ? userAccountService.registerGoogleAccount(name == null ? email : name, email)
                    : userAccountService.findOrCreateGoogleAccount(name == null ? email : name, email);
            if (request.getSession(false) != null) {
                request.changeSessionId();
            }
            request.getSession(true).setAttribute(UserAccountService.SESSION_VERSION_ATTRIBUTE,
                    userAccountService.getSessionVersion(account.getUsername()));

            var appAuthentication = org.springframework.security.authentication.UsernamePasswordAuthenticationToken
                    .authenticated(account, null, account.getAuthorities());
            appAuthentication.setDetails(authentication.getDetails());
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(appAuthentication);
            SecurityContextHolder.setContext(context);
            contextRepository.saveContext(context, request, response);

            response.sendRedirect(UriComponentsBuilder.fromUriString(frontendUrl)
                    .path("/auth/google/callback").build().toUriString());
        } catch (EmailAlreadyRegisteredException exception) {
            clearAuthentication(request, response);
            redirectWithError(response, "email_already_registered");
        } catch (IllegalArgumentException exception) {
            clearAuthentication(request, response);
            redirectWithError(response, "account_unavailable");
        }
    }

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
            org.springframework.security.core.AuthenticationException exception) throws IOException {
        consumeSignupFlow(request);
        redirectWithError(response, "google_login_failed");
    }

    private boolean consumeSignupFlow(HttpServletRequest request) {
        var session = request.getSession(false);
        if (session == null) {
            return false;
        }
        boolean signupFlow = "signup".equals(session.getAttribute(GoogleOAuthController.FLOW_SESSION_ATTRIBUTE));
        session.removeAttribute(GoogleOAuthController.FLOW_SESSION_ATTRIBUTE);
        return signupFlow;
    }

    private void clearAuthentication(HttpServletRequest request, HttpServletResponse response) {
        SecurityContext emptyContext = SecurityContextHolder.createEmptyContext();
        SecurityContextHolder.setContext(emptyContext);
        contextRepository.saveContext(emptyContext, request, response);
        SecurityContextHolder.clearContext();
    }

    private void redirectWithError(HttpServletResponse response, String error) throws IOException {
        response.sendRedirect(UriComponentsBuilder.fromUriString(frontendUrl)
                .path("/auth/google/callback").queryParam("error", error).build().toUriString());
    }
}
