package com.toeic.ai.toeic_api.contentimport;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
class ContentImportStorageConfig {
    @Bean
    RestClient.Builder contentImportRestClientBuilder() {
        return RestClient.builder();
    }

    @Bean
    S3Client contentImportS3Client(@Value("${app.content-import.storage.region:us-east-1}") String region) {
        return S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }
}
