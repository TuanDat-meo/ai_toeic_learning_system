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
  normalizedData: Record<string, unknown> | null;
  errors: string[];
  duplicateOfContentId: string | null;
};

export type ImportBatchDetails = {
  batch: ImportBatchSummary;
  items: ImportPreviewItem[];
  offset: number;
  limit: number;
  hasMore: boolean;
};

export function previewContentImport(type: ImportedContentType, file: File) {
  const body = new FormData();
  body.append('type', type);
  body.append('file', file);
  return uploadAuthRequest<ImportBatchDetails>('/api/admin/data/import/preview', body);
}

export function listContentImportBatches(limit = 30) {
  return apiRequest<ImportBatchSummary[]>(`/api/admin/data/import/batches?limit=${limit}`);
}

export function getContentImportBatch(batchId: string, offset = 0, limit = 100) {
  return apiRequest<ImportBatchDetails>(
    `/api/admin/data/import/batches/${encodeURIComponent(batchId)}?offset=${offset}&limit=${limit}`,
  );
}

export function publishContentImport(batchId: string) {
  return writeAuthRequest<ImportBatchSummary>(
    'POST',
    `/api/admin/data/import/batches/${encodeURIComponent(batchId)}/publish`,
  );
}
