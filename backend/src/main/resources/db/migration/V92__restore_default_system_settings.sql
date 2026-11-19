INSERT INTO system_settings (id, system_name, support_email)
VALUES (1, 'TOEIC AI Learning', 'support@example.com')
ON CONFLICT (id) DO NOTHING;
