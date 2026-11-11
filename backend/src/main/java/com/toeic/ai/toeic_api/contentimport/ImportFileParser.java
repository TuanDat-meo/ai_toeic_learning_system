package com.toeic.ai.toeic_api.contentimport;

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.FormulaEvaluator;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
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
                case "csv" -> maybeGroupReadingQuestionRows(parseCsv(file), name, type);
                case "xlsx", "xls" -> maybeGroupReadingQuestionRows(parseXlsx(file), name, type);
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
            boolean isSingleReadingCard = root.has("questions") || root.has("sampleQuestions") || root.has("title");
            if (!isSingleReadingCard) {
                passages = root.path("passages");
            }
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
            copyFirstText(source, row, "content", "content", "text", "passage", "passageText", "body");
            copyFirstText(source, row, "passageTextVi", "passageTextVi");
            copyFirstText(source, row, "part", "part");
            copyFirstText(source, row, "category", "category");
            copyFirstText(source, row, "subCategory", "subCategory");
            copyFirstText(source, row, "subtitle", "subtitle");
            copyFirstText(source, row, "tag", "tag");
            copyFirstText(source, row, "topic", "topic", "type");
            copyFirstText(source, row, "difficulty", "difficulty");
            copyFirstText(source, row, "source", "source", "testCode");
            copyUrl(source, row, "audioUrl", "audioUrl", "audioURL");
            copyUrl(source, row, "imageUrl", "imageUrl", "imageURL", "image");
            if (source.has("totalQuestions") && source.path("totalQuestions").isInt()) {
                row.put("totalQuestions", source.path("totalQuestions").asInt());
            }
            if (source.has("questions") && source.path("questions").isArray()) {
                row.set("questions", source.path("questions").deepCopy());
            } else if (source.has("sampleQuestions") && source.path("sampleQuestions").isArray()) {
                row.set("questions", source.path("sampleQuestions").deepCopy());
            }
            if (source.has("theory") && source.path("theory").isObject()) {
                row.set("theory", source.path("theory").deepCopy());
            }
            if (source.has("vocabList") && source.path("vocabList").isArray()) {
                row.set("vocabList", source.path("vocabList").deepCopy());
            } else if (source.has("vocabulary") && source.path("vocabulary").isArray()) {
                row.set("vocabList", source.path("vocabulary").deepCopy());
            }
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
        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
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

    private List<ParsedImportRow> maybeGroupReadingQuestionRows(
            List<ParsedImportRow> rows, String fileName, ContentType type) {
        if (type != ContentType.READING || rows.isEmpty()) {
            return rows;
        }
        boolean hasQuestionColumns = rows.stream().anyMatch(r ->
                !extractFieldByAliases(r.data(), "debaitienganh", "questiontext", "question", "debai").isBlank()
                        && (!extractFieldByAliases(r.data(), "dapana", "optiona", "a").isBlank()
                                || !extractFieldByAliases(r.data(), "dapandungabcd", "dapandung", "correctanswer", "answer", "key").isBlank()));
        boolean hasCardStructure = rows.stream().anyMatch(r -> {
            JsonNode d = r.data();
            return d.has("questions") || d.has("sampleQuestions") || d.has("passages")
                    || (!hasQuestionColumns && d.has("title") && (d.has("content") || d.has("passageText") || d.has("passage")));
        });
        if (hasCardStructure || !hasQuestionColumns) {
            return rows;
        }

        ArrayNode questions = objectMapper.createArrayNode();
        String title = "";
        String rawPart = "";
        String tag = "";
        String passageText = "";
        String passageTextVi = "";

        for (int i = 0; i < rows.size(); i++) {
            JsonNode rowData = rows.get(i).data();
            if (title.isBlank()) title = extractFieldByAliases(rowData, "tieude", "title");
            if (rawPart.isBlank()) rawPart = extractFieldByAliases(rowData, "phanthi", "part", "category");
            if (tag.isBlank()) tag = extractFieldByAliases(rowData, "the", "tag", "topic");
            if (passageText.isBlank()) passageText = extractFieldByAliases(rowData, "doanvan", "passagetext", "passage", "content");
            if (passageTextVi.isBlank()) passageTextVi = extractFieldByAliases(rowData, "bandichdoanvan", "passagetextvi");

            String qText = extractFieldByAliases(rowData, "debaitienganh", "questiontext", "question", "debai");
            if (qText.isBlank()) continue;

            ObjectNode qObj = objectMapper.createObjectNode();
            String qNum = extractFieldByAliases(rowData, "causo", "questionnum", "stt", "no");
            qObj.put("questionNum", qNum.isBlank() ? String.valueOf(101 + questions.size()) : qNum);
            qObj.put("question", qText);

            String bilingual = extractFieldByAliases(rowData, "bandichtiengviet", "bilingual", "translation", "dichcau", "dich");
            if (!bilingual.isBlank()) qObj.put("bilingual", bilingual);

            ObjectNode opts = objectMapper.createObjectNode();
            opts.put("A", extractFieldByAliases(rowData, "dapana", "optiona", "a"));
            opts.put("B", extractFieldByAliases(rowData, "dapanb", "optionb", "b"));
            opts.put("C", extractFieldByAliases(rowData, "dapanc", "optionc", "c"));
            opts.put("D", extractFieldByAliases(rowData, "dapand", "optiond", "d"));
            qObj.set("options", opts);

            String correctRaw = extractFieldByAliases(rowData, "dapandungabcd", "dapandung", "correctanswer", "answer", "key")
                    .trim().toUpperCase(Locale.ROOT);
            String correctLetter = correctRaw.isEmpty() ? "A" : correctRaw.substring(0, 1);
            if (!Set.of("A", "B", "C", "D").contains(correctLetter)) correctLetter = "A";
            qObj.put("correctAnswer", correctLetter);

            String exp = extractFieldByAliases(rowData, "giaithichchitiet", "giaithich", "explanation", "loigiai");
            if (!exp.isBlank()) qObj.put("explanation", exp);

            String vocabRaw = extractFieldByAliases(rowData, "tuvung", "vocab", "vocabulary");
            if (!vocabRaw.isBlank()) {
                ArrayNode vocabArr = parseTabularVocabList(vocabRaw);
                if (!vocabArr.isEmpty()) qObj.set("vocabList", vocabArr);
            }
            questions.add(qObj);
        }

        if (questions.isEmpty()) {
            return rows;
        }

        ObjectNode card = objectMapper.createObjectNode();
        card.put("title", title.isBlank() ? stripFileExtension(fileName) : title);
        String resolvedPart = resolveReadingPart(rawPart, !passageText.isBlank(), questions);
        card.put("part", resolvedPart);
        if (!tag.isBlank()) card.put("tag", tag);
        if (!passageText.isBlank()) {
            card.put("content", passageText);
        } else if ("PART_5".equals(resolvedPart)) {
            card.put("content", "Directions: A word or phrase is missing in each of the sentences below. Four answer choices are given below each sentence. Select the best answer to complete the sentence.");
        }
        if (!passageTextVi.isBlank()) card.put("passageTextVi", passageTextVi);
        card.set("questions", questions);
        card.put("totalQuestions", questions.size());
        return List.of(new ParsedImportRow(1, card));
    }

    private String extractFieldByAliases(JsonNode rowData, String... aliases) {
        if (rowData == null || !rowData.isObject()) return "";
        Map<String, String> byKey = new LinkedHashMap<>();
        rowData.fields().forEachRemaining(entry ->
                byKey.put(normalizeHeaderKey(entry.getKey()), entry.getValue().asText("")));
        for (String alias : aliases) {
            String exact = byKey.get(alias);
            if (exact != null && !exact.isBlank()) return exact.trim();
        }
        for (String alias : aliases) {
            if (alias.length() < 4) continue;
            for (Map.Entry<String, String> entry : byKey.entrySet()) {
                if (entry.getKey().contains(alias) && entry.getValue() != null && !entry.getValue().isBlank()) {
                    return entry.getValue().trim();
                }
            }
        }
        return "";
    }

    private ArrayNode parseTabularVocabList(String raw) {
        ArrayNode arr = objectMapper.createArrayNode();
        Pattern ipaPat = Pattern.compile("/([^/]+)/");
        Pattern posPat = Pattern.compile("(?i)\\((n|v|adj|adv|prep|conj|pron|n,\\s*v)[^\\)]*\\)");
        for (String seg : raw.split("[,;]")) {
            String trimmed = seg.trim();
            if (trimmed.isEmpty()) continue;
            String ipa = "";
            Matcher ipaM = ipaPat.matcher(trimmed);
            if (ipaM.find()) ipa = "/" + ipaM.group(1).trim() + "/";
            String pos = "n";
            Matcher posM = posPat.matcher(trimmed);
            if (posM.find()) pos = posM.group(1).trim().toLowerCase(Locale.ROOT);
            String cleaned = trimmed
                    .replaceAll("\\(\\s*/[^/]+/\\s*\\)", "")
                    .replaceAll("/[^/]+/", "")
                    .replaceAll("(?i)\\((?:n|v|adj|adv|prep|conj|pron|n,\\s*v)[^\\)]*\\)", "")
                    .replaceAll("\\(\\s*\\)", "")
                    .trim();
            String[] parts = cleaned.split("[:\\-=]\\s*", 2);
            String word = parts[0].replaceAll("[\\(\\)\\[\\]]", "").trim();
            if (word.isEmpty() || !word.matches("^[A-Za-z][A-Za-z\\s'\\-]*$")) continue;
            ObjectNode v = objectMapper.createObjectNode();
            v.put("word", word);
            if (!ipa.isEmpty()) v.put("ipa", ipa);
            v.put("pos", pos);
            v.put("meaning", (parts.length >= 2 && !parts[1].isBlank()) ? parts[1].trim() : "Từ vựng trọng tâm");
            v.put("level", "B1");
            arr.add(v);
        }
        return arr;
    }

    private String resolveReadingPart(String rawPart, boolean hasPassage, ArrayNode questions) {
        String lower = rawPart.toLowerCase(Locale.ROOT);
        if (lower.contains("6")) return "PART_6";
        if (lower.contains("7")) return "PART_7";
        if (lower.contains("5")) return "PART_5";
        if (hasPassage) return "PART_7";
        if (!questions.isEmpty()) {
            String firstNum = questions.get(0).path("questionNum").asText("101");
            try {
                int n = Integer.parseInt(firstNum.replaceAll("\\D+", ""));
                if (n >= 147) return "PART_7";
                if (n >= 131) return "PART_6";
            } catch (NumberFormatException ignored) {
            }
        }
        return "PART_5";
    }

    private String normalizeHeaderKey(String raw) {
        if (raw == null) return "";
        String noBom = raw.replace("\uFEFF", "").replace('đ', 'd').replace('Đ', 'D');
        String decomposed = Normalizer.normalize(noBom, Normalizer.Form.NFD).replaceAll("[\\p{InCombiningDiacriticalMarks}]", "");
        return decomposed.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "");
    }

    private String stripFileExtension(String fileName) {
        if (fileName == null || fileName.isBlank()) return "Reading Practice";
        int dot = fileName.lastIndexOf('.');
        String base = dot > 0 ? fileName.substring(0, dot) : fileName;
        return base.replace('_', ' ').replace('-', ' ').trim();
    }

    private String extension(String filename) {
        int dot = filename.lastIndexOf('.');
        return dot < 0 ? "" : filename.substring(dot + 1).toLowerCase(Locale.ROOT);
    }
}
