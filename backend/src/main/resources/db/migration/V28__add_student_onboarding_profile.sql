ALTER TABLE learning_profiles
    ADD COLUMN exam_date DATE,
    ADD COLUMN learning_reason VARCHAR(30),
    ADD COLUMN recent_score INT,
    ADD COLUMN daily_study_minutes INT,
    ADD COLUMN onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    ADD CONSTRAINT ck_learning_profiles_learning_reason
        CHECK (learning_reason IS NULL OR learning_reason IN ('CAREER', 'STUDY', 'TRAVEL', 'PERSONAL')),
    ADD CONSTRAINT ck_learning_profiles_recent_score
        CHECK (recent_score IS NULL OR recent_score BETWEEN 0 AND 990),
    ADD CONSTRAINT ck_learning_profiles_daily_study_minutes
        CHECK (daily_study_minutes IS NULL OR daily_study_minutes IN (15, 30, 45, 60, 90));

CREATE TABLE learning_profile_study_days (
    learning_profile_id UUID NOT NULL,
    day_of_week SMALLINT NOT NULL,
    PRIMARY KEY (learning_profile_id, day_of_week),
    CONSTRAINT fk_learning_profile_study_days_profile
        FOREIGN KEY (learning_profile_id) REFERENCES learning_profiles (id) ON DELETE CASCADE,
    CONSTRAINT ck_learning_profile_study_days_day
        CHECK (day_of_week BETWEEN 1 AND 7)
);

CREATE TABLE learning_profile_interests (
    learning_profile_id UUID NOT NULL,
    interest VARCHAR(30) NOT NULL,
    PRIMARY KEY (learning_profile_id, interest),
    CONSTRAINT fk_learning_profile_interests_profile
        FOREIGN KEY (learning_profile_id) REFERENCES learning_profiles (id) ON DELETE CASCADE,
    CONSTRAINT ck_learning_profile_interests_value
        CHECK (interest IN ('LISTENING', 'READING', 'VOCABULARY', 'GRAMMAR', 'MOCK_TESTS'))
);
