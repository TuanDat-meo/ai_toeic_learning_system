package com.toeic.ai.toeic_api.user;

import java.time.Instant;
import java.util.UUID;

public record ManagedUser(UUID id, String email, String fullName, String role, String status, Instant createdAt) {
}