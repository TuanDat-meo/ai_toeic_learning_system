CREATE TABLE system_settings (
    id SMALLINT PRIMARY KEY DEFAULT 1,
    system_name VARCHAR(80) NOT NULL,
    support_email VARCHAR(254) NOT NULL,
    daily_study_minutes SMALLINT NOT NULL DEFAULT 30,
    reminder_time TIME NOT NULL DEFAULT TIME '19:00',
    notify_new_registrations BOOLEAN NOT NULL DEFAULT TRUE,
    notify_support_requests BOOLEAN NOT NULL DEFAULT TRUE,
    notify_content_reports BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0,
    updated_by UUID REFERENCES users (id) ON DELETE SET NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT ck_system_settings_singleton CHECK (id = 1),
    CONSTRAINT ck_system_settings_name_nonblank CHECK (length(btrim(system_name)) > 0),
    CONSTRAINT ck_system_settings_email_nonblank CHECK (length(btrim(support_email)) > 0),
    CONSTRAINT ck_system_settings_daily_study_minutes
        CHECK (daily_study_minutes IN (15, 30, 45, 60, 90)),
    CONSTRAINT ck_system_settings_reminder_time_minute
        CHECK (date_part('second', reminder_time) = 0),
    CONSTRAINT ck_system_settings_version CHECK (version >= 0)
);

INSERT INTO system_settings (id, system_name, support_email)
VALUES (1, 'TOEIC AI Learning', 'support@example.com');
