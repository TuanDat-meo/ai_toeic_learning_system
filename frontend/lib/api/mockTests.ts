import { apiRequest, writeAuthRequest } from './client';
import {
  TestItem,
  PracticeQuestion,
  HistoryAttempt,
  StudentSubmission,
  normalizeToeicPart,
} from '@/app/admin/content/mock-tests/types';
import { enrichPracticeQuestion } from '../toeicQuestionEnricher';

export const LOCAL_SUBMISSIONS_KEY = 'toeic_mock_test_submissions';

export function getLocalSubmissions(): StudentSubmission[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_SUBMISSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalSubmission(sub: StudentSubmission) {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalSubmissions();
    const next = [sub, ...current.filter((s) => s.id !== sub.id)];
    localStorage.setItem(LOCAL_SUBMISSIONS_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('toeic-submissions-updated', { detail: sub }));
  } catch (err) {
    console.warn('Could not save submission to localStorage:', err);
  }
}

export function updateTestStatsInLocalStorage(
  testId: number,
  score: number,
  listeningScore: number,
  readingScore: number,
  correctCount: number,
  totalCount: number,
  durationSeconds: number
) {
  if (typeof window === 'undefined') return;

  const keys = ['toeic_mock_tests_v1', 'toeic_mock_tests_v2', 'toeic_mock_tests_v3'];
  keys.forEach((key) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const tests = JSON.parse(raw);
      if (!Array.isArray(tests)) return;

      const idx = tests.findIndex((t: TestItem) => t.id === testId);
      if (idx !== -1) {
        const test = tests[idx];
        const newAttempt: HistoryAttempt = {
          id: `att-${Date.now()}`,
          testId,
          score,
          listeningScore,
          readingScore,
          correctCount,
          totalCount,
          durationSeconds,
          completedAt: new Date().toISOString(),
        };

        const historyAttempts = [newAttempt, ...(test.historyAttempts || [])];
        const allSubs = getLocalSubmissions().filter((s) => s.testId === testId);
        const allScores = allSubs.length > 0 ? allSubs.map((s) => s.score) : [score];
        const avg = Math.round(allScores.reduce((acc, curr) => acc + curr, 0) / allScores.length);

        tests[idx] = {
          ...test,
          score,
          listeningScore,
          readingScore,
          avgScore: avg,
          attemptCount: Math.max(allSubs.length, historyAttempts.length),
          status: 'Đã làm',
          completedAt: 'Vừa xong',
          historyAttempts,
        };

        localStorage.setItem(key, JSON.stringify(tests));
      }
    } catch (e) {
      console.warn(`Failed to update stats in ${key}:`, e);
    }
  });

  window.dispatchEvent(new CustomEvent('toeic-mock-tests-updated'));
}

export async function fetchMockTests(volId?: string): Promise<TestItem[]> {
  try {
    const query = volId && volId !== 'all' ? `?volId=${volId}` : '';
    const items = await apiRequest<TestItem[]>(`/api/mock-tests${query}`);
    if (Array.isArray(items) && items.length > 0) {
      return items;
    }
  } catch (error) {
    console.warn('Fallback to local mock tests:', error);
  }
  return [];
}

export async function fetchMockTestQuestions(testId: number): Promise<PracticeQuestion[]> {
  try {
    const list = await apiRequest<PracticeQuestion[]>(`/api/mock-tests/${testId}/questions`);
    if (Array.isArray(list) && list.length > 0) {
      return list.map((q) =>
        enrichPracticeQuestion({
          ...q,
          part: normalizeToeicPart(q.part),
        })
      );
    }
  } catch {
    // If backend is offline, try Next.js internal API route
  }

  try {
    const res = await fetch(`/api/mock-tests/${testId}/questions`);
    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list) && list.length > 0) {
        return list.map((q: PracticeQuestion) =>
          enrichPracticeQuestion({
            ...q,
            part: normalizeToeicPart(q.part),
          })
        );
      }
    }
  } catch (err) {
    console.warn(`Fallback to local mock questions for test ${testId}:`, err);
  }

  return [];
}

export async function fetchMockTestSubmissions(testId?: number): Promise<StudentSubmission[]> {
  let backendSubmissions: StudentSubmission[] = [];

  try {
    const query = testId && testId > 0 ? `?testId=${testId}` : '';
    const res = await apiRequest<StudentSubmission[]>(`/api/admin/mock-tests/submissions${query}`);
    if (Array.isArray(res)) {
      backendSubmissions = res;
    }
  } catch {
    // Next.js internal route fallback
    try {
      const query = testId && testId > 0 ? `?testId=${testId}` : '';
      const localRes = await fetch(`/api/admin/mock-tests/submissions${query}`);
      if (localRes.ok) {
        const data = await localRes.json();
        if (Array.isArray(data)) {
          backendSubmissions = data;
        }
      }
    } catch {}
  }

  const localSubs = getLocalSubmissions();
  const filteredLocal = testId && testId > 0 ? localSubs.filter((s) => s.testId === testId) : localSubs;

  // Merge backend and local submissions, deduplicating by ID
  const map = new Map<string, StudentSubmission>();
  filteredLocal.forEach((s) => map.set(s.id, s));
  backendSubmissions.forEach((s) => map.set(s.id, s));

  return Array.from(map.values());
}

export async function submitMockTestAttempt(req: {
  testId: number;
  testTitle?: string;
  volId?: string;
  score: number;
  listeningScore: number;
  readingScore: number;
  correctCount: number;
  totalCount: number;
  durationSeconds: number;
  studentName?: string;
  studentEmail?: string;
}): Promise<HistoryAttempt | null> {
  const submissionId = `sub-${Date.now()}`;
  const now = new Date();
  const dateStr = now.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const localSub: StudentSubmission = {
    id: submissionId,
    testId: req.testId,
    testTitle: req.testTitle || `ETS Test #${req.testId}`,
    volId: req.volId || 'vol1',
    studentName: req.studentName || 'Học viên',
    studentEmail: req.studentEmail || 'student@toeic-ai.local',
    score: req.score,
    listeningScore: req.listeningScore,
    readingScore: req.readingScore,
    correctCount: req.correctCount,
    totalCount: req.totalCount,
    durationSeconds: req.durationSeconds,
    completedAt: dateStr,
    status: 'Đã chấm điểm',
  };

  saveLocalSubmission(localSub);
  updateTestStatsInLocalStorage(
    req.testId,
    req.score,
    req.listeningScore,
    req.readingScore,
    req.correctCount,
    req.totalCount,
    req.durationSeconds
  );

  let backendResult: HistoryAttempt | null = null;
  try {
    backendResult = await writeAuthRequest<HistoryAttempt>('POST', '/api/mock-tests/submit', {
      testId: req.testId,
      score: req.score,
      listeningScore: req.listeningScore,
      readingScore: req.readingScore,
      correctCount: req.correctCount,
      totalCount: req.totalCount,
      durationSeconds: req.durationSeconds,
    });
  } catch (error) {
    // Also try Next.js internal api route if direct backend threw
    try {
      const res = await fetch('/api/mock-tests/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localSub),
      });
      if (res.ok) {
        backendResult = (await res.json()) as HistoryAttempt;
      }
    } catch {}
  }

  return (
    backendResult || {
      id: submissionId,
      testId: req.testId,
      score: req.score,
      listeningScore: req.listeningScore,
      readingScore: req.readingScore,
      correctCount: req.correctCount,
      totalCount: req.totalCount,
      durationSeconds: req.durationSeconds,
      completedAt: now.toISOString(),
    }
  );
}
