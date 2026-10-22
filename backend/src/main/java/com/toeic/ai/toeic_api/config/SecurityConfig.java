package com.toeic.ai.toeic_api.config;

import java.util.ArrayList;
import java.util.Arrays;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.context.SecurityContextHolderFilter;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.toeic.ai.toeic_api.user.UserAccountService;
import com.toeic.ai.toeic_api.auth.GoogleLoginSuccessHandler;

@Configuration
public class SecurityConfig {
    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    @Bean
    FilterRegistrationBean<AccountStatusFilter> accountStatusFilterRegistration(AccountStatusFilter filter) {
        FilterRegistrationBean<AccountStatusFilter> registration = new FilterRegistrationBean<>(filter);
        registration.setEnabled(false);
        return registration;
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, UserAccountService userAccountService,
            AccountStatusFilter accountStatusFilter,
            SecurityContextRepository contextRepository, CorsConfigurationSource corsConfigurationSource,
            ObjectProvider<ClientRegistrationRepository> clientRegistrationRepositories,
            GoogleLoginSuccessHandler googleLoginSuccessHandler) throws Exception {
        http
                .userDetailsService(userAccountService)
                .securityContext(context -> context.securityContextRepository(contextRepository))
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf.ignoringRequestMatchers("/api/webhooks/sepay"))
                .exceptionHandling(exceptions -> exceptions.defaultAuthenticationEntryPointFor(
                        new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
                        request -> request.getServletPath().startsWith("/api/")))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/csrf", "/api/auth/login", "/api/auth/register",
                            "/api/auth/google/**",
                            "/api/auth/password/forgot", "/api/auth/password/reset",
                            "/api/listening/**",
                            "/api/vocabulary/**",
                            "/api/grammar/**",
                            "/api/reading/**",
                            "/api/mock-tests/**",
                            "/oauth2/**", "/login/oauth2/**").permitAll()
                        .requestMatchers("/api/billing/**").hasRole("STUDENT")
                        .requestMatchers("/api/learning-profile/**").hasRole("STUDENT")
                        .requestMatchers(HttpMethod.GET, "/api/chat/discussion").permitAll()
                        .requestMatchers("/api/chat/**").authenticated()
                        .requestMatchers("/api/support-reports/**").authenticated()
                        .requestMatchers("/api/community/**").authenticated()
                        .requestMatchers("/api/announcements/**").hasRole("STUDENT")
                        .requestMatchers("/api/question-corrections/**").authenticated()
                        .requestMatchers("/api/admin/support/**", "/api/admin/chat/support",
                            "/api/admin/announcements", "/api/admin/announcements/**",
                            "/api/admin/settings", "/api/admin/settings/**",
                            "/api/admin/mock-tests/**")
                            .hasAnyRole("ADMIN", "TEACHER")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/auth/**").authenticated()
                        .anyRequest().permitAll());
        if (clientRegistrationRepositories.getIfAvailable() != null) {
            http.oauth2Login(oauth -> oauth
                    .successHandler(googleLoginSuccessHandler)
                    .failureHandler(googleLoginSuccessHandler));
        }
        http.addFilterAfter(accountStatusFilter, SecurityContextHolderFilter.class);
        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(@Value("${app.cors.allowed-origins}") String allowedOrigins) {
        CorsConfiguration configuration = new CorsConfiguration();
        var origins = new ArrayList<String>();
        for (String origin : allowedOrigins.split(",")) {
            if (!origin.isBlank()) {
                origins.add(origin.trim());
            }
        }
        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Accept", "Content-Type", "X-CSRF-TOKEN"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
