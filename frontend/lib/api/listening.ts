import { apiRequest, writeAuthRequest } from './client';
import type {
  DictationCardData,
  DictationQuestion,
  LevelCategoryCardData,
  TranscriptSegment,
} from '@/app/admin/content/listening/types';

export async function fetchListeningCards(): Promise<DictationCardData[]> {
  const cards = await apiRequest<DictationCardData[]>('/api/listening/cards');
  if (!Array.isArray(cards)) throw new Error('Dữ liệu bài nghe từ máy chủ không hợp lệ.');
  return cards;
}

export async function fetchAdminListeningCards(): Promise<DictationCardData[]> {
  const cards = await apiRequest<DictationCardData[]>('/api/admin/listening/cards');
  if (!Array.isArray(cards)) throw new Error('Dữ liệu bài nghe từ máy chủ không hợp lệ.');
  return cards;
}

export async function fetchListeningCard(cardId: string): Promise<DictationCardData> {
  return apiRequest<DictationCardData>(`/api/listening/cards/${cardId}`);
}

export async function fetchListeningUnits(): Promise<LevelCategoryCardData[]> {
  const units = await apiRequest<LevelCategoryCardData[]>('/api/listening/units');
  if (!Array.isArray(units)) throw new Error('Dữ liệu chủ điểm nghe từ máy chủ không hợp lệ.');
  return units;
}

export async function fetchAdminListeningUnits(): Promise<LevelCategoryCardData[]> {
  const units = await apiRequest<LevelCategoryCardData[]>('/api/admin/listening/units');
  if (!Array.isArray(units)) throw new Error('Dữ liệu chủ điểm nghe từ máy chủ không hợp lệ.');
  return units;
}

export type ListeningCardRequest = {
  title: string;
  testNumber: number;
  part: DictationCardData['part'];
  year: DictationCardData['year'];
  totalQuestions: number;
  audioUrl: string;
  fullTranscript: string;
  vietnameseTranslation: string;
  questions?: DictationQuestion[];
  contentStatus?: 'DRAFT' | 'PUBLISHED';
};

export async function createListeningCard(request: ListeningCardRequest): Promise<DictationCardData> {
  return writeAuthRequest<DictationCardData>('POST', '/api/admin/listening/cards', request);
}

export async function updateListeningCard(cardId: string, request: ListeningCardRequest): Promise<DictationCardData> {
  return writeAuthRequest<DictationCardData>('PUT', `/api/admin/listening/cards/${cardId}`, request);
}

export async function updateListeningCardStatus(
  cardId: string,
  contentStatus: 'DRAFT' | 'PUBLISHED'
): Promise<DictationCardData> {
  return writeAuthRequest<DictationCardData>('PATCH', `/api/admin/listening/cards/${cardId}/status`, {
    contentStatus,
  });
}

export async function deleteListeningCard(cardId: string): Promise<void> {
  await writeAuthRequest<void>('DELETE', `/api/admin/listening/cards/${cardId}`);
}

export type ListeningUnitRequest = Pick<LevelCategoryCardData,
  'part' | 'type' | 'title' | 'totalQuestions' | 'theorySummary' | 'rules' | 'vocabBag' | 'questions'
> & { targetLevel?: string; contentStatus?: 'DRAFT' | 'PUBLISHED' };

export async function createListeningUnit(request: ListeningUnitRequest): Promise<LevelCategoryCardData> {
  return writeAuthRequest<LevelCategoryCardData>('POST', '/api/admin/listening/units', request);
}

export async function updateListeningUnit(unitId: string, request: ListeningUnitRequest): Promise<LevelCategoryCardData> {
  return writeAuthRequest<LevelCategoryCardData>('PUT', `/api/admin/listening/units/${unitId}`, request);
}

export async function updateListeningUnitStatus(
  unitId: string,
  contentStatus: 'DRAFT' | 'PUBLISHED'
): Promise<LevelCategoryCardData> {
  return writeAuthRequest<LevelCategoryCardData>('PATCH', `/api/admin/listening/units/${unitId}/status`, {
    contentStatus,
  });
}

export async function deleteListeningUnit(unitId: string): Promise<void> {
  await writeAuthRequest<void>('DELETE', `/api/admin/listening/units/${unitId}`);
}

export interface UploadedMediaItem {
  url: string;
  fileName: string;
  mediaType: 'audio' | 'image';
  sizeBytes: number;
}

export async function uploadListeningMediaFile(
  file: File,
  options?: { folder?: string; keepCleanName?: boolean }
): Promise<UploadedMediaItem> {
  const formData = new FormData();
  formData.append('file', file);
  if (options?.folder) formData.append('folder', options.folder);
  if (options?.keepCleanName) formData.append('keepCleanName', 'true');
  const res = await fetch('/api/media/upload', {
    method: 'POST',
    body: formData,
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload?.error || 'Không thể tải tệp media lên máy chủ.');
  }
  return payload;
}

export async function uploadListeningMediaBatch(
  files: File[],
  options?: { folder?: string; keepCleanName?: boolean }
): Promise<UploadedMediaItem[]> {
  if (files.length === 0) return [];
  const formData = new FormData();
  for (const f of files) {
    formData.append('files', f);
  }
  if (options?.folder) formData.append('folder', options.folder);
  if (options?.keepCleanName) formData.append('keepCleanName', 'true');
  const res = await fetch('/api/media/upload', {
    method: 'POST',
    body: formData,
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload?.error || 'Không thể tải danh sách tệp media lên máy chủ.');
  }
  if (Array.isArray(payload?.items)) {
    return payload.items as UploadedMediaItem[];
  }
  if (payload?.url) {
    return [payload as UploadedMediaItem];
  }
  return [];
}

/**
 * Tự động phân tích 1 file Audio dài chưa cắt trên trình duyệt (Web Audio API)
 * để tìm các khoảng lặng giữa các câu / đoạn hội thoại và chia thành targetSlices đoạn (startTime, endTime).
 */
export async function detectAudioSlicesInBrowser(
  file: File,
  targetSlices: number
): Promise<Array<{ startTime: number; endTime: number }>> {
  const count = Math.max(1, targetSlices);
  const arrayBuffer = await file.arrayBuffer();
  const AudioCtx =
    typeof window !== 'undefined'
      ? window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      : undefined;
  if (!AudioCtx) {
    throw new Error('Trình duyệt không hỗ trợ Web Audio API để phân tích tệp âm thanh.');
  }
  const ctx = new AudioCtx();
  try {
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
    const totalDuration = Math.max(1, audioBuffer.duration);
    if (count === 1) {
      return [{ startTime: 0, endTime: Math.round(totalDuration * 10) / 10 }];
    }

    const sampleRate = audioBuffer.sampleRate;
    const channelData = audioBuffer.getChannelData(0);
    const windowSec = 0.1; // 100ms
    const windowSamples = Math.max(1, Math.floor(sampleRate * windowSec));
    const numWindows = Math.floor(channelData.length / windowSamples);

    const rmsList: number[] = new Array(numWindows);
    let maxRms = 0.0001;
    for (let w = 0; w < numWindows; w++) {
      let sumSq = 0;
      const offset = w * windowSamples;
      for (let i = 0; i < windowSamples; i += 4) {
        const s = channelData[offset + i] || 0;
        sumSq += s * s;
      }
      const rms = Math.sqrt(sumSq / Math.max(1, Math.ceil(windowSamples / 4)));
      rmsList[w] = rms;
      if (rms > maxRms) maxRms = rms;
    }

    const silenceThreshold = maxRms * 0.075;
    // Bỏ qua khoảng lặng ở 2s đầu và 2s cuối file
    const minWindow = Math.floor(2.0 / windowSec);
    const maxWindow = Math.max(minWindow + 1, numWindows - Math.floor(2.0 / windowSec));

    interface SilenceGap {
      startSec: number;
      endSec: number;
      midSec: number;
      durationSec: number;
    }
    const gaps: SilenceGap[] = [];
    let gapStart = -1;
    for (let w = minWindow; w < maxWindow; w++) {
      if (rmsList[w] <= silenceThreshold) {
        if (gapStart === -1) gapStart = w;
      } else if (gapStart !== -1) {
        const durWindows = w - gapStart;
        const durSec = durWindows * windowSec;
        if (durSec >= 0.9) {
          const sSec = gapStart * windowSec;
          const eSec = w * windowSec;
          gaps.push({
            startSec: sSec,
            endSec: eSec,
            midSec: (sSec + eSec) / 2,
            durationSec: durSec,
          });
        }
        gapStart = -1;
      }
    }

    const neededSplits = count - 1;
    let splitPoints: number[] = [];

    if (gaps.length >= neededSplits) {
      // Chọn các khoảng lặng dài nhất nhưng cách nhau tối thiểu (totalDuration / count) * 0.35 giây
      const minSpacing = Math.max(2.5, (totalDuration / count) * 0.35);
      const sortedByDuration = [...gaps].sort((a, b) => b.durationSec - a.durationSec);
      const chosen: SilenceGap[] = [];
      for (const candidate of sortedByDuration) {
        if (chosen.length >= neededSplits) break;
        const tooClose = chosen.some((c) => Math.abs(c.midSec - candidate.midSec) < minSpacing);
        if (!tooClose) {
          chosen.push(candidate);
        }
      }
      if (chosen.length === neededSplits) {
        splitPoints = chosen.map((c) => c.midSec).sort((a, b) => a - b);
      }
    }

    // Fallback: nếu file có nhạc nền hoặc không đủ khoảng lặng rõ rệt, chia đều hoặc bám điểm lặng gần nhất với mốc chia đều
    if (splitPoints.length !== neededSplits) {
      splitPoints = [];
      for (let i = 1; i <= neededSplits; i++) {
        const idealSec = (totalDuration * i) / count;
        const nearbyGap = gaps.find((g) => Math.abs(g.midSec - idealSec) <= (totalDuration / count) * 0.25);
        splitPoints.push(nearbyGap ? nearbyGap.midSec : idealSec);
      }
      splitPoints.sort((a, b) => a - b);
    }

    const bounds = [0, ...splitPoints, totalDuration];
    const slices: Array<{ startTime: number; endTime: number }> = [];
    for (let i = 0; i < count; i++) {
      const s = Math.round(bounds[i] * 10) / 10;
      const e = Math.round(Math.max(s + 0.5, bounds[i + 1]) * 10) / 10;
      slices.push({ startTime: s, endTime: e });
    }
    return slices;
  } finally {
    void ctx.close().catch(() => {});
  }
}

export async function saveListeningProgress(req: {
  cardId: string;
  completedQuestions: number;
  totalQuestions: number;
  correctCount?: number;
  wrongCount?: number;
  answeredQuestionIds?: (number | string)[];
  wrongQuestionIds?: (number | string)[];
  flaggedQuestionIds?: (number | string)[];
  userNotes?: Record<string, string>;
  selfAssessments?: Record<string, string>;
  lastQuestionIndex: number;
  status: string;
}): Promise<void> {
  try {
    await writeAuthRequest<void>('POST', '/api/listening/progress', req);
  } catch (error) {
    console.warn('Could not persist listening progress to backend:', error);
  }
}

export async function saveListeningUnitProgress(req: {
  unitId: string;
  completedQuestions: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  wrongQuestionIds?: (number | string)[];
  answeredQuestionIds?: (number | string)[];
  flaggedQuestionIds?: (number | string)[];
  userNotes?: Record<string, string>;
  status: string;
  lastQuestionIndex: number;
}): Promise<void> {
  try {
    await writeAuthRequest<void>('POST', '/api/listening/units/progress', req);
  } catch (error) {
    console.warn('Could not persist listening unit progress to backend:', error);
  }
}

export interface ListeningAttemptRecord {
  id: number;
  targetType: 'DICTATION' | 'UNIT';
  targetId: string;
  targetTitle: string;
  part: string;
  mode: string;
  totalQuestions: number;
  completedQuestions: number;
  correctCount: number;
  wrongCount: number;
  accuracyPercent: number;
  durationSeconds: number;
  xpEarned: number;
  details?: Record<string, unknown>;
  createdAt: string;
}

export async function recordListeningAttempt(req: {
  targetType: 'DICTATION' | 'UNIT';
  targetId: string;
  targetTitle: string;
  part: string;
  mode: string;
  totalQuestions: number;
  completedQuestions: number;
  correctCount: number;
  wrongCount: number;
  durationSeconds: number;
  xpEarned?: number;
  details?: Record<string, unknown>;
}): Promise<ListeningAttemptRecord | null> {
  try {
    return await writeAuthRequest<ListeningAttemptRecord>('POST', '/api/listening/attempts', req);
  } catch (error) {
    console.warn('Could not record listening attempt to backend:', error);
    return null;
  }
}

export async function fetchListeningAttempts(targetId?: string, limit = 30): Promise<ListeningAttemptRecord[]> {
  try {
    const params = new URLSearchParams();
    if (targetId) params.set('targetId', targetId);
    params.set('limit', String(limit));
    const list = await apiRequest<ListeningAttemptRecord[]>(`/api/listening/attempts?${params.toString()}`);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export interface PartMasteryStat {
  part: string;
  answeredCount: number;
  correctCount: number;
  wrongCount: number;
  accuracyPercent: number;
  bktMasteryProbability: number;
  proficiencyLevel: 'MASTERED' | 'DEVELOPING' | 'WEAK' | 'NOT_STARTED';
}

export interface ListeningRecommendationItem {
  id: string;
  part: string;
  targetType: 'UNIT' | 'DICTATION';
  targetId: string;
  title: string;
  reason: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedMode: 'PRACTICE' | 'REDO_WRONG' | 'DICTATION' | 'REAL_EXAM';
  wrongCount: number;
}

export interface ListeningAnalyticsSummary {
  totalAttempts: number;
  realExamAttempts: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  totalWrong: number;
  overallAccuracyPercent: number;
  estimatedListeningScore: number;
  totalDurationSeconds: number;
  totalXpEarned: number;
  partMastery: PartMasteryStat[];
  recommendations: ListeningRecommendationItem[];
}

export interface AdminListeningAnalyticsSummary {
  activeListeningStudents: number;
  totalAttempts: number;
  realExamAttempts: number;
  dictationAttempts: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  totalWrong: number;
  overallAccuracyPercent: number;
  averageEstimatedListeningScore: number;
  totalStudyMinutes: number;
  partBreakdown: PartMasteryStat[];
  bktRecommendations: ListeningRecommendationItem[];
}

export async function fetchListeningAnalytics(): Promise<ListeningAnalyticsSummary | null> {
  try {
    return await apiRequest<ListeningAnalyticsSummary>('/api/listening/analytics');
  } catch {
    return null;
  }
}

export async function fetchAdminListeningAnalytics(): Promise<AdminListeningAnalyticsSummary | null> {
  try {
    return await apiRequest<AdminListeningAnalyticsSummary>('/api/admin/listening/analytics');
  } catch {
    return null;
  }
}

export function buildTranscriptSegmentsFromText(
  transcript: string,
  translation?: string,
  totalDurationSeconds?: number
): TranscriptSegment[] {
  const cleanEn = (transcript || '').trim();
  if (!cleanEn) return [];
  const cleanVi = (translation || '').trim();

  const rawEnParts = cleanEn
    .split(/(?<=\.|\?|!)\s+(?=[A-Z(\[])|\r?\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const enLines = rawEnParts.length > 0 ? rawEnParts : [cleanEn];

  const viLines = cleanVi
    ? cleanVi
        .split(/(?<=\.|\?|!)\s+|\r?\n+/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const wordCounts = enLines.map((line) => Math.max(1, line.split(/\s+/).filter(Boolean).length));
  const totalWords = Math.max(1, wordCounts.reduce((acc, w) => acc + w, 0));
  const estimatedTotal =
    totalDurationSeconds && Number.isFinite(totalDurationSeconds) && totalDurationSeconds > 1.5
      ? totalDurationSeconds
      : Math.max(3.0, Math.round((totalWords * 0.42 + enLines.length * 0.6) * 10) / 10);

  let cursor = 0;
  return enLines.map((line, idx) => {
    const match = line.match(
      /^(customer:|client:|man:|woman:|speaker\s*\d*:|m-[a-z]+:|w-[a-z]+:|\([A-Da-d]\))\s*(.*)$/i
    );
    const speaker = match ? match[1].trim().replace(/:$/, '') : undefined;
    const share = wordCounts[idx] / totalWords;
    const dur =
      idx === enLines.length - 1
        ? Math.max(0.8, estimatedTotal - cursor)
        : Math.max(1.2, Math.round(estimatedTotal * share * 10) / 10);
    const startTime = Math.round(cursor * 10) / 10;
    const endTime = Math.round(Math.min(estimatedTotal, cursor + dur) * 10) / 10;
    cursor = endTime;

    return {
      id: idx + 1,
      speaker,
      startTime,
      endTime: endTime > startTime ? endTime : Math.round((startTime + 1.5) * 10) / 10,
      text: line,
      translation: viLines[idx] ?? (enLines.length === 1 ? cleanVi : ''),
    };
  });
}
