package com.toeic.ai.toeic_api.settings;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.toeic.ai.toeic_api.audit.AuditLogService;

@Service
public class SystemSettingsService {
    private static final String SELECT_SETTINGS = """
            SELECT system_name, support_email, daily_study_minutes, reminder_time,
                   notify_new_registrations, notify_support_requests, notify_content_reports,
                   version, updated_at
            FROM system_settings
            WHERE id = 1
            """;

    private final JdbcTemplate jdbc;
    private final AuditLogService auditLogService;

    public SystemSettingsService(JdbcTemplate jdbc, AuditLogService auditLogService) {
        this.jdbc = jdbc;
        this.auditLogService = auditLogService;
    }

    public SystemSettings getSettings() {
        List<SystemSettings> settings = jdbc.query(SELECT_SETTINGS, this::mapSettings);
        if (settings.isEmpty()) {
            throw missingSettings();
        }
        return settings.getFirst();
    }

    public int getDefaultDailyStudyMinutes() {
        return getSettings().dailyStudyMinutes();
    }

    @Transactional
    public SystemSettings update(SystemSettingsUpdateRequest request, UUID adminId, String ipAddress) {
        if (!List.of(15, 30, 45, 60, 90).contains(request.dailyStudyMinutes())) {
            throw new IllegalArgumentException("Thời lượng học phải là một trong các mức 15, 30, 45, 60 hoặc 90 phút.");
        }

        int updated = jdbc.update("""
                UPDATE system_settings
                SET system_name = ?, support_email = ?, daily_study_minutes = ?, reminder_time = ?,
                    notify_new_registrations = ?, notify_support_requests = ?, notify_content_reports = ?,
                    version = version + 1, updated_by = ?, updated_at = now()
                WHERE id = 1 AND version = ?
                """,
                request.systemName().trim(),
                request.supportEmail().trim(),
                request.dailyStudyMinutes(),
                LocalTime.parse(request.reminderTime()),
                request.notifications().newRegistrations(),
                request.notifications().supportRequests(),
                request.notifications().contentReports(),
                adminId,
                request.expectedVersion());

        if (updated == 0) {
            if (jdbc.query("SELECT version FROM system_settings WHERE id = 1", (rs, row) -> rs.getLong(1)).isEmpty()) {
                throw missingSettings();
            }
            throw staleSettings();
        }

        auditLogService.record(adminId, "UPDATE", "SYSTEM_SETTINGS", null,
                "Cập nhật cấu hình hệ thống lên phiên bản " + (request.expectedVersion() + 1) + ".",
                ipAddress);
        return getSettings();
    }

    private SystemSettings mapSettings(ResultSet rs, int row) throws SQLException {
        return new SystemSettings(
                rs.getString("system_name"),
                rs.getString("support_email"),
                rs.getInt("daily_study_minutes"),
                rs.getObject("reminder_time", LocalTime.class).toString(),
                new SystemSettingNotifications(
                        rs.getBoolean("notify_new_registrations"),
                        rs.getBoolean("notify_support_requests"),
                        rs.getBoolean("notify_content_reports")),
                rs.getLong("version"),
                rs.getTimestamp("updated_at").toInstant());
    }

    private static ResponseStatusException staleSettings() {
        return new ResponseStatusException(HttpStatus.CONFLICT,
                "Cấu hình đã được quản trị viên khác cập nhật. Hãy tải lại dữ liệu trước khi lưu.");
    }

    private static ResponseStatusException missingSettings() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Cấu hình hệ thống chưa được khởi tạo. Hãy kiểm tra migration cơ sở dữ liệu.");
    }
}
