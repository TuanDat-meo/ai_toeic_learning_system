# Content import: scope and acceptance criteria

## User stories

1. As an administrator or teacher, I can create and review structured vocabulary previews from JSON, CSV, or XLSX.
2. As an administrator or teacher, I can direct vocabulary imports to an existing set or name a new set when the file has no set metadata.
3. As an administrator or teacher, I can add, edit, or remove vocabulary rows in a draft preview and immediately revalidate the batch.
4. As an administrator, I can upload an MP3/WAV pronunciation file while adding or editing a vocabulary row, or enter an existing audio URL.
4. As an administrator, I can publish all valid, non-duplicate rows in a batch and see exactly how many rows were published or skipped.
5. As an administrator, I can reopen recent import batches and inspect their status and preview rows.
6. As an administrator, I can extract text from supported documents and review/download the OCR draft before converting it to the structured import format.
7. As an administrator, I can upload audio/video assets to S3 and use their durable URLs in structured content records.

## Scope

- Structured import formats: UTF-8 CSV, XLSX (first worksheet only), and JSON (an array, one object, or an object with an `items` array).
- Maximum upload: 256 MiB and 5,000 structured data rows per file.
- Imported types: `VOCABULARY`, `GRAMMAR`, `READING`, and `QUESTION` in the general content import UI. `LISTENING` and `MOCK_TEST` are authored and managed directly within their dedicated features (`/admin/content/listening` and `/admin/content/mock-tests`) to ensure audio quality, dictation sync, and full ETS mock test format compliance.
- Every type has a strict, type-specific field set. Unknown fields are reported rather than silently discarded. Files with no fields matching the selected content type are rejected with a content-type format error; rows that match the type but omit required values continue to show field-level validation errors.
- Additional document upload formats are restricted by content type:

  | Type | Documents accepted for text extraction | Media uploaded to S3 |
  | --- | --- | --- |
  | VOCABULARY | PDF, PNG, JPG/JPEG, WEBP, DOC/DOCX, Markdown | MP3, WAV |
  | GRAMMAR | PDF, PNG, JPG/JPEG, WEBP, DOC/DOCX, Markdown | — |
  | LISTENING | PDF, PNG, JPG/JPEG, WEBP, DOC/DOCX, TXT, Markdown | MP3, WAV, M4A, MP4 |
  | READING | PDF, PNG, JPG/JPEG, WEBP, DOC/DOCX, TXT, HTML, Markdown | — |
  | QUESTION | PDF, DOC/DOCX, Markdown | PNG, JPG/JPEG, WEBP, MP3, WAV, M4A, MP4 |
  | MOCK_TEST | PDF, PNG, JPG/JPEG, WEBP, DOC/DOCX, Markdown | MP3, WAV, M4A, MP4 |

- PDF and image files use the self-hosted PaddleOCR service. DOC/DOCX, TXT, Markdown, and HTML are extracted locally by the backend. Extraction returns plain text and a downloadable JSON draft; it does not infer TOEIC fields, answers, or question relationships, and it cannot be published directly. Admins must review and convert the draft into the structured CSV/XLSX/JSON schema.
- XLSX remains a supported structured-import format for content prepared in spreadsheets.
- The importer maps the existing `Data` JSON shapes for vocabulary sets (`words` array), grammar topics (`coreTheory`/`description`), and ETS test question lists (`questions` array) into preview rows. Vocabulary imports preserve per-row `setId`/`topic` values, falling back to set metadata at the JSON root. When a vocabulary row has no set metadata, choose an existing set or enter a new set name before preview; the importer does not silently route such rows to the default set. File metadata takes precedence over the selected target. Local audio/image file paths in those JSON files are not treated as public URLs; upload the corresponding media separately and set its returned `audioUrl`/`imageUrl` before importing. Other JSON shapes still need to match the type-specific row schema.
- Grammar topic JSON using `topicCode`, `titleVi`/`titleEn`, `coreTheory`, `description`, `signalClues`, `tipsAndTricks`, `commonTraps`, `gradedQuestions`, and `summaryTable` is mapped to the grammar import schema. The theory and explanations, question options/answers/translations/solutions, and supporting notes are retained in the normalized preview data.
- Audio/video uploads are stored in AWS S3 and return a URL to be included in the applicable `audioUrl` field of a structured import. Question images return a URL for `imageUrl`. The bucket or CDN URL must be configured for durable read access by the application.
- ZIP archives are rejected; unpack them locally and upload the supported files individually. Executables, scripts, and database files (including EXE, JS, PY, and DB) are not accepted as learning content.
- Published records are stored in `imported_content` as normalized JSON. Draft rows in other preview batches are not treated as published duplicates.
- Original extracted documents are stored in AWS S3. OCR output is a transient review response and is not published as content.
- Vocabulary duplicate rows can be explicitly resolved in the preview: append the new meaning to the matching item, or publish it as a separate entry with the same spelling.
- Existing admin content pages still contain prototype data; they do not yet read the new `imported_content` inventory. The published inventory is available through the admin API and learner-facing content integration is a dependent feature.

## Access control

| Actor | Structured preview | View/edit vocabulary draft | Publish | Document/media upload |
| --- | --- | --- | --- | --- |
| ADMIN | Allow | Allow | Allow | Allow |
| TEACHER | Allow | Allow | Deny | Deny |
| STUDENT / anonymous | Deny | Deny | Deny | Deny |

The `/admin/data/import` page is inside the existing admin/teacher role guard. Backend Spring Security allows teachers to create structured previews, read batches, and mutate vocabulary items only while a batch is a draft (`PREVIEW` or `NO_VALID_ROWS`). Publishing and document/media upload remain administrator-only. Mutating requests use the existing session + CSRF mechanism and are recorded in the audit log.

## Data format and validation

CSV and XLSX use field names as the header row. Array-valued fields in CSV/XLSX accept a JSON array or pipe-separated values; question `options` must be a JSON array of objects with `id` and `text`. JSON records use the same field names and native arrays.

| Type | Required fields | Optional fields |
| --- | --- | --- |
| VOCABULARY | `word`, `meaning` or a non-empty `senses` array | `pos`, `partOfSpeech`, `senses`, `subCategory`, `wordFamily`, `ipa`, `example`, `exampleEn`, `exampleVi`, `topic`, `category`, `setName`, `setId`, `level`, `synonyms`, `antonyms`, `collocations`, `audioUrl` |
| GRAMMAR | `title`, `rule`, `explanation` | `englishTitle`, `code`, `codeName`, `category`, `part`, `examples`, `level`, `signalClues`, `tipsAndTricks`, `commonTraps`, `questions`, `summaryTable`, `reference` |
| LISTENING | `title`, `part`, `transcript`, `audioUrl` | `durationSeconds`, `source`, `difficulty` |
| READING | `title`, `content` | `part` (Part 6/7 only), `topic`, `difficulty`, `source` |
| QUESTION | `part`, `questionText`, `options`, `correctAnswer`, `explanation`, `skill`, `difficulty` | `passage`, `imageUrl`, `audioUrl`, `code` |
| MOCK_TEST | `title`, `description`, `durationMinutes`, `questionCodes` | `level` |

Normalization trims text, normalizes line endings and Unicode, canonicalizes Part and difficulty values, uppercases option IDs/answer, and derives a SHA-256 deduplication key. Part values accept forms such as `Part 5`, `PART_5`, and `5`. Difficulty accepts `EASY`, `MEDIUM`, or `HARD`. Duration fields are bounded to 1–86,400 seconds or 1–600 minutes. Media URLs must use HTTP or HTTPS.

A vocabulary row may keep the legacy scalar `meaning`/`pos` fields or provide multiple senses. Each sense requires `partOfSpeech` and `meaning`; `subCategory` and `example` are optional. `wordFamily` is optional at the vocabulary-row level. Example:

```json
{
  "word": "work",
  "ipa": "/wɜːk/",
  "wordFamily": "worker, workplace",
  "senses": [
    {
      "partOfSpeech": "Noun",
      "subCategory": "Abstract Noun",
      "meaning": "công việc",
      "example": "The work is complete."
    },
    {
      "partOfSpeech": "Verb",
      "subCategory": "Action Verb",
      "meaning": "làm việc"
    }
  ]
}
```

For compatibility with existing consumers, the first sense is also used to populate the legacy `pos` and `meaning` values.

Duplicate keys are calculated per type: vocabulary word; grammar title + rule; listening title + transcript; reading title + content; question code when supplied, otherwise part + prompt + option text + answer; mock test title. Only published records and earlier rows in the same batch count as duplicates; other unpublished preview batches do not. Vocabulary duplicates require an explicit choice to append the new meaning or publish a separate same-spelling entry. Other duplicates remain skipped and never overwrite published data. Mock-test question codes must reference questions that have already been published; import and publish questions before importing the test.

## API contract

- `POST /api/admin/data/import/preview?type={CONTENT_TYPE}` — multipart fields `file` and `type`; vocabulary requests may additionally provide `vocabularySetId` for an existing set or `vocabularySetName` to create/use a named set. These targets are applied only to rows without `setId`, `topic`, `category`, or `setName`. Creates a preview batch and returns the summary plus up to 100 normalized rows.
- `POST /api/admin/data/import/extract?type={CONTENT_TYPE}` — multipart fields `file` and `type`; extracts a supported document, stores the original in S3, and returns `{ fileName, contentType, text, storageKey }`. The text must be reviewed and converted to the structured schema before import.
- `POST /api/admin/data/import/assets?type={CONTENT_TYPE}` — multipart fields `file` and `type`; uploads a content-type-allowed media asset to S3 and returns `{ fileName, contentType, url, fieldName, storageKey }`. `fieldName` is `audioUrl` or `imageUrl`.
- `GET /api/admin/data/import/batches?limit=30` — recent batches (limit clamped to 1–100).
- `GET /api/admin/data/import/batches/{id}?offset=0&limit=100` — batch summary and a page of preview rows; offset/limit allow paging through all rows (`limit` is clamped to 1–100).
- `POST /api/admin/data/import/batches/{id}/items` — adds a vocabulary item to a draft batch and revalidates the batch.
- `PUT /api/admin/data/import/batches/{id}/items/{itemId}` — edits a vocabulary item in a draft batch and revalidates duplicate and validation status.
- `DELETE /api/admin/data/import/batches/{id}/items/{itemId}` — removes a vocabulary item from a draft batch and revalidates the remaining rows.
- `PUT /api/admin/data/import/batches/{id}/items/{itemId}/duplicate-resolution` — resolves a duplicate vocabulary row with `{"resolution":"ADD_MEANING"}` or `{"resolution":"CREATE_NEW"}`.
- `POST /api/admin/data/import/batches/{id}/publish` — publishes rows currently marked `VALID`; duplicate conflicts at publish time are skipped.
- `GET /api/admin/data/import/published?type={CONTENT_TYPE}&limit=50` — published inventory (limit clamped to 1–100); `type` is optional.

Batch statuses: `PREVIEW`, `PUBLISHED`, `PARTIAL`, `NO_VALID_ROWS`. Item statuses: `VALID`, `INVALID`, `DUPLICATE`, `PUBLISHED`. Publishing is a single transaction and is allowed once. A batch with valid rows may be published even if other rows are invalid/duplicates; those rows remain visible and are skipped. Batches with no valid rows are marked `NO_VALID_ROWS`; they may be edited but cannot be published until at least one valid row exists. Vocabulary edits recompute validation and duplicate status for the entire draft batch.

## UI states and acceptance criteria

1. Given an admin opens the page, the supported formats for the selected content type, row/file limits, required fields, templates, and recent import history are visible.
2. Given no file is selected, preview cannot be submitted. Empty history and empty preview have explanatory states.
3. Given an unsupported, empty, oversized, malformed, or over-limit file, a clear error is displayed and no preview batch is created.
4. Given valid file syntax, preview creates a persistent batch, normalizes the supported fields, and reports counts for valid, invalid, and duplicate rows.
5. Given invalid data, the preview identifies the source row and each validation message; invalid rows cannot be published.
6. Given duplicate vocabulary data, the preview identifies it and offers a choice to append the new meaning or create a separate entry; unpublished rows in other batches are not considered duplicates.
7. Given at least one valid row, the admin must confirm publish. Publish makes valid non-duplicate rows queryable in the published inventory; invalid/duplicate rows are skipped.
8. Given publish is retried or the batch is already processed, the API rejects the operation without publishing rows a second time.
9. Given concurrent imports of the same content, the database unique constraint prevents duplicate publication; the conflicting row is reported as duplicate.
10. Given an API/network/server failure, the UI shows an error and retains the selected/previewed context so the admin can retry or inspect the batch.
11. Given a teacher creates or edits a draft vocabulary preview, the backend allows it; publish and document/media upload remain administrator-only.
12. Given a vocabulary row is edited, added, or deleted in a draft preview, the batch counts and duplicate/validation statuses are recalculated.
13. Given a duplicate vocabulary row is resolved to append a meaning, the existing item is updated only when the batch is published; choosing a separate entry keeps both entries.
14. Given vocabulary preview rows are loaded, the list can be searched and scrolled; a search can request the remaining rows before reporting no match.
15. Given a supported document, text extraction returns a reviewable plain-text draft and never publishes it automatically.
14. Given an audio/video asset, upload returns a stable S3/CDN URL; the admin explicitly adds that URL to structured content before importing.

## Object storage and OCR configuration

The backend uses the AWS SDK default credential chain. Configure credentials through an IAM role, AWS profile, or the standard AWS environment variables; never commit credentials. Set `AWS_REGION`, `CONTENT_IMPORT_S3_BUCKET`, and `CONTENT_IMPORT_S3_PUBLIC_BASE_URL` in the backend environment. `CONTENT_IMPORT_S3_PUBLIC_BASE_URL` should be the public S3/CloudFront base URL that serves uploaded media. The bucket policy and CORS/read policy must match the deployment's security requirements.

PaddleOCR runs as a separate Docker Compose profile so the main application can still start without downloading OCR models:

```powershell
docker compose --profile ocr up --build
```

In Compose, the backend calls `http://ocr:8000`; port 8001 is exposed locally for service diagnostics. The OCR container downloads its English recognition models on first startup and needs network access and sufficient CPU/RAM. Uploads are limited to 256 MiB and OCR PDFs to 400 pages; larger documents must be split before uploading. When OCR is unavailable, the endpoint returns an explicit service error. OCR recognizes text only: it does not answer questions, infer correct answers, or guarantee reading order/layout. Vocabulary extraction combines multiple layout parsers and handles standalone numbered rows; compare the preview count with the source document and inspect errors before publishing.

## Related-feature dependencies

- Uses existing `content_sources`, `import_batches`, `import_items`, session authentication, CSRF handling, and audit logging.
- Adds a generic published-content inventory because grammar and mock-test entities do not currently have relational content tables.
- Existing learning/admin content pages are still mock-backed. Integrating published records into those pages, adding learner delivery/practice APIs, and storing media assets are separate follow-up work; import success must not be interpreted as those downstream flows being complete.
