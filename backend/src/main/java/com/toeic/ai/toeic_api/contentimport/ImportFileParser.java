package com.toeic.ai.toeic_api.contentimport;

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.FormulaEvaluator;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

@Component
public class ImportFileParser {
    static final int MAX_ROWS = 5_000;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<ParsedImportRow> parse(MultipartFile file) {
        return parse(file, null);
    }

    public List<ParsedImportRow> parse(MultipartFile file, ContentType type) {
        String name = file.getOriginalFilename();
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Không xác định được tên file.");
        }
        String extension = extension(name);
        try {
            return switch (extension) {
                case "json" -> parseJson(file, type);
                case "csv" -> parseCsv(file);
                case "xlsx" -> parseXlsx(file);
                default -> throw new IllegalArgumentException("Chỉ hỗ trợ file CSV, XLSX hoặc JSON.");
            };
        } catch (IOException exception) {
            throw new IllegalArgumentException("Không đọc được file. Hãy kiểm tra định dạng và thử lại.");
        }
    }

    private List<ParsedImportRow> parseJson(MultipartFile file, ContentType type) throws IOException {
        JsonNode root = objectMapper.readTree(file.getInputStream());
        JsonNode rows = root != null && root.isObject() && root.path("items").isArray()
                ? mapWrappedItems(root.path("items"), type) : rowsForKnownSource(root, type);
        if (rows == null) {
            throw new IllegalArgumentException("JSON không có dữ liệu.");
        }
        List<ParsedImportRow> result = new ArrayList<>();
        if (rows.isArray()) {
            for (JsonNode row : rows) {
                addRow(result, row, result.size() + 1);
            }
        } else {
            addRow(result, rows, 1);
        }
        return requireRows(result);
    }

    private ArrayNode mapWrappedItems(JsonNode items, ContentType type) {
        ArrayNode rows = objectMapper.createArrayNode();
        for (JsonNode item : items) {
            JsonNode mapped = rowsForKnownSource(item, type);
            if (mapped.isArray()) {
                rows.addAll((ArrayNode) mapped);
            } else {
                rows.add(mapped);
            }
        }
        return rows;
    }

    private JsonNode rowsForKnownSource(JsonNode root, ContentType type) {
        if (root == null || !root.isObject() || type == null) {
            return root;
        }
        return switch (type) {
            case VOCABULARY -> root.path("words").isArray() ? mapVocabularyRows(root) : root;
            case GRAMMAR -> root.has("coreTheory") ? mapGrammarRow(root) : root;
            case LISTENING -> mapListeningSource(root);
            case READING -> mapReadingSource(root);
            case QUESTION -> root.path("questions").isArray() ? mapQuestionRows(root) : root;
            case MOCK_TEST -> isEtsTest(root) ? mapMockTestRow(root) : root;
        };
    }

    private ArrayNode mapVocabularyRows(JsonNode root) {
        ArrayNode rows = objectMapper.createArrayNode();
        for (JsonNode source : root.path("words")) {
            ObjectNode row = objectMapper.createObjectNode();
            copyText(source, row, "word", "word");
            copyFirstText(source, row, "meaning", "meaningVi", "meaning", "definitionEn");
            copyFirstText(source, row, "pos", "partOfSpeech", "pos");
            copyText(source, row, "ipa", "ipa");
            copyText(source, row, "level", "level");
            copyFirstText(source, row, "topic", "topic", "themeEn", "tag");
            if (!row.has("topic")) copyFirstText(root, row, "topic", "topic", "themeEn", "tag");
            copyFirstText(source, row, "category", "category", "setName");
            if (!row.has("category")) copyFirstText(root, row, "category", "setName");
            copyFirstText(source, row, "setId", "setId", "setCode");
            if (!row.has("setId")) copyFirstText(root, row, "setId", "setId", "setCode");
            JsonNode examples = source.path("examples");
            if (examples.isArray() && !examples.isEmpty()) {
                copyFirstText(examples.get(0), row, "exampleEn", "sentenceEn", "exampleEn", "sentence");
                copyFirstText(examples.get(0), row, "exampleVi", "sentenceVi", "exampleVi", "translation");
            }
            rows.add(row);
        }
        return rows;
    }

    private ObjectNode mapGrammarRow(JsonNode source) {
        ObjectNode row = objectMapper.createObjectNode();
        copyFirstText(source, row, "title", "titleVi", "title");
        copyFirstText(source, row, "rule", "coreTheory", "rule", "formula");
        copyFirstText(source, row, "explanation", "description", "explanation", "coreTheory");
        copyFirstText(source, row, "englishTitle", "titleEn", "englishTitle");
        copyFirstText(source, row, "code", "topicCode", "code");
        copyFirstText(source, row, "codeName", "codeName");
        copyFirstText(source, row, "category", "category");
        copyFirstText(source, row, "signalClues", "signalClues");
        copyFirstText(source, row, "tipsAndTricks", "tipsAndTricks");
        copyFirstText(source, row, "commonTraps", "commonTraps");
        copyFirstText(source, row, "summaryTable", "summaryTable");
        copyFirstText(source, row, "reference", "reference");
        copyUrl(source, row, "imageUrl", "imageUrl", "imageURL", "image");
        copyUrl(source, row, "audioUrl", "audioUrl", "audioURL", "audio");
        JsonNode questions = source.path("gradedQuestions");
        if (!questions.isArray() || questions.isEmpty()) {
            questions = source.path("questions");
        }
        if (questions.isArray()) {
            row.set("questions", questions.deepCopy());
        }
        return row;
    }

    private JsonNode mapListeningSource(JsonNode root) {
        JsonNode units = root.path("audioUnits");
        if (!units.isArray()) {
            units = root.path("listening").path("audioContentUnits");
        }
        if (units.isArray()) {
            return mapListeningRows(root, units);
        }
        JsonNode listening = root.path("listening");
        if (listening.isObject()) {
            ArrayNode flattened = objectMapper.createArrayNode();
            for (int part = 1; part <= 4; part++) {
                JsonNode partRows = listening.path("part" + part);
                if (partRows.isArray()) {
                    partRows.forEach(flattened::add);
                }
            }
            if (!flattened.isEmpty()) {
                return mapListeningRows(root, flattened);
            }
        }
        return root;
    }

    private ArrayNode mapListeningRows(JsonNode root, JsonNode units) {
        ArrayNode rows = objectMapper.createArrayNode();
        for (JsonNode source : units) {
            ObjectNode row = objectMapper.createObjectNode();
            String testCode = source.path("testCode").asText(root.path("testCode").asText("ETS"));
            String unitId = source.path("unitId").asText(source.path("questionNumber").asText(""));
            row.put("title", testCode + " - " + (unitId.isBlank() ? "Listening" : unitId));
            String part = source.path("partNumber").asText(partNumber(source.path("part").asText("")));
            if (!part.isBlank()) {
                row.put("part", "PART_" + part);
            }
            copyFirstText(source, row, "transcript", "transcriptEn", "transcript", "transcriptVi");
            copyUrl(source, row, "audioUrl", "audioUrl", "audioURL");
            copyFirstText(source, row, "source", "audioFile", "audioFileAbsolute", "source");
            copyText(source, row, "difficulty", "difficulty");
            if (!row.has("difficulty")) {
                row.put("difficulty", difficultyFor(source.path("difficultySummary")));
            }
            copyText(source, row, "durationSeconds", "durationSeconds");
            rows.add(row);
        }
        return rows;
    }

    private JsonNode mapReadingSource(JsonNode root) {
        JsonNode reading = root.path("reading");
        JsonNode passages = reading.path("passages");
        if (!passages.isArray()) {
            passages = root.path("passages");
        }
        if (passages.isArray()) {
            return mapReadingRows(root, passages);
        }
        if (reading.isObject() && hasReadingQuestions(reading)) {
            throw new IllegalArgumentException(
                    "File này chứa danh sách câu hỏi ETS, không có nội dung đoạn văn Reading. "
                            + "Hãy chọn loại Câu hỏi để nhập các câu hỏi, hoặc tải PDF để trích xuất văn bản.");
        }
        return root;
    }

    private boolean hasReadingQuestions(JsonNode reading) {
        for (int part = 5; part <= 7; part++) {
            if (reading.path("part" + part).isArray()) {
                return true;
            }
        }
        return false;
    }

    private ArrayNode mapReadingRows(JsonNode root, JsonNode passages) {
        ArrayNode rows = objectMapper.createArrayNode();
        for (JsonNode source : passages) {
            ObjectNode row = objectMapper.createObjectNode();
            String testCode = root.path("testCode").asText("Reading");
            String passageId = source.path("id").asText(source.path("passageId").asText(""));
            row.put("title", source.path("title").asText(
                    testCode + (passageId.isBlank() ? " Reading passage" : " - " + passageId)));
            copyFirstText(source, row, "content", "content", "text", "passage", "body");
            copyFirstText(source, row, "topic", "topic", "type");
            copyFirstText(source, row, "source", "source", "testCode");
            copyUrl(source, row, "audioUrl", "audioUrl", "audioURL");
            copyUrl(source, row, "imageUrl", "imageUrl", "imageURL", "image");
            rows.add(row);
        }
        return rows;
    }

    private ArrayNode mapQuestionRows(JsonNode root) {
        ArrayNode rows = objectMapper.createArrayNode();
        String testCode = root.path("testCode").asText("");
        for (JsonNode source : root.path("questions")) {
            ObjectNode row = objectMapper.createObjectNode();
            String part = partNumber(source.path("part").asText(""));
            if (!part.isBlank()) {
                row.put("part", "PART_" + part);
            }
            copyFirstText(source, row, "questionText", "questionEn", "questionText", "question");
            copyText(source, row, "correctAnswer", "correctAnswer");
            copyFirstText(source, row, "explanation", "explanation", "solutionMethod");
            row.put("skill", skillForPart(part));
            row.put("difficulty", difficultyFor(source.path("difficultyLevel")));
            copyFirstText(source, row, "passage", "passage", "passageText");
            copyUrl(source, row, "audioUrl", "audioUrl", "audioURL");
            copyUrl(source, row, "imageUrl", "imageUrl", "imageURL");
            if (!testCode.isBlank() && source.hasNonNull("questionNumber")) {
                row.put("code", testCode + "_" + source.path("questionNumber").asText());
            }
            mapOptions(source.path("options"), row);
            rows.add(row);
        }
        return rows;
    }

    private boolean isEtsTest(JsonNode root) {
        return root.isObject() && root.hasNonNull("testCode") && root.path("questions").isArray();
    }

    private ObjectNode mapMockTestRow(JsonNode root) {
        ObjectNode row = objectMapper.createObjectNode();
        copyFirstText(root, row, "title", "title", "testCode");
        copyFirstText(root, row, "description", "description", "title");
        JsonNode duration = root.path("durationMinutes");
        row.put("durationMinutes", duration.isNumber() ? duration.asInt() : 120);
        ArrayNode questionCodes = objectMapper.createArrayNode();
        String testCode = root.path("testCode").asText("ETS");
        for (JsonNode question : root.path("questions")) {
            if (question.hasNonNull("questionNumber")) {
                questionCodes.add(testCode + "_" + question.path("questionNumber").asText());
            }
        }
        if (questionCodes.isEmpty() && root.path("questionCodes").isArray()) {
            questionCodes = (ArrayNode) root.path("questionCodes").deepCopy();
        }
        row.set("questionCodes", questionCodes);
        copyText(root, row, "level", "level");
        return row;
    }

    private void mapOptions(JsonNode source, ObjectNode row) {
        if (source.isArray()) {
            row.set("options", source.deepCopy());
            return;
        }
        if (!source.isObject()) {
            return;
        }
        ArrayNode options = objectMapper.createArrayNode();
        source.properties().forEach(entry -> {
            ObjectNode option = objectMapper.createObjectNode();
            option.put("id", entry.getKey());
            option.put("text", entry.getValue().asText(""));
            options.add(option);
        });
        row.set("options", options);
    }

    private void copyFirstText(JsonNode source, ObjectNode target, String targetField, String... sourceFields) {
        for (String sourceField : sourceFields) {
            JsonNode value = source.get(sourceField);
            if (value != null && value.isValueNode() && !value.asText().isBlank()) {
                target.put(targetField, value.asText());
                return;
            }
        }
    }

    private void copyText(JsonNode source, ObjectNode target, String targetField, String sourceField) {
        JsonNode value = source.get(sourceField);
        if (value != null && value.isValueNode()) {
            target.put(targetField, value.asText());
        }
    }

    private void copyUrl(JsonNode source, ObjectNode target, String targetField, String... sourceFields) {
        for (String sourceField : sourceFields) {
            JsonNode value = source.get(sourceField);
            if (value == null || !value.isTextual()) {
                continue;
            }
            String candidate = value.asText().trim();
            if (candidate.matches("(?i)^https?://.+")) {
                target.put(targetField, candidate);
                return;
            }
        }
    }

    private String partNumber(String source) {
        var matcher = java.util.regex.Pattern.compile("(?i)part\\s*([1-7])").matcher(source);
        if (matcher.find()) {
            return matcher.group(1);
        }
        String trimmed = source.trim();
        return trimmed.matches("[1-7]") ? trimmed : "";
    }

    private String skillForPart(String part) {
        if (part.isBlank()) {
            return "TOEIC";
        }
        int number = Integer.parseInt(part);
        return number <= 4 ? "Listening" : number == 5 ? "Grammar" : "Reading";
    }

    private String difficultyFor(JsonNode level) {
        int value = level.path("level").asInt(0);
        if (value == 1) {
            return "EASY";
        }
        if (value >= 4) {
            return "HARD";
        }
        return "MEDIUM";
    }

    private List<ParsedImportRow> parseCsv(MultipartFile file) throws IOException {
        try (var reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8);
                CSVParser parser = CSVFormat.DEFAULT.builder()
                        .setHeader()
                        .setSkipHeaderRecord(true)
                        .setIgnoreEmptyLines(true)
                        .setTrim(true)
                        .get()
                        .parse(reader)) {
            List<String> headers = normalizeHeaders(parser.getHeaderNames());
            List<ParsedImportRow> result = new ArrayList<>();
            for (var record : parser) {
                if (record.size() != headers.size()) {
                    throw new IllegalArgumentException(
                            "Dòng " + (record.getRecordNumber() + 1) + " có số cột không khớp tiêu đề.");
                }
                ObjectNode data = objectMapper.createObjectNode();
                boolean hasValue = false;
                for (int i = 0; i < headers.size(); i++) {
                    String value = record.get(i);
                    data.put(headers.get(i), value);
                    hasValue |= !value.isBlank();
                }
                if (hasValue) {
                    addRow(result, data, (int) record.getRecordNumber() + 1);
                }
            }
            return requireRows(result);
        } catch (IllegalArgumentException exception) {
            throw exception;
        } catch (RuntimeException exception) {
            throw new IllegalArgumentException("CSV không hợp lệ hoặc thiếu hàng tiêu đề.");
        }
    }

    private List<ParsedImportRow> parseXlsx(MultipartFile file) throws IOException {
        try (XSSFWorkbook workbook = new XSSFWorkbook(file.getInputStream())) {
            if (workbook.getNumberOfSheets() == 0) {
                throw new IllegalArgumentException("File XLSX không có trang tính.");
            }
            var sheet = workbook.getSheetAt(0);
            var headerRow = sheet.getRow(sheet.getFirstRowNum());
            if (headerRow == null) {
                throw new IllegalArgumentException("File XLSX cần có hàng tiêu đề đầu tiên.");
            }
            if (sheet.getLastRowNum() - headerRow.getRowNum() > MAX_ROWS) {
                throw new IllegalArgumentException("Mỗi file chỉ được chứa tối đa " + MAX_ROWS + " dòng dữ liệu.");
            }
            DataFormatter formatter = new DataFormatter(Locale.ROOT);
            FormulaEvaluator evaluator = workbook.getCreationHelper().createFormulaEvaluator();
            List<String> rawHeaders = new ArrayList<>();
            for (int column = 0; column < headerRow.getLastCellNum(); column++) {
                rawHeaders.add(formatter.formatCellValue(headerRow.getCell(column), evaluator));
            }
            List<String> headers = normalizeHeaders(rawHeaders);
            List<ParsedImportRow> result = new ArrayList<>();
            for (int rowIndex = headerRow.getRowNum() + 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
                var row = sheet.getRow(rowIndex);
                if (row == null) {
                    continue;
                }
                for (int column = headers.size(); column < row.getLastCellNum(); column++) {
                    if (!formatter.formatCellValue(row.getCell(column), evaluator).isBlank()) {
                        throw new IllegalArgumentException(
                                "Dòng " + (rowIndex + 1) + " có dữ liệu ngoài các cột tiêu đề.");
                    }
                }
                ObjectNode data = objectMapper.createObjectNode();
                boolean hasValue = false;
                for (int column = 0; column < headers.size(); column++) {
                    String value = formatter.formatCellValue(row.getCell(column), evaluator);
                    data.put(headers.get(column), value);
                    hasValue |= !value.isBlank();
                }
                if (hasValue) {
                    addRow(result, data, rowIndex + 1);
                }
            }
            return requireRows(result);
        } catch (IllegalArgumentException exception) {
            throw exception;
        } catch (RuntimeException exception) {
            throw new IllegalArgumentException("XLSX không hợp lệ hoặc thiếu hàng tiêu đề.");
        }
    }

    private List<String> normalizeHeaders(List<String> rawHeaders) {
        if (rawHeaders.isEmpty()) {
            throw new IllegalArgumentException("File cần có hàng tiêu đề.");
        }
        List<String> headers = new ArrayList<>();
        Set<String> distinct = new HashSet<>();
        for (int i = 0; i < rawHeaders.size(); i++) {
            String header = rawHeaders.get(i).replace("\uFEFF", "").trim();
            if (header.isEmpty()) {
                throw new IllegalArgumentException("Tên cột không được để trống (cột " + (i + 1) + ").");
            }
            if (!distinct.add(header)) {
                throw new IllegalArgumentException("Tên cột bị trùng: " + header + ".");
            }
            headers.add(header);
        }
        return headers;
    }

    private void addRow(List<ParsedImportRow> rows, JsonNode data, int rowNumber) {
        if (!data.isObject()) {
            throw new IllegalArgumentException("Dòng " + rowNumber + " phải là một object JSON.");
        }
        if (rows.size() >= MAX_ROWS) {
            throw new IllegalArgumentException("Mỗi file chỉ được chứa tối đa " + MAX_ROWS + " dòng dữ liệu.");
        }
        rows.add(new ParsedImportRow(rowNumber, data.deepCopy()));
    }

    private List<ParsedImportRow> requireRows(List<ParsedImportRow> rows) {
        if (rows.isEmpty()) {
            throw new IllegalArgumentException("File không có dòng dữ liệu.");
        }
        return rows;
    }

    private String extension(String filename) {
        int dot = filename.lastIndexOf('.');
        return dot < 0 ? "" : filename.substring(dot + 1).toLowerCase(Locale.ROOT);
    }
}
