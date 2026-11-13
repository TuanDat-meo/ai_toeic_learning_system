import { useState, useEffect } from "react";
import { logStudySession, recordLessonCompleted } from "@/lib/studyTracker";

export interface ItemProgress {
  completedQuestions: number;
  totalQuestions: number;
  percent: number;
  status: "not_started" | "in_progress" | "completed";
  lastScore?: number;
  correctAnswers?: number;
  wrongAnswers?: number;
  wrongQuestionIds?: (number | string)[];
  answeredQuestionIds?: (number | string)[];
  lastAnsweredIndex?: number;
  savedCount?: number;
  savedItemIds?: (number | string)[];
  updatedAt?: string;
}

const STORAGE_KEY = "toeic_practice_progress_map";
export const PROGRESS_UPDATED_EVENT = "toeic-practice-progress-updated";

function getRawStorageMap(): Record<string, ItemProgress> {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as Record<string, ItemProgress> : {};
  } catch (error) {
    console.error("Could not read saved practice progress:", error);
    return {};
  }
}

export function getItemProgress(key: string, fallbackTotal: number = 0): ItemProgress {
  const map = getRawStorageMap();
  if (map[key]) {
    const item = map[key];

    // Tự động dọn dẹp dữ liệu rác từ lỗi click câu hỏi thi thử chưa nộp trước đây
    if (
      key.startsWith("mock-test-") &&
      item.lastScore === undefined &&
      (!item.answeredQuestionIds || item.answeredQuestionIds.length === 0) &&
      item.completedQuestions > 0 &&
      item.correctAnswers === item.completedQuestions &&
      (item.wrongAnswers === 0 || item.wrongAnswers === undefined)
    ) {
      item.completedQuestions = 0;
      item.correctAnswers = 0;
      item.wrongAnswers = 0;
      item.percent = 0;
      item.status = "not_started";
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
      } catch {}
    }

    const total = item.totalQuestions > 0 ? item.totalQuestions : fallbackTotal;
    const wrong = item.wrongAnswers !== undefined ? item.wrongAnswers : (item.wrongQuestionIds?.length || 0);
    const correct = item.correctAnswers !== undefined ? item.correctAnswers : 0;
    const completed = Math.max(item.completedQuestions || 0, correct + wrong);

    const clampedCompleted = total > 0 ? Math.min(total, completed) : completed;
    const percent = total > 0 ? Math.min(100, Math.round((clampedCompleted / total) * 100)) : 0;

    return {
      ...item,
      completedQuestions: clampedCompleted,
      totalQuestions: total,
      percent,
      correctAnswers: correct,
      wrongAnswers: wrong,
      wrongQuestionIds: item.wrongQuestionIds || [],
      answeredQuestionIds: item.answeredQuestionIds || [],
      savedCount: item.savedCount || 0,
      status: percent >= 100 ? "completed" : percent > 0 ? "in_progress" : "not_started",
    };
  }

  return {
    completedQuestions: 0,
    totalQuestions: fallbackTotal,
    percent: 0,
    status: "not_started",
    correctAnswers: 0,
    wrongAnswers: 0,
    wrongQuestionIds: [],
    answeredQuestionIds: [],
    savedCount: 0,
  };
}

export function saveItemProgress(
  key: string,
  completedQuestions: number,
  totalQuestions: number,
  score?: number,
  correctAnswers?: number,
  wrongAnswers?: number,
  wrongQuestionIds?: (number | string)[],
  savedCount?: number,
  answeredQuestionIds?: (number | string)[]
): ItemProgress {
  if (typeof window === "undefined") {
    const pct = totalQuestions > 0 ? Math.min(100, Math.round((completedQuestions / totalQuestions) * 100)) : 0;
    return {
      completedQuestions,
      totalQuestions,
      percent: pct,
      status: pct >= 100 ? "completed" : pct > 0 ? "in_progress" : "not_started",
      lastScore: score,
      correctAnswers: correctAnswers !== undefined ? correctAnswers : 0,
      wrongAnswers: wrongAnswers !== undefined ? wrongAnswers : 0,
      wrongQuestionIds: wrongQuestionIds || [],
      answeredQuestionIds: answeredQuestionIds || [],
      savedCount: savedCount || 0,
    };
  }

  const map = getRawStorageMap();
  const prev = map[key];
  const total = totalQuestions > 0 ? totalQuestions : (prev?.totalQuestions || 0);
  
  const wrong = wrongAnswers !== undefined ? wrongAnswers : (prev?.wrongAnswers ?? 0);
  const correct = correctAnswers !== undefined ? correctAnswers : (prev?.correctAnswers ?? 0);
  const completed = Math.max(completedQuestions, correct + wrong);

  const clampedCompleted = total > 0 ? Math.min(total, completed) : completed;
  const percent = total > 0 ? Math.min(100, Math.round((clampedCompleted / total) * 100)) : 0;
  const status: ItemProgress["status"] = percent >= 100 ? "completed" : percent > 0 ? "in_progress" : "not_started";

  const updated: ItemProgress = {
    completedQuestions: clampedCompleted,
    totalQuestions: total,
    percent,
    status,
    lastScore: score !== undefined ? score : prev?.lastScore,
    correctAnswers: correct,
    wrongAnswers: wrong,
    wrongQuestionIds: wrongQuestionIds !== undefined ? wrongQuestionIds : prev?.wrongQuestionIds ?? [],
    answeredQuestionIds: answeredQuestionIds !== undefined ? answeredQuestionIds : prev?.answeredQuestionIds ?? [],
    savedCount: savedCount !== undefined ? savedCount : prev?.savedCount ?? 0,
    updatedAt: new Date().toISOString(),
  };

  map[key] = updated;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    setTimeout(() => {
      try {
        window.dispatchEvent(new CustomEvent(PROGRESS_UPDATED_EVENT, { detail: { key, progress: updated } }));
      } catch {}
    }, 0);
  } catch {}

  const wasCompleted = prev ? (prev.status === "completed" || prev.percent >= 100) : false;
  const isNowCompleted = (status === "completed" || percent >= 100);

  if (!wasCompleted && isNowCompleted) {
    try {
      logStudySession(0, 1);
    } catch {}
  } else if (wasCompleted && !isNowCompleted) {
    try {
      recordLessonCompleted(-1);
    } catch {}
  }

  return updated;
}

/**
 * Ghi nhận kết quả làm câu hỏi.
 * QUY TẮC CHUẨN XÁC:
 * 1. Làm câu mới:
 *    - Làm ĐÚNG: tăng correctAnswers, tăng completedQuestions, không tăng wrong.
 *    - Làm SAI: tăng wrongAnswers, thêm vào wrongQuestionIds, tăng completedQuestions.
 * 2. Làm lại câu vốn dĩ bị SAI:
 *    - Làm lại ĐÚNG: XÓA khỏi wrongQuestionIds, wrongAnswers GIẢM DẦN, correctAnswers TĂNG LÊN!
 *    - Làm lại vẫn SAI: giữ nguyên câu trong wrongQuestionIds.
 * 3. completedQuestions luôn bằng correctAnswers + wrongAnswers và đúng với số câu học viên đã làm!
 */
export function recordQuestionAnswer(
  key: string,
  questionId: number | string,
  isCorrect: boolean,
  totalQuestions?: number
): ItemProgress {
  const current = getItemProgress(key, totalQuestions || 0);
  const total = totalQuestions || current.totalQuestions || 0;
  
  const wrongList = Array.isArray(current.wrongQuestionIds) ? [...current.wrongQuestionIds] : [];
  const answeredList = Array.isArray(current.answeredQuestionIds) ? [...current.answeredQuestionIds] : [];
  let correct = current.correctAnswers || 0;
  let wrong = current.wrongAnswers || 0;
  let completed = current.completedQuestions || 0;

  const qStr = String(questionId);

  // Kiểm tra câu này có đang nằm trong danh sách câu SAI không
  const existingWrongIndex = wrongList.findIndex((id) => {
    const idStr = String(id);
    return idStr === qStr || qStr.endsWith(`-${idStr}`) || qStr.endsWith(`_${idStr}`) || (idStr.length > 2 && qStr.includes(idStr));
  });
  const isExistingWrong = existingWrongIndex !== -1;

  // Kiểm tra câu này đã từng làm chưa
  const isAlreadyAnswered = answeredList.some((id) => {
    const idStr = String(id);
    return idStr === qStr || qStr.endsWith(`-${idStr}`) || qStr.endsWith(`_${idStr}`);
  });

  if (isCorrect) {
    if (isExistingWrong) {
      // Làm lại đúng câu sai: XÓA khỏi sai, GIẢM DẦN câu sai và TĂNG số câu đúng!
      wrongList.splice(existingWrongIndex, 1);
      wrong = Math.max(0, wrong - 1);
      correct = correct + 1;
    } else {
      // Làm câu mới đúng
      if (!isAlreadyAnswered) {
        answeredList.push(questionId);
        correct = correct + 1;
      }
    }
  } else {
    // Làm câu hỏi SAI
    if (!isExistingWrong) {
      wrongList.push(questionId);
      wrong = wrong + 1;
    }
    if (!isAlreadyAnswered) {
      answeredList.push(questionId);
    }
  }

  // Đảm bảo số câu đã làm luôn bằng đúng + sai
  completed = Math.min(total, correct + wrong);

  return saveItemProgress(
    key,
    completed,
    total,
    current.lastScore,
    correct,
    wrong,
    wrongList,
    current.savedCount,
    answeredList
  );
}

/**
 * Đặt lại tiến độ bài học về 0 (như mới)
 */
export function resetItemProgress(key: string, fallbackTotal: number = 0): ItemProgress {
  const current = getItemProgress(key, fallbackTotal);
  if (typeof window !== "undefined" && key.startsWith("reading-")) {
    try {
      const cardId = key.slice("reading-".length);
      localStorage.removeItem(`toeic_reading_answers_${cardId}`);
    } catch {}
  }
  return saveItemProgress(key, 0, current.totalQuestions || fallbackTotal, undefined, 0, 0, [], current.savedCount);
}

/**
 * Lấy danh sách câu hỏi cần làm lại cho chế độ "Làm lại câu sai".
 * ĐẢM BẢO TUYỆT ĐỐI:
 * - Số lượng câu hỏi trả về luôn bằng đúng số câu sai đã báo ngoài Badge (`wrongAnswers`),
 *   không bao giờ bị thiếu (ví dụ ngoài badge báo 6 câu sai thì phiên làm lại sẽ có đủ 6 câu).
 * - Tự động đồng bộ wrongQuestionIds vào localStorage để khi làm đúng, số câu sai giảm dần chuẩn xác.
 */
export function getRedoWrongQuestions<T extends { id?: number | string | null; questionNum?: string | number | null }>(
  allQuestions: T[],
  progressKey: string,
  fallbackTotal = 0
): T[] {
  if (!allQuestions || allQuestions.length === 0) return [];
  const prog = getItemProgress(progressKey, fallbackTotal || allQuestions.length);
  const targetCount = Math.min(
    allQuestions.length,
    Math.max(prog.wrongAnswers || 0, (prog.wrongQuestionIds || []).length)
  );

  if (targetCount <= 0) {
    return [];
  }

  const wrongIds = (prog.wrongQuestionIds || []).map(String);
  const selected: T[] = [];

  // 1. Lọc trước các câu có ID/questionNum/Index trùng khớp với wrongQuestionIds
  for (let idx = 0; idx < allQuestions.length; idx++) {
    const q = allQuestions[idx];
    const qIdStr = q.id !== undefined ? String(q.id) : "";
    const qNumStr = q.questionNum !== undefined ? String(q.questionNum) : "";
    const idx1Str = String(idx + 1);
    const idx0Str = String(idx);

    const isMatch = wrongIds.some(
      (wid) =>
        wid === qIdStr ||
        wid === qNumStr ||
        wid === idx1Str ||
        wid === idx0Str ||
        (qIdStr && qIdStr.endsWith(`-${wid}`)) ||
        (qIdStr && qIdStr.endsWith(`_${wid}`))
    );

    if (isMatch) {
      selected.push(q);
      if (selected.length >= targetCount) break;
    }
  }

  // Keep the retry list limited to questions whose IDs were actually recorded.
  try {
    const newWrongIds = selected.map((q, idx) => {
      if (q.questionNum !== undefined) return String(q.questionNum);
      if (q.id !== undefined) return String(q.id);
      return String(idx + 1);
    });
    const currentWrong = prog.wrongAnswers !== undefined ? prog.wrongAnswers : selected.length;
    const currentCorrect = prog.correctAnswers !== undefined ? prog.correctAnswers : 0;
    const currentCompleted = Math.max(prog.completedQuestions || 0, currentCorrect + currentWrong);

    saveItemProgress(
      progressKey,
      currentCompleted,
      prog.totalQuestions || allQuestions.length,
      prog.lastScore,
      currentCorrect,
      currentWrong,
      newWrongIds,
      prog.savedCount,
      prog.answeredQuestionIds
    );
  } catch {}

  return selected;
}

/**
 * Hook lắng nghe tiến độ của một bài học
 */
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
