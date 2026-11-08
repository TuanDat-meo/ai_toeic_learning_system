package com.toeic.ai.toeic_api.vocabulary;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
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
        return listSets(category, userId, false);
    }

    public List<VocabularyTestSet> listSets(String category, UUID userId, boolean includeUnpublished) {
        StringBuilder setSql = new StringBuilder(
                "SELECT id, title, year, category, word_count, status, release_at FROM vocabulary_test_sets WHERE 1=1");
        List<Object> setArgs = new ArrayList<>();
        if (category != null && !category.isBlank() && !"all".equalsIgnoreCase(category)) {
            setSql.append(" AND category = ?");
            setArgs.add(category);
        }
        if (!includeUnpublished) {
            setSql.append(" AND status = 'PUBLISHED' AND (release_at IS NULL OR release_at <= now())");
        }
        setSql.append(" ORDER BY id ASC");
        List<VocabularyTestSet> sets = jdbc.query(setSql.toString(), (rs, rowNum) -> mapSetSummary(rs), setArgs.toArray());

        // Fetch words for all sets with user progress
        String wordSql = """
                SELECT w.id, w.set_id, w.word, w.ipa, w.part_of_speech, w.meaning,
                       w.meaning_source, w.meaning_edited,
                       w.example, w.example_meaning, w.level,
                       w.audio_url, w.audio_region, w.word_family,
                       COALESCE(p.starred, w.starred) AS starred,
                       COALESCE(p.status, 'NEW') AS status
                FROM vocabulary_items w
                LEFT JOIN user_vocabulary_progress p ON p.word_id = w.id AND p.user_id = ?
                ORDER BY w.set_id, w.order_index ASC, w.id ASC
                """;

        List<VocabularyWord> allWords = loadSenses(jdbc.query(wordSql, (rs, rowNum) -> mapWord(rs), userId));
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
                    words.size(),
                    s.status(),
                    s.releaseAt(),
                    words
            ));
        }
        return result;
    }

    public VocabularyTestSet getSetDetails(String setId, UUID userId) {
        return getSetDetails(setId, userId, false);
    }

    public VocabularyTestSet getSetDetails(String setId, UUID userId, boolean includeUnpublished) {
        String query = "SELECT id, title, year, category, word_count, status, release_at "
                + "FROM vocabulary_test_sets WHERE id = ?";
        if (!includeUnpublished) {
            query += " AND status = 'PUBLISHED' AND (release_at IS NULL OR release_at <= now())";
        }
        List<VocabularyTestSet> sets = jdbc.query(
                query, (rs, rowNum) -> mapSetSummary(rs), setId);

        if (sets.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bộ từ vựng: " + setId);
        }

        VocabularyTestSet set = sets.get(0);
        List<VocabularyWord> words = getWordsForSet(setId, userId);
        return new VocabularyTestSet(set.id(), set.title(), set.year(), set.category(), words.size(),
                set.status(), set.releaseAt(), words);
    }

    public List<VocabularyWord> getWordsForSet(String setId, UUID userId) {
        String sql = """
                SELECT w.id, w.set_id, w.word, w.ipa, w.part_of_speech, w.meaning,
                       w.meaning_source, w.meaning_edited,
                       w.example, w.example_meaning, w.level,
                       w.audio_url, w.audio_region, w.word_family,
                       COALESCE(p.starred, w.starred) AS starred,
                       COALESCE(p.status, 'NEW') AS status
                FROM vocabulary_items w
                LEFT JOIN user_vocabulary_progress p ON p.word_id = w.id AND p.user_id = ?
                WHERE w.set_id = ?
                ORDER BY w.order_index ASC, w.id ASC
                """;

        return loadSenses(jdbc.query(sql, (rs, rowNum) -> mapWord(rs), userId, setId));
    }

    @Transactional
    public VocabularyTestSet createSet(CreateSetRequest req) {
        String id = req.id() != null && !req.id().isBlank() ? req.id().trim()
                : "set-" + System.currentTimeMillis();
        String title = req.title() != null && !req.title().isBlank() ? req.title().trim() : "Bộ từ vựng mới";
        String year = req.year() != null && !req.year().isBlank() ? req.year().trim() : "2024";
        String category = req.category() != null && !req.category().isBlank() ? req.category().trim() : "2024";
        String status = formatStatus(req.status());
        Timestamp releaseAt = parseReleaseAt(req.releaseAt());

        jdbc.update("""
                INSERT INTO vocabulary_test_sets (id, title, year, category, word_count, status, release_at, created_at, updated_at)
                VALUES (?, ?, ?, ?, 0, ?, ?, now(), now())
                """, id, title, year, category, status, releaseAt);

        return getSetDetails(id, null, true);
    }

    @Transactional
    public VocabularyTestSet updateSet(String setId, UpdateSetRequest req) {
        String title = req.title() != null && !req.title().isBlank() ? req.title().trim() : "";
        String year = req.year() != null ? req.year().trim() : "2024";
        String category = req.category() != null ? req.category().trim() : "2024";
        String status = formatStatus(req.status());
        Timestamp releaseAt = parseReleaseAt(req.releaseAt());

        int rows = jdbc.update("""
                UPDATE vocabulary_test_sets SET
                    title = CASE WHEN ? != '' THEN ? ELSE title END,
                    year = ?,
                    category = ?,
                    status = ?,
                    release_at = ?,
                    updated_at = now()
                WHERE id = ?
                """, title, title, year, category, status, releaseAt, setId);

        if (rows == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bộ từ vựng: " + setId);
        }
        return getSetDetails(setId, null, true);
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
        List<VocabularySenseInput> senses = normalizeSenses(req.senses(), pos, req.subCategory(), req.meaning(),
                req.example(), req.exampleMeaning());
        VocabularySenseInput primarySense = senses.get(0);
        pos = primarySense.partOfSpeech();
        String meaning = primarySense.meaning();
        String meaningSource = formatMeaningSource(req.meaningSource());
        boolean meaningEdited = Boolean.TRUE.equals(req.meaningEdited());
        String example = primarySense.example();
        String exampleMeaning = req.exampleMeaning() != null ? req.exampleMeaning().trim() : "";
        String audioUrl = req.audioUrl() != null ? req.audioUrl().trim() : "";
        String audioRegion = normalizeAudioRegion(req.audioRegion());
        String wordFamily = req.wordFamily() != null ? req.wordFamily().trim() : "";
        String level = formatLevel(req.level());

        List<String> existingWordIds = jdbc.query(
                """
                SELECT id FROM vocabulary_items
                WHERE set_id = ? AND LOWER(TRIM(word)) = LOWER(TRIM(?))
                ORDER BY order_index, id
                LIMIT 1
                """,
                (rs, rowNum) -> rs.getString("id"),
                setId, word);
        if (!existingWordIds.isEmpty()) {
            String existingWordId = existingWordIds.get(0);
            jdbc.update("""
                    UPDATE vocabulary_items SET
                        ipa = COALESCE(NULLIF(ipa, ''), ?),
                        audio_url = COALESCE(NULLIF(audio_url, ''), ?),
                        audio_region = CASE WHEN audio_region IS NULL OR audio_region = 'UNKNOWN' THEN ? ELSE audio_region END,
                        word_family = COALESCE(NULLIF(word_family, ''), ?),
                        updated_at = now()
                    WHERE id = ?
                    """, ipa, audioUrl, audioRegion, wordFamily, existingWordId);
            for (VocabularySenseInput sense : senses) {
                upsertSense(existingWordId, sense.partOfSpeech(), sense.subCategory(), sense.meaning(),
                        sense.example(), sense.exampleMeaning(), sense.synonyms(), sense.antonyms());
            }
            addRelatedForms(existingWordId, req.relatedForms());
            return getWordsForSet(setId, null).stream()
                    .filter(existing -> existing.id().equals(existingWordId))
                    .findFirst()
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.INTERNAL_SERVER_ERROR, "Không thể tải từ vựng vừa được cập nhật."));
        }

        Integer maxOrder = jdbc.queryForObject("SELECT COALESCE(MAX(order_index) + 1, 0) FROM vocabulary_items WHERE set_id = ?", Integer.class, setId);
        int orderIndex = maxOrder != null ? maxOrder : 0;

        jdbc.update("""
                INSERT INTO vocabulary_items (id, set_id, word, ipa, part_of_speech, meaning, meaning_source, meaning_edited, example, example_meaning, level, audio_url, audio_region, word_family, starred, order_index, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, false, ?, now(), now())
                """, wordId, setId, word, ipa, pos, meaning, meaningSource, meaningEdited,
                example, exampleMeaning, level, audioUrl, audioRegion, wordFamily, orderIndex);
        replaceSenses(wordId, senses);
        replaceRelatedForms(wordId, req.relatedForms());

        jdbc.update("UPDATE vocabulary_test_sets SET word_count = (SELECT count(*) FROM vocabulary_items WHERE set_id = ?), updated_at = now() WHERE id = ?", setId, setId);

        return getWordsForSet(setId, null).stream()
                .filter(created -> created.id().equals(wordId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR, "Không thể tải từ vựng vừa tạo."));
    }

    @Transactional
    public VocabularyWord updateWord(String wordId, UpdateWordRequest req) {
        String word = req.word() != null ? req.word().trim() : "";
        String ipa = req.ipa() != null ? req.ipa().trim() : "";
        String pos = req.partOfSpeech() != null ? req.partOfSpeech().trim() : "";
        List<VocabularySenseInput> senses = normalizeSenses(req.senses(), pos, req.subCategory(), req.meaning(),
                req.example(), req.exampleMeaning());
        VocabularySenseInput primarySense = senses.get(0);
        pos = primarySense.partOfSpeech();
        String meaning = primarySense.meaning();
        String meaningSource = req.meaningSource() == null || req.meaningSource().isBlank()
                ? null : formatMeaningSource(req.meaningSource());
        Boolean meaningEdited = req.meaningEdited();
        String example = primarySense.example();
        String exampleMeaning = req.exampleMeaning() != null ? req.exampleMeaning().trim() : "";
        String audioUrl = req.audioUrl() != null ? req.audioUrl().trim() : "";
        String audioRegion = normalizeAudioRegion(req.audioRegion());
        String wordFamily = req.wordFamily() != null ? req.wordFamily().trim() : "";
        String level = formatLevel(req.level());

        int rows = jdbc.update("""
                UPDATE vocabulary_items SET
                    word = CASE WHEN ? != '' THEN ? ELSE word END,
                    ipa = ?,
                    part_of_speech = ?,
                    meaning = ?,
                    meaning_source = COALESCE(?, meaning_source),
                    meaning_edited = COALESCE(?, meaning_edited),
                    example = ?,
                    example_meaning = ?,
                    level = ?,
                    audio_url = ?,
                    audio_region = ?,
                    word_family = ?,
                    updated_at = now()
                WHERE id = ?
                """, word, word, ipa, pos, meaning, meaningSource, meaningEdited,
                example, exampleMeaning, level, audioUrl, audioRegion, wordFamily, wordId);

        if (rows == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy từ vựng: " + wordId);
        }

        replaceSenses(wordId, senses);
        if (req.relatedForms() != null) {
            replaceRelatedForms(wordId, req.relatedForms());
        }
        List<VocabularyWord> found = jdbc.query("SELECT id, set_id, word, ipa, part_of_speech, meaning, meaning_source, meaning_edited, example, example_meaning, level, audio_url, audio_region, word_family, starred, 'NEW' AS status FROM vocabulary_items WHERE id = ?", (rs, rowNum) -> mapWord(rs), wordId);
        return loadSenses(found).get(0);
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
        List<VocabularySenseInput> importedSenses = readImportedSenses(data.path("senses"));
        String meaning = data.path("meaning").asText("").trim();
        if (!importedSenses.isEmpty()) {
            meaning = importedSenses.get(0).meaning();
        }
        String meaningSource = formatMeaningSource(data.path("meaningSource").asText("EDITOR"));
        boolean meaningEdited = data.path("meaningEdited").asBoolean(false);
        if (word.isBlank() || meaning.isBlank()) return;

        String pos = VocabularyPartOfSpeech.normalize(data.has("pos") && !data.path("pos").asText("").isBlank()
                ? data.path("pos").asText("")
                : data.path("partOfSpeech").asText("Noun"));
        if (!importedSenses.isEmpty()) {
            pos = importedSenses.get(0).partOfSpeech();
        }
        String ipa = data.path("ipa").asText("").trim();
        String example = data.has("example") && !data.path("example").asText("").isBlank()
                ? data.path("example").asText("").trim()
                : data.path("exampleEn").asText("").trim();
        if (!importedSenses.isEmpty()) {
            example = importedSenses.get(0).example();
        }
        String exampleMeaning = data.path("exampleVi").asText("").trim();
        String audioUrl = data.path("audioUrl").asText("").trim();
        String subCategory = data.path("subCategory").asText(data.path("sub_category").asText("")).trim();
        if (!importedSenses.isEmpty()) {
            subCategory = importedSenses.get(0).subCategory();
        }
        String wordFamily = data.path("wordFamily").asText(data.path("word_family").asText("")).trim();
        String level = formatLevel(data.path("level").asText("B1"));
        String topic = data.has("topic") && !data.path("topic").asText("").isBlank()
                ? data.path("topic").asText("").trim()
                : data.path("category").asText("").trim();

        // Target set resolution
        String setId;
        if (data.has("setId") && !data.path("setId").asText("").isBlank()) {
            String rawId = data.path("setId").asText("").trim();
            if (rawId.matches("^\\d+$")) {
                int num = Integer.parseInt(rawId);
                setId = String.format("set-%02d", num);
            } else if (rawId.startsWith("SET_")) {
                setId = rawId.toLowerCase(Locale.ROOT).replace('_', '-');
            } else {
                setId = rawId;
            }
        } else if (!topic.isBlank()) {
            // Match explicit topic metadata only; substring matches can route words to an unrelated set.
            List<String> foundSets = jdbc.query(
                    """
                    SELECT id FROM vocabulary_test_sets
                    WHERE LOWER(category) = LOWER(?)
                       OR LOWER(title) = LOWER(?)
                       OR LOWER(title) = LOWER(?)
                    ORDER BY CASE WHEN LOWER(category) = LOWER(?) THEN 0 ELSE 1 END
                    LIMIT 1
                    """,
                    (rs, rowNum) -> rs.getString("id"),
                    topic, topic, "Từ vựng: " + topic, topic);
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

        // Determine title and category for the test set
        String setTitle = "Bộ từ vựng: " + setId;
        String setCategory = "General";
        if (data.has("category") && !data.path("category").asText("").isBlank()) {
            setTitle = data.path("category").asText("").trim();
        } else if (data.has("setName") && !data.path("setName").asText("").isBlank()) {
            setTitle = data.path("setName").asText("").trim();
        }

        if (setId.startsWith("set-")) {
            String numPart = setId.replaceAll("[^0-9]", "");
            if (!numPart.isEmpty()) {
                int idNum = Integer.parseInt(numPart);
                if (idNum >= 1 && idNum <= 3) setCategory = "corporate";
                else if (idNum >= 4 && idNum <= 6) setCategory = "finance_marketing";
                else if (idNum >= 7 && idNum <= 10) setCategory = "commerce_production";
                else if (idNum >= 11 && idNum <= 15) setCategory = "office_travel";
                else if (idNum >= 16 && idNum <= 20) setCategory = "tech_services";
            }
        }

        // Ensure target set exists in vocabulary_test_sets to satisfy foreign key constraint
        jdbc.update("""
                INSERT INTO vocabulary_test_sets (id, title, year, category, word_count, status, created_at, updated_at)
                VALUES (?, ?, '2024', ?, 0, 'PUBLISHED', now(), now())
                ON CONFLICT (id) DO UPDATE SET
                    title = CASE WHEN vocabulary_test_sets.title LIKE 'Bộ từ vựng: %' AND EXCLUDED.title NOT LIKE 'Bộ từ vựng: %' THEN EXCLUDED.title ELSE vocabulary_test_sets.title END,
                    category = CASE WHEN vocabulary_test_sets.category = 'General' AND EXCLUDED.category <> 'General' THEN EXCLUDED.category ELSE vocabulary_test_sets.category END,
                    updated_at = now()
                """, setId, setTitle, setCategory);

        // Upsert into vocabulary_items
        boolean createSeparateMeaning = "CREATE_NEW".equals(data.path("duplicateResolution").asText());
        List<String> existing = createSeparateMeaning ? List.of() : jdbc.query(
                """
                SELECT id FROM vocabulary_items
                WHERE set_id = ? AND LOWER(TRIM(word)) = LOWER(TRIM(?))
                ORDER BY order_index, id
                LIMIT 1
                """,
                (rs, rowNum) -> rs.getString("id"),
                setId, word);

        String wordId;
        if (!existing.isEmpty()) {
            wordId = existing.get(0);
            jdbc.update("""
                    UPDATE vocabulary_items SET
                        ipa = COALESCE(NULLIF(?, ''), ipa),
                        part_of_speech = COALESCE(NULLIF(?, ''), part_of_speech),
                        meaning = ?,
                        meaning_source = ?,
                        meaning_edited = ?,
                        example = COALESCE(NULLIF(?, ''), example),
                        example_meaning = COALESCE(NULLIF(?, ''), example_meaning),
                        level = ?,
                        audio_url = COALESCE(NULLIF(?, ''), audio_url),
                        word_family = COALESCE(NULLIF(?, ''), word_family),
                        updated_at = now()
                    WHERE id = ?
                    """, ipa, pos, meaning, meaningSource, meaningEdited, example, exampleMeaning, level, audioUrl, wordFamily, wordId);
        } else {
            String wordSlug = slugify(word);
            wordId = "w-" + wordSlug.substring(0, Math.min(wordSlug.length(), 53))
                    + "-" + UUID.randomUUID().toString().substring(0, 8);
            jdbc.update("""
                    INSERT INTO vocabulary_items (id, set_id, word, ipa, part_of_speech, meaning, meaning_source, meaning_edited, example, example_meaning, level, audio_url, word_family, starred, order_index, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, false, (SELECT COALESCE(MAX(order_index) + 1, 0) FROM vocabulary_items WHERE set_id = ?), now(), now())
                    """, wordId, setId, word, ipa, pos, meaning, meaningSource, meaningEdited, example, exampleMeaning, level, audioUrl, wordFamily, setId);
        }
        if (importedSenses.isEmpty()) {
            upsertSense(wordId, pos, subCategory, meaning, example, exampleMeaning, "", "");
        } else {
            for (VocabularySenseInput sense : importedSenses) {
                upsertSense(wordId, sense.partOfSpeech(), sense.subCategory(), sense.meaning(),
                        sense.example(), sense.exampleMeaning(), sense.synonyms(), sense.antonyms());
            }
        }

        // Update word count
        jdbc.update("UPDATE vocabulary_test_sets SET word_count = (SELECT count(*) FROM vocabulary_items WHERE set_id = ?), updated_at = now() WHERE id = ?", setId, setId);
    }

    private List<VocabularySenseInput> readImportedSenses(JsonNode sensesNode) {
        if (sensesNode == null || !sensesNode.isArray()) {
            return List.of();
        }
        List<VocabularySenseInput> senses = new ArrayList<>();
        for (JsonNode sense : sensesNode) {
            if (!sense.isObject()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Mỗi nghĩa trong senses phải là một object.");
            }
            String partOfSpeech = VocabularyPartOfSpeech.normalize(sense.path("partOfSpeech")
                    .asText(sense.path("part_of_speech").asText(sense.path("pos").asText(""))));
            String meaning = sense.path("meaning")
                    .asText(sense.path("meaningVi").asText(sense.path("meaning_vi").asText(""))).trim();
            if (partOfSpeech.isBlank() || meaning.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Mỗi nghĩa cần có từ loại và nghĩa tiếng Việt.");
            }
            senses.add(new VocabularySenseInput(
                    partOfSpeech,
                    sense.path("subCategory").asText(sense.path("sub_category").asText("")).trim(),
                    meaning,
                    sense.path("example").asText(sense.path("exampleEn").asText(sense.path("example_en").asText(""))).trim(),
                    sense.path("exampleMeaning").asText(sense.path("exampleVi").asText(sense.path("example_vi").asText(""))).trim(),
                    sense.path("synonyms").asText("").trim(),
                    sense.path("antonyms").asText("").trim()
            ));
        }
        return senses;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedInitialDataIfEmpty() {
        // Ensure default sets exist
        jdbc.update("""
                INSERT INTO vocabulary_test_sets (id, title, year, category, word_count, status)
                VALUES ('ets2024-t1', 'ETS 2024 - Test 1 Vocabulary', '2024', '2024', 8, 'PUBLISHED')
                ON CONFLICT (id) DO NOTHING
                """);
        jdbc.update("""
                INSERT INTO vocabulary_test_sets (id, title, year, category, word_count, status)
                VALUES ('ets2024-t2', 'ETS 2024 - Test 2 Vocabulary', '2024', '2024', 8, 'PUBLISHED')
                ON CONFLICT (id) DO NOTHING
                """);
        jdbc.update("""
                INSERT INTO vocabulary_test_sets (id, title, year, category, word_count, status)
                VALUES ('600-essential', '600 Từ Vựng Thiết Yếu Cho TOEIC', '2024', '600_essential', 10, 'PUBLISHED')
                ON CONFLICT (id) DO NOTHING
                """);

        // Seed words for ets2024-t1 if empty
        Integer t1WordCount = jdbc.queryForObject("SELECT count(*) FROM vocabulary_items WHERE set_id = 'ets2024-t1'", Integer.class);
        if (t1WordCount == null || t1WordCount == 0) {
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
                        ON CONFLICT (id) DO NOTHING
                        """, w[0], w[1], w[2], w[3], w[4], w[5], w[6], w[7], Boolean.parseBoolean(w[8]), i);
            }
        }

        // Seed words for ets2024-t2 if empty
        Integer t2WordCount = jdbc.queryForObject("SELECT count(*) FROM vocabulary_items WHERE set_id = 'ets2024-t2'", Integer.class);
        if (t2WordCount == null || t2WordCount == 0) {
            String[][] wordsT2 = {
                {"w-t2-1", "compromise", "/ˈkɑːmprəmaɪz/", "Noun", "Sự thỏa hiệp, thỏa thuận nhượng bộ", "The management reached a compromise with the union over working hours.", "Ban quản lý đã đạt được thỏa thuận thỏa hiệp với công đoàn về giờ làm việc.", "B2", "true"},
                {"w-t2-2", "delegate", "/ˈdelɪɡeɪt/", "Verb", "Ủy thác, phân công nhiệm vụ", "A successful manager knows how to delegate responsibilities effectively.", "Một người quản lý thành công biết cách phân công trách nhiệm một cách hiệu quả.", "B2", "false"},
                {"w-t2-3", "facilitate", "/fəˈsɪlɪteɪt/", "Verb", "Tạo điều kiện thuận lợi, hỗ trợ tiến trình", "The new software is designed to facilitate communication between departments.", "Phần mềm mới được thiết kế để tạo điều kiện liên lạc thuận lợi giữa các phòng ban.", "B2", "false"},
                {"w-t2-4", "mandatory", "/ˈmændətɔːri/", "Adjective", "Bắt buộc theo quy định", "Attendance at the workplace safety workshop is mandatory for all personnel.", "Tham dự hội thảo an toàn lao động là bắt buộc đối với tất cả nhân viên.", "B1", "true"},
                {"w-t2-5", "lucrative", "/ˈluːkrətɪv/", "Adjective", "Sinh lợi nhiều, mang lại lợi nhuận cao", "The merger opened up lucrative opportunities in the international market.", "Vụ sáp nhập đã mở ra những cơ hội sinh lời lớn tại thị trường quốc tế.", "B2", "false"},
                {"w-t2-6", "reimburse", "/ˌriːɪmˈbɜːrs/", "Verb", "Hoàn trả chi phí, bồi hoàn tiền", "The company will reimburse travel expenses within five business days.", "Công ty sẽ hoàn trả các khoản chi phí đi lại trong vòng năm ngày làm việc.", "B1", "true"},
                {"w-t2-7", "preliminary", "/prɪˈlɪmɪneri/", "Adjective", "Sơ bộ, mở đầu, chuẩn bị", "The preliminary findings of the financial audit will be released tomorrow.", "Các kết quả sơ bộ của đợt kiểm toán tài chính sẽ được công bố vào ngày mai.", "B2", "false"},
                {"w-t2-8", "tenant", "/ˈtenənt/", "Noun", "Người thuê nhà, bên thuê mặt bằng", "All tenants are required to follow the building noise regulations after 10 PM.", "Tất cả khách thuê được yêu cầu tuân thủ quy định về tiếng ồn sau 10 giờ tối.", "B1", "false"}
            };

            for (int i = 0; i < wordsT2.length; i++) {
                String[] w = wordsT2[i];
                jdbc.update("""
                        INSERT INTO vocabulary_items (id, set_id, word, ipa, part_of_speech, meaning, example, example_meaning, level, starred, order_index)
                        VALUES (?, 'ets2024-t2', ?, ?, ?, ?, ?, ?, ?, ?::boolean, ?)
                        ON CONFLICT (id) DO NOTHING
                        """, w[0], w[1], w[2], w[3], w[4], w[5], w[6], w[7], Boolean.parseBoolean(w[8]), i);
            }
        }

        // Seed words for 600-essential if empty
        Integer w600Count = jdbc.queryForObject("SELECT count(*) FROM vocabulary_items WHERE set_id = '600-essential'", Integer.class);
        if (w600Count == null || w600Count == 0) {
            String[][] words600 = {
                {"w-600-1", "abide by", "/əˈbaɪd baɪ/", "Verb", "Tuân thủ, tuân theo hợp đồng", "Both parties agreed to abide by the terms stated in the agreement.", "Cả hai bên đã đồng ý tuân thủ các điều khoản được nêu trong hợp đồng.", "B1", "true"},
                {"w-600-2", "agreement", "/əˈɡriːmənt/", "Noun", "Hợp đồng, sự thỏa thuận", "The commercial agreement was signed after weeks of negotiations.", "Hợp đồng thương mại đã được ký kết sau nhiều tuần đàm phán.", "A2", "false"},
                {"w-600-3", "assurance", "/əˈʃʊrəns/", "Noun", "Sự cam đoan, sự bảo đảm", "The sales director gave his assurance that the delivery would arrive on schedule.", "Giám đốc bán hàng đã cam đoan rằng hàng sẽ đến đúng lịch trình.", "B2", "false"},
                {"w-600-4", "cancellation", "/ˌkænsəˈleɪʃn/", "Noun", "Sự hủy bỏ, chấm dứt", "The client clause specifies penalty fees in case of late contract cancellation.", "Điều khoản khách hàng quy định mức phí phạt trong trường hợp hủy hợp đồng trễ.", "B1", "true"},
                {"w-600-5", "determine", "/dɪˈtɜːrmɪn/", "Verb", "Xác định, quyết định một cách rõ ràng", "Market research helped the committee determine the most competitive retail price.", "Nghiên cứu thị trường đã giúp ủy ban xác định mức giá bán lẻ cạnh tranh nhất.", "B1", "false"},
                {"w-600-6", "engage", "/ɪnˈɡeɪdʒ/", "Verb", "Tham gia, cam kết tham gia", "The firm decided to engage an external consulting agency for market entry.", "Công ty đã quyết định thuê một đơn vị tư vấn bên ngoài để tiếp cận thị trường.", "B2", "false"},
                {"w-600-7", "establish", "/ɪˈstæblɪʃ/", "Verb", "Thiết lập, thành lập mối quan hệ", "The two enterprises collaborated to establish long-term strategic cooperation.", "Hai doanh nghiệp đã hợp tác nhằm thiết lập mối quan hệ chiến lược lâu dài.", "B1", "true"},
                {"w-600-8", "obligate", "/ˈɑːblɪɡeɪt/", "Verb", "Bắt buộc, ràng buộc nghĩa vụ", "The confidentiality clause obligates employees to protect proprietary data.", "Điều khoản bảo mật ràng buộc nhân viên phải bảo vệ dữ liệu độc quyền.", "B2", "false"},
                {"w-600-9", "party", "/ˈpɑːrti/", "Noun", "Bên tham gia hợp đồng / thỏa thuận", "The contract is only legally binding when signed by both interested parties.", "Hợp đồng chỉ có hiệu lực pháp lý khi được ký bởi cả hai bên liên quan.", "B1", "false"},
                {"w-600-10", "provision", "/prəˈvɪʒn/", "Noun", "Điều khoản hợp đồng, sự dự phòng", "Under the provisions of the lease, rent will increase by three percent annually.", "Theo các điều khoản của hợp đồng thuê, tiền thuê sẽ tăng 3% hàng năm.", "B2", "true"}
            };

            for (int i = 0; i < words600.length; i++) {
                String[] w = words600[i];
                jdbc.update("""
                        INSERT INTO vocabulary_items (id, set_id, word, ipa, part_of_speech, meaning, example, example_meaning, level, starred, order_index)
                        VALUES (?, '600-essential', ?, ?, ?, ?, ?, ?, ?, ?::boolean, ?)
                        ON CONFLICT (id) DO NOTHING
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

        // Synchronize all set word counts to actual items count
        jdbc.update("""
                UPDATE vocabulary_test_sets s
                SET word_count = (SELECT count(*) FROM vocabulary_items w WHERE w.set_id = s.id)
                """);
    }

    private VocabularyTestSet mapSetSummary(ResultSet rs) throws SQLException {
        return new VocabularyTestSet(
                rs.getString("id"),
                rs.getString("title"),
                rs.getString("year"),
                rs.getString("category"),
                rs.getInt("word_count"),
                rs.getString("status"),
                timestampToString(rs.getTimestamp("release_at")),
                Collections.emptyList()
        );
    }

    private VocabularyWord mapWord(ResultSet rs) throws SQLException {
        return new VocabularyWord(
                rs.getString("id"),
                rs.getString("set_id"),
                rs.getString("word"),
                rs.getString("ipa"),
                VocabularyPartOfSpeech.normalize(rs.getString("part_of_speech")),
                rs.getString("meaning"),
                rs.getString("meaning_source"),
                rs.getBoolean("meaning_edited"),
                rs.getString("example"),
                rs.getString("example_meaning"),
                rs.getString("level"),
                rs.getString("audio_url"),
                rs.getString("audio_region"),
                rs.getString("word_family"),
                rs.getBoolean("starred"),
                rs.getString("status"),
                List.of(),
                List.of()
        );
    }

    private List<VocabularyWord> loadSenses(List<VocabularyWord> words) {
        if (words.isEmpty()) return words;
        List<String> ids = words.stream().map(word -> word.id()).toList();
        String placeholders = String.join(",", Collections.nCopies(ids.size(), "?"));
        Map<String, List<VocabularySense>> sensesByItem = new HashMap<>();
        Map<String, List<VocabularyRelatedForm>> relatedFormsByItem = new HashMap<>();
        jdbc.query(
                "SELECT id, vocabulary_item_id, part_of_speech, sub_category, meaning, example, example_meaning, synonyms, antonyms "
                        + "FROM vocabulary_item_senses WHERE vocabulary_item_id IN (" + placeholders + ") "
                        + "ORDER BY order_index, id",
                (org.springframework.jdbc.core.RowCallbackHandler) rs -> {
                    sensesByItem.computeIfAbsent(rs.getString("vocabulary_item_id"), ignored -> new ArrayList<>())
                        .add(new VocabularySense(
                                rs.getString("id"),
                                VocabularyPartOfSpeech.normalize(rs.getString("part_of_speech")),
                                rs.getString("sub_category"),
                                rs.getString("meaning"),
                                rs.getString("example"),
                                rs.getString("example_meaning"),
                                rs.getString("synonyms"),
                                rs.getString("antonyms")
                        ));
                },
                ids.toArray()
        );
        List<Object> relationArgs = new ArrayList<>(ids);
        relationArgs.addAll(ids);
        String relationSql = """
                SELECT r.source_word_id AS owner_id, w.id, w.word, w.part_of_speech, r.relation_type
                FROM vocabulary_item_relations r
                JOIN vocabulary_items w ON w.id = r.related_word_id
                WHERE r.source_word_id IN (%s)
                UNION
                SELECT r.related_word_id AS owner_id, w.id, w.word, w.part_of_speech, r.relation_type
                FROM vocabulary_item_relations r
                JOIN vocabulary_items w ON w.id = r.source_word_id
                WHERE r.related_word_id IN (%s)
                ORDER BY owner_id, word
                """.formatted(placeholders, placeholders);
        jdbc.query(
                relationSql,
                (org.springframework.jdbc.core.RowCallbackHandler) rs -> {
                    relatedFormsByItem.computeIfAbsent(rs.getString("owner_id"), ignored -> new ArrayList<>())
                            .add(new VocabularyRelatedForm(
                                    rs.getString("id"),
                                    rs.getString("word"),
                                    VocabularyPartOfSpeech.normalize(rs.getString("part_of_speech")),
                                    rs.getString("relation_type")
                            ));
                },
                relationArgs.toArray()
        );
        return words.stream().map(word -> {
            List<VocabularySense> senses = deduplicateSenseRecords(sensesByItem.getOrDefault(word.id(), List.of()));
            if (senses.isEmpty() && word.meaning() != null && !word.meaning().isBlank()) {
                senses = List.of(new VocabularySense(null, word.partOfSpeech(), "", word.meaning(), word.example(),
                        word.exampleMeaning(), "", ""));
            }
            return new VocabularyWord(
                    word.id(), word.setId(), word.word(), word.ipa(), word.partOfSpeech(), word.meaning(),
                    word.meaningSource(), word.meaningEdited(), word.example(), word.exampleMeaning(), word.level(),
                    word.audioUrl(), word.audioRegion(), word.wordFamily(), word.starred(), word.status(), senses,
                    relatedFormsByItem.getOrDefault(word.id(), List.of())
            );
        }).toList();
    }

    private void replaceRelatedForms(String wordId, List<VocabularyRelatedFormInput> relatedForms) {
        Map<String, String> uniqueForms = normalizeRelatedForms(wordId, relatedForms);
        jdbc.update("""
                DELETE FROM vocabulary_item_relations
                WHERE source_word_id = ? OR related_word_id = ?
                """, wordId, wordId);
        insertRelatedForms(wordId, uniqueForms);
    }

    private void addRelatedForms(String wordId, List<VocabularyRelatedFormInput> relatedForms) {
        insertRelatedForms(wordId, normalizeRelatedForms(wordId, relatedForms));
    }

    private Map<String, String> normalizeRelatedForms(
            String wordId, List<VocabularyRelatedFormInput> relatedForms) {
        List<VocabularyRelatedFormInput> normalizedForms = relatedForms == null ? List.of() : relatedForms;
        Map<String, String> uniqueForms = new LinkedHashMap<>();
        for (VocabularyRelatedFormInput form : normalizedForms) {
            if (form == null || form.id() == null || form.id().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mỗi liên kết họ từ cần có từ đích.");
            }
            String relatedWordId = form.id().trim();
            if (wordId.equals(relatedWordId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể liên kết từ với chính nó.");
            }
            Integer exists = jdbc.queryForObject(
                    "SELECT count(*) FROM vocabulary_items WHERE id = ?", Integer.class, relatedWordId);
            if (exists == null || exists == 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không tìm thấy từ được liên kết.");
            }
            String relationType = normalizeRelationType(form.relationType());
            uniqueForms.putIfAbsent(relatedWordId, relationType);
        }
        return uniqueForms;
    }

    private void insertRelatedForms(String wordId, Map<String, String> relatedForms) {
        relatedForms.forEach((relatedWordId, relationType) -> jdbc.update("""
                INSERT INTO vocabulary_item_relations (source_word_id, related_word_id, relation_type)
                VALUES (?, ?, ?)
                ON CONFLICT (source_word_id, related_word_id) DO UPDATE SET relation_type = EXCLUDED.relation_type
                """, wordId, relatedWordId, relationType));
    }

    private String normalizeRelationType(String relationType) {
        if (relationType == null || relationType.isBlank()) return "WORD_FAMILY";
        String normalized = relationType.trim().toUpperCase(Locale.ROOT);
        if (normalized.equals("WORD_FAMILY") || normalized.equals("INFLECTION")) return normalized;
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Loại liên kết từ vựng không hợp lệ.");
    }

    private List<VocabularySenseInput> normalizeSenses(
            List<VocabularySenseInput> requested,
            String fallbackPartOfSpeech,
            String fallbackSubCategory,
            String fallbackMeaning,
            String fallbackExample,
            String fallbackExampleMeaning) {
        List<VocabularySenseInput> senses = requested == null || requested.isEmpty()
                ? List.of(new VocabularySenseInput(
                        fallbackPartOfSpeech, fallbackSubCategory, fallbackMeaning, fallbackExample,
                        fallbackExampleMeaning, "", ""))
                : requested;
        Map<String, VocabularySenseInput> normalized = new LinkedHashMap<>();
        for (VocabularySenseInput sense : senses) {
            if (sense == null) continue;
            String pos = VocabularyPartOfSpeech.normalize(sense.partOfSpeech());
            String meaning = sense.meaning() == null ? "" : sense.meaning().trim();
            if (pos.isEmpty() || meaning.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Mỗi nghĩa cần có từ loại và nghĩa tiếng Việt.");
            }
            VocabularySenseInput normalizedSense = new VocabularySenseInput(
                    pos,
                    sense.subCategory() == null ? "" : sense.subCategory().trim(),
                    meaning,
                    sense.example() == null ? "" : sense.example().trim(),
                    sense.exampleMeaning() == null ? "" : sense.exampleMeaning().trim(),
                    sense.synonyms() == null ? "" : sense.synonyms().trim(),
                    sense.antonyms() == null ? "" : sense.antonyms().trim()
            );
            String key = senseKey(pos, meaning);
            VocabularySenseInput existing = normalized.get(key);
            if (existing == null) {
                normalized.put(key, normalizedSense);
            } else {
                normalized.put(key, new VocabularySenseInput(
                        existing.partOfSpeech(),
                        existing.subCategory().isBlank() ? normalizedSense.subCategory() : existing.subCategory(),
                        existing.meaning(),
                        existing.example().isBlank() ? normalizedSense.example() : existing.example(),
                        mergeRelationTerms(existing.synonyms(), normalizedSense.synonyms()),
                        mergeRelationTerms(existing.antonyms(), normalizedSense.antonyms()),
                        existing.exampleMeaning().isBlank() ? normalizedSense.exampleMeaning() : existing.exampleMeaning()
                ));
            }
        }
        if (normalized.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Từ vựng cần có ít nhất một nghĩa.");
        }
        return new ArrayList<>(normalized.values());
    }

    private List<VocabularySense> deduplicateSenseRecords(List<VocabularySense> senses) {
        Map<String, VocabularySense> unique = new LinkedHashMap<>();
        for (VocabularySense sense : senses) {
            String partOfSpeech = VocabularyPartOfSpeech.normalize(sense.partOfSpeech());
            String key = senseKey(partOfSpeech, sense.meaning());
            VocabularySense existing = unique.get(key);
            if (existing == null) {
                unique.put(key, new VocabularySense(
                        sense.id(), partOfSpeech, sense.subCategory(), sense.meaning(), sense.example(),
                        sense.exampleMeaning(), sense.synonyms(), sense.antonyms()));
            } else {
                unique.put(key, new VocabularySense(
                        existing.id(),
                        partOfSpeech,
                        existing.subCategory() == null || existing.subCategory().isBlank()
                                ? sense.subCategory() : existing.subCategory(),
                        existing.meaning(),
                        existing.example() == null || existing.example().isBlank()
                                ? sense.example() : existing.example(),
                        existing.exampleMeaning() == null || existing.exampleMeaning().isBlank()
                                ? sense.exampleMeaning() : existing.exampleMeaning(),
                        mergeRelationTerms(existing.synonyms(), sense.synonyms()),
                        mergeRelationTerms(existing.antonyms(), sense.antonyms())));
            }
        }
        return new ArrayList<>(unique.values());
    }

    private String senseKey(String partOfSpeech, String meaning) {
        String normalizedMeaning = meaning == null ? "" : meaning.trim().replaceAll("\\s+", " ").toLowerCase(Locale.ROOT);
        return VocabularyPartOfSpeech.normalize(partOfSpeech).toLowerCase(Locale.ROOT) + "|" + normalizedMeaning;
    }

    private String mergeRelationTerms(String existing, String incoming) {
        Map<String, String> terms = new LinkedHashMap<>();
        for (String value : List.of(existing == null ? "" : existing, incoming == null ? "" : incoming)) {
            for (String term : value.split("[,;|]")) {
                String trimmed = term.trim();
                if (!trimmed.isEmpty()) terms.putIfAbsent(trimmed.toLowerCase(Locale.ROOT), trimmed);
            }
        }
        return String.join(", ", terms.values());
    }

    private void replaceSenses(String itemId, List<VocabularySenseInput> senses) {
        jdbc.update("DELETE FROM vocabulary_item_senses WHERE vocabulary_item_id = ?", itemId);
        for (int index = 0; index < senses.size(); index++) {
            VocabularySenseInput sense = senses.get(index);
            jdbc.update("""
                    INSERT INTO vocabulary_item_senses (
                        vocabulary_item_id, part_of_speech, sub_category, meaning, example, example_meaning, synonyms, antonyms, order_index
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, itemId, sense.partOfSpeech(), sense.subCategory(), sense.meaning(),
                    sense.example(), sense.exampleMeaning(), sense.synonyms(), sense.antonyms(), index);
        }
    }

    private void upsertSense(
            String itemId, String partOfSpeech, String subCategory, String meaning, String example,
            String exampleMeaning, String synonyms, String antonyms) {
        String normalizedPartOfSpeech = VocabularyPartOfSpeech.normalize(partOfSpeech);
        String normalizedMeaning = meaning == null ? "" : meaning.trim().replaceAll("\\s+", " ");
        List<UUID> senseIds = jdbc.query(
                """
                SELECT id, part_of_speech, meaning FROM vocabulary_item_senses
                WHERE vocabulary_item_id = ?
                """,
                (rs, rowNum) -> senseKey(normalizedPartOfSpeech, normalizedMeaning)
                        .equals(senseKey(rs.getString("part_of_speech"), rs.getString("meaning")))
                                ? rs.getObject("id", UUID.class) : null,
                itemId).stream().filter(java.util.Objects::nonNull).toList();
        if (senseIds.isEmpty()) {
            jdbc.update("""
                    INSERT INTO vocabulary_item_senses (
                        vocabulary_item_id, part_of_speech, sub_category, meaning, example, example_meaning, synonyms, antonyms, order_index
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, (
                        SELECT COALESCE(MAX(order_index) + 1, 0)
                        FROM vocabulary_item_senses WHERE vocabulary_item_id = ?
                    ))
                    """, itemId, normalizedPartOfSpeech, subCategory, normalizedMeaning, example,
                    exampleMeaning, synonyms, antonyms, itemId);
            return;
        }
        jdbc.update("""
                UPDATE vocabulary_item_senses SET
                    sub_category = COALESCE(NULLIF(?, ''), sub_category),
                    example = COALESCE(NULLIF(?, ''), example),
                    example_meaning = COALESCE(NULLIF(?, ''), example_meaning),
                    synonyms = COALESCE(NULLIF(?, ''), synonyms),
                    antonyms = COALESCE(NULLIF(?, ''), antonyms),
                    updated_at = now()
                WHERE id = ?
                """, subCategory, example, exampleMeaning, synonyms, antonyms, senseIds.get(0));
    }

    private String timestampToString(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toLocalDateTime().toString();
    }

    private Timestamp parseReleaseAt(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return Timestamp.valueOf(LocalDateTime.parse(value.trim()));
        } catch (java.time.format.DateTimeParseException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Thời gian phát hành không đúng định dạng.", exception);
        }
    }

    private String normalizeAudioRegion(String region) {
        if (region == null || region.isBlank()) return "UNKNOWN";
        String normalized = region.trim().toUpperCase(Locale.ROOT);
        return switch (normalized) {
            case "UK", "US" -> normalized;
            default -> "UNKNOWN";
        };
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

    private String formatMeaningSource(String source) {
        if (source == null || source.isBlank()) return "EDITOR";
        String normalized = source.trim().toUpperCase(Locale.ROOT);
        if (normalized.equals("MINHQND") || normalized.equals("THICHHOC") || normalized.equals("EDITOR")) {
            return normalized;
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nguồn nghĩa từ vựng không hợp lệ.");
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
            String releaseAt,
            List<VocabularyWord> words
    ) {}

    public record VocabularyWord(
            String id,
            String setId,
            String word,
            String ipa,
            String partOfSpeech,
            String meaning,
            String meaningSource,
            boolean meaningEdited,
            String example,
            String exampleMeaning,
            String level,
            String audioUrl,
            String audioRegion,
            String wordFamily,
            boolean starred,
            String status,
            List<VocabularySense> senses,
            List<VocabularyRelatedForm> relatedForms
    ) {}

    public record VocabularyRelatedForm(
            String id,
            String word,
            String partOfSpeech,
            String relationType
    ) {}

    public record VocabularyRelatedFormInput(String id, String relationType) {}

    public record VocabularySense(
            String id,
            String partOfSpeech,
            String subCategory,
            String meaning,
            String example,
            String exampleMeaning,
            String synonyms,
            String antonyms
    ) {
        public VocabularySense(String id, String partOfSpeech, String subCategory, String meaning, String example) {
            this(id, partOfSpeech, subCategory, meaning, example, "", "", "");
        }
    }

    public record VocabularySenseInput(
            String partOfSpeech,
            String subCategory,
            String meaning,
            String example,
            String exampleMeaning,
            String synonyms,
            String antonyms
    ) {
        public VocabularySenseInput(String partOfSpeech, String subCategory, String meaning, String example) {
            this(partOfSpeech, subCategory, meaning, example, "", "", "");
        }

        public VocabularySenseInput(
                String partOfSpeech, String subCategory, String meaning, String example,
                String synonyms, String antonyms) {
            this(partOfSpeech, subCategory, meaning, example, "", synonyms, antonyms);
        }
    }

    public record CreateSetRequest(
            String id,
            String title,
            String year,
            String category,
            String status,
            String releaseAt
    ) {}

    public record UpdateSetRequest(
            String title,
            String year,
            String category,
            String status,
            String releaseAt
    ) {}

    public record CreateWordRequest(
            String id,
            String word,
            String ipa,
            String partOfSpeech,
            String meaning,
            String meaningSource,
            Boolean meaningEdited,
            String example,
            String exampleMeaning,
            String level,
            String audioUrl,
            String audioRegion,
            String subCategory,
            String wordFamily,
            List<VocabularySenseInput> senses,
            List<VocabularyRelatedFormInput> relatedForms
    ) {}

    public record UpdateWordRequest(
            String word,
            String ipa,
            String partOfSpeech,
            String meaning,
            String meaningSource,
            Boolean meaningEdited,
            String example,
            String exampleMeaning,
            String level,
            String audioUrl,
            String audioRegion,
            String subCategory,
            String wordFamily,
            List<VocabularySenseInput> senses,
            List<VocabularyRelatedFormInput> relatedForms
    ) {}
}
