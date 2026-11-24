CREATE TABLE grammar_user_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    daily_target_minutes INT NOT NULL DEFAULT 20 CHECK (daily_target_minutes >= 5 AND daily_target_minutes <= 240),
    reminder_enabled BOOLEAN NOT NULL DEFAULT false,
    reminder_time TIME,
    timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    sound_enabled BOOLEAN NOT NULL DEFAULT true,
    font_scale INT NOT NULL DEFAULT 100 CHECK (font_scale BETWEEN 90 AND 140),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);
