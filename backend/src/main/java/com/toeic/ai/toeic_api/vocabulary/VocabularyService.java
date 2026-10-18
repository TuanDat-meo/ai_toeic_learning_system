package com.toeic.ai.toeic_api.vocabulary;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
    private final ObjectMapper objectMapper = new ObjectMapper();

    public VocabularyService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<VocabularyTestSet> listSets(String category, UUID userId) {
        String setSql = "SELECT id, title, year, category, word_count, status FROM vocabulary_test_sets ";
        List<VocabularyTestSet> sets;
        if (category != null && !category.isBlank() && !"all".equalsIgnoreCase(category)) {
            setSql += "WHERE category = ? ORDER BY id ASC";
            sets = jdbc.query(setSql, (rs, rowNum) -> mapSetSummary(rs), category);
        } else {
            setSql += "ORDER BY id ASC";
            sets = jdbc.query(setSql, (rs, rowNum) -> mapSetSummary(rs));
        }

        // Fetch words for all sets with user progress
        String wordSql = """
                SELECT w.id, w.set_id, w.word, w.ipa, w.part_of_speech, w.meaning,
                       w.example, w.example_meaning, w.level,
                       COALESCE(p.starred, w.starred) AS starred,
                       COALESCE(p.status, 'NEW') AS status
                FROM vocabulary_items w
                LEFT JOIN user_vocabulary_progress p ON p.word_id = w.id AND p.user_id = ?
                ORDER BY w.set_id, w.order_index ASC, w.id ASC
                """;

        List<VocabularyWord> allWords = jdbc.query(wordSql, (rs, rowNum) -> mapWord(rs), userId);
        Map<String, List<VocabularyWord>> wordsBySet = new HashMap<>();
        for (VocabularyWord w : allWords) {
            wordsBySet.computeIfAbsent(w.setId(), k -> new ArrayList<>()).add(w);
        }

        List<VocabularyTestSet> result = new ArrayList<>();
        for (VocabularyTestSet s : sets) {
            List<VocabularyWord> words = wordsBySet.getOrDefault(s.id(), Collections.emptyList());
            result.add(new VocabularyTestSet(
                    s.id(),
                    s.title(),
                    s.year(),
                    s.category(),
                    Math.max(s.wordCount(), words.size()),
                    s.status(),
                    words
            ));
        }
        return result;
    }

    public VocabularyTestSet getSetDetails(String setId, UUID userId) {
        List<VocabularyTestSet> sets = jdbc.query(
                "SELECT id, title, year, category, word_count, status FROM vocabulary_test_sets WHERE id = ?",
                (rs, rowNum) -> mapSetSummary(rs), setId);

        if (sets.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bộ từ vựng: " + setId);
        }

        VocabularyTestSet set = sets.get(0);
        List<VocabularyWord> words = getWordsForSet(setId, userId);
        return new VocabularyTestSet(set.id(), set.title(), set.year(), set.category(), Math.max(set.wordCount(), words.size()), set.status(), words);
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

        return jdbc.query(sql, (rs, rowNum) -> mapWord(rs), userId, setId);
    }

    @Transactional
    public VocabularyTestSet createSet(CreateSetRequest req) {
        String id = req.id() != null && !req.id().isBlank() ? req.id().trim()
                : "set-" + System.currentTimeMillis();
        String title = req.title() != null && !req.title().isBlank() ? req.title().trim() : "Bộ từ vựng mới";
        String year = req.year() != null && !req.year().isBlank() ? req.year().trim() : "2024";
        String category = req.category() != null && !req.category().isBlank() ? req.category().trim() : "2024";
        String status = formatStatus(req.status());

        jdbc.update("""
                INSERT INTO vocabulary_test_sets (id, title, year, category, word_count, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, 0, ?, now(), now())
                """, id, title, year, category, status);

        return getSetDetails(id, null);
    }

    @Transactional
    public VocabularyTestSet updateSet(String setId, UpdateSetRequest req) {
        String title = req.title() != null && !req.title().isBlank() ? req.title().trim() : "";
        String year = req.year() != null ? req.year().trim() : "2024";
        String category = req.category() != null ? req.category().trim() : "2024";
        String status = formatStatus(req.status());

        int rows = jdbc.update("""
                UPDATE vocabulary_test_sets SET
                    title = CASE WHEN ? != '' THEN ? ELSE title END,
                    year = ?,
                    category = ?,
                    status = ?,
                    updated_at = now()
                WHERE id = ?
                """, title, title, year, category, status, setId);

        if (rows == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bộ từ vựng: " + setId);
        }
        return getSetDetails(setId, null);
    }

    @Transactional
    public void deleteSet(String setId) {
        int rows = jdbc.update("DELETE FROM vocabulary_test_sets WHERE id = ?", setId);
        if (rows == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bộ từ vựng: " + setId);
        }
    }

    @Transactional
    public VocabularyWord addWord(String setId, CreateWordRequest req) {
        // Verify set exists
        Integer count = jdbc.queryForObject("SELECT count(*) FROM vocabulary_test_sets WHERE id = ?", Integer.class, setId);
        if (count == null || count == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bộ từ vựng: " + setId);
        }

        String wordId = req.id() != null && !req.id().isBlank() ? req.id().trim()
                : "w-" + System.currentTimeMillis();
        String word = req.word() != null ? req.word().trim() : "";
        String ipa = req.ipa() != null ? req.ipa().trim() : "";
        String pos = req.partOfSpeech() != null ? req.partOfSpeech().trim() : "Noun";
        String meaning = req.meaning() != null ? req.meaning().trim() : "";
        String example = req.example() != null ? req.example().trim() : "";
        String exampleMeaning = req.exampleMeaning() != null ? req.exampleMeaning().trim() : "";
        String level = formatLevel(req.level());

        Integer maxOrder = jdbc.queryForObject("SELECT COALESCE(MAX(order_index) + 1, 0) FROM vocabulary_items WHERE set_id = ?", Integer.class, setId);
        int orderIndex = maxOrder != null ? maxOrder : 0;

        jdbc.update("""
                INSERT INTO vocabulary_items (id, set_id, word, ipa, part_of_speech, meaning, example, example_meaning, level, starred, order_index, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, false, ?, now(), now())
                """, wordId, setId, word, ipa, pos, meaning, example, exampleMeaning, level, orderIndex);

        jdbc.update("UPDATE vocabulary_test_sets SET word_count = (SELECT count(*) FROM vocabulary_items WHERE set_id = ?), updated_at = now() WHERE id = ?", setId, setId);

        return new VocabularyWord(wordId, setId, word, ipa, pos, meaning, example, exampleMeaning, level, false, "NEW");
    }

    @Transactional
    public VocabularyWord updateWord(String wordId, UpdateWordRequest req) {
        String word = req.word() != null ? req.word().trim() : "";
        String ipa = req.ipa() != null ? req.ipa().trim() : "";
        String pos = req.partOfSpeech() != null ? req.partOfSpeech().trim() : "";
        String meaning = req.meaning() != null ? req.meaning().trim() : "";
        String example = req.example() != null ? req.example().trim() : "";
        String exampleMeaning = req.exampleMeaning() != null ? req.exampleMeaning().trim() : "";
        String level = formatLevel(req.level());

        int rows = jdbc.update("""
                UPDATE vocabulary_items SET
                    word = CASE WHEN ? != '' THEN ? ELSE word END,
                    ipa = ?,
                    part_of_speech = ?,
                    meaning = ?,
                    example = ?,
                    example_meaning = ?,
                    level = ?,
                    updated_at = now()
                WHERE id = ?
                """, word, word, ipa, pos, meaning, example, exampleMeaning, level, wordId);

        if (rows == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy từ vựng: " + wordId);
        }

        List<VocabularyWord> found = jdbc.query("SELECT id, set_id, word, ipa, part_of_speech, meaning, example, example_meaning, level, starred, 'NEW' AS status FROM vocabulary_items WHERE id = ?", (rs, rowNum) -> mapWord(rs), wordId);
        return found.get(0);
    }

    @Transactional
    public void deleteWord(String wordId) {
        List<String> setIds = jdbc.query("SELECT set_id FROM vocabulary_items WHERE id = ?", (rs, rowNum) -> rs.getString("set_id"), wordId);
        if (setIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy từ vựng: " + wordId);
        }
        String setId = setIds.get(0);
        jdbc.update("DELETE FROM vocabulary_items WHERE id = ?", wordId);
        jdbc.update("UPDATE vocabulary_test_sets SET word_count = (SELECT count(*) FROM vocabulary_items WHERE set_id = ?), updated_at = now() WHERE id = ?", setId, setId);
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

    @Transactional
    public void syncFromImportItem(JsonNode data) {
        if (data == null) return;
        String word = data.path("word").asText("").trim();
        String meaning = data.path("meaning").asText("").trim();
        if (word.isBlank() || meaning.isBlank()) return;

        String pos = data.has("pos") && !data.path("pos").asText("").isBlank()
                ? data.path("pos").asText("").trim()
                : data.path("partOfSpeech").asText("Noun").trim();
        String ipa = data.path("ipa").asText("").trim();
        String example = data.has("example") && !data.path("example").asText("").isBlank()
                ? data.path("example").asText("").trim()
                : data.path("exampleEn").asText("").trim();
        String exampleMeaning = data.path("exampleVi").asText("").trim();
        String level = formatLevel(data.path("level").asText("B1"));
        String topic = data.has("topic") && !data.path("topic").asText("").isBlank()
                ? data.path("topic").asText("").trim()
                : data.path("category").asText("").trim();

        // Target set resolution
        String setId;
        if (data.has("setId") && !data.path("setId").asText("").isBlank()) {
            setId = data.path("setId").asText("").trim();
        } else if (!topic.isBlank()) {
            // Find set by topic or category
            List<String> foundSets = jdbc.query(
                    "SELECT id FROM vocabulary_test_sets WHERE LOWER(category) = LOWER(?) OR LOWER(title) LIKE LOWER(?) LIMIT 1",
                    (rs, rowNum) -> rs.getString("id"),
                    topic, "%" + topic + "%");
            if (!foundSets.isEmpty()) {
                setId = foundSets.get(0);
            } else {
                setId = "set-" + slugify(topic);
                String title = "Từ vựng: " + topic;
                jdbc.update("""
                        INSERT INTO vocabulary_test_sets (id, title, year, category, word_count, status, created_at, updated_at)
                        VALUES (?, ?, '2024', ?, 0, 'PUBLISHED', now(), now())
                        ON CONFLICT (id) DO NOTHING
                        """, setId, title, topic);
            }
        } else {
            setId = "ets2024-t1";
        }

        // Ensure target set exists in vocabulary_test_sets to satisfy foreign key constraint
        jdbc.update("""
                INSERT INTO vocabulary_test_sets (id, title, year, category, word_count, status, created_at, updated_at)
                VALUES (?, ?, '2024', 'General', 0, 'PUBLISHED', now(), now())
                ON CONFLICT (id) DO NOTHING
                """, setId, "Bộ từ vựng: " + setId);

        // Upsert into vocabulary_items
        List<String> existing = jdbc.query(
                "SELECT id FROM vocabulary_items WHERE set_id = ? AND LOWER(word) = LOWER(?) LIMIT 1",
                (rs, rowNum) -> rs.getString("id"),
                setId, word);

        if (!existing.isEmpty()) {
            String wordId = existing.get(0);
            jdbc.update("""
                    UPDATE vocabulary_items SET
                        ipa = COALESCE(NULLIF(?, ''), ipa),
                        part_of_speech = COALESCE(NULLIF(?, ''), part_of_speech),
                        meaning = ?,
                        example = COALESCE(NULLIF(?, ''), example),
                        example_meaning = COALESCE(NULLIF(?, ''), example_meaning),
                        level = ?,
                        updated_at = now()
                    WHERE id = ?
                    """, ipa, pos, meaning, example, exampleMeaning, level, wordId);
        } else {
            String wordId = "w-" + slugify(word) + "-" + UUID.randomUUID().toString().substring(0, 8);
            jdbc.update("""
                    INSERT INTO vocabulary_items (id, set_id, word, ipa, part_of_speech, meaning, example, example_meaning, level, starred, order_index, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, false, (SELECT COALESCE(MAX(order_index) + 1, 0) FROM vocabulary_items WHERE set_id = ?), now(), now())
                    """, wordId, setId, word, ipa, pos, meaning, example, exampleMeaning, level, setId);
        }

        // Update word count
        jdbc.update("UPDATE vocabulary_test_sets SET word_count = (SELECT count(*) FROM vocabulary_items WHERE set_id = ?), updated_at = now() WHERE id = ?", setId, setId);
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedInitialDataIfEmpty() {
        Integer count = jdbc.queryForObject("SELECT count(*) FROM vocabulary_test_sets", Integer.class);
        if (count == null || count == 0) {
            jdbc.update("""
                    INSERT INTO vocabulary_test_sets (id, title, year, category, word_count, status)
                    VALUES ('ets2024-t1', 'ETS 2024 - Test 1 Vocabulary', '2024', '2024', 8, 'PUBLISHED'),
                           ('ets2024-t2', 'ETS 2024 - Test 2 Vocabulary', '2024', '2024', 8, 'PUBLISHED'),
                           ('600-essential', '600 Từ Vựng Thiết Yếu Cho TOEIC', '2024', '600_essential', 10, 'PUBLISHED')
                    """);

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

        // Also sync any published VOCABULARY rows from imported_content
        try {
            List<String> publishedJson = jdbc.query(
                    "SELECT payload_json::text FROM imported_content WHERE content_type = 'VOCABULARY'",
                    (rs, rowNum) -> rs.getString(1));
            for (String json : publishedJson) {
                try {
                    JsonNode node = objectMapper.readTree(json);
                    syncFromImportItem(node);
                } catch (Exception ignored) {}
            }
        } catch (Exception ignored) {}
    }

    private VocabularyTestSet mapSetSummary(ResultSet rs) throws SQLException {
        return new VocabularyTestSet(
                rs.getString("id"),
                rs.getString("title"),
                rs.getString("year"),
                rs.getString("category"),
                rs.getInt("word_count"),
                rs.getString("status"),
                Collections.emptyList()
        );
    }

    private VocabularyWord mapWord(ResultSet rs) throws SQLException {
        return new VocabularyWord(
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
        );
    }

    private String formatLevel(String level) {
        if (level == null || level.isBlank()) return "B1";
        String upper = level.trim().toUpperCase(Locale.ROOT);
        if (upper.equals("EASY") || upper.equals("A1")) return "A1";
        if (upper.equals("A2")) return "A2";
        if (upper.equals("B1") || upper.equals("MEDIUM")) return "B1";
        if (upper.equals("B2") || upper.equals("HARD")) return "B2";
        if (upper.equals("C1")) return "C1";
        if (upper.equals("C2")) return "C2";
        return "B1";
    }

    private String formatStatus(String status) {
        if (status == null || status.isBlank()) return "PUBLISHED";
        String upper = status.trim().toUpperCase(Locale.ROOT);
        if (upper.equals("DRAFT") || upper.equals("PUBLISHED") || upper.equals("ARCHIVED")) {
            return upper;
        }
        return "PUBLISHED";
    }

    private String slugify(String input) {
        if (input == null) return "";
        String normalized = java.text.Normalizer.normalize(input, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        return normalized.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
    }

    public record VocabularyTestSet(
            String id,
            String title,
            String year,
            String category,
            int wordCount,
            String status,
            List<VocabularyWord> words
    ) {}

    public record VocabularyWord(
            String id,
            String setId,
            String word,
            String ipa,
            String partOfSpeech,
            String meaning,
            String example,
            String exampleMeaning,
            String level,
            boolean starred,
            String status
    ) {}

    public record CreateSetRequest(
            String id,
            String title,
            String year,
            String category,
            String status
    ) {}

    public record UpdateSetRequest(
            String title,
            String year,
            String category,
            String status
    ) {}

    public record CreateWordRequest(
            String id,
            String word,
            String ipa,
            String partOfSpeech,
            String meaning,
            String example,
            String exampleMeaning,
            String level
    ) {}

    public record UpdateWordRequest(
            String word,
            String ipa,
            String partOfSpeech,
            String meaning,
            String example,
            String exampleMeaning,
            String level
    ) {}
}
