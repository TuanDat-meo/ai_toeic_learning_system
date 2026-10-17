import { useState, useEffect } from "react";

export interface ItemProgress {
  completedQuestions: number;
  totalQuestions: number;
  percent: number;
  status: "not_started" | "in_progress" | "completed";
  lastScore?: number;
  correctAnswers?: number;
  wrongAnswers?: number;
  updatedAt?: string;
}

const STORAGE_KEY = "toeic_practice_progress_map";
export const PROGRESS_UPDATED_EVENT = "toeic-practice-progress-updated";

// Seed data so users and admin see realistic progress immediately
const DEFAULT_PROGRESS: Record<string, { completed: number; total: number; score?: number; correct?: number; wrong?: number }> = {
  // Mock Tests
  "mock-test-1": { completed: 200, total: 200, score: 785 },
  "mock-test-2": { completed: 145, total: 200, score: 690 },
  "mock-test-3": { completed: 60, total: 200 },
  "mock-test-11": { completed: 180, total: 200, score: 810 },

  // Reading exercises
  "reading-test-1": { completed: 100, total: 100 },
  "reading-test-2": { completed: 65, total: 100 },
  "reading-level-1": { completed: 20, total: 20 },
  "reading-level-2": { completed: 14, total: 20 },
  "reading-noun-clause": { completed: 10, total: 10 },
  "reading-verb-tense": { completed: 8, total: 10 },

  // Listening exercises
  "listening-quiz-lvl-p1-1": { completed: 10, total: 10 },
  "listening-quiz-lvl-p1-2": { completed: 7, total: 10 },
  "listening-dictation-d1": { completed: 10, total: 10 },
  "listening-dictation-d2": { completed: 6, total: 10 },

  // Grammar topics
  "grammar-g1": { completed: 3, total: 3 },
  "grammar-g2": { completed: 3, total: 3 },
  "grammar-g3": { completed: 1, total: 3 },
  "grammar-g7": { completed: 2, total: 3 },

  // Vocabulary sets
  "vocab-test-1": { completed: 25, total: 25 },
  "vocab-test-2": { completed: 18, total: 25 },
  "vocab-test-3": { completed: 5, total: 25 },
};

function getRawStorageMap(): Record<string, ItemProgress> {
  if (typeof window === "undefined") {
    const fallback: Record<string, ItemProgress> = {};
    for (const [k, v] of Object.entries(DEFAULT_PROGRESS)) {
      const pct = v.total > 0 ? Math.min(100, Math.round((v.completed / v.total) * 100)) : 0;
      fallback[k] = {
        completedQuestions: v.completed,
        totalQuestions: v.total,
        percent: pct,
        status: pct >= 100 ? "completed" : pct > 0 ? "in_progress" : "not_started",
        lastScore: v.score,
        correctAnswers: v.correct,
        wrongAnswers: v.wrong,
      };
    }
    return fallback;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial: Record<string, ItemProgress> = {};
      for (const [k, v] of Object.entries(DEFAULT_PROGRESS)) {
        const pct = v.total > 0 ? Math.min(100, Math.round((v.completed / v.total) * 100)) : 0;
        initial[k] = {
          completedQuestions: v.completed,
          totalQuestions: v.total,
          percent: pct,
          status: pct >= 100 ? "completed" : pct > 0 ? "in_progress" : "not_started",
          lastScore: v.score,
          correctAnswers: v.correct,
          wrongAnswers: v.wrong,
          updatedAt: new Date().toISOString(),
        };
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function getItemProgress(key: string, fallbackTotal: number = 0): ItemProgress {
  const map = getRawStorageMap();
  if (map[key]) {
    const item = map[key];
    const total = item.totalQuestions > 0 ? item.totalQuestions : fallbackTotal;
    const completed = Math.min(item.completedQuestions, total > 0 ? total : item.completedQuestions);
    const percent = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
    return {
      ...item,
      completedQuestions: completed,
      totalQuestions: total,
      percent,
      status: percent >= 100 ? "completed" : percent > 0 ? "in_progress" : "not_started",
    };
  }

  return {
    completedQuestions: 0,
    totalQuestions: fallbackTotal,
    percent: 0,
    status: "not_started",
  };
}

export function saveItemProgress(
  key: string,
  completedQuestions: number,
  totalQuestions: number,
  score?: number,
  correctAnswers?: number,
  wrongAnswers?: number
): ItemProgress {
  if (typeof window === "undefined") {
    const pct = totalQuestions > 0 ? Math.min(100, Math.round((completedQuestions / totalQuestions) * 100)) : 0;
    return {
      completedQuestions,
      totalQuestions,
      percent: pct,
      status: pct >= 100 ? "completed" : pct > 0 ? "in_progress" : "not_started",
      lastScore: score,
      correctAnswers,
      wrongAnswers,
    };
  }

  const map = getRawStorageMap();
  const clampedCompleted = Math.max(0, Math.min(totalQuestions > 0 ? totalQuestions : completedQuestions, completedQuestions));
  const percent = totalQuestions > 0 ? Math.min(100, Math.round((clampedCompleted / totalQuestions) * 100)) : 0;
  const status: ItemProgress["status"] = percent >= 100 ? "completed" : percent > 0 ? "in_progress" : "not_started";

  const updated: ItemProgress = {
    completedQuestions: clampedCompleted,
    totalQuestions,
    percent,
    status,
    lastScore: score !== undefined ? score : map[key]?.lastScore,
    correctAnswers: correctAnswers !== undefined ? correctAnswers : map[key]?.correctAnswers,
    wrongAnswers: wrongAnswers !== undefined ? wrongAnswers : map[key]?.wrongAnswers,
    updatedAt: new Date().toISOString(),
  };

  map[key] = updated;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(new CustomEvent(PROGRESS_UPDATED_EVENT, { detail: { key, progress: updated } }));
  } catch {
    // Ignore storage write error
  }

  return updated;
}

export function useItemProgress(key: string, fallbackTotal: number = 0): ItemProgress {
  const [progress, setProgress] = useState<ItemProgress>(() => getItemProgress(key, fallbackTotal));

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<{ key: string; progress: ItemProgress }>;
      if (!customEvent.detail || customEvent.detail.key === key) {
        setProgress(getItemProgress(key, fallbackTotal));
      }
    };

    const storageHandler = () => {
      setProgress(getItemProgress(key, fallbackTotal));
    };

    window.addEventListener(PROGRESS_UPDATED_EVENT, handler);
    window.addEventListener("storage", storageHandler);
    return () => {
      window.removeEventListener(PROGRESS_UPDATED_EVENT, handler);
      window.removeEventListener("storage", storageHandler);
    };
  }, [key, fallbackTotal]);

  return progress;
}
