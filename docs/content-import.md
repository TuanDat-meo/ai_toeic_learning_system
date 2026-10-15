# Content import: scope and acceptance criteria

## User stories

1. As an administrator, I can import vocabulary, grammar, listening, reading, questions, and mock tests from CSV, XLSX, or JSON so that I can load learning content in batches.
2. As an administrator, I can preview normalized rows and see row-level validation errors and duplicates before any content is published.
3. As an administrator, I can publish all valid, non-duplicate rows in a batch and see exactly how many rows were published or skipped.
4. As an administrator, I can reopen recent import batches and inspect their status and preview rows.

## Scope

- Accepted formats: UTF-8 CSV, XLSX (first worksheet only), and JSON (an array, one object, or an object with an `items` array).
- Maximum upload: 10 MiB and 5,000 data rows per file.
- Imported types: `VOCABULARY`, `GRAMMAR`, `LISTENING`, `READING`, `QUESTION`, and `MOCK_TEST`.
- Every type has a strict, type-specific field set. Unknown fields are reported rather than silently discarded.
- The first release stores published records in `imported_content` as normalized JSON. It does not replace existing content or delete data.
- Media must already be available at an HTTP(S) URL. File upload/storage, PDF/Word/OCR extraction, editing invalid rows in the preview, and automatic updates/merges are not included.
- Existing admin content pages still contain prototype data; they do not yet read the new `imported_content` inventory. The published inventory is available through the admin API and learner-facing content integration is a dependent feature.

## Access control

| Actor | Upload/preview | View batches | Publish | View published inventory |
| --- | --- | --- | --- | --- |
| ADMIN | Allow | Allow | Allow | Allow |
| TEACHER | Deny | Deny | Deny | Deny |
| STUDENT / anonymous | Deny | Deny | Deny | Deny |

The `/admin/data/import` page is inside the existing admin role guard. All API endpoints are under `/api/admin/**`, which is protected by backend Spring Security. Mutating requests use the existing session + CSRF mechanism and are recorded in the audit log.

## Data format and validation

CSV and XLSX use field names as the header row. Array-valued fields in CSV/XLSX accept a JSON array or pipe-separated values; question `options` must be a JSON array of objects with `id` and `text`. JSON records use the same field names and native arrays.

| Type | Required fields | Optional fields |
| --- | --- | --- |
| VOCABULARY | `word`, `meaning` | `pos`, `partOfSpeech`, `ipa`, `example`, `exampleEn`, `exampleVi`, `topic`, `level`, `synonyms`, `antonyms`, `collocations` |
| GRAMMAR | `title`, `rule`, `explanation` | `part`, `examples`, `level` |
| LISTENING | `title`, `part`, `transcript`, `audioUrl` | `durationSeconds`, `source`, `difficulty` |
| READING | `title`, `content` | `part` (Part 6/7 only), `topic`, `difficulty`, `source` |
| QUESTION | `part`, `questionText`, `options`, `correctAnswer`, `explanation`, `skill`, `difficulty` | `passage`, `imageUrl`, `audioUrl`, `code` |
| MOCK_TEST | `title`, `description`, `durationMinutes`, `questionCodes` | `level` |

Normalization trims text, normalizes line endings and Unicode, canonicalizes Part and difficulty values, uppercases option IDs/answer, and derives a SHA-256 deduplication key. Part values accept forms such as `Part 5`, `PART_5`, and `5`. Difficulty accepts `EASY`, `MEDIUM`, or `HARD`. Duration fields are bounded to 1–86,400 seconds or 1–600 minutes. Media URLs must use HTTP or HTTPS.

Duplicate keys are calculated per type: vocabulary word; grammar title + rule; listening title + transcript; reading title + content; question code when supplied, otherwise part + prompt + option text + answer; mock test title. Duplicates against published records and earlier rows in the same file are flagged and never overwritten. Mock-test question codes must reference questions that have already been published; import and publish questions before importing the test.

## API contract

- `POST /api/admin/data/import/preview?type={CONTENT_TYPE}` — multipart fields `file` and `type`; creates a preview batch and returns the summary plus up to 100 normalized rows.
- `GET /api/admin/data/import/batches?limit=30` — recent batches (limit clamped to 1–100).
- `GET /api/admin/data/import/batches/{id}?offset=0&limit=100` — batch summary and a page of preview rows; offset/limit allow paging through all rows (`limit` is clamped to 1–100).
- `POST /api/admin/data/import/batches/{id}/publish` — publishes rows currently marked `VALID`; duplicate conflicts at publish time are skipped.
- `GET /api/admin/data/import/published?type={CONTENT_TYPE}&limit=50` — published inventory (limit clamped to 1–100); `type` is optional.

Batch statuses: `PREVIEW`, `PUBLISHED`, `PARTIAL`, `NO_VALID_ROWS`. Item statuses: `VALID`, `INVALID`, `DUPLICATE`, `PUBLISHED`. Publishing is a single transaction and is allowed once. A batch with valid rows may be published even if other rows are invalid/duplicates; those rows remain visible and are skipped. Batches with no valid rows are marked `NO_VALID_ROWS` and cannot be published. Invalid rows are not editable in this release and must be corrected in the source file and re-imported.

## UI states and acceptance criteria

1. Given an admin opens the page, the supported file types, row/file limits, required fields, templates, and recent import history are visible.
2. Given no file is selected, preview cannot be submitted. Empty history and empty preview have explanatory states.
3. Given an unsupported, empty, oversized, malformed, or over-limit file, a clear error is displayed and no preview batch is created.
4. Given valid file syntax, preview creates a persistent batch, normalizes the supported fields, and reports counts for valid, invalid, and duplicate rows.
5. Given invalid data, the preview identifies the source row and each validation message; invalid rows cannot be published.
6. Given duplicate data in the upload or published inventory, the preview identifies it and it cannot overwrite existing published data.
7. Given at least one valid row, the admin must confirm publish. Publish makes valid non-duplicate rows queryable in the published inventory; invalid/duplicate rows are skipped.
8. Given publish is retried or the batch is already processed, the API rejects the operation without publishing rows a second time.
9. Given concurrent imports of the same content, the database unique constraint prevents duplicate publication; the conflicting row is reported as duplicate.
10. Given an API/network/server failure, the UI shows an error and retains the selected/previewed context so the admin can retry or inspect the batch.
11. Given a non-admin user calls any import endpoint, the backend denies access independently of frontend route guards.

## Related-feature dependencies

- Uses existing `content_sources`, `import_batches`, `import_items`, session authentication, CSRF handling, and audit logging.
- Adds a generic published-content inventory because grammar and mock-test entities do not currently have relational content tables.
- Existing learning/admin content pages are still mock-backed. Integrating published records into those pages, adding learner delivery/practice APIs, and storing media assets are separate follow-up work; import success must not be interpreted as those downstream flows being complete.
