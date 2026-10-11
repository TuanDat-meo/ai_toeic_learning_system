package com.toeic.ai.toeic_api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.context.annotation.Conditional;
import org.springframework.core.type.AnnotatedTypeMetadata;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.config.oauth2.client.CommonOAuth2Provider;

@Configuration
@Conditional(GoogleOAuthClientConfig.GoogleCredentialsConfigured.class)
public class GoogleOAuthClientConfig {
    @Bean
    ClientRegistrationRepository clientRegistrationRepository(
            @Value("${GOOGLE_CLIENT_ID}") String clientId,
            @Value("${GOOGLE_CLIENT_SECRET}") String clientSecret) {
        ClientRegistration google = CommonOAuth2Provider.GOOGLE.getBuilder("google")
                .clientId(clientId)
                .clientSecret(clientSecret)
                .redirectUri("{baseUrl}/login/oauth2/code/{registrationId}")
                .scope("openid", "profile", "email")
                .build();
        return new InMemoryClientRegistrationRepository(google);
    }

    public static class GoogleCredentialsConfigured implements Condition {
        @Override
        public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
            String clientId = context.getEnvironment().getProperty("GOOGLE_CLIENT_ID", "");
            String clientSecret = context.getEnvironment().getProperty("GOOGLE_CLIENT_SECRET", "");
            return !clientId.isBlank() && !clientSecret.isBlank();
        }
    }
}
