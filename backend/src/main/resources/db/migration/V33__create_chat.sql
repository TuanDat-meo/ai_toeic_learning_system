CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_type VARCHAR(20) NOT NULL,
    thread_id UUID,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content VARCHAR(2000) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT ck_chat_room_type CHECK (room_type IN ('DISCUSSION', 'SUPPORT'))
);

CREATE TABLE chat_support_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT ck_chat_thread_status CHECK (status IN ('OPEN', 'CLOSED'))
);

CREATE UNIQUE INDEX uq_chat_support_thread_open_user ON chat_support_threads(user_id) WHERE status = 'OPEN';
CREATE INDEX idx_chat_messages_discussion ON chat_messages(created_at DESC) WHERE room_type = 'DISCUSSION';
CREATE INDEX idx_chat_messages_thread ON chat_messages(thread_id, created_at) WHERE room_type = 'SUPPORT';
CREATE INDEX idx_chat_threads_updated ON chat_support_threads(updated_at DESC);

CREATE TABLE chat_presence (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    last_seen_at TIMESTAMP NOT NULL DEFAULT now()
);
