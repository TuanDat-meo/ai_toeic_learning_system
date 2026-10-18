package com.toeic.ai.toeic_api.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

@Order(Ordered.HIGHEST_PRECEDENCE)
public class DatabaseHostEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Map<String, Object> overrides = new HashMap<>();

        String dbUrl = environment.getProperty("DB_URL");
        if (dbUrl != null && dbUrl.contains("://localhost:")) {
            overrides.put("DB_URL", dbUrl.replace("://localhost:", "://127.0.0.1:"));
        }

        String datasourceUrl = environment.getProperty("spring.datasource.url");
        if (datasourceUrl != null && datasourceUrl.contains("://localhost:")) {
            overrides.put("spring.datasource.url", datasourceUrl.replace("://localhost:", "://127.0.0.1:"));
        }

        if (!overrides.isEmpty()) {
            environment.getPropertySources().addFirst(new MapPropertySource("databaseHostIPv4Override", overrides));
        }
    }
}
