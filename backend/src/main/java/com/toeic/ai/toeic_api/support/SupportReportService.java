package com.toeic.ai.toeic_api.support;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SupportReportService {
    private static final String SELECT = """
            SELECT r.id, r.ticket_code, r.reporter_id, u.full_name, u.email,
                   r.category, r.title, r.description, r.source, r.question_ref,
                   r.question_snapshot::text AS question_snapshot, r.related_content,
                   r.priority, r.status, r.admin_reply, r.correction::text AS correction,
                   r.created_at, r.updated_at, r.replied_at
            FROM support_reports r JOIN users u ON u.id = r.reporter_id
            """;

    private final JdbcTemplate jdbc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SupportReportService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Transactional
    public SupportReport create(UUID reporterId, CreateSupportReportRequest request) {
        UUID id = UUID.randomUUID();
        String code = "TK-" + id.toString().substring(0, 8).toUpperCase();
        jdbc.update("""
                INSERT INTO support_reports (id, ticket_code, reporter_id, category, title, description,
                    source, question_ref, question_snapshot, related_content)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?)
                """, id, code, reporterId, request.category(), request.title().trim(),
                request.description().trim(), request.source(), blankToNull(request.questionRef()),
                json(request.questionSnapshot()), blankToNull(request.relatedContent()));
        return find(id);
    }

    public List<SupportReport> listForAdmin() {
        return jdbc.query(SELECT + " ORDER BY r.created_at DESC, r.id DESC", this::mapReport);
    }

    public List<SupportReport> listForUser(UUID userId) {
        return jdbc.query(SELECT + " WHERE r.reporter_id = ? ORDER BY r.created_at DESC, r.id DESC",
                this::mapReport, userId);
    }

    @Transactional
    public SupportReport update(UUID id, UUID adminId, UpdateSupportReportRequest request) {
        SupportReport existing = find(id);
        if (request.correction() != null) {
            if (existing.questionRef() == null || existing.questionRef().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Báo cáo này không liên kết với câu hỏi để cập nhật nội dung.");
            }
            if (!"QUESTION_ERROR".equals(existing.category())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Chỉ báo cáo lỗi câu hỏi mới được cập nhật bộ câu hỏi.");
            }
            validateCorrection(request.correction());
            jdbc.update("""
                    INSERT INTO question_corrections (question_ref, corrected_content, corrected_by, report_id)
                    VALUES (?, ?::jsonb, ?, ?)
                    ON CONFLICT (question_ref) DO UPDATE SET
                        corrected_content = EXCLUDED.corrected_content,
                        corrected_by = EXCLUDED.corrected_by,
                        report_id = EXCLUDED.report_id,
                        updated_at = now()
                    """, existing.questionRef(), writeJson(request.correction()), adminId, id);
        }
        jdbc.update("""
                UPDATE support_reports
                SET status = ?, admin_reply = ?,
                    correction = COALESCE(?::jsonb, correction),
                    replied_at = now(), updated_at = now()
                WHERE id = ?
                """, request.status(), blankToNull(request.adminReply()),
                request.correction() == null ? null : writeJson(request.correction()), id);
        return find(id);
    }

    @Transactional
    public void delete(UUID id) {
        find(id);
        jdbc.update("DELETE FROM question_corrections WHERE report_id = ?", id);
        jdbc.update("DELETE FROM support_reports WHERE id = ?", id);
    }

    public Map<String, Object> findQuestionCorrection(String questionRef) {
        List<String> rows = jdbc.query("SELECT corrected_content::text FROM question_corrections WHERE question_ref = ?",
                (rs, row) -> rs.getString(1), questionRef);
        if (rows.isEmpty()) return null;
        return readJson(rows.getFirst());
    }

    private SupportReport find(UUID id) {
        List<SupportReport> rows = jdbc.query(SELECT + " WHERE r.id = ?", this::mapReport, id);
        if (rows.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy báo cáo.");
        return rows.getFirst();
    }

    private SupportReport mapReport(ResultSet rs, int row) throws SQLException {
        return new SupportReport(rs.getObject("id", UUID.class), rs.getString("ticket_code"),
                rs.getObject("reporter_id", UUID.class).toString(), rs.getString("full_name"),
                rs.getString("email"), rs.getString("category"), rs.getString("title"),
                rs.getString("description"), rs.getString("source"), rs.getString("question_ref"),
                readJson(rs.getString("question_snapshot")), rs.getString("related_content"),
                rs.getString("priority"), rs.getString("status"), rs.getString("admin_reply"),
                readJson(rs.getString("correction")), instant(rs.getTimestamp("created_at")),
                instant(rs.getTimestamp("updated_at")), instant(rs.getTimestamp("replied_at")));
    }

    private String json(Map<String, Object> value) {
        if (value == null || value.isEmpty()) return null;
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thông tin câu hỏi đính kèm không hợp lệ.");
        }
    }

    private String writeJson(Map<String, Object> value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            throw new IllegalArgumentException("Không thể lưu nội dung câu hỏi đã sửa.");
        }
    }

    private static void validateCorrection(Map<String, Object> correction) {
        Object questionText = correction.get("questionText");
        Object answer = correction.get("correctAnswer");
        Object options = correction.get("options");
        if (!(questionText instanceof String question) || question.isBlank()
                || !(answer instanceof String answerKey) || !answerKey.matches("[A-D]")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Nội dung câu hỏi và đáp án đúng A-D là bắt buộc.");
        }
        boolean validOptions = false;
        if (options instanceof Map<?, ?> map) {
            validOptions = map.size() >= 2 && map.containsKey(answerKey)
                    && map.values().stream().allMatch(value -> value instanceof String optionText && !optionText.isBlank());
        } else if (options instanceof List<?> list) {
            int answerIndex = answerKey.charAt(0) - 'A';
            validOptions = list.size() >= 2 && answerIndex < list.size()
                    && list.stream().allMatch(value -> value instanceof String optionText && !optionText.isBlank());
        }
        if (!validOptions) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cần ít nhất hai phương án không rỗng và phải có phương án đáp án đúng.");
        }
    }

    private Map<String, Object> readJson(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return objectMapper.readValue(value, new TypeReference<>() { });
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Không đọc được nội dung báo cáo đã lưu.", exception);
        }
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static java.time.Instant instant(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toInstant();
    }
}
