import type { ImportBatchSummary, ImportPreviewItem } from '@/lib/api/content-import';
import { type ContentTypeConfig, STRUCTURED_EXTENSIONS } from './types';
import { normalizeVocabularyPartOfSpeech } from '@/lib/vocabulary-part-of-speech';

export function extensionOf(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() ?? '';
}

export function acceptedExtensions(type: ContentTypeConfig): string[] {
  return [...STRUCTURED_EXTENSIONS, ...type.documentExtensions, ...type.mediaExtensions];
}

export function extensionLabel(extensions: string[]): string {
  return extensions.map((extension) => `.${extension}`).join(', ');
}

export function formatGuidance(type: ContentTypeConfig): string {
  const guidance = [`Dữ liệu: ${extensionLabel(STRUCTURED_EXTENSIONS)}`];
  if (type.documentExtensions.length) {
    guidance.push(`Tài liệu: ${extensionLabel(type.documentExtensions)}`);
  }
  if (type.mediaExtensions.length) {
    guidance.push(`Media: ${extensionLabel(type.mediaExtensions)}`);
  }
  return guidance.join(' · ');
}

export function statusLabel(status: ImportBatchSummary['status']): string {
  switch (status) {
    case 'PREVIEW': return 'Chờ publish';
    case 'PUBLISHED': return 'Đã publish';
    case 'PARTIAL': return 'Đã publish một phần';
    case 'NO_VALID_ROWS': return 'Không có dòng hợp lệ';
  }
}

export function itemStatus(status: string): { label: string; classes: string } {
  if (status === 'VALID') return { label: 'Hợp lệ', classes: 'border-emerald-200 bg-emerald-50 text-emerald-700' };
  if (status === 'PUBLISHED') return { label: 'Đã publish', classes: 'border-blue-200 bg-blue-50 text-blue-700' };
  if (status === 'DUPLICATE') return { label: 'Trùng lặp', classes: 'border-amber-200 bg-amber-50 text-amber-700' };
  return { label: 'Lỗi dữ liệu', classes: 'border-red-200 bg-red-50 text-red-700' };
}

export function displayName(item: ImportPreviewItem): string {
  const data = item.normalizedData ?? item.rawData ?? {};
  const headline = data.word ?? data.title ?? data.titleVi ?? data.questionText ?? data.codeName;
  return typeof headline === 'string' && headline.trim() ? headline : `Dòng ${item.rowNumber}`;
}

export function normalizePartOfSpeech(value: string | undefined): string {
  return normalizeVocabularyPartOfSpeech(value) || 'Verb';
}

export function partOfSpeechLabel(value: string | undefined): string {
  const labels: Record<string, string> = {
    Noun: 'Danh từ',
    Verb: 'Động từ',
    Adjective: 'Tính từ',
    Adverb: 'Trạng từ',
    Pronoun: 'Đại từ',
    Preposition: 'Giới từ',
    Conjunction: 'Liên từ',
    Interjection: 'Thán từ',
    Determiner: 'Từ hạn định',
  };
  return labels[normalizePartOfSpeech(value)];
}

export function textValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export function textList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === 'string' && Boolean(entry.trim()));
}

export function firstText(...values: unknown[]): string | undefined {
  for (const value of values) {
    const text = textValue(value);
    if (text) return text;
  }
  return undefined;
}

/**
 * Làm sạch thông báo lỗi: Loại bỏ các chuỗi kỹ thuật DB (PSQLException, SQL, duplicate key, v.v.)
 * thay bằng câu thông báo thân thiện, rõ ràng cho người dùng.
 */
export function cleanErrorMessage(err: unknown): string {
  if (!err) return 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.';
  const rawMsg = err instanceof Error ? err.message : String(err);

  // Nhận diện lỗi vi phạm ràng buộc unique / duplicate
  if (
    rawMsg.includes('duplicate key') ||
    rawMsg.includes('already exists') ||
    rawMsg.includes('Unique index') ||
    rawMsg.includes('unique constraint') ||
    rawMsg.includes('trùng lặp')
  ) {
    return 'Dữ liệu đã tồn tại trong hệ thống hoặc bị trùng lặp mã nhận diện.';
  }

  // Nhận diện lỗi ngoại lệ SQL / Database
  if (
    rawMsg.includes('PSQLException') ||
    rawMsg.includes('SQLException') ||
    rawMsg.includes('DataIntegrityViolation') ||
    rawMsg.includes('could not execute statement') ||
    rawMsg.includes('bad SQL grammar') ||
    rawMsg.includes('foreign key constraint') ||
    rawMsg.includes('violates foreign key')
  ) {
    return 'Không thể lưu dữ liệu do vi phạm ràng buộc dữ liệu hệ thống. Vui lòng kiểm tra lại cấu trúc file.';
  }

  // Nhận diện lỗi phân giải JSON / định dạng file
  if (
    rawMsg.includes('Unexpected token') ||
    rawMsg.includes('JSON') ||
    rawMsg.includes('HttpMessageNotReadable') ||
    rawMsg.includes('Cannot deserialize')
  ) {
    return 'Cấu trúc file dữ liệu không hợp lệ. Vui lòng kiểm tra cú pháp JSON hoặc file Excel/CSV.';
  }

  // Nhận diện lỗi mạng / kết nối
  if (
    rawMsg.includes('Failed to fetch') ||
    rawMsg.includes('NetworkError') ||
    rawMsg.includes('Connection refused')
  ) {
    return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng hoặc thử lại sau ít phút.';
  }

  // Nếu là lỗi nghiệp vụ bình thường đã có thông điệp tiếng Việt thì giữ nguyên
  // Lỗi OCR / dịch vụ trích xuất PDF
  if (
    rawMsg.includes('PaddleOCR') ||
    rawMsg.includes('OCR') ||
    rawMsg.toLowerCase().includes('service_unavailable') ||
    rawMsg.toLowerCase().includes('service unavailable') ||
    rawMsg.includes('ocr-url') ||
    rawMsg.includes('Chưa cấu hình dịch vụ')
  ) {
    return 'Không thể trích xuất file PDF/ảnh vì chưa cấu hình dịch vụ OCR. Vui lòng dùng file Word (.doc/.docx) hoặc Markdown (.md) thay thế.';
  }

  return rawMsg;
}
