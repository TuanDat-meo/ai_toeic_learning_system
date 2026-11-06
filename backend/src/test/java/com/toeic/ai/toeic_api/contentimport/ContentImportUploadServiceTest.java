package com.toeic.ai.toeic_api.contentimport;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

class ContentImportUploadServiceTest {
    private final S3Client s3Client = mock(S3Client.class);
    private final ContentImportUploadService service = new ContentImportUploadService(
            s3Client, RestClient.builder(), "toeic-content", "https://cdn.example.com", "http://localhost:8001");

    @Test
    void uploadsOnlyMediaSupportedForTheSelectedContentType() {
        var file = new MockMultipartFile("file", "pronunciation.mp3", "audio/mpeg", new byte[] { 1, 2, 3 });

        var result = service.uploadMedia(ContentType.VOCABULARY, file);

        assertThat(result.url()).startsWith("https://cdn.example.com/content-import/vocabulary/");
        assertThat(result.url()).endsWith(".mp3");
        verify(s3Client).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    void questionImagesAreUploadedForTheImageUrlField() {
        var file = new MockMultipartFile("file", "question.webp", "image/webp", new byte[] { 1, 2, 3 });

        var result = service.uploadMedia(ContentType.QUESTION, file);

        assertThat(result.fieldName()).isEqualTo("imageUrl");
        verify(s3Client).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    void rejectsMediaFormatNotAllowedForTheSelectedContentType() {
        var file = new MockMultipartFile("file", "lesson.m4a", "audio/mp4", new byte[] { 1 });

        assertThatThrownBy(() -> service.uploadMedia(ContentType.GRAMMAR, file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Định dạng không được hỗ trợ");
        verify(s3Client, never()).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    void reportsUnavailablePlaybackLinkWithoutExposingStorageConfiguration() {
        var serviceWithoutPublicUrl = new ContentImportUploadService(
                s3Client, RestClient.builder(), "toeic-content", "", "http://localhost:8001");
        var file = new MockMultipartFile("file", "pronunciation.mp3", "audio/mpeg", new byte[] { 1 });

        assertThatThrownBy(() -> serviceWithoutPublicUrl.uploadMedia(ContentType.VOCABULARY, file))
                .isInstanceOf(org.springframework.web.server.ResponseStatusException.class)
                .hasMessageContaining("liên kết phát media")
                .hasMessageNotContaining("CONTENT_IMPORT_S3_PUBLIC_BASE_URL");
        verify(s3Client, never()).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    void rejectsDocumentFormatNotAllowedForTheSelectedContentType() {
        var file = new MockMultipartFile("file", "vocabulary.txt", "text/plain", "word".getBytes());

        assertThatThrownBy(() -> service.extract(ContentType.VOCABULARY, file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Định dạng không được hỗ trợ");
        verify(s3Client, never()).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    void forwardsPdfToOcrAsFileMultipartField() {
        RestClient.Builder restClientBuilder = RestClient.builder();
        MockRestServiceServer ocrServer = MockRestServiceServer.bindTo(restClientBuilder).build();
        var ocrService = new ContentImportUploadService(
                s3Client, restClientBuilder.build(), "toeic-content", "https://cdn.example.com", "http://ocr.example");
        var file = new MockMultipartFile("file", "toeic-words.pdf", "application/pdf",
                new byte[] { 1, 2, 3 });
        ocrServer.expect(requestTo("http://ocr.example/extract"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(content().contentTypeCompatibleWith(MediaType.MULTIPART_FORM_DATA))
                .andExpect(content().string(containsString("name=\"file\"")))
                .andExpect(content().string(containsString("filename=\"toeic-words.pdf\"")))
                .andRespond(withSuccess("{\"text\":\"schedule\"}", MediaType.APPLICATION_JSON));

        var result = ocrService.extract(ContentType.VOCABULARY, file);

        assertThat(result.text()).isEqualTo("schedule");
        ocrServer.verify();
    }

    @Test
    void extractsMarkdownForVocabularyAndStoresTheSource() {
        var file = new MockMultipartFile("file", "words.md", "text/markdown", "# TOEIC words".getBytes());

        var result = service.extract(ContentType.VOCABULARY, file);

        assertThat(result.text()).isEqualTo("# TOEIC words");
        verify(s3Client).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    void rejectsExecutableAndArchiveUploads() {
        var executable = new MockMultipartFile("file", "tool.exe", "application/octet-stream", new byte[] { 1 });
        var archive = new MockMultipartFile("file", "audio.zip", "application/zip", new byte[] { 1 });

        assertThatThrownBy(() -> service.uploadMedia(ContentType.MOCK_TEST, executable))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> service.uploadMedia(ContentType.MOCK_TEST, archive))
                .isInstanceOf(IllegalArgumentException.class);
        verify(s3Client, never()).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    void extractsPlainTextAndStoresTheOriginalDocument() {
        var file = new MockMultipartFile("file", "reading.txt", "text/plain",
                "A notice for all employees.".getBytes(java.nio.charset.StandardCharsets.UTF_8));

        var result = service.extract(ContentType.READING, file);

        assertThat(result.text()).isEqualTo("A notice for all employees.");
        assertThat(result.storageKey()).startsWith("content-import/reading/");
        verify(s3Client).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    void extractsPlainTextForListeningAndStoresTheOriginalDocument() {
        var file = new MockMultipartFile("file", "listening-answer-key.txt", "text/plain",
                "1. A\n2. C".getBytes(java.nio.charset.StandardCharsets.UTF_8));

        var result = service.extract(ContentType.LISTENING, file);

        assertThat(result.text()).isEqualTo("1. A\n2. C");
        assertThat(result.storageKey()).startsWith("content-import/listening/");
        verify(s3Client).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    void rejectsQuestionImagesAsDocumentsBecauseTheyMustBeUploadedAsMedia() {
        var file = new MockMultipartFile("file", "question.webp", "image/webp", new byte[] { 1, 2, 3 });

        assertThatThrownBy(() -> service.extract(ContentType.QUESTION, file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Định dạng không được hỗ trợ");
        verify(s3Client, never()).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }
}
