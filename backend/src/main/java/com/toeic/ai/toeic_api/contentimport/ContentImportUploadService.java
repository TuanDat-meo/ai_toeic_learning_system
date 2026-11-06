package com.toeic.ai.toeic_api.contentimport;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFTable;
import org.apache.poi.hwpf.HWPFDocument;
import org.apache.poi.hwpf.extractor.WordExtractor;
import org.jsoup.Jsoup;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import software.amazon.awssdk.core.exception.SdkException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
public class ContentImportUploadService {
    private static final long MAX_FILE_SIZE = 256L * 1024 * 1024;
    private static final Map<ContentType, Set<String>> DOCUMENT_EXTENSIONS = Map.of(
            ContentType.VOCABULARY, Set.of("pdf", "png", "jpg", "jpeg", "webp", "doc", "docx", "md"),
            ContentType.GRAMMAR, Set.of("pdf", "png", "jpg", "jpeg", "webp", "doc", "docx", "md"),
            ContentType.LISTENING, Set.of("pdf", "png", "jpg", "jpeg", "webp", "doc", "docx", "txt", "md"),
            ContentType.READING, Set.of("pdf", "png", "jpg", "jpeg", "webp", "doc", "docx", "txt", "html", "md"),
            ContentType.QUESTION, Set.of("pdf", "doc", "docx", "md"),
            ContentType.MOCK_TEST, Set.of("pdf", "png", "jpg", "jpeg", "webp", "doc", "docx", "md"));
    private static final Map<ContentType, Set<String>> MEDIA_EXTENSIONS = Map.of(
            ContentType.VOCABULARY, Set.of("mp3", "wav", "png", "jpg", "jpeg", "webp"),
            ContentType.GRAMMAR, Set.of("png", "jpg", "jpeg", "webp", "mp3", "wav"),
            ContentType.LISTENING, Set.of("mp3", "wav", "m4a", "mp4", "png", "jpg", "jpeg", "webp"),
            ContentType.READING, Set.of("mp3", "wav", "m4a", "mp4", "png", "jpg", "jpeg", "webp"),
            ContentType.QUESTION, Set.of("mp3", "wav", "m4a", "mp4", "png", "jpg", "jpeg", "webp"),
            ContentType.MOCK_TEST, Set.of("mp3", "wav", "m4a", "mp4", "png", "jpg", "jpeg", "webp"));
    private static final Map<String, String> CONTENT_TYPES = Map.ofEntries(
            Map.entry("pdf", "application/pdf"),
            Map.entry("png", "image/png"),
            Map.entry("jpg", "image/jpeg"),
            Map.entry("jpeg", "image/jpeg"),
            Map.entry("webp", "image/webp"),
            Map.entry("doc", "application/msword"),
            Map.entry("docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
            Map.entry("txt", "text/plain; charset=utf-8"),
            Map.entry("md", "text/markdown; charset=utf-8"),
            Map.entry("html", "text/html; charset=utf-8"),
            Map.entry("mp3", "audio/mpeg"),
            Map.entry("wav", "audio/wav"),
            Map.entry("m4a", "audio/mp4"),
            Map.entry("mp4", "video/mp4"));

    private final S3Client s3Client;
    private final RestClient restClient;
    private final String bucket;
    private final String publicBaseUrl;
    private final String ocrUrl;

    @Autowired
    public ContentImportUploadService(S3Client s3Client, RestClient.Builder restClientBuilder,
            @Value("${app.content-import.storage.bucket:}") String bucket,
            @Value("${app.content-import.storage.public-base-url:}") String publicBaseUrl,
            @Value("${app.content-import.ocr-url:http://localhost:8001}") String ocrUrl) {
        this(s3Client, createRestClient(restClientBuilder), bucket, publicBaseUrl, ocrUrl);
    }

    ContentImportUploadService(S3Client s3Client, RestClient restClient,
            String bucket, String publicBaseUrl, String ocrUrl) {
        this.s3Client = s3Client;
        this.restClient = restClient;
        this.bucket = bucket.trim();
        this.publicBaseUrl = trimTrailingSlash(publicBaseUrl.trim());
        this.ocrUrl = trimTrailingSlash(ocrUrl.trim());
    }

    private static RestClient createRestClient(RestClient.Builder restClientBuilder) {
        var requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(java.time.Duration.ofSeconds(15));
        requestFactory.setReadTimeout(java.time.Duration.ofMinutes(5));
        return restClientBuilder.requestFactory(requestFactory).build();
    }

    public DocumentExtraction extract(ContentType type, MultipartFile file) {
        String extension = validateFile(file, type, type == null ? Set.of() : DOCUMENT_EXTENSIONS.get(type));
        String text = extractText(file, extension);
        String storageKey = store(file, type, extension, false);
        return new DocumentExtraction(safeFileName(file.getOriginalFilename()), type, text, storageKey);
    }

    public MediaAsset uploadMedia(ContentType type, MultipartFile file) {
        Set<String> allowedExtensions = type == null ? Set.of() : MEDIA_EXTENSIONS.getOrDefault(type, Set.of());
        String extension = validateFile(file, type, allowedExtensions);
        if (publicBaseUrl.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Hiện chưa thể tạo liên kết phát media. Hãy dùng URL media có sẵn hoặc thử lại sau.");
        }
        String storageKey = store(file, type, extension, true);
        boolean isImage = Set.of("png", "jpg", "jpeg", "webp").contains(extension);
        String fieldName = isImage ? "imageUrl" : "audioUrl";
        return new MediaAsset(safeFileName(file.getOriginalFilename()), type,
                publicBaseUrl + "/" + storageKey,
                fieldName,
                storageKey);
    }

    private String extractText(MultipartFile file, String extension) {
        try {
            return switch (extension) {
                case "pdf", "png", "jpg", "jpeg", "webp" -> extractWithOcr(file);
                case "doc" -> extractDoc(file);
                case "docx" -> extractDocx(file);
                case "html" -> Jsoup.parse(file.getInputStream(), StandardCharsets.UTF_8.name(), "").text();
                case "txt", "md" -> new String(file.getBytes(), StandardCharsets.UTF_8);
                default -> throw new IllegalArgumentException("Không hỗ trợ trích xuất định dạng tài liệu này.");
            };
        } catch (IOException exception) {
            throw new IllegalArgumentException("Không đọc được file tài liệu. Hãy kiểm tra file và thử lại.");
        }
    }

    private String extractWithOcr(MultipartFile file) throws IOException {
        if (ocrUrl.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Chưa cấu hình dịch vụ PaddleOCR.");
        }
        String ext = extension(file.getOriginalFilename());
        String uploadName = asciiFileName(file.getOriginalFilename());
        var resource = new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return uploadName;
            }
        };
        var multipart = new LinkedMultiValueMap<String, Object>();
        var partHeaders = new HttpHeaders();
        String mimeType = CONTENT_TYPES.getOrDefault(ext, MediaType.APPLICATION_OCTET_STREAM_VALUE);
        partHeaders.setContentType(MediaType.parseMediaType(mimeType));
        multipart.add("file", new HttpEntity<>(resource, partHeaders));

        OcrResult result;
        try {
            result = restClient.post()
                    .uri(ocrUrl + "/extract")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(multipart)
                    .retrieve()
                    .body(OcrResult.class);
        } catch (HttpStatusCodeException exception) {
            throw new ResponseStatusException(exception.getStatusCode(),
                    "Dịch vụ OCR từ chối file: " + exception.getResponseBodyAsString(), exception);
        } catch (RestClientException exception) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Không thể kết nối PaddleOCR. Hãy kiểm tra dịch vụ OCR rồi thử lại.", exception);
        }
        if (result == null || result.text() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "PaddleOCR trả về kết quả không hợp lệ.");
        }
        return result.text();
    }

    private String extractDoc(MultipartFile file) throws IOException {
        try (HWPFDocument document = new HWPFDocument(file.getInputStream());
                WordExtractor extractor = new WordExtractor(document)) {
            return extractor.getText();
        }
    }

    private String extractDocx(MultipartFile file) throws IOException {
        try (XWPFDocument document = new XWPFDocument(file.getInputStream())) {
            StringBuilder text = new StringBuilder();
            for (XWPFParagraph paragraph : document.getParagraphs()) {
                appendLine(text, paragraph.getText());
            }
            for (XWPFTable table : document.getTables()) {
                for (var row : table.getRows()) {
                    appendLine(text, row.getTableCells().stream()
                            .map(cell -> cell.getText().replace('\n', ' '))
                            .collect(Collectors.joining("\t")));
                }
            }
            return text.toString();
        }
    }

    private String store(MultipartFile file, ContentType type, String extension, boolean requirePublicBaseUrl) {
        if (bucket.isBlank()) {
            if (requirePublicBaseUrl) {
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                        "Chưa cấu hình CONTENT_IMPORT_S3_BUCKET.");
            }
            return null;
        }
        if (requirePublicBaseUrl && publicBaseUrl.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Hiện chưa thể tạo liên kết phát media. Hãy dùng URL media có sẵn hoặc thử lại sau.");
        }
        String key = "content-import/" + type.name().toLowerCase(Locale.ROOT) + "/"
                + UUID.randomUUID() + "." + extension;
        String contentType = CONTENT_TYPES.get(extension);
        try {
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucket)
                            .key(key)
                            .contentType(contentType)
                            .build(),
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        } catch (IOException exception) {
            throw new IllegalArgumentException("Không thể đọc file để lưu vào Object Storage.");
        } catch (SdkException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Không thể lưu file vào AWS S3. Kiểm tra cấu hình bucket và quyền truy cập.", exception);
        }
        return key;
    }

    private String validateFile(MultipartFile file, ContentType type, Set<String> allowedExtensions) {
        if (type == null) {
            throw new IllegalArgumentException("Chọn loại nội dung cần nhập.");
        }
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Chọn file có dữ liệu trước khi tiếp tục.");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File không được vượt quá 256 MB.");
        }
        String name = file.getOriginalFilename();
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Không xác định được tên file.");
        }
        String extension = extension(name);
        if (!allowedExtensions.contains(extension)) {
            String allowed = allowedExtensions.stream().sorted().map(value -> "." + value)
                    .collect(Collectors.joining(", "));
            throw new IllegalArgumentException("Định dạng không được hỗ trợ cho loại nội dung này. Cho phép: " + allowed + ".");
        }
        return extension;
    }

    private static void appendLine(StringBuilder text, String value) {
        if (value != null && !value.isBlank()) {
            if (text.length() > 0) {
                text.append('\n');
            }
            text.append(value.trim());
        }
    }

    private static String extension(String filename) {
        if (filename == null) return "";
        int dot = filename.lastIndexOf('.');
        return dot < 0 ? "" : filename.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    private static String safeFileName(String filename) {
        return filename == null ? "uploaded-file" : filename.replaceAll("[\\r\\n\\\\/]", "_");
    }

    private static String asciiFileName(String filename) {
        if (filename == null || filename.isBlank()) {
            return "upload.file";
        }
        return filename.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    private static String trimTrailingSlash(String value) {
        return value.replaceAll("/+$", "");
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record OcrResult(String text) {
    }

    public record DocumentExtraction(String fileName, ContentType contentType, String text, String storageKey) {
    }

    public record MediaAsset(String fileName, ContentType contentType, String url, String fieldName, String storageKey) {
    }
}
