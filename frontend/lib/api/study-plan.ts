import { apiRequest, writeAuthRequest } from './client';

export interface WeeklyTarget {
  weekNumber: number;
  focusSkill: 'VOCABULARY' | 'GRAMMAR' | 'LISTENING' | 'READING' | 'MOCK_TEST' | 'GENERAL_REVIEW';
  targetItems: number;
  completedItems: number;
  notes?: string;
}

export interface StudyPlanResponse {
  planId: string;
  targetScore: number;
  baselineScore: number | null;
  baselineSource: 'SELF_REPORTED' | 'DIAGNOSTIC_TEST' | 'MOCK_TEST' | 'SYSTEM_ESTIMATED' | null;
  examDate: string | null;
  daysRemaining: number | null;
  dailyStudyMinutes: number;
  weeklyStudyDays: number;
  recommendedNewWords: number;
  recommendedReview: number;
  recommendedGrammar: number;
  recommendedListeningMinutes: number;
  recommendedReadingMinutes: number;
  recommendedMockTestsPerWeek: number;
  focusAreas: string[];
  planExplanation: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  weeklyTargets: WeeklyTarget[];
}

export interface StudyPlanSummary {
  targetScore: number;
  baselineScore: number | null;
  daysRemaining: number | null;
  recommendedNewWords: number;
  recommendedReview: number;
  recommendedGrammar: number;
  recommendedMockTestsPerWeek: number;
  planExplanation: string | null;
  focusAreas: string[];
  progressPercent: number;
  baselineSource: 'SELF_REPORTED' | 'DIAGNOSTIC_TEST' | 'MOCK_TEST' | 'SYSTEM_ESTIMATED' | null;
}

export interface UpdateStudyPlanRequest {
  newWordsPerDay?: number;
  reviewPerDay?: number;
  grammarPerDay?: number;
  listeningMinutes?: number;
  readingMinutes?: number;
  mockTestsPerWeek?: number;
}

/**
 * Lấy chi tiết lộ trình học tập cá nhân hóa
 */
export async function getStudyPlan(): Promise<StudyPlanResponse> {
  return apiRequest<StudyPlanResponse>('/api/study-plan');
}

/**
 * Lấy tóm tắt lộ trình học tập cho Dashboard (nhanh, nhẹ)
 */
export async function getStudyPlanSummary(): Promise<StudyPlanSummary> {
  return apiRequest<StudyPlanSummary>('/api/study-plan/summary');
}

/**
 * Tạo mới hoặc tính toán lại lộ trình dựa trên hồ sơ & kết quả thi gần nhất
 */
export async function generateStudyPlan(): Promise<StudyPlanResponse> {
  return writeAuthRequest<StudyPlanResponse>('POST', '/api/study-plan/generate', {});
}

/**
 * Cập nhật các chỉ số phân bổ trong lộ trình
 */
export async function updateStudyPlan(data: UpdateStudyPlanRequest): Promise<StudyPlanResponse> {
  return writeAuthRequest<StudyPlanResponse>('PUT', '/api/study-plan', data);
}
