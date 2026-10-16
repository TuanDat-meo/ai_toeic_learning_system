package com.toeic.ai.toeic_api.contentimport;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class ContentImportService {
    private static final long MAX_FILE_SIZE = 10L * 1024 * 1024;
    private static final int PREVIEW_LIMIT = 100;

    private final JdbcTemplate jdbcTemplate;
    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;
    private final ImportFileParser fileParser;
    private final ContentPayloadValidator validator;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ContentImportService(JdbcTemplate jdbcTemplate, ImportFileParser fileParser,
            ContentPayloadValidator validator) {
        this.jdbcTemplate = jdbcTemplate;
        this.namedParameterJdbcTemplate = new NamedParameterJdbcTemplate(jdbcTemplate);
        this.fileParser = fileParser;
        this.validator = validator;
    }

    @Transactional
    public BatchDetails preview(ContentType type, MultipartFile file, UUID uploadedBy) {
        if (type == null) {
            throw new IllegalArgumentException("Chọn loại nội dung cần nhập.");
        }
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Chọn file có dữ liệu trước khi xem trước.");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File không được vượt quá 10 MB.");
        }

        List<ParsedImportRow> rows = fileParser.parse(file);
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
        Map<String, UUID> existingContent = findContentIds(type, dedupeKeys);
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
        String fileName = safeFileName(file.getOriginalFilename());
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
                batchId, sourceId, fileName, rows.size(), type.name(), uploadedBy, file.getSize());

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
                "SELECT id, row_number, status, normalized_data, validation_errors, duplicate_of_content_id "
                        + "FROM import_items WHERE import_batch_id = ? ORDER BY row_number LIMIT ? OFFSET ?",
                (rs, rowNum) -> new PreviewItem(rs.getObject("id", UUID.class), rs.getInt("row_number"),
                        rs.getString("status"), readJson(rs.getString("normalized_data")),
                        readStringList(rs.getString("validation_errors")),
                        rs.getObject("duplicate_of_content_id", UUID.class)),
                batchId, limit, offset);
        return new BatchDetails(summary, items, offset, limit, summary.totalRecords() > offset + items.size());
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
                jdbcTemplate.update("UPDATE import_items SET status = 'PUBLISHED' WHERE id = ?", item.id());
                publishedCount++;
            } else {
                UUID duplicateId = findContentId(batch.contentType(), item.dedupeKey());
                jdbcTemplate.update(
                        "UPDATE import_items SET status = 'DUPLICATE', duplicate_of_content_id = ? WHERE id = ?",
                        duplicateId, item.id());
            }
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
                + "b.completed_at, count(*) FILTER (WHERE i.status = 'VALID') AS valid_count, "
                + "count(*) FILTER (WHERE i.status = 'INVALID') AS invalid_count, "
                + "count(*) FILTER (WHERE i.status = 'DUPLICATE') AS duplicate_count, "
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
        String extension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
        return switch (extension) {
            case "csv" -> "CSV";
            case "xlsx" -> "EXCEL";
            case "json" -> "JSON";
            default -> throw new IllegalArgumentException("Chỉ hỗ trợ file CSV, XLSX hoặc JSON.");
        };
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

    private record BatchForPublish(UUID id, ContentType contentType, String status, int totalRecords) { }
    private record PublishableItem(UUID id, String dedupeKey, String title, JsonNode normalizedData) { }
    private record PreparedImportRow(ParsedImportRow row,
            ContentPayloadValidator.ValidationResult result, List<String> errors) { }

    public record BatchSummary(UUID id, String fileName, ContentType contentType, int totalRecords,
            int validCount, int invalidCount, int duplicateCount, int publishedCount, String status,
            Instant createdAt, Instant completedAt) { }
    public record PreviewItem(UUID id, int rowNumber, String status, JsonNode normalizedData,
            List<String> errors, UUID duplicateOfContentId) { }
    public record BatchDetails(BatchSummary batch, List<PreviewItem> items, int offset,
            int limit, boolean hasMore) { }
    public record PublishedContent(UUID id, ContentType contentType, String title,
            JsonNode payload, Instant publishedAt) { }
}
