import { apiRequest, uploadAuthRequest, writeAuthRequest } from './client';

export type ImportedContentType =
  | 'VOCABULARY'
  | 'GRAMMAR'
  | 'LISTENING'
  | 'READING'
  | 'QUESTION'
  | 'MOCK_TEST';

export type ImportBatchSummary = {
  id: string;
  fileName: string;
  contentType: ImportedContentType;
  totalRecords: number;
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  publishedCount: number;
  status: 'PREVIEW' | 'PUBLISHED' | 'PARTIAL' | 'NO_VALID_ROWS';
  createdAt: string;
  completedAt: string | null;
};

export type ImportPreviewItem = {
  id: string;
  rowNumber: number;
  status: 'VALID' | 'INVALID' | 'DUPLICATE' | 'PUBLISHED';
  rawData: Record<string, unknown> | null;
  normalizedData: Record<string, unknown> | null;
  errors: string[];
  duplicateOfContentId: string | null;
  duplicateResolution: 'ADD_MEANING' | 'CREATE_NEW' | null;
};

export type ImportBatchDetails = {
  batch: ImportBatchSummary;
  items: ImportPreviewItem[];
  offset: number;
  limit: number;
  hasMore: boolean;
};

export type ContentImportDocumentExtraction = {
  fileName: string;
  contentType: ImportedContentType;
  text: string;
  storageKey: string;
};

export type ContentImportMediaAsset = {
  fileName: string;
  contentType: ImportedContentType;
  url: string;
  fieldName: 'audioUrl' | 'imageUrl';
  storageKey: string;
};

export function previewContentImport(
  type: ImportedContentType,
  file: File,
  target?: { setId?: string; setName?: string },
) {
  const body = new FormData();
  body.append('type', type);
  body.append('file', file);
  if (target?.setId) body.append('vocabularySetId', target.setId);
  if (target?.setName) body.append('vocabularySetName', target.setName);
  return uploadAuthRequest<ImportBatchDetails>('/api/admin/data/import/preview', body);
}

export function extractContentImportDocument(type: ImportedContentType, file: File) {
  const body = new FormData();
  body.append('type', type);
  body.append('file', file);
  return uploadAuthRequest<ContentImportDocumentExtraction>('/api/admin/data/import/extract', body);
}

export function uploadContentImportAsset(type: ImportedContentType, file: File) {
  const body = new FormData();
  body.append('type', type);
  body.append('file', file);
  return uploadAuthRequest<ContentImportMediaAsset>('/api/admin/data/import/assets', body);
}

export function listContentImportBatches(limit = 30) {
  return apiRequest<ImportBatchSummary[]>(`/api/admin/data/import/batches?limit=${limit}`);
}

export function getContentImportBatch(batchId: string, offset = 0, limit = 100) {
  return apiRequest<ImportBatchDetails>(
    `/api/admin/data/import/batches/${encodeURIComponent(batchId)}?offset=${offset}&limit=${limit}`,
  );
}

export function addVocabularyPreviewItem(batchId: string, data: Record<string, unknown>) {
  return writeAuthRequest<ImportBatchDetails>(
    'POST',
    `/api/admin/data/import/batches/${encodeURIComponent(batchId)}/items`,
    data,
  );
}

export function updateVocabularyPreviewItem(
  batchId: string,
  itemId: string,
  data: Record<string, unknown>,
) {
  return writeAuthRequest<ImportBatchDetails>(
    'PUT',
    `/api/admin/data/import/batches/${encodeURIComponent(batchId)}/items/${encodeURIComponent(itemId)}`,
    data,
  );
}

export function resolveVocabularyPreviewDuplicate(
  batchId: string,
  itemId: string,
  resolution: 'ADD_MEANING' | 'CREATE_NEW',
) {
  return writeAuthRequest<ImportBatchDetails>(
    'PUT',
    `/api/admin/data/import/batches/${encodeURIComponent(batchId)}/items/${encodeURIComponent(itemId)}/duplicate-resolution`,
    { resolution },
  );
}

export function deleteVocabularyPreviewItem(batchId: string, itemId: string) {
  return writeAuthRequest<ImportBatchDetails>(
    'DELETE',
    `/api/admin/data/import/batches/${encodeURIComponent(batchId)}/items/${encodeURIComponent(itemId)}`,
  );
}

export function deleteContentImportBatch(batchId: string) {
  return writeAuthRequest<void>(
    'DELETE',
    `/api/admin/data/import/batches/${encodeURIComponent(batchId)}`,
  );
}

export function publishContentImport(batchId: string) {
  return writeAuthRequest<ImportBatchSummary>(
    'POST',
    `/api/admin/data/import/batches/${encodeURIComponent(batchId)}/publish`,
  );
}

export function parseTextToContentImportPreview(
  type: ImportedContentType,
  payload: { text: string; fileName?: string; vocabularySetId?: string; vocabularySetName?: string },
) {
  return writeAuthRequest<ImportBatchDetails>(
    'POST',
    `/api/admin/data/import/parse-text-preview?type=${encodeURIComponent(type)}`,
    payload,
  );
}
