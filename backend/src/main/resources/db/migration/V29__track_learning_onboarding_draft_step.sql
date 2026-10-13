ALTER TABLE learning_profiles
    ADD COLUMN onboarding_step SMALLINT NOT NULL DEFAULT 0,
    ADD CONSTRAINT ck_learning_profiles_onboarding_step
        CHECK (onboarding_step BETWEEN 0 AND 4);
