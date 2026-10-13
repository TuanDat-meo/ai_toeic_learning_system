package com.toeic.ai.toeic_api.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import jakarta.servlet.http.HttpServletRequest;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.context.SecurityContextRepository;

import com.toeic.ai.toeic_api.user.EmailAlreadyRegisteredException;
import com.toeic.ai.toeic_api.user.UserAccountService;

class GoogleLoginSuccessHandlerTest {
    @Test
    void rejectsExistingEmailDuringGoogleSignupWithoutSavingAuthentication() throws Exception {
        UserAccountService userAccountService = mock(UserAccountService.class);
        SecurityContextRepository contextRepository = mock(SecurityContextRepository.class);
        GoogleLoginSuccessHandler handler = new GoogleLoginSuccessHandler(
                userAccountService, contextRepository, "http://localhost:3000");
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.getSession(true).setAttribute(GoogleOAuthController.FLOW_SESSION_ATTRIBUTE, "signup");
        MockHttpServletResponse response = new MockHttpServletResponse();

        OAuth2User googleUser = mock(OAuth2User.class);
        when(googleUser.getAttribute("email")).thenReturn("existing@example.com");
        when(googleUser.getAttribute("email_verified")).thenReturn(Boolean.TRUE);
        when(googleUser.getAttribute("name")).thenReturn("Existing User");
        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(googleUser);

        when(userAccountService.registerGoogleAccount("Existing User", "existing@example.com"))
                .thenThrow(new EmailAlreadyRegisteredException());

        handler.onAuthenticationSuccess(request, response, authentication);

        assertThat(response.getRedirectedUrl())
                .isEqualTo("http://localhost:3000/auth/google/callback?error=email_already_registered");
        verify(userAccountService).registerGoogleAccount("Existing User", "existing@example.com");
        verify(userAccountService, never()).findOrCreateGoogleAccount(anyString(), anyString());
        var contextCaptor = org.mockito.ArgumentCaptor.forClass(SecurityContext.class);
        verify(contextRepository).saveContext(contextCaptor.capture(), eq((HttpServletRequest) request), eq(response));
        assertThat(contextCaptor.getValue().getAuthentication()).isNull();
    }

    @Test
    void usesGoogleLoginFlowForExistingAccounts() throws Exception {
        UserAccountService userAccountService = mock(UserAccountService.class);
        SecurityContextRepository contextRepository = mock(SecurityContextRepository.class);
        GoogleLoginSuccessHandler handler = new GoogleLoginSuccessHandler(
                userAccountService, contextRepository, "http://localhost:3000");
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.getSession(true).setAttribute(GoogleOAuthController.FLOW_SESSION_ATTRIBUTE, "login");
        MockHttpServletResponse response = new MockHttpServletResponse();

        OAuth2User googleUser = mock(OAuth2User.class);
        when(googleUser.getAttribute("email")).thenReturn("existing@example.com");
        when(googleUser.getAttribute("email_verified")).thenReturn(Boolean.TRUE);
        when(googleUser.getAttribute("name")).thenReturn("Existing User");
        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(googleUser);
        UserDetails account = org.springframework.security.core.userdetails.User
                .withUsername("existing@example.com").password("encoded").roles("STUDENT").build();
        when(userAccountService.findOrCreateGoogleAccount("Existing User", "existing@example.com"))
                .thenReturn(account);
        when(userAccountService.getSessionVersion("existing@example.com")).thenReturn(1L);

        handler.onAuthenticationSuccess(request, response, authentication);

        assertThat(response.getRedirectedUrl()).isEqualTo("http://localhost:3000/auth/google/callback");
        verify(userAccountService).findOrCreateGoogleAccount("Existing User", "existing@example.com");
        verify(userAccountService, never()).registerGoogleAccount(anyString(), anyString());
    }
}
