CREATE INDEX idx_users_role_status_created_at
    ON users (role, status, created_at DESC);