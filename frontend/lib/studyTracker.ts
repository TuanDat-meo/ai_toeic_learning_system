export interface StudyDayRecord {
  date: string; // "YYYY-MM-DD"
  minutesSpent: number;
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
}

const STORAGE_KEY = "toeic_study_tracker_data";

// Helper to get today's date formatted as YYYY-MM-DD
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Generate sample/seed history for the current week so the student has realistic data out of the box
function createDefaultTrackerData(): StudyTrackerData {
  const todayStr = getTodayDateString();
  const now = new Date();
  const history: Record<string, StudyDayRecord> = {};

  // Seed previous consecutive 4 days plus today
  for (let i = 4; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    history[dateStr] = {
      date: dateStr,
      minutesSpent: i === 0 ? 25 : 20 + (i * 5),
      completedLessons: i === 0 ? 2 : 3 + i,
    };
  }

  return {
    dailyTargetMinutes: 15,
    currentStreak: 5,
    bestStreak: 7,
    lastActiveDate: todayStr,
    history,
    totalMinutesOverall: 245,
    totalCompletedLessons: 36,
    totalAvailableLessons: 200,
  };
}

export function getStudyTrackerData(): StudyTrackerData {
  if (typeof window === "undefined") {
    return createDefaultTrackerData();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createDefaultTrackerData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const data: StudyTrackerData = JSON.parse(raw);
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

// Record study time or lesson completion
export function logStudySession(minutes: number, lessonsCompleted: number = 0): StudyTrackerData {
  const data = getStudyTrackerData();
  const todayStr = getTodayDateString();

  if (!data.history[todayStr]) {
    data.history[todayStr] = {
      date: todayStr,
      minutesSpent: 0,
      completedLessons: 0,
    };
  }

  data.history[todayStr].minutesSpent += minutes;
  data.history[todayStr].completedLessons += lessonsCompleted;
  data.totalMinutesOverall += minutes;
  data.totalCompletedLessons += lessonsCompleted;
  data.lastActiveDate = todayStr;

  // Recalculate streak if daily target met
  if (data.history[todayStr].minutesSpent >= data.dailyTargetMinutes || data.history[todayStr].completedLessons > 0) {
    // Already counted or continue
    if (data.currentStreak === 0) {
      data.currentStreak = 1;
    }
    if (data.currentStreak > data.bestStreak) {
      data.bestStreak = data.currentStreak;
    }
  }

  saveStudyTrackerData(data);
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
