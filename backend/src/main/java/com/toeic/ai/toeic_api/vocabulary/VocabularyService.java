package com.toeic.ai.toeic_api.vocabulary;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class VocabularyService {

    private final JdbcTemplate jdbc;

    public VocabularyService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<VocabularyTestSet> listSets(String category) {
        String sql = "SELECT id, title, year, category, word_count FROM vocabulary_test_sets ";
        if (category != null && !category.isBlank() && !"all".equalsIgnoreCase(category)) {
            sql += "WHERE category = ? ORDER BY id ASC";
            return jdbc.query(sql, this::mapSetSummary, category);
        } else {
            sql += "ORDER BY id ASC";
            return jdbc.query(sql, this::mapSetSummary);
        }
    }

    public VocabularyTestSet getSetDetails(String setId, UUID userId) {
        List<VocabularyTestSet> sets = jdbc.query(
                "SELECT id, title, year, category, word_count FROM vocabulary_test_sets WHERE id = ?",
                this::mapSetSummary, setId);

        if (sets.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bộ từ vựng: " + setId);
        }

        VocabularyTestSet set = sets.get(0);
        List<VocabularyWord> words = getWordsForSet(setId, userId);
        return new VocabularyTestSet(set.id(), set.title(), set.year(), set.category(), set.wordCount(), words);
    }

    public List<VocabularyWord> getWordsForSet(String setId, UUID userId) {
        String sql = """
                SELECT w.id, w.set_id, w.word, w.ipa, w.part_of_speech, w.meaning,
                       w.example, w.example_meaning, w.level,
                       COALESCE(p.starred, w.starred) AS starred,
                       COALESCE(p.status, 'NEW') AS status
                FROM vocabulary_items w
                LEFT JOIN user_vocabulary_progress p ON p.word_id = w.id AND p.user_id = ?
                WHERE w.set_id = ?
                ORDER BY w.order_index ASC, w.id ASC
                """;

        return jdbc.query(sql, (rs, rowNum) -> new VocabularyWord(
                rs.getString("id"),
                rs.getString("set_id"),
                rs.getString("word"),
                rs.getString("ipa"),
                rs.getString("part_of_speech"),
                rs.getString("meaning"),
                rs.getString("example"),
                rs.getString("example_meaning"),
                rs.getString("level"),
                rs.getBoolean("starred"),
                rs.getString("status")
        ), userId, setId);
    }

    @Transactional
    public void toggleStar(String wordId, UUID userId) {
        if (userId == null) return;

        String upsert = """
                INSERT INTO user_vocabulary_progress (user_id, word_id, status, starred, updated_at)
                VALUES (?, ?, 'LEARNING', true, now())
                ON CONFLICT (user_id, word_id) DO UPDATE SET
                    starred = NOT user_vocabulary_progress.starred,
                    updated_at = now()
                """;
        jdbc.update(upsert, userId, wordId);
    }

    @Transactional
    public void updateWordStatus(String wordId, String status, UUID userId) {
        if (userId == null) return;

        String upsert = """
                INSERT INTO user_vocabulary_progress (user_id, word_id, status, starred, review_count, last_reviewed_at, updated_at)
                VALUES (?, ?, ?, false, 1, now(), now())
                ON CONFLICT (user_id, word_id) DO UPDATE SET
                    status = EXCLUDED.status,
                    review_count = user_vocabulary_progress.review_count + 1,
                    last_reviewed_at = now(),
                    updated_at = now()
                """;
        jdbc.update(upsert, userId, wordId, status);
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedInitialDataIfEmpty() {
        Integer count = jdbc.queryForObject("SELECT count(*) FROM vocabulary_test_sets", Integer.class);
        if (count != null && count > 0) {
            return;
        }

        // Tạo bộ từ vựng ETS 2024 Test 1 -> 10 & 600 Essential Words
        jdbc.update("""
                INSERT INTO vocabulary_test_sets (id, title, year, category, word_count)
                VALUES ('ets2024-t1', 'ETS 2024 - Test 1 Vocabulary', '2024', '2024', 8),
                       ('ets2024-t2', 'ETS 2024 - Test 2 Vocabulary', '2024', '2024', 8),
                       ('600-essential', '600 Từ Vựng Thiết Yếu Cho TOEIC', '2024', '600_essential', 10)
                """);

        // Seed từ vựng cho ets2024-t1
        String[][] wordsT1 = {
            {"w-1", "negotiate", "/nəˈɡoʊʃieɪt/", "Verb", "Đàm phán, thương lượng hợp đồng", "The executive team successfully negotiated a lucrative distribution agreement.", "Ban điều hành đã thương lượng thành công thỏa thuận phân phối.", "B2", "true"},
            {"w-2", "invoice", "/ˈɪnvɔɪs/", "Noun", "Hóa đơn thanh toán hàng hóa", "All invoices must be submitted to the finance department by the end of each month.", "Tất cả hóa đơn phải được nộp cho bộ phận tài chính vào cuối tháng.", "B1", "false"},
            {"w-3", "implement", "/ˈɪmplɪment/", "Verb", "Triển khai, thực thi chính sách mới", "We plan to implement the revised safety protocol starting next Monday.", "Chúng tôi dự định thực thi quy trình an toàn đã sửa đổi vào thứ Hai tới.", "B2", "false"},
            {"w-4", "itinerary", "/aɪˈtɪnəreri/", "Noun", "Lịch trình chuyến đi công tác", "The corporate travel coordinator emailed the complete flight itinerary.", "Điều phối viên đã gửi email lịch trình chuyến bay đầy đủ.", "B1", "false"},
            {"w-5", "warranty", "/ˈwɔːrənti/", "Noun", "Phiếu bảo hành chất lượng sản phẩm", "The commercial air conditioner is covered by an extensive three-year warranty.", "Máy điều hòa thương mại được bảo hành toàn diện trong 3 năm.", "B1", "true"},
            {"w-6", "collaborate", "/kəˈlæbəreɪt/", "Verb", "Hợp tác làm việc cùng nhau", "Our graphic designers collaborate closely with the copywriters on every ad campaign.", "Các nhà thiết kế đồ họa hợp tác chặt chẽ với người viết lời quảng cáo.", "B2", "false"},
            {"w-7", "revenue", "/ˈrevənuː/", "Noun", "Doanh thu của doanh nghiệp", "Annual revenue increased by fifteen percent following the expansion into overseas markets.", "Doanh thu hàng năm tăng 15% sau khi mở rộng ra thị trường nước ngoài.", "B2", "true"},
            {"w-8", "specifications", "/ˌspesɪfɪˈkeɪʃnz/", "Noun", "Thông số kỹ thuật chi tiết", "Engineers verified that the prototype strictly met all manufacturing specifications.", "Các kỹ sư xác nhận rằng mẫu thử nghiệm đáp ứng nghiêm ngặt thông số kỹ thuật.", "B2", "false"}
        };

        for (int i = 0; i < wordsT1.length; i++) {
            String[] w = wordsT1[i];
            jdbc.update("""
                    INSERT INTO vocabulary_items (id, set_id, word, ipa, part_of_speech, meaning, example, example_meaning, level, starred, order_index)
                    VALUES (?, 'ets2024-t1', ?, ?, ?, ?, ?, ?, ?, ?::boolean, ?)
                    """, w[0], w[1], w[2], w[3], w[4], w[5], w[6], w[7], Boolean.parseBoolean(w[8]), i);
        }
    }

    private VocabularyTestSet mapSetSummary(ResultSet rs, int rowNum) throws SQLException {
        return new VocabularyTestSet(
                rs.getString("id"),
                rs.getString("title"),
                rs.getString("year"),
                rs.getString("category"),
                rs.getInt("word_count"),
                Collections.emptyList()
        );
    }
}
