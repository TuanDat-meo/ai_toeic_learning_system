package com.toeic.ai.toeic_api.contentimport;

import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/media-assets")
public class MediaAssetController {
    private static final Pattern RANGE = Pattern.compile("^bytes=(\\d*)-(\\d*)$");

    private final JdbcTemplate jdbc;

    public MediaAssetController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping("/{id}")
    public ResponseEntity<byte[]> getAsset(@PathVariable UUID id,
            @RequestHeader(value = HttpHeaders.RANGE, required = false) String range) {
        AssetMetadata metadata = jdbc.query("""
                SELECT content_type, size_bytes, content IS NOT NULL AS available
                FROM media_assets WHERE id = ?
                """, rs -> rs.next() ? new AssetMetadata(rs.getString("content_type"), rs.getLong("size_bytes"), rs.getBoolean("available")) : null, id);
        if (metadata == null || !metadata.available()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tệp media.");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.ACCEPT_RANGES, "bytes");
        headers.setContentType(MediaType.parseMediaType(metadata.contentType()));
        headers.setCacheControl("public, max-age=86400");

        if (range == null || range.isBlank()) {
            byte[] content = jdbc.queryForObject("SELECT content FROM media_assets WHERE id = ?", byte[].class, id);
            headers.setContentLength(content.length);
            return ResponseEntity.ok().headers(headers).body(content);
        }

        Matcher matcher = RANGE.matcher(range.trim());
        if (!matcher.matches()) return rangeNotSatisfiable(metadata.sizeBytes());
        long start = matcher.group(1).isEmpty() ? 0 : Long.parseLong(matcher.group(1));
        long end = matcher.group(2).isEmpty() ? metadata.sizeBytes() - 1 : Long.parseLong(matcher.group(2));
        if (start >= metadata.sizeBytes() || end < start) return rangeNotSatisfiable(metadata.sizeBytes());
        end = Math.min(end, metadata.sizeBytes() - 1);
        int length = Math.toIntExact(end - start + 1);
        byte[] content = jdbc.queryForObject("SELECT substring(content FROM ? FOR ?) FROM media_assets WHERE id = ?",
                byte[].class, Math.toIntExact(start + 1), length, id);
        headers.setContentLength(content.length);
        headers.set(HttpHeaders.CONTENT_RANGE, "bytes " + start + "-" + end + "/" + metadata.sizeBytes());
        return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT).headers(headers).body(content);
    }

    private ResponseEntity<byte[]> rangeNotSatisfiable(long size) {
        return ResponseEntity.status(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
                .header(HttpHeaders.CONTENT_RANGE, "bytes */" + size)
                .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                .build();
    }

    private record AssetMetadata(String contentType, long sizeBytes, boolean available) {
    }
}
