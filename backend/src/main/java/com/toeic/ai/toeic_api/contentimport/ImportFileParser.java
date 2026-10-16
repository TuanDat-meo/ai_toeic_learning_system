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
import com.fasterxml.jackson.databind.node.ObjectNode;

@Component
public class ImportFileParser {
    static final int MAX_ROWS = 5_000;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<ParsedImportRow> parse(MultipartFile file) {
        String name = file.getOriginalFilename();
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Không xác định được tên file.");
        }
        String extension = extension(name);
        try {
            return switch (extension) {
                case "json" -> parseJson(file);
                case "csv" -> parseCsv(file);
                case "xlsx" -> parseXlsx(file);
                default -> throw new IllegalArgumentException("Chỉ hỗ trợ file CSV, XLSX hoặc JSON.");
            };
        } catch (IOException exception) {
            throw new IllegalArgumentException("Không đọc được file. Hãy kiểm tra định dạng và thử lại.");
        }
    }

    private List<ParsedImportRow> parseJson(MultipartFile file) throws IOException {
        JsonNode root = objectMapper.readTree(file.getInputStream());
        JsonNode rows = root != null && root.isObject() && root.has("items") ? root.get("items") : root;
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
