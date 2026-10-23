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

// Generate sample/seed history for the current week so the student has realistic data out of the box
function createDefaultTrackerData(): StudyTrackerData {
  const todayStr = getTodayDateString();
  const now = new Date();
  const history: Record<string, StudyDayRecord> = {};

  // Seed previous consecutive 4 days
  for (let i = 4; i >= 1; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    history[dateStr] = {
      date: dateStr,
      minutesSpent: 20 + (i * 5),
      secondsSpent: (20 + (i * 5)) * 60,
      completedLessons: 3 + i,
    };
  }

  // Today begins at 0 unless active
  history[todayStr] = {
    date: todayStr,
    minutesSpent: 0,
    secondsSpent: 0,
    completedLessons: 0,
  };

  return {
    dailyTargetMinutes: 15,
    currentStreak: 4,
    bestStreak: 7,
    lastActiveDate: todayStr,
    history,
    totalMinutesOverall: 220,
    totalCompletedLessons: 36,
    totalAvailableLessons: 200,
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
 */
export function addStudySeconds(seconds: number): StudyTrackerData {
  if (seconds <= 0) return getStudyTrackerData();
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

  data.todayMinutes = newMins;
  data.todaySeconds = newSec;
  data.lastActiveDate = todayStr;

  // Cập nhật chuỗi ngày học nếu đạt chỉ tiêu phút hoặc đã hoàn thành bài
  if (newMins >= data.dailyTargetMinutes || rec.completedLessons > 0) {
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

// Get array of status for Monday through Sunday of current week
export function getCurrentWeekDaysStatus(data: StudyTrackerData): { dayName: string; dateStr: string; isCompleted: boolean; isToday: boolean }[] {
  const now = new Date();
  // Get current day of week: Sunday is 0, Monday is 1, ..., Saturday is 6
  const currentDay = now.getDay();
  // We want Monday (1) as start of week. If currentDay is 0 (Sunday), distance from Monday is -6.
  const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;

  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);

  const daysLabel = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const todayStr = getTodayDateString();

  return daysLabel.map((label, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const record = data.history[dateStr];
    const isCompleted = Boolean(record && (record.minutesSpent >= data.dailyTargetMinutes || record.completedLessons > 0));
    return {
      dayName: label,
      dateStr,
      isCompleted,
      isToday: dateStr === todayStr,
    };
  });
}
