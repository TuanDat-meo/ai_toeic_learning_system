export interface StudyDayRecord {
  date: string; // "YYYY-MM-DD"
  minutesSpent: number;
  secondsSpent?: number;
  completedLessons: number;
}

export interface StudyTrackerData {
  dailyTargetMinutes: number; // default: 15
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string; // "YYYY-MM-DD"
  history: Record<string, StudyDayRecord>;
  totalMinutesOverall: number;
  totalCompletedLessons: number;
  totalAvailableLessons: number;
  todayMinutes?: number;
  todaySeconds?: number;
}

const STORAGE_KEY = "toeic_study_tracker_data";
export const STUDY_TRACKER_UPDATED_EVENT = "toeic-study-tracker-updated";

// Helper to get today's date formatted as YYYY-MM-DD
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Broadcast updates to all components and windows
function broadcastTrackerUpdate(data: StudyTrackerData): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent(STUDY_TRACKER_UPDATED_EVENT, { detail: data }));
    window.dispatchEvent(new Event("storage"));
  } catch {
    // Ignore event dispatch errors
  }
}

function createDefaultTrackerData(): StudyTrackerData {
  const todayStr = getTodayDateString();

  return {
    dailyTargetMinutes: 15,
    currentStreak: 0,
    bestStreak: 0,
    lastActiveDate: "",
    history: {
      [todayStr]: {
        date: todayStr,
        minutesSpent: 0,
        secondsSpent: 0,
        completedLessons: 0,
      },
    },
    totalMinutesOverall: 0,
    totalCompletedLessons: 0,
    totalAvailableLessons: 0,
    todayMinutes: 0,
    todaySeconds: 0,
  };
}

export function getStudyTrackerData(): StudyTrackerData {
  if (typeof window === "undefined") {
    return createDefaultTrackerData();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let data: StudyTrackerData;
    if (!raw) {
      data = createDefaultTrackerData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    } else {
      data = JSON.parse(raw);
    }

    const todayStr = getTodayDateString();
    if (!data.history) {
      data.history = {};
    }
    if (!data.history[todayStr]) {
      data.history[todayStr] = {
        date: todayStr,
        minutesSpent: 0,
        secondsSpent: 0,
        completedLessons: 0,
      };
    }

    // Always keep helper properties synced
    const todayRec = data.history[todayStr];
    data.todayMinutes = todayRec.minutesSpent || 0;
    data.todaySeconds = todayRec.secondsSpent ?? ((todayRec.minutesSpent || 0) * 60);

    return data;
  } catch {
    return createDefaultTrackerData();
  }
}

export function saveStudyTrackerData(data: StudyTrackerData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore localStorage write error
  }
}

/**
 * Tích lũy số giây học thực tế của học viên khi đang học bài/làm bài.
 * Cứ mỗi giây/chu kỳ học tích cực trôi qua, thời gian sẽ được cộng dồn và quy đổi ra phút.
 * Có thể truyền targetDateStr để đảm bảo khi bước qua mốc 00:00:00 (sang ngày mới),
 * số giây trước 23:59:59 vẫn được ghi chuẩn vào ngày cũ.
 */
export function addStudySeconds(seconds: number, targetDateStr?: string): StudyTrackerData {
  if (seconds <= 0) return getStudyTrackerData();
  const data = getStudyTrackerData();
  const todayStr = getTodayDateString();
  const dateKey = targetDateStr || todayStr;

  if (!data.history[dateKey]) {
    data.history[dateKey] = {
      date: dateKey,
      minutesSpent: 0,
      secondsSpent: 0,
      completedLessons: 0,
    };
  }

  const rec = data.history[dateKey];
  const oldSec = rec.secondsSpent ?? (rec.minutesSpent * 60);
  const newSec = oldSec + seconds;
  rec.secondsSpent = newSec;

  const oldMins = rec.minutesSpent;
  const newMins = Math.floor(newSec / 60);
  rec.minutesSpent = newMins;

  const diffMins = newMins - oldMins;
  if (diffMins > 0) {
    data.totalMinutesOverall = (data.totalMinutesOverall || 0) + diffMins;
  }

  const todayRec = data.history[todayStr];
  data.todayMinutes = todayRec ? todayRec.minutesSpent : 0;
  data.todaySeconds = todayRec ? (todayRec.secondsSpent ?? todayRec.minutesSpent * 60) : 0;
  data.lastActiveDate = dateKey;

  // Cập nhật chuỗi ngày học thực tế từ history
  const realStreaks = computeRealStreaks(data);
  data.currentStreak = realStreaks.currentStreak;
  data.bestStreak = realStreaks.bestStreak;

  saveStudyTrackerData(data);
  broadcastTrackerUpdate(data);
  return data;
}

/**
 * Đồng bộ ngay khi đồng hồ hệ thống bước qua 00:00:00 sang ngày mới,
 * giúp Dashboard tự động chuyển sang 0 phút của ngày mới mà không cần F5.
 */
export function syncStudyTrackerDayRollover(): StudyTrackerData {
  const data = getStudyTrackerData();
  const realStreaks = computeRealStreaks(data);
  data.currentStreak = realStreaks.currentStreak;
  data.bestStreak = realStreaks.bestStreak;
  saveStudyTrackerData(data);
  broadcastTrackerUpdate(data);
  return data;
}

/**
 * Ghi nhận hoặc trừ số bài học hoàn thành khi hoàn thành hoặc đặt lại bài.
 */
export function recordLessonCompleted(delta: number = 1): StudyTrackerData {
  const data = getStudyTrackerData();
  const todayStr = getTodayDateString();

  if (!data.history[todayStr]) {
    data.history[todayStr] = {
      date: todayStr,
      minutesSpent: 0,
      secondsSpent: 0,
      completedLessons: 0,
    };
  }

  const rec = data.history[todayStr];
  rec.completedLessons = Math.max(0, rec.completedLessons + delta);
  data.totalCompletedLessons = Math.max(0, (data.totalCompletedLessons || 0) + delta);

  if (delta > 0 && data.currentStreak === 0) {
    data.currentStreak = 1;
    if (data.currentStreak > data.bestStreak) {
      data.bestStreak = data.currentStreak;
    }
  }

  saveStudyTrackerData(data);
  broadcastTrackerUpdate(data);
  return data;
}

/**
 * Ghi nhận phiên làm bài (số phút và số bài hoàn thành)
 */
export function logStudySession(minutes: number, lessonsCompleted: number = 0): StudyTrackerData {
  const data = getStudyTrackerData();
  const todayStr = getTodayDateString();

  if (!data.history[todayStr]) {
    data.history[todayStr] = {
      date: todayStr,
      minutesSpent: 0,
      secondsSpent: 0,
      completedLessons: 0,
    };
  }

  const rec = data.history[todayStr];
  rec.minutesSpent += minutes;
  rec.secondsSpent = (rec.secondsSpent || 0) + minutes * 60;
  rec.completedLessons += lessonsCompleted;
  data.totalMinutesOverall = (data.totalMinutesOverall || 0) + minutes;
  data.totalCompletedLessons = Math.max(0, (data.totalCompletedLessons || 0) + lessonsCompleted);
  data.todayMinutes = rec.minutesSpent;
  data.todaySeconds = rec.secondsSpent;
  data.lastActiveDate = todayStr;

  // Recalculate streak if daily target met
  if (rec.minutesSpent >= data.dailyTargetMinutes || rec.completedLessons > 0) {
    if (data.currentStreak === 0) {
      data.currentStreak = 1;
    }
    if (data.currentStreak > data.bestStreak) {
      data.bestStreak = data.currentStreak;
    }
  }

  saveStudyTrackerData(data);
  broadcastTrackerUpdate(data);
  return data;
}

/**
 * Tính chính xác chuỗi ngày học liên tục hiện tại và kỷ lục cao nhất
 * dựa hoàn toàn vào lịch sử học thực tế trong `data.history` (không dùng số giả/cũ bị kẹt).
 */
export function computeRealStreaks(data: StudyTrackerData): { currentStreak: number; bestStreak: number } {
  const targetMins = Math.max(1, data.dailyTargetMinutes || 15);
  const completedDates = Object.entries(data.history || {})
    .filter(([, rec]) => rec && (rec.minutesSpent || 0) >= targetMins)
    .map(([dateStr]) => dateStr)
    .sort();

  if (completedDates.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  const completedSet = new Set(completedDates);
  const formatDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  // 1. Tính chuỗi hiện tại (tính lùi từ hôm nay; nếu hôm nay chưa xong thì tính lùi từ hôm qua)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = formatDate(today);
  const cursor = new Date(today);
  if (!completedSet.has(todayStr)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let currentStreak = 0;
  while (completedSet.has(formatDate(cursor))) {
    currentStreak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  // 2. Tính kỷ lục chuỗi dài nhất từ trước tới nay trong history
  let bestStreak = currentStreak;
  let running = 0;
  let prevDate: Date | null = null;
  for (const dateStr of completedDates) {
    const curr = new Date(`${dateStr}T00:00:00`);
    if (prevDate) {
      const diffDays = Math.round((curr.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      running = diffDays === 1 ? running + 1 : 1;
    } else {
      running = 1;
    }
    if (running > bestStreak) bestStreak = running;
    prevDate = curr;
  }

  return { currentStreak, bestStreak };
}

// Get array of status for Monday through Sunday of current week
export function getCurrentWeekDaysStatus(data: StudyTrackerData): { dayName: string; dateStr: string; isCompleted: boolean; isToday: boolean }[] {
  const now = new Date();
  const currentDay = now.getDay();
  const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;

  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);

  const daysLabel = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const todayStr = getTodayDateString();
  const targetMins = Math.max(1, data.dailyTargetMinutes || 15);

  return daysLabel.map((label, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const record = data.history[dateStr];
    const isCompleted = Boolean(record && (record.minutesSpent || 0) >= targetMins);
    return {
      dayName: label,
      dateStr,
      isCompleted,
      isToday: dateStr === todayStr,
    };
  });
}
