CREATE TABLE vocabulary_daily_goals (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_date DATE NOT NULL DEFAULT CURRENT_DATE,
    new_words_goal INT NOT NULL DEFAULT 10 CHECK (new_words_goal >= 0),
    review_goal INT NOT NULL DEFAULT 20 CHECK (review_goal >= 0),
    completed_new_words INT NOT NULL DEFAULT 0 CHECK (completed_new_words >= 0),
    completed_review INT NOT NULL DEFAULT 0 CHECK (completed_review >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_vocabulary_daily_goal UNIQUE (user_id, goal_date)
);

CREATE INDEX idx_vocabulary_daily_goals_user_date
    ON vocabulary_daily_goals (user_id, goal_date);
