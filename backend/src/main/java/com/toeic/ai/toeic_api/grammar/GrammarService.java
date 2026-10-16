package com.toeic.ai.toeic_api.grammar;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class GrammarService {

    private final JdbcTemplate jdbc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GrammarService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<GrammarTopic> listTopics(UUID userId) {
        String sql = """
                SELECT g.id, g.code, g.title, g.english_title, g.part, g.target_score, g.status,
                       g.summary, g.formula,
                       g.signal_words::text AS signal_words,
                       g.traps::text AS traps,
                       '[]' AS examples,
                       '[]' AS questions,
                       COALESCE(p.completed_questions, 0) AS completed_questions,
                       COALESCE(jsonb_array_length(g.questions), 0) AS total_questions,
                       COALESCE(p.status, 'Chưa học') AS user_status,
                       g.created_at, g.updated_at
                FROM grammar_topics g
                LEFT JOIN user_grammar_progress p ON p.topic_id = g.id AND p.user_id = ?
                ORDER BY g.order_index ASC, g.id ASC
                """;

        return jdbc.query(sql, this::mapTopicSummary, userId);
    }

    public GrammarTopic getTopic(String topicId, UUID userId) {
        String sql = """
                SELECT g.id, g.code, g.title, g.english_title, g.part, g.target_score, g.status,
                       g.summary, g.formula,
                       g.signal_words::text AS signal_words,
                       g.traps::text AS traps,
                       g.examples::text AS examples,
                       g.questions::text AS questions,
                       COALESCE(p.completed_questions, 0) AS completed_questions,
                       COALESCE(jsonb_array_length(g.questions), 0) AS total_questions,
                       COALESCE(p.status, 'Chưa học') AS user_status,
                       g.created_at, g.updated_at
                FROM grammar_topics g
                LEFT JOIN user_grammar_progress p ON p.topic_id = g.id AND p.user_id = ?
                WHERE g.id = ?
                """;

        List<GrammarTopic> topics = jdbc.query(sql, this::mapTopicFull, userId, topicId);
        if (topics.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy chủ điểm ngữ pháp: " + topicId);
        }
        return topics.get(0);
    }

    @Transactional
    public void saveProgress(UUID userId, String topicId, int completed, int total, String status) {
        if (userId == null) return;

        String upsert = """
                INSERT INTO user_grammar_progress (user_id, topic_id, completed_questions, total_questions, status, updated_at)
                VALUES (?, ?, ?, ?, ?, now())
                ON CONFLICT (user_id, topic_id) DO UPDATE SET
                    completed_questions = EXCLUDED.completed_questions,
                    total_questions = EXCLUDED.total_questions,
                    status = EXCLUDED.status,
                    updated_at = now()
                """;

        jdbc.update(upsert, userId, topicId, completed, total, status);
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedInitialDataIfEmpty() {
        Integer count = jdbc.queryForObject("SELECT count(*) FROM grammar_topics", Integer.class);
        if (count != null && count > 0) {
            return;
        }

        String signals = "[\"career experiences\", \"own\", \"by oneself\", \"on one's own\", \"colleagues\"]";
        String traps = "[\"Bẫy chọn đại từ tân ngữ (him/them) thay vì tính từ sở hữu (his/their)\", \"Bẫy đại từ phản thân: by himself = on his own\"]";
        String examples = "[{\"sentence\":\"Former Sendai Company CEO Ken Nakata spoke about his career experiences.\",\"translation\":\"Cựu CEO Ken Nakata đã nói về những trải nghiệm nghề nghiệp của mình.\",\"analysis\":\"Đứng trước danh từ career experiences bắt buộc dùng his.\"}]";
        String questions = "[{\"id\":\"pro24-q1\",\"part\":\"Part 5\",\"questionText\":\"Former Sendai Company CEO Ken Nakata spoke about _______ career experiences at the international business conference.\",\"options\":{\"A\":\"he\",\"B\":\"his\",\"C\":\"him\",\"D\":\"himself\"},\"correctAnswer\":\"B\",\"explanation\":\"Cụm career experiences cần tính từ sở hữu his đứng trước bổ nghĩa.\",\"trapNote\":\"Tránh chọn him vì sau giới từ có danh từ đi kèm.\",\"translation\":\"Cựu CEO Ken Nakata nói về trải nghiệm của mình.\",\"difficulty\":\"350-500\"},{\"id\":\"pro24-q2\",\"part\":\"Part 5\",\"questionText\":\"Board members reviewed the quarterly expenditure report and compared _______ with the projected annual figures.\",\"options\":{\"A\":\"it\",\"B\":\"its\",\"C\":\"itself\",\"D\":\"they\"},\"correctAnswer\":\"A\",\"explanation\":\"Chỗ trống cần một đại từ tân ngữ it để thay thế cho expenditure report.\",\"trapNote\":\"Không chọn its vì không có danh từ theo sau.\",\"translation\":\"Hội đồng quản trị xem xét báo cáo chi tiêu và so sánh nó với số liệu dự kiến.\",\"difficulty\":\"350-500\"}]";

        jdbc.update("""
                INSERT INTO grammar_topics (id, code, title, english_title, part, target_score, status, summary, formula, signal_words, traps, examples, questions, order_index)
                VALUES ('g-pronouns-2024', 'PRO-2024', 'Đại Từ & Tính Từ Sở Hữu (ETS 2024)', 'Pronouns & Possessive Forms in ETS 2024',
                    'Part 5', '350-500', 'PUBLISHED',
                    'Nhóm câu hỏi xuất hiện liên tục trong đề thi ETS 2024 kiểm tra chức năng chủ ngữ, tân ngữ, tính từ sở hữu và đại từ phản thân.',
                    'S + V + O | Tính từ sở hữu + Noun | by + myself/himself',
                    ?::jsonb, ?::jsonb, ?::jsonb, ?::jsonb, 0)
                """, signals, traps, examples, questions);

        String signalsTenses = "[\"already\", \"recently\", \"since\", \"for the past 3 years\", \"next week\"]";
        String trapsTenses = "[\"Nhầm thì hiện tại hoàn thành với quá khứ đơn khi có mốc thời gian cụ thể (in 2020)\"]";
        String examplesTenses = "[{\"sentence\":\"The committee has reviewed all incoming grant proposals.\",\"translation\":\"Hội đồng đã xem xét tất cả đề xuất tài trợ.\",\"analysis\":\"Diễn tả hành động đã hoàn thành tính đến thời điểm hiện tại.\"}]";
        String questionsTenses = "[{\"id\":\"tenses-q1\",\"part\":\"Part 5\",\"questionText\":\"The quality control team _______ all manufactured components before dispatching them to clients.\",\"options\":{\"A\":\"inspects\",\"B\":\"inspecting\",\"C\":\"inspection\",\"D\":\"to inspect\"},\"correctAnswer\":\"A\",\"explanation\":\"Câu thiếu động từ chính chia theo chủ ngữ số ít quality control team.\",\"trapNote\":\"Không chọn inspecting vì thiếu to be.\",\"translation\":\"Đội kiểm tra chất lượng kiểm tra các bộ phận trước khi gửi.\",\"difficulty\":\"450-650\"}]";

        jdbc.update("""
                INSERT INTO grammar_topics (id, code, title, english_title, part, target_score, status, summary, formula, signal_words, traps, examples, questions, order_index)
                VALUES ('g-tenses-2024', 'TENSES-2024', 'Các Thì Cơ Bản & Phối Hợp Thì Trong TOEIC', 'Verb Tenses in TOEIC',
                    'Part 5', '450-650', 'PUBLISHED',
                    'Nắm vững 6 thì trọng tâm hay xuất hiện nhất trong bài thi TOEIC Part 5 & 6.',
                    'Present Simple, Past Simple, Present Perfect, Future Simple',
                    ?::jsonb, ?::jsonb, ?::jsonb, ?::jsonb, 1)
                """, signalsTenses, trapsTenses, examplesTenses, questionsTenses);
    }

    private GrammarTopic mapTopicSummary(ResultSet rs, int rowNum) throws SQLException {
        return new GrammarTopic(
                rs.getString("id"),
                rs.getString("code"),
                rs.getString("title"),
                rs.getString("english_title"),
                rs.getString("part"),
                rs.getString("target_score"),
                rs.getString("status"),
                rs.getString("summary"),
                rs.getString("formula"),
                parseStringList(rs.getString("signal_words")),
                parseStringList(rs.getString("traps")),
                Collections.emptyList(),
                Collections.emptyList(),
                rs.getInt("completed_questions"),
                rs.getInt("total_questions"),
                rs.getString("user_status"),
                rs.getTimestamp("created_at").toInstant(),
                rs.getTimestamp("updated_at").toInstant()
        );
    }

    private GrammarTopic mapTopicFull(ResultSet rs, int rowNum) throws SQLException {
        return new GrammarTopic(
                rs.getString("id"),
                rs.getString("code"),
                rs.getString("title"),
                rs.getString("english_title"),
                rs.getString("part"),
                rs.getString("target_score"),
                rs.getString("status"),
                rs.getString("summary"),
                rs.getString("formula"),
                parseStringList(rs.getString("signal_words")),
                parseStringList(rs.getString("traps")),
                parseMapList(rs.getString("examples")),
                parseMapList(rs.getString("questions")),
                rs.getInt("completed_questions"),
                rs.getInt("total_questions"),
                rs.getString("user_status"),
                rs.getTimestamp("created_at").toInstant(),
                rs.getTimestamp("updated_at").toInstant()
        );
    }

    private List<String> parseStringList(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private List<Map<String, Object>> parseMapList(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
