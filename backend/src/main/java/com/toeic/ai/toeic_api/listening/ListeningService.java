package com.toeic.ai.toeic_api.listening;

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
public class ListeningService {

    private final JdbcTemplate jdbc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ListeningService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<ListeningDictationCard> listCards(UUID userId) {
        String sql = """
                SELECT c.id, c.test_number, c.part, c.year, c.total_questions,
                       COALESCE(p.completed_questions, 0) AS completed_questions,
                       COALESCE(p.status, c.status) AS status,
                       c.created_at, c.updated_at
                FROM listening_dictation_cards c
                LEFT JOIN user_listening_progress p ON p.card_id = c.id AND p.user_id = ?
                ORDER BY c.test_number ASC, c.part ASC
                """;

        return jdbc.query(sql, (rs, rowNum) -> new ListeningDictationCard(
                rs.getString("id"),
                rs.getInt("test_number"),
                rs.getString("part"),
                rs.getString("year"),
                rs.getInt("total_questions"),
                rs.getInt("completed_questions"),
                rs.getString("status"),
                0,
                Collections.emptyList(),
                rs.getTimestamp("created_at").toInstant(),
                rs.getTimestamp("updated_at").toInstant()
        ), userId);
    }

    public ListeningDictationCard getCard(String cardId, UUID userId) {
        String sql = """
                SELECT c.id, c.test_number, c.part, c.year, c.total_questions,
                       COALESCE(p.completed_questions, 0) AS completed_questions,
                       COALESCE(p.status, c.status) AS status,
                       c.created_at, c.updated_at
                FROM listening_dictation_cards c
                LEFT JOIN user_listening_progress p ON p.card_id = c.id AND p.user_id = ?
                WHERE c.id = ?
                """;

        List<ListeningDictationCard> cards = jdbc.query(sql, (rs, rowNum) -> new ListeningDictationCard(
                rs.getString("id"),
                rs.getInt("test_number"),
                rs.getString("part"),
                rs.getString("year"),
                rs.getInt("total_questions"),
                rs.getInt("completed_questions"),
                rs.getString("status"),
                0,
                Collections.emptyList(),
                rs.getTimestamp("created_at").toInstant(),
                rs.getTimestamp("updated_at").toInstant()
        ), userId, cardId);

        if (cards.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bài nghe: " + cardId);
        }

        ListeningDictationCard card = cards.get(0);
        List<ListeningDictationQuestion> questions = getQuestionsForCard(cardId);

        return new ListeningDictationCard(
                card.id(),
                card.testNumber(),
                card.part(),
                card.year(),
                card.totalQuestions(),
                card.completedQuestions(),
                card.status(),
                0,
                questions,
                card.createdAt(),
                card.updatedAt()
        );
    }

    public List<ListeningDictationQuestion> getQuestionsForCard(String cardId) {
        String sql = """
                SELECT id, card_id, question_index, part, audio_url, image_url,
                       full_transcript, vietnamese_translation,
                       options::text AS options_json,
                       option_translations::text AS opt_trans_json,
                       correct_answer, explanation, trap_note,
                       vocab_list::text AS vocab_json
                FROM listening_dictation_questions
                WHERE card_id = ?
                ORDER BY question_index ASC
                """;

        return jdbc.query(sql, this::mapQuestion, cardId);
    }

    private ListeningDictationQuestion mapQuestion(ResultSet rs, int rowNum) throws SQLException {
        return new ListeningDictationQuestion(
                rs.getLong("id"),
                rs.getString("card_id"),
                rs.getInt("question_index"),
                rs.getString("part"),
                rs.getString("audio_url"),
                rs.getString("image_url"),
                rs.getString("full_transcript"),
                rs.getString("vietnamese_translation"),
                parseMap(rs.getString("options_json")),
                parseMap(rs.getString("opt_trans_json")),
                rs.getString("correct_answer"),
                rs.getString("explanation"),
                rs.getString("trap_note"),
                parseList(rs.getString("vocab_json"))
        );
    }

    @Transactional
    public void saveProgress(UUID userId, SaveListeningProgressRequest req) {
        if (userId == null) return;

        String upsert = """
                INSERT INTO user_listening_progress (user_id, card_id, completed_questions, total_questions, status, last_question_index, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, now())
                ON CONFLICT (user_id, card_id) DO UPDATE SET
                    completed_questions = EXCLUDED.completed_questions,
                    total_questions = EXCLUDED.total_questions,
                    status = EXCLUDED.status,
                    last_question_index = EXCLUDED.last_question_index,
                    updated_at = now()
                """;

        jdbc.update(upsert, userId, req.cardId(), req.completedQuestions(), req.totalQuestions(),
                req.status() != null ? req.status() : "Đang luyện tập", req.lastQuestionIndex());
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedInitialDataIfEmpty() {
        Integer count = jdbc.queryForObject("SELECT count(*) FROM listening_dictation_cards", Integer.class);
        if (count != null && count > 0) {
            return;
        }

        // Tạo thẻ mẫu cho Test 1 Part 1
        jdbc.update("""
                INSERT INTO listening_dictation_cards (id, test_number, part, year, total_questions, status)
                VALUES ('t1-p1', 1, 'Part 1', '2024', 6, 'Chưa bắt đầu'),
                       ('t1-p2', 1, 'Part 2', '2024', 25, 'Chưa bắt đầu'),
                       ('t1-p3', 1, 'Part 3', '2024', 39, 'Chưa bắt đầu'),
                       ('t1-p4', 1, 'Part 4', '2024', 30, 'Chưa bắt đầu'),
                       ('t2-p1', 2, 'Part 1', '2024', 6, 'Chưa bắt đầu')
                """);

        // Seed các câu hỏi mẫu cho t1-p1
        String optionsQ1 = "{\"A\":\"He's standing on a rug.\",\"B\":\"He's turning a doorknob.\",\"C\":\"He's climbing a ladder.\",\"D\":\"He's painting a wall.\"}";
        String optTransQ1 = "{\"A\":\"Anh ấy đang đứng trên một tấm thảm.\",\"B\":\"Anh ấy đang vặn nắm cửa.\",\"C\":\"Anh ấy đang leo lên một chiếc thang.\",\"D\":\"Anh ấy đang sơn một bức tường.\"}";
        String vocabQ1 = "[{\"word\":\"climb\",\"pos\":\"v\",\"level\":\"B1\",\"ipa\":\"/klaɪm/\",\"meaning\":\"leo, trèo\",\"example\":{\"en\":\"He's climbing a ladder.\",\"vi\":\"Anh ấy đang leo lên chiếc thang.\"}},{\"word\":\"ladder\",\"pos\":\"n\",\"level\":\"B1\",\"ipa\":\"/ˈlædər/\",\"meaning\":\"cái thang\",\"example\":{\"en\":\"The ladder is wooden.\",\"vi\":\"Chiếc thang làm bằng gỗ.\"}},{\"word\":\"rug\",\"pos\":\"n\",\"level\":\"B2\",\"ipa\":\"/rʌɡ/\",\"meaning\":\"tấm thảm\"}]";

        jdbc.update("""
                INSERT INTO listening_dictation_questions (card_id, question_index, part, audio_url, image_url,
                    full_transcript, vietnamese_translation, options, option_translations, correct_answer, explanation, trap_note, vocab_list)
                VALUES ('t1-p1', 0, 'Part 1', '/ets_2024_lc/audio/part1_test1.mp3',
                    'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80',
                    'He is climbing a ladder.', 'Anh ấy đang leo lên một chiếc thang.',
                    ?::jsonb, ?::jsonb, 'C',
                    'Động từ climbing a ladder mô tả chính xác hành động người đàn ông đang bước lên các bậc thang.',
                    'Quan sát kỹ: Người đàn ông không cầm chổi sơn tường hay đứng trên thảm.',
                    ?::jsonb)
                """, optionsQ1, optTransQ1, vocabQ1);

        String optionsQ2 = "{\"A\":\"Cardboard boxes are stacked neatly in the distribution warehouse.\",\"B\":\"Workers are loading cartons onto a delivery truck.\",\"C\":\"The storage shelves are completely empty.\",\"D\":\"A forklift is moving pallets across the factory.\"}";
        String optTransQ2 = "{\"A\":\"Các thùng carton đang được xếp ngay ngắn trong kho phân phối.\",\"B\":\"Công nhân đang bốc xếp các thùng lên xe tải chở hàng.\",\"C\":\"Các kệ để đồ trong kho hoàn toàn trống trơn.\",\"D\":\"Xe nâng đang di chuyển các tấm nâng hàng qua nhà máy.\"}";
        String vocabQ2 = "[{\"word\":\"cardboard\",\"pos\":\"n\",\"level\":\"B1\",\"ipa\":\"/ˈkɑːrdbɔːrd/\",\"meaning\":\"bìa các-tông\"},{\"word\":\"stack\",\"pos\":\"v\",\"level\":\"B2\",\"ipa\":\"/stæk/\",\"meaning\":\"chồng, xếp chồng lên nhau\"},{\"word\":\"warehouse\",\"pos\":\"n\",\"level\":\"B2\",\"ipa\":\"/ˈwerhaʊs/\",\"meaning\":\"kho chứa hàng\"}]";

        jdbc.update("""
                INSERT INTO listening_dictation_questions (card_id, question_index, part, audio_url, image_url,
                    full_transcript, vietnamese_translation, options, option_translations, correct_answer, explanation, trap_note, vocab_list)
                VALUES ('t1-p1', 1, 'Part 1', '/ets_2024_lc/audio/part1_test1.mp3',
                    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
                    'Cardboard boxes are stacked neatly in the distribution warehouse.', 'Các thùng carton đang được xếp ngay ngắn trong kho phân phối.',
                    ?::jsonb, ?::jsonb, 'A',
                    'Chủ ngữ boxes kết hợp với cụm stacked neatly (xếp ngay ngắn) mô tả đúng thực tế các hộp hàng trong kho.',
                    'Không có bóng dáng công nhân nào đang bốc vác hay xe nâng hàng hoạt động trong ảnh.',
                    ?::jsonb)
                """, optionsQ2, optTransQ2, vocabQ2);
    }

    private Map<String, String> parseMap(String json) {
        if (json == null || json.isBlank()) return Collections.emptyMap();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            return Collections.emptyMap();
        }
    }

    private List<Map<String, Object>> parseList(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
