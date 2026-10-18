// ============================================================
// Shared domain types — dùng chung cho toàn bộ admin UI
// DB lưu mã chuẩn; UI map sang nhãn tiếng Việt qua LABEL_MAP
// ============================================================

// --- Content & Status enums ---
export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'PENDING_REVIEW';
export type ProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type ToeicPart = 'PART_1' | 'PART_2' | 'PART_3' | 'PART_4' | 'PART_5' | 'PART_6' | 'PART_7';
export type ListeningPart = 'PART_1' | 'PART_2' | 'PART_3' | 'PART_4';
export type GrammarPart = 'PART_5' | 'PART_6' | 'PART_7';
export type TargetScore = '350_500' | '500_750' | '750_PLUS';

// --- UI Label Maps (DB code → tiếng Việt) ---
export const CONTENT_STATUS_LABEL: Record<ContentStatus, string> = {
  DRAFT:          'Nháp',
  PUBLISHED:      'Đã xuất bản',
  ARCHIVED:       'Lưu trữ',
  PENDING_REVIEW: 'Chờ duyệt',
};

export const PROGRESS_STATUS_LABEL: Record<ProgressStatus, string> = {
  NOT_STARTED: 'Chưa bắt đầu',
  IN_PROGRESS: 'Đang luyện tập',
  COMPLETED:   'Đã hoàn thành',
};

export const DIFFICULTY_LABEL: Record<QuestionDifficulty, string> = {
  EASY:   'Dễ',
  MEDIUM: 'Trung bình',
  HARD:   'Khó',
};

export const PART_LABEL: Record<ToeicPart, string> = {
  PART_1: 'Part 1',
  PART_2: 'Part 2',
  PART_3: 'Part 3',
  PART_4: 'Part 4',
  PART_5: 'Part 5',
  PART_6: 'Part 6',
  PART_7: 'Part 7',
};

export const TARGET_SCORE_LABEL: Record<TargetScore, string> = {
  '350_500': '350–500',
  '500_750': '500–750',
  '750_PLUS': '750+',
};

// --- Shared entity types ---
export interface MediaFile {
  id: string;
  storageKey: string;
  originalName: string;
  mimeType: string;
  fileSizeBytes: number;
  durationMs?: number;
  publicUrl?: string;
  storageBackend: 'LOCAL' | 'S3' | 'MINIO';
}
