package com.toeic.ai.toeic_api.config;

import java.io.IOException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.toeic.ai.toeic_api.user.UserAccountService;

@Component
public class AccountStatusFilter extends OncePerRequestFilter {
    private final UserAccountService userAccountService;

    public AccountStatusFilter(UserAccountService userAccountService) {
        this.userAccountService = userAccountService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            chain.doFilter(request, response);
            return;
        }

        String username = authentication.getName();
        UserDetails account;
        try {
            account = userAccountService.loadUserByUsername(username);
        } catch (UsernameNotFoundException exception) {
            expireSession(request, response);
            return;
        }
        if (!account.isEnabled()) {
            expireSession(request, response);
            return;
        }

        var session = request.getSession(true);
        Object sessionVersion = session.getAttribute(UserAccountService.SESSION_VERSION_ATTRIBUTE);
        long currentVersion = userAccountService.getSessionVersion(username);
        if (sessionVersion instanceof Number version) {
            if (version.longValue() != currentVersion) {
                expireSession(request, response);
                return;
            }
        } else {
            session.setAttribute(UserAccountService.SESSION_VERSION_ATTRIBUTE, currentVersion);
        }

        var refreshedAuthentication = UsernamePasswordAuthenticationToken.authenticated(
                account, null, account.getAuthorities());
        refreshedAuthentication.setDetails(authentication.getDetails());
        SecurityContextHolder.getContext().setAuthentication(refreshedAuthentication);
        chain.doFilter(request, response);
    }

    private void expireSession(HttpServletRequest request, HttpServletResponse response) throws IOException {
        SecurityContextHolder.clearContext();
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"message\":\"Tài khoản không còn hoạt động. Vui lòng đăng nhập lại.\"}");
    }
}