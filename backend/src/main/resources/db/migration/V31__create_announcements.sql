CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    summary VARCHAR(500) NOT NULL DEFAULT '',
    content TEXT NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('SYSTEM','FEATURE_UPDATE','PROMOTION','EVENT')),
    target VARCHAR(20) NOT NULL CHECK (target IN ('ALL','FREE_USERS','VIP_USERS')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('ACTIVE','DRAFT','ARCHIVED')),
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    action_url VARCHAR(500),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX ix_announcements_status_created ON announcements(status, created_at DESC);

CREATE TABLE announcement_reads (
    announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP NOT NULL DEFAULT now(),
    PRIMARY KEY (announcement_id, user_id)
);
