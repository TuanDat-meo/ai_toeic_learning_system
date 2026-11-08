package com.toeic.ai.toeic_api.contentimport;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.toeic.ai.toeic_api.grammar.GrammarService;
import com.toeic.ai.toeic_api.vocabulary.VocabularyService;

@Service
public class ContentImportService {
    private static final long MAX_FILE_SIZE = 256L * 1024 * 1024;
    private static final int PREVIEW_LIMIT = 100;

    private final JdbcTemplate jdbcTemplate;
    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;
    private final ImportFileParser fileParser;
    private final ContentPayloadValidator validator;
    private final GrammarService grammarService;
    private final VocabularyService vocabularyService;
    private final ContentImportUploadService uploadService;
    private final DocumentContentRecognizer recognizer;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ContentImportService(JdbcTemplate jdbcTemplate, ImportFileParser fileParser,
            ContentPayloadValidator validator, GrammarService grammarService,
            VocabularyService vocabularyService) {
        this(jdbcTemplate, fileParser, validator, grammarService, vocabularyService, null, null);
    }

    @Autowired
    public ContentImportService(JdbcTemplate jdbcTemplate, ImportFileParser fileParser,
            ContentPayloadValidator validator, GrammarService grammarService,
            VocabularyService vocabularyService,
            @Autowired(required = false) ContentImportUploadService uploadService,
            @Autowired(required = false) DocumentContentRecognizer recognizer) {
        this.jdbcTemplate = jdbcTemplate;
        this.namedParameterJdbcTemplate = new NamedParameterJdbcTemplate(jdbcTemplate);
        this.fileParser = fileParser;
        this.validator = validator;
        this.grammarService = grammarService;
        this.vocabularyService = vocabularyService;
        this.uploadService = uploadService;
        this.recognizer = recognizer;
    }

    @Transactional
    public BatchDetails preview(ContentType type, MultipartFile file, UUID uploadedBy) {
        return preview(type, file, uploadedBy, null, null);
    }

    @Transactional
    public BatchDetails preview(ContentType type, MultipartFile file, UUID uploadedBy,
            String vocabularySetId, String vocabularySetName) {
        if (type == null) {
            throw new IllegalArgumentException("Chọn loại nội dung cần nhập.");
        }
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Chọn file có dữ liệu trước khi xem trước.");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File không được vượt quá 256 MB.");
        }

        String fileName = safeFileName(file.getOriginalFilename());
        String ext = fileExtension(fileName);
        List<ParsedImportRow> rows;
        if (Set.of("json", "csv", "xlsx").contains(ext)) {
            rows = fileParser.parse(file, type);
        } else if (uploadService != null && recognizer != null) {
            // Unstructured file (pdf, doc, docx, txt, md, image...)
            var extraction = uploadService.extract(type, file);
            List<Map<String, Object>> recognizedItems = recognizer.recognize(type, extraction.text());
            if (recognizedItems.isEmpty()) {
                throw new IllegalArgumentException("Không thể nhận diện nội dung " + type + " từ file " + fileName + ". Hãy kiểm tra nội dung file.");
            }
            rows = new ArrayList<>();
            for (int idx = 0; idx < recognizedItems.size(); idx++) {
                rows.add(new ParsedImportRow(idx + 1, objectMapper.valueToTree(recognizedItems.get(idx))));
            }
        } else {
            rows = fileParser.parse(file, type);
        }

        validator.validateFileShape(type, rows);
        return createPreviewBatch(type, fileName, file.getSize(),
                applyVocabularyTarget(type, rows, vocabularySetId, vocabularySetName), uploadedBy);
    }

    @Transactional
    public BatchDetails previewExtractedText(ContentType type, String fileName, String text, UUID uploadedBy) {
        return previewExtractedText(type, fileName, text, uploadedBy, null, null);
    }

    @Transactional
    public BatchDetails previewExtractedText(ContentType type, String fileName, String text, UUID uploadedBy,
            String vocabularySetId, String vocabularySetName) {
        if (type == null) {
            throw new IllegalArgumentException("Chọn loại nội dung cần nhập.");
        }
        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException("Văn bản trích xuất rỗng.");
        }
        List<Map<String, Object>> recognizedItems = recognizer != null
                ? recognizer.recognize(type, text) : List.of();
        if (recognizedItems.isEmpty()) {
            throw new IllegalArgumentException("Không thể nhận diện nội dung " + type + " từ văn bản trích xuất.");
        }
        List<ParsedImportRow> rows = new ArrayList<>();
        for (int idx = 0; idx < recognizedItems.size(); idx++) {
            rows.add(new ParsedImportRow(idx + 1, objectMapper.valueToTree(recognizedItems.get(idx))));
        }
        String safeName = fileName == null || fileName.isBlank() ? "extracted-document.json" : safeFileName(fileName);
        validator.validateFileShape(type, rows);
        return createPreviewBatch(type, safeName, text.getBytes(java.nio.charset.StandardCharsets.UTF_8).length,
                applyVocabularyTarget(type, rows, vocabularySetId, vocabularySetName), uploadedBy);
    }

    private List<ParsedImportRow> applyVocabularyTarget(ContentType type, List<ParsedImportRow> rows,
            String vocabularySetId, String vocabularySetName) {
        String targetId = vocabularySetId == null ? "" : vocabularySetId.trim();
        String targetName = vocabularySetName == null ? "" : vocabularySetName.trim();
        if (type != ContentType.VOCABULARY) {
            if (!targetId.isEmpty() || !targetName.isEmpty()) {
                throw new IllegalArgumentException("Chỉ nội dung từ vựng mới hỗ trợ chọn bộ đích.");
            }
            return rows;
        }
        if (!targetId.isEmpty() && !targetName.isEmpty()) {
            throw new IllegalArgumentException("Chỉ chọn bộ từ vựng có sẵn hoặc nhập tên bộ mới, không chọn đồng thời.");
        }
        if (targetName.length() > 255) {
            throw new IllegalArgumentException("Tên bộ từ vựng không được vượt quá 255 ký tự.");
        }
        String existingSetName = "";
        if (!targetId.isEmpty()) {
            List<String> setNames = jdbcTemplate.query(
                    "SELECT title FROM vocabulary_test_sets WHERE id = ?",
                    (rs, rowNum) -> rs.getString("title"), targetId);
            if (setNames.isEmpty()) {
                throw new IllegalArgumentException("Không tìm thấy bộ từ vựng có mã " + targetId + ".");
            }
            existingSetName = setNames.getFirst();
        }
        String generatedSetId = targetName.isEmpty()
                ? "" : "import-" + UUID.nameUUIDFromBytes(targetName.toLowerCase(Locale.ROOT)
                        .getBytes(java.nio.charset.StandardCharsets.UTF_8)).toString().substring(0, 12);

        List<ParsedImportRow> targetedRows = new ArrayList<>(rows.size());
        for (ParsedImportRow row : rows) {
            ObjectNode data = row.data().deepCopy();
            boolean hasTarget = hasText(data, "setId") || hasText(data, "set_id")
                    || hasText(data, "topic") || hasText(data, "category") || hasText(data, "setName");
            if (!hasTarget) {
                if (!targetId.isEmpty()) {
                    data.put("setId", targetId);
                    data.put("setName", existingSetName);
                } else if (!targetName.isEmpty()) {
                    data.put("setId", generatedSetId);
                    data.put("setName", targetName);
                } else {
                    throw new IllegalArgumentException("Dòng " + row.rowNumber()
                            + " chưa có setId/topic. Hãy chọn bộ từ vựng có sẵn hoặc nhập tên bộ mới.");
                }
            }
            targetedRows.add(new ParsedImportRow(row.rowNumber(), data));
        }
        return targetedRows;
    }

    private boolean hasText(JsonNode data, String field) {
        return data.has(field) && !data.path(field).asText("").isBlank();
    }

    private BatchDetails createPreviewBatch(ContentType type, String fileName, long fileSizeBytes,
            List<ParsedImportRow> rows, UUID uploadedBy) {
        List<PreparedImportRow> preparedRows = new ArrayList<>();
        Set<String> dedupeKeys = new java.util.HashSet<>();
        Set<String> mockQuestionCodes = new java.util.HashSet<>();
        for (ParsedImportRow row : rows) {
            ContentPayloadValidator.ValidationResult result = validator.validate(type, row.data());
            List<String> errors = new ArrayList<>(result.errors());
            if (errors.isEmpty()) {
                dedupeKeys.add(result.dedupeKey());
                if (type == ContentType.MOCK_TEST) {
                    result.normalizedData().path("questionCodes").forEach(
                            code -> mockQuestionCodes.add(code.asText().toLowerCase(Locale.ROOT)));
                }
            }
            preparedRows.add(new PreparedImportRow(row, result, errors));
        }
        Map<String, UUID> existingContent = findExistingContentIds(type,
                preparedRows.stream().map(row -> row.result()).toList(), dedupeKeys);
        Set<String> publishedQuestionCodes = type == ContentType.MOCK_TEST
                ? findPublishedQuestionCodes(mockQuestionCodes) : Set.of();
        if (type == ContentType.MOCK_TEST) {
            for (PreparedImportRow prepared : preparedRows) {
                if (prepared.errors().isEmpty()) {
                    for (JsonNode code : prepared.result().normalizedData().path("questionCodes")) {
                        if (!publishedQuestionCodes.contains(code.asText().toLowerCase(Locale.ROOT))) {
                            prepared.errors().add("Không tìm thấy mã câu hỏi đã publish: " + code.asText() + ".");
                        }
                    }
                }
            }
        }
        String sourceType = sourceType(fileName);
        UUID sourceId = UUID.randomUUID();
        jdbcTemplate.update(
                "INSERT INTO content_sources (id, name, type, reference) VALUES (?, ?, ?, ?)",
                sourceId, fileName, sourceType, "Content import");
        UUID batchId = UUID.randomUUID();
        jdbcTemplate.update(
                "INSERT INTO import_batches (id, source_id, file_name, total_records, success_count, "
                        + "failed_count, status, content_type, uploaded_by, file_size_bytes) "
                        + "VALUES (?, ?, ?, ?, 0, 0, 'PREVIEW', ?, ?, ?)",
                batchId, sourceId, fileName, rows.size(), type.name(), uploadedBy, fileSizeBytes);

        int validCount = 0;
        int invalidCount = 0;
        var seenKeys = new java.util.HashSet<String>();
        for (PreparedImportRow prepared : preparedRows) {
            ParsedImportRow row = prepared.row();
            ContentPayloadValidator.ValidationResult result = prepared.result();
            List<String> errors = prepared.errors();
            UUID existingContentId = errors.isEmpty() ? existingContent.get(result.dedupeKey()) : null;
            boolean duplicateInFile = false;
            if (errors.isEmpty()) {
                duplicateInFile = !seenKeys.add(result.dedupeKey());
            }
            String status = !errors.isEmpty() ? "INVALID"
                    : existingContentId != null || duplicateInFile ? "DUPLICATE" : "VALID";
            if (status.equals("VALID")) validCount++; else invalidCount++;

            UUID itemId = UUID.randomUUID();
            jdbcTemplate.update(
                    "INSERT INTO import_items (id, import_batch_id, raw_data, status, row_number, "
                            + "normalized_data, validation_errors, dedupe_key, title, duplicate_of_content_id) "
                            + "VALUES (?, ?, ?::jsonb, ?, ?, ?::jsonb, ?::jsonb, ?, ?, ?)",
                    itemId, batchId, toJson(row.data()), status, row.rowNumber(),
                    toJson(result.normalizedData()), toJson(errors), result.dedupeKey(),
                    result.title(), existingContentId);
        }
        jdbcTemplate.update(
                "UPDATE import_batches SET success_count = ?, failed_count = ?, "
                        + "status = ?, completed_at = CASE WHEN ? = 0 THEN now() ELSE NULL END WHERE id = ?",
                validCount, invalidCount, validCount == 0 ? "NO_VALID_ROWS" : "PREVIEW", validCount, batchId);
        return getBatch(batchId, 0, PREVIEW_LIMIT);
    }

    @Transactional(readOnly = true)
    public List<BatchSummary> listBatches(int requestedLimit) {
        int limit = Math.max(1, Math.min(requestedLimit, 100));
        return jdbcTemplate.query(batchSummarySql() + " WHERE b.content_type IS NOT NULL "
                        + "GROUP BY b.id ORDER BY b.created_at DESC LIMIT ?",
                (rs, rowNum) -> mapBatchSummary(rs), limit);
    }

    @Transactional(readOnly = true)
    public BatchDetails getBatch(UUID batchId, int requestedOffset, int requestedLimit) {
        int offset = Math.max(0, Math.min(requestedOffset, ImportFileParser.MAX_ROWS));
        int limit = Math.max(1, Math.min(requestedLimit, PREVIEW_LIMIT));
        BatchSummary summary;
        try {
            summary = jdbcTemplate.queryForObject(batchSummarySql()
                            + " WHERE b.id = ? AND b.content_type IS NOT NULL GROUP BY b.id",
                    (rs, rowNum) -> mapBatchSummary(rs), batchId);
        } catch (EmptyResultDataAccessException exception) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lô nhập.");
        }
        List<PreviewItem> items = jdbcTemplate.query(
                "SELECT id, row_number, status, raw_data, normalized_data, validation_errors, duplicate_of_content_id, duplicate_resolution "
                        + "FROM import_items WHERE import_batch_id = ? ORDER BY row_number LIMIT ? OFFSET ?",
                (rs, rowNum) -> new PreviewItem(rs.getObject("id", UUID.class), rs.getInt("row_number"),
                        rs.getString("status"), readJsonObject(rs.getString("raw_data")),
                        readJsonObject(rs.getString("normalized_data")),
                        readStringList(rs.getString("validation_errors")),
                        rs.getObject("duplicate_of_content_id", UUID.class), rs.getString("duplicate_resolution")),
                batchId, limit, offset);
        return new BatchDetails(summary, items, offset, limit, summary.totalRecords() > offset + items.size());
    }

    @Transactional
    public void deleteBatch(UUID batchId) {
        List<EditableBatch> batches = jdbcTemplate.query(
                "SELECT content_type, status FROM import_batches WHERE id = ? FOR UPDATE",
                (rs, rowNum) -> new EditableBatch(ContentType.valueOf(rs.getString("content_type")),
                        rs.getString("status")), batchId);
        if (batches.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lô nhập.");
        }
        EditableBatch batch = batches.getFirst();
        if ("PUBLISHED".equals(batch.status()) || "PARTIAL".equals(batch.status())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không được xóa lô import đã publish dữ liệu.");
        }
        jdbcTemplate.update("DELETE FROM import_items WHERE import_batch_id = ?", batchId);
        jdbcTemplate.update("DELETE FROM import_batches WHERE id = ?", batchId);
    }

    @Transactional
    public BatchDetails addVocabularyPreviewItem(UUID batchId, Map<String, Object> data) {
        ContentType type = requireEditableBatch(batchId);
        JsonNode raw = vocabularyPayload(data);
        int rowNumber = jdbcTemplate.queryForObject(
                "SELECT coalesce(max(row_number), 0) + 1 FROM import_items WHERE import_batch_id = ?",
                Integer.class, batchId);
        insertPreviewItem(batchId, type, raw, rowNumber);
        refreshBatchPreview(batchId, type);
        return getBatch(batchId, 0, PREVIEW_LIMIT);
    }

    @Transactional
    public BatchDetails updateVocabularyPreviewItem(UUID batchId, UUID itemId, Map<String, Object> data) {
        ContentType type = requireEditableBatch(batchId);
        if (data == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dữ liệu cập nhật không được để trống.");
        }
        JsonNode raw = objectMapper.valueToTree(data);
        int updated = jdbcTemplate.update(
                "UPDATE import_items SET raw_data = ?::jsonb, duplicate_resolution = NULL "
                        + "WHERE id = ? AND import_batch_id = ?",
                toJson(raw), itemId, batchId);
        if (updated == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy dòng xem trước.");
        }
        refreshBatchPreview(batchId, type);
        return getBatch(batchId, 0, PREVIEW_LIMIT);
    }

    private JsonNode vocabularyPayload(Map<String, Object> data) {
        if (data == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dữ liệu không được để trống.");
        }
        return objectMapper.valueToTree(data);
    }

    @Transactional
    public BatchDetails deleteVocabularyPreviewItem(UUID batchId, UUID itemId) {
        ContentType type = requireEditableBatch(batchId);
        int deleted = jdbcTemplate.update(
                "DELETE FROM import_items WHERE id = ? AND import_batch_id = ?",
                itemId, batchId);
        if (deleted == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy dòng xem trước.");
        }
        jdbcTemplate.update("""
                WITH numbered AS (
                    SELECT id, row_number() OVER (ORDER BY row_number, id) AS new_row_number
                    FROM import_items
                    WHERE import_batch_id = ?
                )
                UPDATE import_items item
                SET row_number = numbered.new_row_number
                FROM numbered
                WHERE item.id = numbered.id
                """, batchId);
        refreshBatchPreview(batchId, type);
        return getBatch(batchId, 0, PREVIEW_LIMIT);
    }

    @Transactional
    public BatchDetails resolveVocabularyDuplicate(UUID batchId, UUID itemId, String resolution) {
        requireEditableVocabularyBatch(batchId);
        if (!Set.of("ADD_MEANING", "CREATE_NEW").contains(resolution)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lựa chọn xử lý từ trùng không hợp lệ.");
        }
        List<DuplicatePreviewItem> matches = jdbcTemplate.query(
                "SELECT raw_data, normalized_data, dedupe_key, status FROM import_items "
                        + "WHERE id = ? AND import_batch_id = ? FOR UPDATE",
                (rs, rowNum) -> new DuplicatePreviewItem(readJson(rs.getString("raw_data")),
                        readJson(rs.getString("normalized_data")), rs.getString("dedupe_key"),
                        rs.getString("status")),
                itemId, batchId);
        if (matches.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy dòng xem trước.");
        }
        DuplicatePreviewItem item = matches.getFirst();
        if (!"DUPLICATE".equals(item.status())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Dòng này không còn ở trạng thái trùng từ.");
        }

        if ("ADD_MEANING".equals(resolution)) {
            UUID existingContentId = jdbcTemplate.query(
                    "SELECT duplicate_of_content_id FROM import_items "
                            + "WHERE id = ? AND duplicate_of_content_id IS NOT NULL",
                    (rs, rowNum) -> rs.getObject(1, UUID.class), itemId).stream().findFirst().orElse(null);
            if (existingContentId == null) {
                List<UUID> batchMatches = jdbcTemplate.query(
                        "SELECT id FROM import_items WHERE import_batch_id = ? AND id <> ? "
                                + "AND dedupe_key = ? AND status = 'VALID' ORDER BY row_number LIMIT 1",
                        (rs, rowNum) -> rs.getObject("id", UUID.class), batchId, itemId, item.dedupeKey());
                if (batchMatches.isEmpty()) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT,
                            "Không tìm thấy từ đã publish hoặc dòng hợp lệ trong lô để bổ sung nghĩa.");
                }
            }
        } else {
            ObjectNode normalized = item.normalizedData().deepCopy();
            normalized.put("duplicateResolution", resolution);
            jdbcTemplate.update(
                    "UPDATE import_items SET duplicate_resolution = ?, dedupe_key = ?, "
                            + "normalized_data = ?::jsonb, status = 'VALID', duplicate_of_content_id = NULL "
                            + "WHERE id = ?",
                    resolution, item.dedupeKey() + ":" + itemId, toJson(normalized), itemId);
            refreshVocabularyPreview(batchId);
            return getBatch(batchId, 0, PREVIEW_LIMIT);
        }
        jdbcTemplate.update(
                "UPDATE import_items SET duplicate_resolution = ? WHERE id = ?", resolution, itemId);
        refreshVocabularyPreview(batchId);
        return getBatch(batchId, 0, PREVIEW_LIMIT);
    }

    private void appendMeaning(ObjectNode payload, String meaning) {
        if (meaning.isBlank()) return;
        String current = payload.path("meaning").asText("").trim();
        if (current.isBlank()) {
            payload.put("meaning", meaning);
        } else if (java.util.Arrays.stream(current.split("\\s*;\\s*"))
                .noneMatch(existing -> existing.equalsIgnoreCase(meaning))) {
            payload.put("meaning", current + "; " + meaning);
        }
    }

    private void insertPreviewItem(UUID batchId, ContentType type, JsonNode raw, int rowNumber) {
        ContentPayloadValidator.ValidationResult result = validator.validate(type, raw);
        jdbcTemplate.update(
                "INSERT INTO import_items (id, import_batch_id, raw_data, status, row_number, "
                        + "normalized_data, validation_errors, dedupe_key, title) "
                        + "VALUES (?, ?, ?::jsonb, 'INVALID', ?, ?::jsonb, ?::jsonb, ?, ?)",
                UUID.randomUUID(), batchId, toJson(raw), rowNumber,
                toJson(result.normalizedData()), toJson(result.errors()), result.dedupeKey(), result.title());
    }

    private ContentType requireEditableBatch(UUID batchId) {
        List<EditableBatch> batches = jdbcTemplate.query(
                "SELECT content_type, status FROM import_batches WHERE id = ? FOR UPDATE",
                (rs, rowNum) -> new EditableBatch(ContentType.valueOf(rs.getString("content_type")),
                        rs.getString("status")), batchId);
        if (batches.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lô nhập.");
        }
        EditableBatch batch = batches.getFirst();
        if (!Set.of("PREVIEW", "NO_VALID_ROWS").contains(batch.status())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Chỉ có thể chỉnh sửa lô đang ở trạng thái xem trước.");
        }
        return batch.contentType();
    }

    private ContentType requireEditableVocabularyBatch(UUID batchId) {
        ContentType type = requireEditableBatch(batchId);
        if (type != ContentType.VOCABULARY) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Chỉ hỗ trợ thao tác từ vựng đối với lô từ vựng.");
        }
        return type;
    }

    private void refreshVocabularyPreview(UUID batchId) {
        refreshBatchPreview(batchId, ContentType.VOCABULARY);
    }

    private void refreshBatchPreview(UUID batchId, ContentType type) {
        List<PreviewRevalidation> rows = jdbcTemplate.query(
                "SELECT id, raw_data, duplicate_resolution FROM import_items WHERE import_batch_id = ? ORDER BY row_number, id",
                (rs, rowNum) -> new PreviewRevalidation(rs.getObject("id", UUID.class),
                        readJson(rs.getString("raw_data")), rs.getString("duplicate_resolution")), batchId);
        List<ContentPayloadValidator.ValidationResult> validations = rows.stream()
                .map(row -> validator.validate(type, row.rawData()))
                .toList();
        Set<String> dedupeKeys = new java.util.HashSet<>();
        validations.stream().filter(validation -> validation.valid())
                .forEach(result -> dedupeKeys.add(result.dedupeKey()));
        Map<String, UUID> existingContent = findExistingContentIds(
                type, validations, dedupeKeys);
        Set<String> seenKeys = new java.util.HashSet<>();
        int validCount = 0;
        int failedCount = 0;

        for (int i = 0; i < rows.size(); i++) {
            PreviewRevalidation row = rows.get(i);
            ContentPayloadValidator.ValidationResult result = validations.get(i);
            List<String> errors = new ArrayList<>(result.errors());
            UUID existingId = errors.isEmpty() ? existingContent.get(result.dedupeKey()) : null;
            boolean duplicateInFile = errors.isEmpty() && !seenKeys.add(result.dedupeKey());
            ObjectNode normalized = result.normalizedData();
            if ("CREATE_NEW".equals(row.duplicateResolution())) {
                normalized.put("duplicateResolution", "CREATE_NEW");
            }
            String dedupeKey = "CREATE_NEW".equals(row.duplicateResolution())
                    ? result.dedupeKey() + ":" + row.id() : result.dedupeKey();
            String status = !errors.isEmpty() ? "INVALID"
                    : "CREATE_NEW".equals(row.duplicateResolution()) ? "VALID"
                    : existingId != null || duplicateInFile ? "DUPLICATE" : "VALID";
            if ("VALID".equals(status) || "ADD_MEANING".equals(row.duplicateResolution())) validCount++;
            else failedCount++;
            jdbcTemplate.update(
                    "UPDATE import_items SET normalized_data = ?::jsonb, validation_errors = ?::jsonb, "
                            + "dedupe_key = ?, title = ?, status = ?, duplicate_of_content_id = ? WHERE id = ?",
                    toJson(normalized), toJson(errors), dedupeKey, result.title(),
                    status, "CREATE_NEW".equals(row.duplicateResolution()) ? null : existingId, row.id());
        }

        jdbcTemplate.update(
                "UPDATE import_batches SET total_records = ?, success_count = ?, failed_count = ?, "
                        + "status = ?, completed_at = CASE WHEN ? = 0 THEN now() ELSE NULL END WHERE id = ?",
                rows.size(), validCount, failedCount, validCount == 0 ? "NO_VALID_ROWS" : "PREVIEW",
                validCount, batchId);
    }

    @Transactional
    public BatchSummary publish(UUID batchId, UUID publishedBy) {
        BatchForPublish batch;
        try {
            batch = jdbcTemplate.queryForObject(
                    "SELECT id, content_type, status, total_records FROM import_batches WHERE id = ? FOR UPDATE",
                    (rs, rowNum) -> new BatchForPublish(rs.getObject("id", UUID.class),
                            ContentType.valueOf(rs.getString("content_type")), rs.getString("status"),
                            rs.getInt("total_records")),
                    batchId);
        } catch (EmptyResultDataAccessException exception) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lô nhập.");
        }
        if (!"PREVIEW".equals(batch.status())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Lô nhập này đã được xử lý và không thể publish lại.");
        }

        List<ResolvedDuplicate> sameBatchAdditions = jdbcTemplate.query(
                "SELECT id, dedupe_key, normalized_data FROM import_items "
                        + "WHERE import_batch_id = ? AND status = 'DUPLICATE' "
                        + "AND duplicate_resolution = 'ADD_MEANING' AND duplicate_of_content_id IS NULL "
                        + "ORDER BY row_number FOR UPDATE",
                (rs, rowNum) -> new ResolvedDuplicate(rs.getObject("id", UUID.class), null,
                        rs.getString("dedupe_key"), readJson(rs.getString("normalized_data"))),
                batchId);
        for (ResolvedDuplicate addition : sameBatchAdditions) {
            UUID targetId = jdbcTemplate.queryForObject(
                    "SELECT id FROM import_items WHERE import_batch_id = ? AND id <> ? "
                            + "AND dedupe_key = ? AND status = 'VALID' ORDER BY row_number LIMIT 1 FOR UPDATE",
                    (rs, rowNum) -> rs.getObject("id", UUID.class),
                    batchId, addition.id(), addition.dedupeKey());
            ObjectNode targetRaw = jdbcTemplate.queryForObject(
                    "SELECT raw_data FROM import_items WHERE id = ?",
                    (rs, rowNum) -> (ObjectNode) readJson(rs.getString(1)), targetId);
            ObjectNode targetNormalized = jdbcTemplate.queryForObject(
                    "SELECT normalized_data FROM import_items WHERE id = ?",
                    (rs, rowNum) -> (ObjectNode) readJson(rs.getString(1)), targetId);
            String meaning = addition.normalizedData().path("meaning").asText();
            appendMeaning(targetRaw, meaning);
            appendMeaning(targetNormalized, meaning);
            jdbcTemplate.update(
                    "UPDATE import_items SET raw_data = ?::jsonb, normalized_data = ?::jsonb WHERE id = ?",
                    toJson(targetRaw), toJson(targetNormalized), targetId);
        }

        List<PublishableItem> validItems = jdbcTemplate.query(
                "SELECT id, dedupe_key, title, normalized_data FROM import_items "
                        + "WHERE import_batch_id = ? AND status = 'VALID' ORDER BY row_number FOR UPDATE",
                (rs, rowNum) -> new PublishableItem(rs.getObject("id", UUID.class), rs.getString("dedupe_key"),
                        rs.getString("title"), readJson(rs.getString("normalized_data"))),
                batchId);
        int publishedCount = 0;
        for (PublishableItem item : validItems) {
            int inserted = jdbcTemplate.update(
                    "INSERT INTO imported_content (content_type, dedupe_key, title, payload_json, "
                            + "source_import_item_id, created_by) VALUES (?, ?, ?, ?::jsonb, ?, ?) "
                            + "ON CONFLICT (content_type, dedupe_key) DO NOTHING",
                    batch.contentType().name(), item.dedupeKey(), item.title(),
                    toJson(item.normalizedData()), item.id(), publishedBy);
            if (inserted == 1) {
                if (batch.contentType() == ContentType.GRAMMAR) {
                    grammarService.syncFromImportItem(item.normalizedData());
                } else if (batch.contentType() == ContentType.VOCABULARY) {
                    vocabularyService.syncFromImportItem(item.normalizedData());
                }
                jdbcTemplate.update("UPDATE import_items SET status = 'PUBLISHED' WHERE id = ?", item.id());
                publishedCount++;
            } else {
                if (batch.contentType() == ContentType.GRAMMAR) {
                    grammarService.syncFromImportItem(item.normalizedData());
                } else if (batch.contentType() == ContentType.VOCABULARY) {
                    vocabularyService.syncFromImportItem(item.normalizedData());
                }
                UUID duplicateId = findContentId(batch.contentType(), item.dedupeKey());
                jdbcTemplate.update(
                        "UPDATE import_items SET status = 'DUPLICATE', duplicate_of_content_id = ? WHERE id = ?",
                        duplicateId, item.id());
            }
        }

        List<ResolvedDuplicate> meaningAdditions = jdbcTemplate.query(
                "SELECT id, duplicate_of_content_id, normalized_data FROM import_items "
                        + "WHERE import_batch_id = ? AND status = 'DUPLICATE' "
                        + "AND duplicate_resolution = 'ADD_MEANING' ORDER BY row_number FOR UPDATE",
                (rs, rowNum) -> new ResolvedDuplicate(rs.getObject("id", UUID.class),
                        rs.getObject("duplicate_of_content_id", UUID.class), null,
                        readJson(rs.getString("normalized_data"))),
                batchId);
        for (ResolvedDuplicate addition : meaningAdditions) {
            if (addition.existingContentId() != null) {
                JsonNode existingPayload = jdbcTemplate.queryForObject(
                        "SELECT payload_json FROM imported_content WHERE id = ? FOR UPDATE",
                        (rs, rowNum) -> readJson(rs.getString(1)), addition.existingContentId());
                ObjectNode merged = existingPayload.deepCopy();
                appendMeaning(merged, addition.normalizedData().path("meaning").asText());
                jdbcTemplate.update("UPDATE imported_content SET payload_json = ?::jsonb WHERE id = ?",
                        toJson(merged), addition.existingContentId());
                vocabularyService.syncFromImportItem(merged);
            }
            jdbcTemplate.update("UPDATE import_items SET status = 'PUBLISHED' WHERE id = ?", addition.id());
            publishedCount++;
        }

        int skippedCount = jdbcTemplate.queryForObject(
                "SELECT count(*) FROM import_items WHERE import_batch_id = ? AND status IN ('INVALID', 'DUPLICATE')",
                Integer.class, batchId);
        String finalStatus = publishedCount == 0 ? "NO_VALID_ROWS"
                : skippedCount == 0 && publishedCount == batch.totalRecords() ? "PUBLISHED" : "PARTIAL";
        jdbcTemplate.update(
                "UPDATE import_batches SET status = ?, success_count = ?, failed_count = ?, completed_at = now() "
                        + "WHERE id = ?",
                finalStatus, publishedCount, skippedCount, batchId);
        return getBatch(batchId, 0, PREVIEW_LIMIT).batch();
    }

    @Transactional(readOnly = true)
    public List<PublishedContent> listPublished(ContentType type, int requestedLimit) {
        int limit = Math.max(1, Math.min(requestedLimit, 100));
        String sql = "SELECT id, content_type, title, payload_json, published_at FROM imported_content "
                + (type == null ? "" : "WHERE content_type = ? ")
                + "ORDER BY published_at DESC LIMIT ?";
        if (type == null) {
            return jdbcTemplate.query(sql, (rs, rowNum) -> mapPublished(rs), limit);
        }
        return jdbcTemplate.query(sql, (rs, rowNum) -> mapPublished(rs), type.name(), limit);
    }

    private UUID findContentId(ContentType type, String dedupeKey) {
        List<UUID> ids = jdbcTemplate.query(
                "SELECT id FROM imported_content WHERE content_type = ? AND dedupe_key = ? LIMIT 1",
                (rs, rowNum) -> rs.getObject("id", UUID.class), type.name(), dedupeKey);
        return ids.isEmpty() ? null : ids.getFirst();
    }

    private Map<String, UUID> findContentIds(ContentType type, Collection<String> dedupeKeys) {
        if (dedupeKeys.isEmpty()) return Map.of();
        return namedParameterJdbcTemplate.query(
                "SELECT dedupe_key, id FROM imported_content "
                        + "WHERE content_type = :type AND dedupe_key IN (:keys)",
                Map.of("type", type.name(), "keys", dedupeKeys),
                rs -> {
                    Map<String, UUID> found = new java.util.HashMap<>();
                    while (rs.next()) found.put(rs.getString("dedupe_key"), rs.getObject("id", UUID.class));
                    return found;
                });
    }

    private Map<String, UUID> findExistingContentIds(ContentType type,
                    Collection<ContentPayloadValidator.ValidationResult> validations, Collection<String> dedupeKeys) {
                Map<String, UUID> found = new java.util.HashMap<>(findContentIds(type, dedupeKeys));
                if (type != ContentType.VOCABULARY) return found;

                Set<String> words = validations.stream()
                        .filter(validation -> validation.valid())
                        .map(result -> result.normalizedData().path("word").asText().trim().toLowerCase(Locale.ROOT))
                        .filter(word -> !word.isBlank())
                        .collect(java.util.stream.Collectors.toSet());
                if (words.isEmpty()) return found;
                Map<String, UUID> publishedWords = namedParameterJdbcTemplate.query(
                        "SELECT lower(payload_json ->> 'word') AS word, id FROM imported_content "
                                + "WHERE content_type = 'VOCABULARY' AND lower(payload_json ->> 'word') IN (:words) "
                                + "ORDER BY published_at, id",
                        Map.of("words", words),
                        rs -> {
                            Map<String, UUID> byWord = new java.util.HashMap<>();
                            while (rs.next()) {
                                byWord.putIfAbsent(rs.getString("word"), rs.getObject("id", UUID.class));
                            }
                            return byWord;
                        });
                for (ContentPayloadValidator.ValidationResult result : validations) {
                    if (result.valid()) {
                        UUID existingId = publishedWords.get(
                                result.normalizedData().path("word").asText().trim().toLowerCase(Locale.ROOT));
                        if (existingId != null) found.put(result.dedupeKey(), existingId);
                    }
                }
                return found;
    }

    private Set<String> findPublishedQuestionCodes(Set<String> codes) {
        if (codes.isEmpty()) return Set.of();
        return namedParameterJdbcTemplate.query(
                "SELECT DISTINCT lower(payload_json ->> 'code') AS code FROM imported_content "
                        + "WHERE content_type = 'QUESTION' AND lower(payload_json ->> 'code') IN (:codes)",
                Map.of("codes", codes),
                rs -> {
                    Set<String> found = new java.util.HashSet<>();
                    while (rs.next()) found.add(rs.getString("code"));
                    return found;
                });
    }

    private String batchSummarySql() {
        return "SELECT b.id, b.file_name, b.content_type, b.total_records, b.status, b.created_at, "
                + "b.completed_at, count(*) FILTER (WHERE i.status = 'VALID' "
                + "OR (i.status = 'DUPLICATE' AND i.duplicate_resolution = 'ADD_MEANING')) AS valid_count, "
                + "count(*) FILTER (WHERE i.status = 'INVALID') AS invalid_count, "
                + "count(*) FILTER (WHERE i.status = 'DUPLICATE' AND i.duplicate_resolution IS NULL) AS duplicate_count, "
                + "count(*) FILTER (WHERE i.status = 'PUBLISHED') AS published_count "
                + "FROM import_batches b LEFT JOIN import_items i ON i.import_batch_id = b.id";
    }

    private BatchSummary mapBatchSummary(java.sql.ResultSet rs) throws java.sql.SQLException {
        return new BatchSummary(rs.getObject("id", UUID.class), rs.getString("file_name"),
                ContentType.valueOf(rs.getString("content_type")), rs.getInt("total_records"),
                rs.getInt("valid_count"), rs.getInt("invalid_count"), rs.getInt("duplicate_count"),
                rs.getInt("published_count"), rs.getString("status"),
                rs.getTimestamp("created_at").toInstant(),
                rs.getTimestamp("completed_at") == null ? null : rs.getTimestamp("completed_at").toInstant());
    }

    private PublishedContent mapPublished(java.sql.ResultSet rs) throws java.sql.SQLException {
        return new PublishedContent(rs.getObject("id", UUID.class),
                ContentType.valueOf(rs.getString("content_type")), rs.getString("title"),
                readJson(rs.getString("payload_json")), rs.getTimestamp("published_at").toInstant());
    }

    private String sourceType(String fileName) {
        String extension = fileExtension(fileName);
        return switch (extension) {
            case "csv" -> "CSV";
            case "xlsx" -> "EXCEL";
            case "json" -> "JSON";
            case "pdf" -> "PDF";
            case "doc", "docx" -> "WORD";
            default -> "MANUAL";
        };
    }

    private static String fileExtension(String fileName) {
        if (fileName == null) return "";
        int dot = fileName.lastIndexOf('.');
        return dot < 0 ? "" : fileName.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    private String safeFileName(String originalName) {
        if (originalName == null || originalName.isBlank()) {
            throw new IllegalArgumentException("Không xác định được tên file.");
        }
        String basename = originalName.replace('\\', '/');
        basename = basename.substring(basename.lastIndexOf('/') + 1).trim();
        if (basename.isBlank()) {
            throw new IllegalArgumentException("Tên file không hợp lệ.");
        }
        return basename.length() > 500 ? basename.substring(basename.length() - 500) : basename;
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Không thể lưu dữ liệu import JSON.", exception);
        }
    }

    private JsonNode readJson(String value) {
        if (value == null) return objectMapper.getNodeFactory().nullNode();
        try {
            return objectMapper.readTree(value);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Dữ liệu JSON trong lô import không hợp lệ.", exception);
        }
    }

    private List<String> readStringList(String value) {
        JsonNode node = readJson(value);
        List<String> result = new ArrayList<>();
        if (node.isArray()) node.forEach(item -> result.add(item.asText()));
        return result;
    }

    Map<String, Object> readJsonObject(String value) {
        if (value == null) return new LinkedHashMap<>();
        try {
            // Parse directly from JSON string to ensure plain Java types (String, Integer, List, Map)
            // rather than Jackson JsonNode objects which serialize incorrectly via Spring MVC.
            return objectMapper.readValue(value, new TypeReference<Map<String, Object>>() { });
        } catch (JsonProcessingException exception) {
            return new LinkedHashMap<>();
        }
    }

    private record BatchForPublish(UUID id, ContentType contentType, String status, int totalRecords) { }
    private record EditableBatch(ContentType contentType, String status) { }
    private record PreviewRevalidation(UUID id, JsonNode rawData, String duplicateResolution) { }
    private record DuplicatePreviewItem(JsonNode rawData, JsonNode normalizedData,
            String dedupeKey, String status) { }
    private record ResolvedDuplicate(UUID id, UUID existingContentId, String dedupeKey, JsonNode normalizedData) { }
    private record PublishableItem(UUID id, String dedupeKey, String title, JsonNode normalizedData) { }
    private record PreparedImportRow(ParsedImportRow row,
            ContentPayloadValidator.ValidationResult result, List<String> errors) { }

    public record BatchSummary(UUID id, String fileName, ContentType contentType, int totalRecords,
            int validCount, int invalidCount, int duplicateCount, int publishedCount, String status,
            Instant createdAt, Instant completedAt) { }
    public record PreviewItem(UUID id, int rowNumber, String status, Map<String, Object> rawData,
            Map<String, Object> normalizedData,
            List<String> errors, UUID duplicateOfContentId, String duplicateResolution) { }
    public record BatchDetails(BatchSummary batch, List<PreviewItem> items, int offset,
            int limit, boolean hasMore) { }
    public record PublishedContent(UUID id, ContentType contentType, String title,
            JsonNode payload, Instant publishedAt) { }
}
