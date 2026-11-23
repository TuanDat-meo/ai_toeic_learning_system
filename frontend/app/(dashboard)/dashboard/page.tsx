"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { LearningOnboardingPrompt } from "@/components/learning/LearningOnboardingPrompt";
import {
  BookOpen,
  Brain,
  ClipboardCheck,
  Headphones,
  ListChecks,
  Gamepad2,
  TrendingUp,
  Flame,
  Award,
  ArrowRight,
  Target,
  CheckCircle2,
  Pencil,
  X,
  Check,
  Clock,
  Info,
  Calendar,
  BarChart3,
  MessageSquare,
  History,
  ChevronRight,
  AlertCircle,
  Megaphone,
  ExternalLink,
} from "lucide-react";
import {
  getStudentAnnouncements,
  markAnnouncementRead,
  resolveStudentActionUrl,
  getActionUrlLabel,
  normalizeLineBreaks,
  type Announcement,
} from "@/lib/api/support";
import {
  getStudyTrackerData,
  saveStudyTrackerData,
  computeRealStreaks,
  getCurrentWeekDaysStatus,
  getTodayDateString,
  StudyTrackerData,
} from "@/lib/studyTracker";
import { fetchListeningAnalytics, type ListeningAnalyticsSummary } from "@/lib/api/listening";
import {
  getCurrentUser,
  getLearningOnboardingStatus,
  type AuthUser,
} from "@/lib/api/auth";
import {
  getStudentVocabularyDashboard,
  getVocabularySetSummaries,
  type StudentVocabularyDashboard,
} from "@/lib/api/vocabulary";
import { getGrammarTopics } from "@/lib/api/grammar";
import { fetchListeningCards, fetchListeningUnits } from "@/lib/api/listening";
import { fetchReadingCards } from "@/lib/api/reading";
import { fetchMockTests } from "@/lib/api/mockTests";
import { type ItemProgress } from "@/lib/practiceProgress";

interface LatestScoreData {
  lc: number;
  rc: number;
  total: number;
  testName?: string;
}

interface TargetGoalData {
  targetBand: number;
  focusNote: string;
  examDate?: string;
}

interface ModuleLiveStats {
  loading: boolean;
  vocabSets: number;
  vocabTotalWords: number;
  vocabLearnedWords: number;
  vocabDueReview: number;
  grammarTotal: number;
  grammarCompleted: number;
  listeningCards: number;
  listeningUnits: number;
  readingCards: number;
  readingQuestions: number;
  readingStudiedQuestions: number;
  mockTests: number;
}

interface ResumeItem {
  key: string;
  title: string;
  skillLabel: string;
  href: string;
  percent: number;
  completedQuestions: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  isInProgress: boolean;
  needsWrongReview: boolean;
  updatedAt?: string;
}

const PRACTICE_PROGRESS_KEY = "toeic_practice_progress_map";

function getVietnameseGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Chào buổi sáng";
  if (hour < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

function getVietnameseDateLabel(): string {
  const now = new Date();
  const weekdays = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];
  return `${weekdays[now.getDay()]}, ngày ${now.getDate()} tháng ${now.getMonth() + 1}, ${now.getFullYear()}`;
}

function getDaysUntilDate(dateStr?: string | null): number | null {
  if (!dateStr) return null;
  const target = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatMinutesCompact(totalMins: number): string {
  if (totalMins < 60) return `${totalMins} phút`;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return m > 0 ? `${h}g ${m}p` : `${h} giờ`;
}

function readPracticeProgressMap(): Record<string, ItemProgress> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PRACTICE_PROGRESS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, ItemProgress>) : {};
  } catch {
    return {};
  }
}

export default function StudentDashboardPage() {
  const todayStr = getTodayDateString();

  // User & Backend Live Stats
  const [user, setUser] = useState<AuthUser | null>(null);
  const [vocabDashboard, setVocabDashboard] = useState<StudentVocabularyDashboard | null>(null);
  const [moduleStats, setModuleStats] = useState<ModuleLiveStats>({
    loading: true,
    vocabSets: 0,
    vocabTotalWords: 0,
    vocabLearnedWords: 0,
    vocabDueReview: 0,
    grammarTotal: 0,
    grammarCompleted: 0,
    listeningCards: 0,
    listeningUnits: 0,
    readingCards: 0,
    readingQuestions: 0,
    readingStudiedQuestions: 0,
    mockTests: 0,
  });
  const [titleLookup, setTitleLookup] = useState<Record<string, { title: string; skillLabel: string; href: string }>>({});

  // Study Tracker & Streak Data
  const [trackerData, setTrackerData] = useState<StudyTrackerData>(getStudyTrackerData);
  const [progressMap, setProgressMap] = useState<Record<string, ItemProgress>>(readPracticeProgressMap);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const [editDailyMinutes, setEditDailyMinutes] = useState(() => getStudyTrackerData().dailyTargetMinutes);
  const [listeningAnalytics, setListeningAnalytics] = useState<ListeningAnalyticsSummary | null>(null);

  useEffect(() => {
    fetchListeningAnalytics()
      .then((res) => setListeningAnalytics(res))
      .catch(() => {});
  }, []);

  // Lắng nghe cập nhật thời gian học thực tế theo thời gian thực
  useEffect(() => {
    const handleTrackerUpdate = () => {
      setTrackerData(getStudyTrackerData());
    };
    window.addEventListener("toeic-study-tracker-updated", handleTrackerUpdate);
    window.addEventListener("storage", handleTrackerUpdate);
    window.addEventListener("focus", handleTrackerUpdate);
    return () => {
      window.removeEventListener("toeic-study-tracker-updated", handleTrackerUpdate);
      window.removeEventListener("storage", handleTrackerUpdate);
      window.removeEventListener("focus", handleTrackerUpdate);
    };
  }, []);

  // Latest Score & Target Goal State
  const [latestScore, setLatestScore] = useState<LatestScoreData | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedScore = localStorage.getItem("toeic_dashboard_latest_score");
        if (savedScore) {
          const parsed = JSON.parse(savedScore) as LatestScoreData;
          if (Number.isFinite(parsed.lc) && Number.isFinite(parsed.rc)) return parsed;
        }
      } catch {
        // Ignore parse error
      }
    }
    return null;
  });

  const [targetGoal, setTargetGoal] = useState<TargetGoalData | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedTarget = localStorage.getItem("toeic_dashboard_target_goal");
        if (savedTarget) {
          const parsed = JSON.parse(savedTarget) as TargetGoalData;
          if (Number.isFinite(parsed.targetBand)) return parsed;
        }
      } catch {
        // Ignore parse error
      }
    }
    return null;
  });

  // Filter tab for "Tiếp tục học & Ôn tập ưu tiên"
  const [resumeFilter, setResumeFilter] = useState<"all" | "in_progress" | "wrong">("all");

  // Modal states
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);

  // Form states for Score editing (string-based to prevent leading zeros like "00135")
  const [editLc, setEditLc] = useState<string>("");
  const [editRc, setEditRc] = useState<string>("");

  // Form states for Target editing
  const [editTargetBand, setEditTargetBand] = useState<string>("650");
  const [editFocusNote, setEditFocusNote] = useState<string>("");
  const [editExamDate, setEditExamDate] = useState<string>("");

  const sanitizeScoreInput = (raw: string, max: number): string => {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return "";
    const normalized = digits.replace(/^0+(?=\d)/, "");
    const num = Math.min(max, parseInt(normalized, 10));
    return String(num);
  };

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Active pinned announcement banner
  const [pinnedAnnouncement, setPinnedAnnouncement] = useState<Announcement | null>(null);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);

  useEffect(() => {
    document.title = "Bảng Điều Khiển Học Tập - TOEIC AI";
    let active = true;
    const fetchAnnouncement = async () => {
      try {
        const list = await getStudentAnnouncements();
        if (!active) return;
        const pinned = list.find((a) => a.isPinned && a.status === "ACTIVE");
        if (pinned) {
          const dismissedId =
            typeof window !== "undefined"
              ? sessionStorage.getItem(`dismissed_announcement_${pinned.id}`)
              : null;
          if (!dismissedId) {
            setPinnedAnnouncement(pinned);
          }
        } else {
          setPinnedAnnouncement(null);
        }
      } catch {
        // Silently skip if student cannot load announcements
      }
    };
    void fetchAnnouncement();
    const handleUpdated = () => void fetchAnnouncement();
    window.addEventListener("announcement-updated", handleUpdated);
    window.addEventListener("announcement-read-updated", handleUpdated);
    return () => {
      active = false;
      window.removeEventListener("announcement-updated", handleUpdated);
      window.removeEventListener("announcement-read-updated", handleUpdated);
    };
  }, []);

  // Sync live updates from studyTracker & practiceProgress
  useEffect(() => {
    const handleTrackerUpdate = () => {
      setTrackerData(getStudyTrackerData());
      setProgressMap(readPracticeProgressMap());
    };
    window.addEventListener("toeic-study-tracker-updated", handleTrackerUpdate);
    window.addEventListener("toeic-practice-progress-updated", handleTrackerUpdate);
    window.addEventListener("storage", handleTrackerUpdate);
    window.addEventListener("focus", handleTrackerUpdate);
    return () => {
      window.removeEventListener("toeic-study-tracker-updated", handleTrackerUpdate);
      window.removeEventListener("toeic-practice-progress-updated", handleTrackerUpdate);
      window.removeEventListener("storage", handleTrackerUpdate);
      window.removeEventListener("focus", handleTrackerUpdate);
    };
  }, []);

  // Load real backend data across all modules concurrently
  useEffect(() => {
    document.title = "Bảng Điều Khiển Học Tập - TOEIC AI";
    let active = true;

    Promise.allSettled([
      getCurrentUser(),
      getLearningOnboardingStatus(),
      getStudentVocabularyDashboard(),
      getVocabularySetSummaries(),
      getGrammarTopics(),
      fetchListeningCards(),
      fetchListeningUnits(),
      fetchReadingCards(),
      fetchMockTests(),
    ]).then((results) => {
      if (!active) return;

      const [
        userRes,
        onboardingRes,
        vocabDashRes,
        vocabSetsRes,
        grammarRes,
        listeningCardsRes,
        listeningUnitsRes,
        readingRes,
        mockTestsRes,
      ] = results;

      if (userRes.status === "fulfilled" && userRes.value) {
        setUser(userRes.value);
      }

      // Sync onboarding targets smoothly if user hasn't manually set local values yet
      if (onboardingRes.status === "fulfilled" && onboardingRes.value?.state) {
        const ob = onboardingRes.value.state;
        if (ob.targetScore && ob.targetScore > 0) {
          setTargetGoal((prev) => {
            if (prev) {
              if (!prev.examDate && ob.examDate) {
                return { ...prev, examDate: ob.examDate };
              }
              return prev;
            }
            const hydrated: TargetGoalData = {
              targetBand: ob.targetScore ?? 650,
              focusNote:
                ob.interests && ob.interests.length > 0
                  ? `Trọng tâm: ${ob.interests.join(", ")}`
                  : "Theo lộ trình cá nhân",
              examDate: ob.examDate ?? undefined,
            };
            try {
              localStorage.setItem("toeic_dashboard_target_goal", JSON.stringify(hydrated));
            } catch {}
            return hydrated;
          });
        }
        if (ob.recentScore && ob.recentScore > 0) {
          setLatestScore((prev) => {
            if (prev) return prev;
            const half = Math.round(ob.recentScore! / 10) * 5;
            const hydrated: LatestScoreData = {
              lc: half,
              rc: Math.max(0, ob.recentScore! - half),
              total: ob.recentScore!,
              testName: "Điểm đầu vào (Hồ sơ học tập)",
            };
            try {
              localStorage.setItem("toeic_dashboard_latest_score", JSON.stringify(hydrated));
            } catch {}
            return hydrated;
          });
        }
      }

      const vocabDash = vocabDashRes.status === "fulfilled" ? vocabDashRes.value : null;
      if (vocabDash) {
        setVocabDashboard(vocabDash);
      }

      const vocabSets = vocabSetsRes.status === "fulfilled" ? vocabSetsRes.value : [];
      const grammarTopics = grammarRes.status === "fulfilled" ? grammarRes.value : [];
      const listeningCards = listeningCardsRes.status === "fulfilled" ? listeningCardsRes.value : [];
      const listeningUnits = listeningUnitsRes.status === "fulfilled" ? listeningUnitsRes.value : [];
      const readingCards = readingRes.status === "fulfilled" ? readingRes.value : [];
      const mockTests = mockTestsRes.status === "fulfilled" ? mockTestsRes.value : [];

      const publishedReading = readingCards.filter((c) => c.status !== "draft");
      const readingQuestionsTotal = publishedReading.reduce((sum, c) => sum + (c.totalQuestions || 0), 0);
      const readingStudiedTotal = publishedReading.reduce((sum, c) => sum + (c.studiedQuestions || 0), 0);

      const grammarCompleted = grammarTopics.filter(
        (t) =>
          t.userStatus === "Đã hoàn thành" ||
          ((t.totalQuestions ?? 0) > 0 && (t.completedQuestions ?? 0) >= (t.totalQuestions ?? 0))
      ).length;

      setModuleStats({
        loading: false,
        vocabSets: vocabDash?.totalSets ?? vocabSets.length,
        vocabTotalWords:
          vocabDash?.totalWords ?? vocabSets.reduce((sum, s) => sum + (s.wordCount || 0), 0),
        vocabLearnedWords: vocabDash?.learnedWords ?? 0,
        vocabDueReview: vocabDash?.dueForReview ?? 0,
        grammarTotal: grammarTopics.length,
        grammarCompleted,
        listeningCards: listeningCards.length,
        listeningUnits: listeningUnits.length,
        readingCards: publishedReading.length,
        readingQuestions: readingQuestionsTotal,
        readingStudiedQuestions: readingStudiedTotal,
        mockTests: mockTests.length,
      });

      // Build title lookup map so "Continue Learning" shows real lesson names
      const lookup: Record<string, { title: string; skillLabel: string; href: string }> = {};
      publishedReading.forEach((c) => {
        lookup[`reading-${c.id}`] = { title: c.title, skillLabel: "Reading", href: "/reading" };
      });
      listeningCards.forEach((c) => {
        lookup[`listening-${c.id}`] = { title: c.title || "Bài luyện Listening", skillLabel: "Listening", href: "/listening" };
      });
      grammarTopics.forEach((t) => {
        lookup[`grammar-${t.id}`] = { title: t.title || t.titleVi || "Chủ điểm Ngữ pháp", skillLabel: "Ngữ pháp", href: "/grammar" };
      });
      mockTests.forEach((m) => {
        lookup[`mock-test-${m.id}`] = { title: m.title, skillLabel: "Thi thử", href: "/mock-tests" };
      });
      setTitleLookup(lookup);

      // Update total available lessons in tracker if real backend catalog is available
      const totalCatalogItems =
        vocabSets.length +
        grammarTopics.length +
        listeningCards.length +
        publishedReading.length +
        mockTests.length;
      if (totalCatalogItems > 0) {
        const current = getStudyTrackerData();
        if (current.totalAvailableLessons !== totalCatalogItems) {
          const synced = { ...current, totalAvailableLessons: totalCatalogItems };
          saveStudyTrackerData(synced);
          setTrackerData(synced);
        }
      }
    });

    return () => {
      active = false;
    };
  }, []);

  // Modal open handlers
  const handleOpenScoreModal = () => {
    setEditLc(latestScore ? String(latestScore.lc) : "");
    setEditRc(latestScore ? String(latestScore.rc) : "");
    setIsScoreModalOpen(true);
  };

  const handleOpenTargetModal = () => {
    setEditTargetBand(targetGoal ? String(targetGoal.targetBand) : "650");
    setEditFocusNote(targetGoal?.focusNote ?? "");
    setEditExamDate(targetGoal?.examDate ?? "");
    setIsTargetModalOpen(true);
  };

  const isValidToeicMultiple = (raw: string, max: number): boolean => {
    if (raw.trim() === "") return false;
    const num = parseInt(raw, 10);
    return Number.isFinite(num) && num >= 0 && num <= max && num % 5 === 0;
  };

  const stepToeicScore = (raw: string, delta: number, max: number): string => {
    const current = parseInt(raw || "0", 10) || 0;
    const base = delta > 0 ? Math.floor(current / 5) * 5 : Math.ceil(current / 5) * 5;
    const next = Math.max(0, Math.min(max, base + delta));
    return String(next);
  };

  // Save Score
  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidToeicMultiple(editLc, 495) || !isValidToeicMultiple(editRc, 495)) {
      return;
    }
    const clampedLc = Math.max(0, Math.min(495, parseInt(editLc, 10)));
    const clampedRc = Math.max(0, Math.min(495, parseInt(editRc, 10)));
    const updated: LatestScoreData = {
      lc: clampedLc,
      rc: clampedRc,
      total: clampedLc + clampedRc,
    };
    setLatestScore(updated);
    try {
      localStorage.setItem("toeic_dashboard_latest_score", JSON.stringify(updated));
      window.dispatchEvent(new Event("toeic-dashboard-score-updated"));
    } catch {}
    setIsScoreModalOpen(false);
    showToast("Đã lưu điểm thi gần nhất thành công.");
  };

  // Save Target
  const handleSaveTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidToeicMultiple(editTargetBand, 990)) {
      return;
    }
    const clampedTarget = Math.max(0, Math.min(990, parseInt(editTargetBand, 10)));
    const updated: TargetGoalData = {
      targetBand: clampedTarget,
      focusNote: editFocusNote.trim(),
      examDate: editExamDate.trim() || undefined,
    };
    setTargetGoal(updated);
    try {
      localStorage.setItem("toeic_dashboard_target_goal", JSON.stringify(updated));
    } catch {}
    setIsTargetModalOpen(false);
    showToast("Đã cập nhật mục tiêu điểm và ngày thi.");
  };

  // Save Daily Target Minutes
  const handleSaveDailyMinutes = (minutes: number) => {
    const updated: StudyTrackerData = {
      ...trackerData,
      dailyTargetMinutes: minutes,
    };
    setTrackerData(updated);
    setEditDailyMinutes(minutes);
    saveStudyTrackerData(updated);
    showToast(`Đã đặt mục tiêu học mỗi ngày: ${minutes} phút.`);
  };

  // Derived metrics (100% tính từ dữ liệu thật, không dùng số cũ/ảo bị kẹt)
  const scoreGap = latestScore && targetGoal ? targetGoal.targetBand - latestScore.total : null;
  const daysToExam = getDaysUntilDate(targetGoal?.examDate);
  const todayRecord = trackerData.history[todayStr] || {
    minutesSpent: 0,
    completedLessons: 0,
    secondsSpent: 0,
  };
  const todayMinutes = todayRecord.minutesSpent;
  const todaySeconds = todayRecord.secondsSpent ?? todayMinutes * 60;
  const displayTodayTime =
    todayMinutes > 0 ? `${todayMinutes} phút` : todaySeconds >= 10 ? "< 1 phút" : "0 phút";
  const dailyGoalPercent =
    trackerData.dailyTargetMinutes > 0
      ? Math.min(100, Math.round((todaySeconds / (trackerData.dailyTargetMinutes * 60)) * 100))
      : 0;
  const realStreaks = useMemo(() => computeRealStreaks(trackerData), [trackerData]);
  const effectiveStreak = Math.max(realStreaks.currentStreak, vocabDashboard?.streakDays ?? 0);
  const effectiveBestStreak = Math.max(realStreaks.bestStreak, effectiveStreak);
  const realCompletedLessonsCount = useMemo(() => {
    const completedInProgressMap = Object.values(progressMap).filter(
      (p) => p && (p.status === "completed" || p.percent >= 100)
    ).length;
    return completedInProgressMap + moduleStats.grammarCompleted;
  }, [progressMap, moduleStats.grammarCompleted]);
  const progressPercent =
    trackerData.totalAvailableLessons > 0
      ? Math.min(
          100,
          Math.round((realCompletedLessonsCount / trackerData.totalAvailableLessons) * 100)
        )
      : null;

  const weekDays = getCurrentWeekDaysStatus(trackerData);
  const weeklyChartData = useMemo(() => {
    const targetMins = Math.max(1, trackerData.dailyTargetMinutes || 15);
    const minutesList = weekDays.map((day) => {
      const minutes = trackerData.history[day.dateStr]?.minutesSpent || 0;
      const lessons = trackerData.history[day.dateStr]?.completedLessons || 0;
      return {
        ...day,
        minutes,
        lessons,
        metTimeTarget: minutes >= targetMins,
      };
    });
    const maxMins = Math.max(targetMins, ...minutesList.map((d) => d.minutes), 15);
    const totalWeekMinutes = minutesList.reduce((sum, d) => sum + d.minutes, 0);
    const completedDaysCount = minutesList.filter((d) => d.metTimeTarget).length;
    const activeDaysCount = minutesList.filter((d) => d.minutes > 0).length;
    const avgActiveDayMinutes =
      activeDaysCount > 0 ? Math.round(totalWeekMinutes / activeDaysCount) : 0;
    return {
      items: minutesList,
      maxMins,
      targetMins,
      totalWeekMinutes,
      completedDaysCount,
      activeDaysCount,
      avgActiveDayMinutes,
    };
  }, [weekDays, trackerData.history, trackerData.dailyTargetMinutes]);

  // Build "Continue Learning" list from real local progress + backend titles
  const allResumeItems: ResumeItem[] = useMemo(() => {
    return Object.entries(progressMap)
      .filter(([, prog]) => prog && (prog.status === "in_progress" || (prog.wrongAnswers || 0) > 0))
      .map(([key, prog]) => {
        const meta = titleLookup[key];
        const percent = prog.percent || 0;
        const completedQuestions = prog.completedQuestions || 0;
        const totalQuestions = prog.totalQuestions || 0;
        const wrongAnswers = prog.wrongAnswers || 0;
        const correctAnswers = Math.max(0, completedQuestions - wrongAnswers);
        const isInProgress = prog.status === "in_progress" || percent < 100;
        const needsWrongReview = wrongAnswers > 0;
        const shouldRedoWrong = !isInProgress && needsWrongReview;

        let fallbackSkill = "Luyện tập";
        let fallbackHref = "/reading";
        if (key.startsWith("reading-")) {
          const cardId = key.slice("reading-".length);
          fallbackSkill = "Reading";
          fallbackHref = `/reading?openCard=${encodeURIComponent(cardId)}${shouldRedoWrong ? "&redoWrong=1" : ""}`;
        } else if (key.startsWith("listening-")) {
          fallbackSkill = "Listening";
          fallbackHref = "/listening";
        } else if (key.startsWith("grammar-")) {
          fallbackSkill = "Ngữ pháp";
          fallbackHref = "/grammar";
        } else if (key.startsWith("mock-test-")) {
          fallbackSkill = "Thi thử";
          fallbackHref = "/mock-tests";
        }
        const readableFallbackTitle = key
          .replace(/^(reading|listening|grammar|mock-test)-/, "")
          .replace(/[-_]+/g, " ")
          .toUpperCase();

        return {
          key,
          title: meta?.title || readableFallbackTitle,
          skillLabel: meta?.skillLabel || fallbackSkill,
          href: key.startsWith("reading-") ? fallbackHref : (meta?.href || fallbackHref),
          percent,
          completedQuestions,
          totalQuestions,
          correctAnswers,
          wrongAnswers,
          isInProgress,
          needsWrongReview,
          updatedAt: prog.updatedAt,
        };
      })
      .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  }, [progressMap, titleLookup]);

  const resumeCounts = useMemo(
    () => ({
      all: allResumeItems.length,
      inProgress: allResumeItems.filter((item) => item.isInProgress).length,
      wrong: allResumeItems.filter((item) => item.needsWrongReview).length,
      totalWrongQuestions: allResumeItems.reduce((sum, item) => sum + item.wrongAnswers, 0),
    }),
    [allResumeItems]
  );

  const visibleResumeItems = useMemo(() => {
    const list =
      resumeFilter === "in_progress"
        ? allResumeItems.filter((item) => item.isInProgress)
        : resumeFilter === "wrong"
        ? allResumeItems.filter((item) => item.needsWrongReview)
        : allResumeItems;
    return list.slice(0, 4);
  }, [allResumeItems, resumeFilter]);

  // 6 Balanced Learning Modules (3x2 grid) with LIVE database stats
  const modules = [
    {
      title: "Từ vựng TOEIC",
      description: "Học từ theo chủ đề, ôn tập ngắt quãng (SRS) và theo dõi mức độ ghi nhớ.",
      icon: BookOpen,
      href: "/vocabulary",
      statText: moduleStats.loading
        ? "Đang tải dữ liệu..."
        : `${moduleStats.vocabSets} bộ từ · ${moduleStats.vocabLearnedWords}/${moduleStats.vocabTotalWords} từ đã học`,
      tag:
        moduleStats.vocabDueReview > 0
          ? `${moduleStats.vocabDueReview} từ cần ôn`
          : moduleStats.vocabSets > 0
          ? "Sẵn sàng"
          : "Chưa có bộ từ",
      tagTone:
        moduleStats.vocabDueReview > 0
          ? "bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-700/60"
          : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700",
      iconClass: "bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800/60",
    },
    {
      title: "Ngữ pháp trọng tâm",
      description: "Hệ thống cấu trúc câu, mẹo tránh bẫy và bài tập thực hành theo từng Part.",
      icon: Brain,
      href: "/grammar",
      statText: moduleStats.loading
        ? "Đang tải dữ liệu..."
        : `${moduleStats.grammarTotal} chuyên đề · Đã xong ${moduleStats.grammarCompleted}`,
      tag: moduleStats.grammarTotal > 0 ? `${moduleStats.grammarTotal} chủ điểm` : "Đang cập nhật",
      tagTone: "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700",
      iconClass: "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800/60",
    },
    {
      title: "Luyện Nghe (Listening)",
      description: "Luyện nghe Part 1–4 kèm chép chính tả, lời thoại song ngữ và kiểm tra tốc độ.",
      icon: Headphones,
      href: "/listening",
      statText: moduleStats.loading
        ? "Đang tải dữ liệu..."
        : `${moduleStats.listeningCards} bài nghe · ${moduleStats.listeningUnits} chuyên mục`,
      tag: moduleStats.listeningCards > 0 ? "Part 1 – 4" : "Chưa có bài",
      tagTone: "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700",
      iconClass: "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800/60",
    },
    {
      title: "Luyện Đọc (Reading)",
      description: "Giải chi tiết Part 5, 6, 7 với giải thích từng phương án và bảng từ vựng trọng tâm.",
      icon: ListChecks,
      href: "/reading",
      statText: moduleStats.loading
        ? "Đang tải dữ liệu..."
        : moduleStats.readingCards > 0
        ? `${moduleStats.readingCards} bộ đề · ${moduleStats.readingQuestions.toLocaleString("vi-VN")} câu hỏi`
        : "Chưa có bộ đề trong DB",
      tag:
        moduleStats.readingStudiedQuestions > 0
          ? `Đã làm ${moduleStats.readingStudiedQuestions} câu`
          : "Part 5 – 7",
      tagTone:
        moduleStats.readingStudiedQuestions > 0
          ? "bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60"
          : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700",
      iconClass: "bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border-sky-100 dark:border-sky-800/60",
    },
    {
      title: "Thi thử Full Test",
      description: "Làm đề thi thử 200 câu chuẩn thời gian 120 phút, chấm điểm LC & RC tự động.",
      icon: ClipboardCheck,
      href: "/mock-tests",
      statText: moduleStats.loading
        ? "Đang tải dữ liệu..."
        : `${moduleStats.mockTests} đề thi thử hiện có`,
      tag: moduleStats.mockTests > 0 ? "Chuẩn 120 phút" : "Chưa có đề",
      tagTone: "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700",
      iconClass: "bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-100 dark:border-rose-800/60",
    },
    {
      title: "Trò chơi Từ vựng",
      description: "Ôn từ tốc độ cao qua Flashcard, Runner, Battleship, Gõ từ và Word Rain.",
      icon: Gamepad2,
      href: "/vocabulary/games",
      statText: "5 chế độ tương tác · Ghi nhận điểm & tiến độ thật",
      tag: "Luyện phản xạ",
      tagTone: "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700",
      iconClass: "bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-800/60",
    },
  ];

  const firstName = user?.fullName?.trim() || "";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-14">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-lg">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Pinned Announcement Banner */}
      {pinnedAnnouncement && !announcementDismissed && (
        <div className="relative overflow-hidden rounded-2xl border border-blue-200 dark:border-blue-500/30 bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-white dark:from-slate-900 dark:via-slate-800/95 dark:to-slate-900 p-4 shadow-xs dark:shadow-md transition-all animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                <Megaphone className="size-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-blue-600/10 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-700/60 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                    Tin nổi bật
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {normalizeLineBreaks(pinnedAnnouncement.title)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 line-clamp-1 leading-relaxed">
                  {normalizeLineBreaks(pinnedAnnouncement.summary || pinnedAnnouncement.content)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              {pinnedAnnouncement.actionUrl && pinnedAnnouncement.actionUrl.trim() !== '' && pinnedAnnouncement.actionUrl.trim() !== '/' && (
                <Link
                  href={resolveStudentActionUrl(pinnedAnnouncement.actionUrl)}
                  onClick={() => {
                    if (!pinnedAnnouncement.isRead) {
                      void markAnnouncementRead(pinnedAnnouncement.id);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs transition"
                >
                  <span>{getActionUrlLabel(pinnedAnnouncement.actionUrl)}</span>
                  <ExternalLink className="size-3" />
                </Link>
              )}
              <Link
                href="/notifications"
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                <span>Xem tất cả</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setAnnouncementDismissed(true);
                  if (typeof window !== "undefined") {
                    sessionStorage.setItem(`dismissed_announcement_${pinnedAnnouncement.id}`, "true");
                  }
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                title="Tạm ẩn thông báo này"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 1. HEADER CÁ NHÂN HÓA & ĐẾM NGƯỢC NGÀY THI                            */}
      {/* ===================================================================== */}
      <header className="flex flex-col gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{getVietnameseDateLabel()}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white md:text-[26px]">
            {getVietnameseGreeting()}
            {firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Theo dõi tiến độ học tập hôm nay, ôn lại phần còn yếu và duy trì nhịp học đều đặn.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {daysToExam !== null ? (
            <button
              type="button"
              onClick={handleOpenTargetModal}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer shadow-xs"
              title="Bấm để chỉnh ngày thi dự kiến"
            >
              <Calendar className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400" />
              <span>
                {daysToExam > 0
                  ? `Còn ${daysToExam} ngày tới kỳ thi`
                  : daysToExam === 0
                  ? "Hôm nay là ngày thi"
                  : "Đã qua ngày thi dự kiến"}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenTargetModal}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 transition hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white cursor-pointer shadow-xs"
            >
              <Calendar className="h-3.5 w-3.5 text-slate-400 dark:text-slate-400" />
              <span>Đặt ngày thi dự kiến</span>
            </button>
          )}

          <Link
            href={moduleStats.vocabDueReview > 0 ? "/vocabulary" : "/reading"}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1b41ae] dark:bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#15348f] dark:hover:bg-blue-500 shadow-xs"
          >
            <span>
              {moduleStats.vocabDueReview > 0
                ? `Ôn ${moduleStats.vocabDueReview} từ đến hạn`
                : "Vào luyện tập ngay"}
            </span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* Onboarding Goal Banner if not yet completed */}
      <LearningOnboardingPrompt />

      {/* ===================================================================== */}
      {/* 2. 4 CHỈ SỐ CỐT LÕI (KPI CARDS)                                       */}
      {/* ===================================================================== */}
      <section aria-label="Chỉ số học tập cá nhân">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Thời gian học hôm nay & Tiến độ */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 transition hover:border-slate-300 dark:hover:border-slate-700 shadow-xs dark:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Học hôm nay</span>
              <button
                type="button"
                onClick={() => setIsProgressModalOpen(true)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <Clock className="h-3 w-3" />
                <span>Chi tiết</span>
              </button>
            </div>

            <div
              className="mt-3 cursor-pointer"
              onClick={() => setIsProgressModalOpen(true)}
              title="Xem chi tiết thời gian và mục tiêu mỗi ngày"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                  {displayTodayTime}
                </span>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500 tabular-nums">
                  / {trackerData.dailyTargetMinutes} phút
                </span>
              </div>

              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    dailyGoalPercent >= 100 ? "bg-emerald-600 dark:bg-emerald-500" : "bg-[#1b41ae] dark:bg-blue-600"
                  }`}
                  style={{ width: `${dailyGoalPercent}%` }}
                />
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>
                  {dailyGoalPercent >= 100 ? "Đã đạt chỉ tiêu hôm nay" : `Đạt ${dailyGoalPercent}% mục tiêu ngày`}
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                  {realCompletedLessonsCount} bài hoàn thành
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Chuỗi ngày học (Streak) */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 transition hover:border-slate-300 dark:hover:border-slate-700 shadow-xs dark:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Chuỗi ngày học</span>
              <button
                type="button"
                onClick={() => setIsStreakModalOpen(true)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <Flame className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                <span>Lịch sử</span>
              </button>
            </div>

            <div
              className="mt-3 cursor-pointer"
              onClick={() => setIsStreakModalOpen(true)}
              title="Xem chi tiết chuỗi ngày học"
            >
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                  {effectiveStreak} ngày
                </span>
                <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                  {effectiveStreak > 0 ? "liên tục" : "chưa bắt đầu"}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-7 gap-1">
                {weekDays.map((day) => (
                  <span
                    key={day.dayName}
                    className={`rounded-md py-1 text-center text-[10px] font-semibold transition ${
                      day.isCompleted
                        ? "bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-300/70 dark:border-amber-700/60"
                        : day.isToday
                        ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-dashed border-amber-500"
                        : "bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-800"
                    }`}
                    title={`${day.dayName} (${day.dateStr}): ${
                      trackerData.history[day.dateStr]?.minutesSpent || 0
                    } phút`}
                  >
                    {day.dayName}
                  </span>
                ))}
              </div>

              <p className="mt-2.5 text-[11px] text-slate-500 dark:text-slate-400">
                Kỷ lục cao nhất:{" "}
                <strong className="font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                  {effectiveBestStreak} ngày
                </strong>
              </p>
            </div>
          </div>

          {/* Card 3: Điểm thi gần nhất (LC / RC) */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 transition hover:border-slate-300 dark:hover:border-slate-700 shadow-xs dark:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Điểm thi gần nhất</span>
              <button
                type="button"
                onClick={handleOpenScoreModal}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <Pencil className="h-3 w-3" />
                <span>Cập nhật</span>
              </button>
            </div>

            <div
              className="mt-3 cursor-pointer"
              onClick={handleOpenScoreModal}
              title="Bấm để nhập hoặc chỉnh điểm thi gần nhất"
            >
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                  {latestScore ? latestScore.total : "Chưa có"}
                </span>
                {latestScore && <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums">/ 990</span>}
              </div>

              {latestScore ? (
                <>
                  <div className="mt-3 flex h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="bg-[#1b41ae] dark:bg-blue-600"
                      style={{ width: `${Math.round((latestScore.lc / 990) * 100)}%` }}
                    />
                    <div
                      className="bg-emerald-600 dark:bg-emerald-500"
                      style={{ width: `${Math.round((latestScore.rc / 990) * 100)}%` }}
                    />
                  </div>
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 tabular-nums">
                    <span>
                      LC: <strong className="text-[#1b41ae] dark:text-blue-400">{latestScore.lc}</strong>
                    </span>
                    <span>
                      RC: <strong className="text-emerald-700 dark:text-emerald-400">{latestScore.rc}</strong>
                    </span>
                  </div>
                </>
              ) : (
                <p className="mt-3 text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                  Nhập điểm thi thử để hệ thống tính khoảng cách tới mục tiêu.
                </p>
              )}
            </div>
          </div>

          {/* Card 4: Mục tiêu Band điểm */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 transition hover:border-slate-300 dark:hover:border-slate-700 shadow-xs dark:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Mục tiêu điểm</span>
              <button
                type="button"
                onClick={handleOpenTargetModal}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <Pencil className="h-3 w-3" />
                <span>Chỉnh sửa</span>
              </button>
            </div>

            <div
              className="mt-3 cursor-pointer"
              onClick={handleOpenTargetModal}
              title="Bấm để chỉnh mục tiêu điểm và ngày thi"
            >
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-[#1b41ae] dark:text-blue-400 tabular-nums">
                  {targetGoal ? `${targetGoal.targetBand}+` : "Chưa đặt"}
                </span>
                {targetGoal && <span className="text-xs text-slate-400 dark:text-slate-500">TOEIC</span>}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2.5 text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">Khoảng cách:</span>
                <span
                  className={`font-semibold tabular-nums ${
                    scoreGap !== null && scoreGap <= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-slate-800 dark:text-slate-200"
                  }`}
                >
                  {scoreGap === null
                    ? "Chưa đủ dữ liệu"
                    : scoreGap <= 0
                    ? "Đã đạt mục tiêu"
                    : `Cần +${scoreGap} điểm`}
                </span>
              </div>

              <p className="mt-1 truncate text-[11px] text-slate-400 dark:text-slate-400" title={targetGoal?.focusNote}>
                {targetGoal?.focusNote || "Nhấn Chỉnh sửa để đặt mục tiêu & lịch thi"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 3. BỐ CỤC 2 CỘT CÂN ĐỐI: THỜI GIAN TUẦN (5/12) | TIẾP TỤC HỌC (7/12)  */}
      {/* ===================================================================== */}
      <section className="grid items-stretch gap-5 lg:grid-cols-12">
        {/* CỘT TRÁI (5/12): Biểu đồ thời gian học 7 ngày + Tổng hợp tuần */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 lg:col-span-5 shadow-xs dark:shadow-md">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Thời gian học trong tuần</h2>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                  Tự động ghi nhận khi làm Nghe, Đọc, Từ vựng, Ngữ pháp &amp; Thi thử.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsProgressModalOpen(true)}
                className="shrink-0 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 transition hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Mục tiêu {weeklyChartData.targetMins}p
              </button>
            </div>

            <div className="mt-6">
              {/* Top minutes labels */}
              <div className="mb-1.5 grid grid-cols-7 gap-2">
                {weeklyChartData.items.map((day) => (
                  <span
                    key={`lbl-${day.dateStr}`}
                    className={`text-center text-[10px] font-medium tabular-nums ${
                      day.metTimeTarget
                        ? "font-semibold text-[#1b41ae] dark:text-blue-400"
                        : day.minutes > 0
                        ? "text-slate-500 dark:text-slate-400"
                        : "text-transparent"
                    }`}
                  >
                    {day.minutes > 0 ? `${day.minutes}p` : "0p"}
                  </span>
                ))}
              </div>

              {/* Exact scaled plot area with mathematically aligned target line */}
              <div className="relative h-36 border-b border-slate-100 dark:border-slate-800">
                <div
                  className="pointer-events-none absolute inset-x-0 z-10 border-t border-dashed border-slate-300 dark:border-slate-700"
                  style={{
                    bottom: `${Math.min(
                      96,
                      Math.max(4, Math.round((weeklyChartData.targetMins / weeklyChartData.maxMins) * 100))
                    )}%`,
                  }}
                >
                  <span className="absolute -top-4 right-0 bg-white/95 dark:bg-slate-900 px-1 text-[10px] font-medium text-slate-400 dark:text-slate-400">
                    Mục tiêu {weeklyChartData.targetMins}p
                  </span>
                </div>

                <div className="grid h-full grid-cols-7 items-end gap-2">
                  {weeklyChartData.items.map((day) => {
                    const barHeightPct =
                      day.minutes > 0
                        ? Math.max(6, Math.round((day.minutes / weeklyChartData.maxMins) * 100))
                        : 3;
                    return (
                      <div key={day.dateStr} className="flex h-full w-full items-end justify-center">
                        <div
                          className={`w-full max-w-[30px] rounded-t-md transition-all duration-300 ${
                            day.metTimeTarget
                              ? "bg-[#1b41ae] dark:bg-blue-600"
                              : day.isToday && day.minutes > 0
                              ? "bg-blue-300 dark:bg-blue-400/80"
                              : day.minutes > 0
                              ? "bg-slate-300 dark:bg-slate-700"
                              : "bg-slate-100 dark:bg-slate-800/60"
                          }`}
                          style={{ height: `${barHeightPct}%` }}
                          title={`${day.dayName} (${day.dateStr}): ${day.minutes} phút${
                            day.lessons > 0 ? ` · ${day.lessons} bài hoàn thành` : ""
                          }${day.metTimeTarget ? " (Đạt mục tiêu ngày)" : ""}`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom weekday labels */}
              <div className="mt-2 grid grid-cols-7 gap-2">
                {weeklyChartData.items.map((day) => (
                  <span
                    key={`day-${day.dateStr}`}
                    className={`text-center text-[11px] font-semibold ${
                      day.isToday ? "text-[#1b41ae] dark:text-blue-400" : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {day.dayName}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Real weekly summary strip */}
          <div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
            <div>
              <span className="block text-[10px] font-medium text-slate-400 dark:text-slate-400">Tổng tuần này</span>
              <span className="mt-0.5 block text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                {formatMinutesCompact(weeklyChartData.totalWeekMinutes)}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-medium text-slate-400 dark:text-slate-400">TB ngày có học</span>
              <span className="mt-0.5 block text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                {weeklyChartData.avgActiveDayMinutes > 0
                  ? `${weeklyChartData.avgActiveDayMinutes} phút`
                  : "0 phút"}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-medium text-slate-400 dark:text-slate-400">Đạt chỉ tiêu</span>
              <span
                className={`mt-0.5 block text-sm font-bold tabular-nums ${
                  weeklyChartData.completedDaysCount > 0 ? "text-emerald-700 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300"
                }`}
              >
                {weeklyChartData.completedDaysCount}/7 ngày
              </span>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI (7/12): Tiếp tục học & Ôn tập ưu tiên với bộ lọc thật */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 lg:col-span-7 shadow-xs dark:shadow-md">
          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Tiếp tục học &amp; Ôn tập ưu tiên</h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Mở nhanh bài đang làm dở, câu sai cần sửa và từ vựng đến hạn ôn.
                </p>
              </div>

              {/* Segmented Filter Tabs */}
              <div className="inline-flex self-start rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-[11px] font-semibold border border-transparent dark:border-slate-700">
                {(
                  [
                    { id: "all", label: "Tất cả", count: resumeCounts.all },
                    { id: "in_progress", label: "Đang làm", count: resumeCounts.inProgress },
                    { id: "wrong", label: "Câu sai", count: resumeCounts.wrong },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setResumeFilter(tab.id)}
                    className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 transition cursor-pointer ${
                      resumeFilter === tab.id
                        ? "bg-white dark:!bg-blue-600 text-slate-900 dark:!text-white shadow-2xs font-bold"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span
                        className={`rounded px-1 text-[10px] tabular-nums ${
                          resumeFilter === tab.id
                            ? "bg-slate-100 dark:bg-blue-700 text-slate-700 dark:text-white"
                            : "text-slate-400 dark:text-slate-400"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              {/* Priority SRS Vocabulary Review banner if due > 0 */}
              {resumeFilter === "all" && moduleStats.vocabDueReview > 0 && (
                <Link
                  href="/vocabulary"
                  className="flex items-center justify-between gap-3 rounded-xl border border-amber-200/80 dark:border-amber-700/60 bg-amber-50/60 dark:bg-amber-950/40 px-4 py-3 transition hover:bg-amber-50 dark:hover:bg-amber-950/60"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                      <AlertCircle className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                        Có {moduleStats.vocabDueReview} từ vựng đến hạn ôn hôm nay
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">
                        Ôn ngay để giữ tỷ lệ ghi nhớ ({vocabDashboard?.memoryRate ?? 0}%).
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" />
                </Link>
              )}

              {/* In-progress or wrong-answer items */}
              {visibleResumeItems.length > 0 ? (
                visibleResumeItems.map((item) => {
                  const isRedoMode = !item.isInProgress && item.needsWrongReview;
                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 px-4 py-3 transition hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800/80"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="shrink-0 rounded bg-slate-200/70 dark:bg-slate-700 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-200">
                              {item.skillLabel}
                            </span>
                            <p className="truncate text-xs font-semibold text-slate-900 dark:text-white group-hover:text-[#1b41ae] dark:group-hover:text-blue-400">
                              {item.title}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                              isRedoMode
                                ? "bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-100 dark:border-rose-900"
                                : "bg-blue-50 dark:bg-blue-950/70 text-[#1b41ae] dark:text-blue-300 border border-blue-100 dark:border-blue-900"
                            }`}
                          >
                            {isRedoMode ? "Ôn câu sai" : "Làm tiếp"}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center gap-3">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-700">
                            <div
                              className={`h-full rounded-full ${
                                isRedoMode ? "bg-rose-500" : "bg-[#1b41ae] dark:bg-blue-500"
                              }`}
                              style={{ width: `${item.percent}%` }}
                            />
                          </div>
                          <span className="shrink-0 text-[11px] font-medium text-slate-500 dark:text-slate-400 tabular-nums">
                            {item.completedQuestions}/{item.totalQuestions} câu ({item.percent}%)
                          </span>
                          {item.wrongAnswers > 0 && (
                            <span className="shrink-0 text-[11px] font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                              · {item.wrongAnswers} sai
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-slate-700 dark:group-hover:text-slate-200" />
                    </Link>
                  );
                })
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-5">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {resumeFilter === "in_progress"
                      ? "Không có bài nào đang làm dở."
                      : resumeFilter === "wrong"
                      ? "Tuyệt vời! Chưa có bài nào tồn đọng câu sai."
                      : "Chưa có bài luyện tập nào đang làm dở."}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    Bắt đầu một bài đọc hoặc bộ từ vựng — hệ thống sẽ tự động lưu tiến độ và câu cần ôn tại đây.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href="/reading"
                      className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 transition hover:border-slate-300 dark:hover:border-slate-600 hover:text-[#1b41ae] dark:hover:text-blue-400"
                    >
                      Mở bài đọc Reading
                    </Link>
                    <Link
                      href="/vocabulary"
                      className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 transition hover:border-slate-300 dark:hover:border-slate-600 hover:text-[#1b41ae] dark:hover:text-blue-400"
                    >
                      Mở kho từ vựng
                    </Link>
                    <Link
                      href="/grammar"
                      className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 transition hover:border-slate-300 dark:hover:border-slate-600 hover:text-[#1b41ae] dark:hover:text-blue-400"
                    >
                      Ôn ngữ pháp
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Clean footer summary */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 pt-3.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="tabular-nums">
              {resumeCounts.all > 0 ? (
                <>
                  Đang theo dõi <strong className="font-semibold text-slate-700 dark:text-slate-200">{resumeCounts.all} bài</strong>
                  {resumeCounts.totalWrongQuestions > 0 && (
                    <>
                      {" "}·{" "}
                      <strong className="font-semibold text-rose-600 dark:text-rose-400">
                        {resumeCounts.totalWrongQuestions} câu sai
                      </strong>{" "}
                      cần ôn lại
                    </>
                  )}
                </>
              ) : (
                "Chọn một học phần bên dưới để bắt đầu luyện tập"
              )}
            </span>
            <Link
              href="/reading"
              className="inline-flex items-center gap-1 font-semibold text-[#1b41ae] dark:text-blue-400 hover:underline"
            >
              <span>Xem toàn bộ kho đề</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 4. KHU VỰC HỌC TẬP & LUYỆN THI (LƯỚI 3×2 CÂN ĐỐI · SỐ LIỆU THẬT)     */}
      {/* ===================================================================== */}
      <section aria-labelledby="modules-title" className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="modules-title" className="text-base font-bold text-slate-900 dark:text-white">
              Khu Vực Học Tập &amp; Luyện Thi
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Số liệu đồng bộ trực tiếp từ cơ sở dữ liệu bài học hiện có trên hệ thống.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map(({ title, description, icon: Icon, href, statText, tag, tagTone, iconClass }) => (
            <Link
              key={title}
              href={href}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 transition hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm shadow-xs dark:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${iconClass}`}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#1b41ae] dark:group-hover:text-blue-400 transition-colors">
                        {title}
                      </h3>
                      <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500 dark:text-slate-400 tabular-nums">
                        {statText}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${tagTone}`}
                  >
                    {tag}
                  </span>
                </div>

                <p className="mt-3.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{description}</p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-[#1b41ae] dark:group-hover:text-blue-400">
                <span>Mở học phần</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 5. ĐỀ XUẤT LỘ TRÌNH BKT & ANALYTICS LISTENING CÁ NHÂN HÓA             */}
      {/* ===================================================================== */}
      <section className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/70 via-sky-50/50 to-indigo-50/40 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-800">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Đề xuất Lộ trình BKT &amp; Analytics Cá nhân hóa
            </span>
            <h4 className="text-sm font-bold text-slate-900">
              {listeningAnalytics && listeningAnalytics.recommendations.length > 0
                ? listeningAnalytics.recommendations[0].title
                : "Chọn học phần phù hợp với mục tiêu của bạn"}
            </h4>
            <p className="text-xs text-slate-600">
              {listeningAnalytics && listeningAnalytics.recommendations.length > 0
                ? listeningAnalytics.recommendations[0].reason
                : "Danh sách bài học và đề luyện tập được tải từ dữ liệu của hệ thống."}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/listening"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
            >
              Luyện nghe ngay
            </Link>
            <Link
              href="/vocabulary"
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition"
            >
              Học từ vựng
            </Link>
          </div>
        </div>

        {listeningAnalytics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-blue-200/60">
            <div className="rounded-xl bg-white/90 border border-blue-100 p-3">
              <div className="text-[11px] font-semibold text-slate-500">Điểm Listening quy đổi</div>
              <div className="text-base font-black text-blue-700 font-mono mt-0.5">
                {listeningAnalytics.estimatedListeningScore}/495
              </div>
            </div>
            <div className="rounded-xl bg-white/90 border border-blue-100 p-3">
              <div className="text-[11px] font-semibold text-slate-500">Độ chính xác Listening</div>
              <div className="text-base font-black text-emerald-700 font-mono mt-0.5">
                {listeningAnalytics.overallAccuracyPercent}% ({listeningAnalytics.totalCorrect}/{listeningAnalytics.totalQuestionsAnswered})
              </div>
            </div>
            <div className="rounded-xl bg-white/90 border border-blue-100 p-3">
              <div className="text-[11px] font-semibold text-slate-500">Số lượt Chế độ Thi thật</div>
              <div className="text-base font-black text-rose-600 font-mono mt-0.5">
                {listeningAnalytics.realExamAttempts} lượt
              </div>
            </div>
            <div className="rounded-xl bg-white/90 border border-blue-100 p-3">
              <div className="text-[11px] font-semibold text-slate-500">Tổng XP Listening</div>
              <div className="text-base font-black text-amber-600 font-mono mt-0.5">
                +{listeningAnalytics.totalXpEarned} XP
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ===================================================================== */}
      {/* 6. LỐI TẮT HỖ TRỢ: CỘNG ĐỒNG & LỊCH SỬ HỌC TẬP                        */}
      {/* ===================================================================== */}
      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/community?feed=all"
          className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 px-5 py-4 transition hover:border-slate-300 dark:hover:border-slate-700 shadow-xs dark:shadow-md"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
              <MessageSquare className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#1b41ae] dark:group-hover:text-blue-400">
                Cộng đồng hỏi đáp TOEIC
              </h3>
              <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                Trao đổi câu hỏi khó, chia sẻ kinh nghiệm luyện thi cùng các học viên khác.
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200" />
        </Link>

        <Link
          href="/vocabulary/history"
          className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 px-5 py-4 transition hover:border-slate-300 dark:hover:border-slate-700 shadow-xs dark:shadow-md"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
              <History className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#1b41ae] dark:group-hover:text-blue-400">
                Lịch sử luyện từ &amp; Thống kê trí nhớ
              </h3>
              <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                Xem lại các phiên học từ vựng, độ chính xác và tiến trình ghi nhớ SRS.
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200" />
        </Link>
      </section>

      {/* ===================================================================== */}
      {/* MODAL 1: CHI TIẾT TIẾN ĐỘ & THỜI GIAN HỌC                             */}
      {/* ===================================================================== */}
      {isProgressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <span className="rounded-xl bg-blue-50 dark:bg-blue-950/80 p-2 text-[#1b41ae] dark:text-blue-400">
                  <Clock className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Chi tiết Thời gian &amp; Tiến độ</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Ghi nhận từ quá trình làm bài và phiên học tập trung
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProgressModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 p-3 text-center">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Hôm nay
                  </span>
                  <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                    {displayTodayTime}
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    Mục tiêu: {trackerData.dailyTargetMinutes}p
                  </span>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 p-3 text-center">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Tổng tích lũy
                  </span>
                  {(() => {
                    const realTotalMins = Object.values(trackerData.history || {}).reduce(
                      (sum, rec) => sum + (rec.minutesSpent || 0),
                      0
                    );
                    return (
                      <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                        {Math.floor(realTotalMins / 60)}h {realTotalMins % 60}p
                      </div>
                    );
                  })()}
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Toàn khóa</span>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 p-3 text-center">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Bài đã xong
                  </span>
                  <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                    {progressPercent === null
                      ? realCompletedLessonsCount
                      : `${realCompletedLessonsCount}/${trackerData.totalAvailableLessons}`}
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    {progressPercent === null ? "Tích lũy" : `Đạt ${progressPercent}%`}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4">
                <div className="mb-2.5 flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <Target className="h-3.5 w-3.5 text-[#1b41ae] dark:text-blue-400" />
                    Mục tiêu thời gian mỗi ngày
                  </label>
                  <span className="text-xs font-bold text-[#1b41ae] dark:text-blue-400 tabular-nums">
                    {editDailyMinutes} phút / ngày
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => handleSaveDailyMinutes(mins)}
                      className={`rounded-lg px-2 py-2 text-xs font-semibold transition cursor-pointer ${
                        editDailyMinutes === mins
                          ? "bg-[#1b41ae] dark:bg-blue-600 text-white"
                          : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {mins} phút
                    </button>
                  ))}
                </div>
                <p className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <Info className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  Đạt đủ số phút này mỗi ngày sẽ tự động duy trì chuỗi ngày học của bạn.
                </p>
              </div>

              <div className="flex justify-end border-t border-slate-100 dark:border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setIsProgressModalOpen(false)}
                  className="rounded-xl bg-slate-900 dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: HỒ SƠ CHUỖI NGÀY HỌC (STREAK)                                */}
      {/* ===================================================================== */}
      {isStreakModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <span className="rounded-xl bg-amber-50 dark:bg-amber-950/80 p-2 text-amber-700 dark:text-amber-400">
                  <Flame className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Hồ sơ Chuỗi Ngày Học</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Theo dõi mức độ đều đặn học tập từng ngày trong tuần
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsStreakModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="flex items-center justify-between rounded-xl border border-amber-200 dark:border-amber-700/60 bg-amber-50/60 dark:bg-amber-950/40 p-4">
                <div>
                  <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">Chuỗi hiện tại</span>
                  <div className="mt-0.5 text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
                    {effectiveStreak} ngày
                  </div>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                    Kỷ lục cao nhất:{" "}
                    <strong className="text-slate-900 dark:text-white tabular-nums">
                      {effectiveBestStreak} ngày liên tục
                    </strong>
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                  <Flame className="h-6 w-6" />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Lịch học tuần này</h4>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">Thứ 2 – Chủ Nhật</span>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day) => (
                    <div
                      key={day.dayName}
                      className={`rounded-xl border p-2.5 text-center ${
                        day.isCompleted
                          ? "border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200"
                          : day.isToday
                          ? "border-dashed border-amber-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                          : "border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500"
                      }`}
                    >
                      <span className="block text-[11px] font-bold">{day.dayName}</span>
                      <div className="my-1 flex justify-center">
                        {day.isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        ) : day.isToday ? (
                          <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                        ) : (
                          <span className="text-xs">—</span>
                        )}
                      </div>
                      <span className="block text-[10px] font-medium tabular-nums">
                        {trackerData.history[day.dateStr]?.minutesSpent || 0}p
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-3.5 text-xs text-slate-600 dark:text-slate-300">
                <p className="font-semibold text-slate-800 dark:text-slate-200">Cách tính chuỗi ngày học:</p>
                <ul className="mt-1.5 list-disc list-inside space-y-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  <li>
                    Học tối thiểu <strong>{trackerData.dailyTargetMinutes} phút/ngày</strong> để được
                    tính hoàn thành ngày đó.
                  </li>
                  <li>Duy trì các ngày liên tiếp để tích lũy kỷ lục chuỗi.</li>
                </ul>
              </div>

              <div className="flex justify-end border-t border-slate-100 dark:border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setIsStreakModalOpen(false)}
                  className="rounded-xl bg-slate-900 dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: CHỈNH SỬA ĐIỂM THI GẦN NHẤT                                  */}
      {/* ===================================================================== */}
      {isScoreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <span className="rounded-xl bg-emerald-50 dark:bg-emerald-950/80 p-2 text-emerald-700 dark:text-emerald-400">
                  <Award className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cập nhật điểm thi gần nhất</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Lưu kết quả Listening &amp; Reading để so với mục tiêu
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsScoreModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {(() => {
              const lcHasValue = editLc.trim() !== "";
              const rcHasValue = editRc.trim() !== "";
              const lcInvalid = lcHasValue && !isValidToeicMultiple(editLc, 495);
              const rcInvalid = rcHasValue && !isValidToeicMultiple(editRc, 495);
              const canSubmitScore =
                isValidToeicMultiple(editLc, 495) && isValidToeicMultiple(editRc, 495);
              const previewLc = Math.max(0, Math.min(495, parseInt(editLc || "0", 10) || 0));
              const previewRc = Math.max(0, Math.min(495, parseInt(editRc || "0", 10) || 0));

              return (
                <form onSubmit={handleSaveScore} className="space-y-4 p-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Điểm Listening (LC)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={editLc}
                          onChange={(e) => setEditLc(sanitizeScoreInput(e.target.value, 495))}
                          onKeyDown={(e) => {
                            if (e.key === "ArrowUp") {
                              e.preventDefault();
                              setEditLc((prev) => stepToeicScore(prev, 5, 495));
                            } else if (e.key === "ArrowDown") {
                              e.preventDefault();
                              setEditLc((prev) => stepToeicScore(prev, -5, 495));
                            }
                          }}
                          placeholder="Ví dụ: 250"
                          className={`w-full rounded-xl border bg-white dark:bg-slate-800 pl-3.5 pr-12 py-2 text-sm font-bold tabular-nums focus:outline-none ${
                            lcInvalid
                              ? "border-rose-400 text-rose-600 focus:border-rose-500"
                              : "border-slate-200 dark:border-slate-700 text-[#1b41ae] dark:text-blue-400 focus:border-[#1b41ae]"
                          }`}
                          required
                        />
                        <span className="pointer-events-none absolute right-3 top-2.5 text-[11px] font-medium text-slate-400">
                          / 495
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Điểm Reading (RC)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={editRc}
                          onChange={(e) => setEditRc(sanitizeScoreInput(e.target.value, 495))}
                          onKeyDown={(e) => {
                            if (e.key === "ArrowUp") {
                              e.preventDefault();
                              setEditRc((prev) => stepToeicScore(prev, 5, 495));
                            } else if (e.key === "ArrowDown") {
                              e.preventDefault();
                              setEditRc((prev) => stepToeicScore(prev, -5, 495));
                            }
                          }}
                          placeholder="Ví dụ: 255"
                          className={`w-full rounded-xl border bg-white dark:bg-slate-800 pl-3.5 pr-12 py-2 text-sm font-bold tabular-nums focus:outline-none ${
                            rcInvalid
                              ? "border-rose-400 text-rose-600 focus:border-rose-500"
                              : "border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 focus:border-emerald-600"
                          }`}
                          required
                        />
                        <span className="pointer-events-none absolute right-3 top-2.5 text-[11px] font-medium text-slate-400">
                          / 495
                        </span>
                      </div>
                    </div>
                  </div>

                  {lcInvalid || rcInvalid ? (
                    <p
                      role="alert"
                      className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 px-3 py-2 text-[11px] font-medium text-rose-700 dark:text-rose-300"
                    >
                      Điểm TOEIC phải kết thúc bằng <strong>0</strong> hoặc <strong>5</strong> (bội số của 5, ví dụ: 120, 125).
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400 dark:text-slate-400">
                      Điểm chuẩn TOEIC là bội số của 5 (kết thúc bằng 0 hoặc 5, dùng phím ↑/↓ để tăng giảm 5 điểm).
                    </p>
                  )}

                  <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
                    <div>
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Tổng điểm</span>
                      <div className="mt-0.5 flex items-baseline gap-1.5">
                        <span className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                          {previewLc + previewRc}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">/ 990</span>
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                      <div>
                        LC: <strong className="text-[#1b41ae] dark:text-blue-400">{previewLc}</strong>
                      </div>
                      <div>
                        RC: <strong className="text-emerald-700 dark:text-emerald-400">{previewRc}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsScoreModalOpen(false)}
                      className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={!canSubmitScore}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#1b41ae] dark:bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#15348f] dark:hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-45 cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Lưu điểm</span>
                    </button>
                  </div>
                </form>
              );
            })()}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 4: CHỈNH SỬA MỤC TIÊU BAND ĐIỂM & NGÀY THI                     */}
      {/* ===================================================================== */}
      {isTargetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <span className="rounded-xl bg-blue-50 dark:bg-blue-950/80 p-2 text-[#1b41ae] dark:text-blue-400">
                  <TrendingUp className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Mục tiêu điểm &amp; Lịch thi</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Đặt mốc điểm mong muốn và ngày dự kiến thi TOEIC
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTargetModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTarget} className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Mốc điểm phổ biến
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[500, 600, 650, 750, 800, 850, 900, 950].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setEditTargetBand(String(score))}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold tabular-nums transition cursor-pointer ${
                        Number(editTargetBand) === score
                          ? "bg-[#1b41ae] dark:bg-blue-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {score}+
                    </button>
                  ))}
                </div>
              </div>

              {(() => {
                const targetInvalid =
                  editTargetBand.trim() !== "" && !isValidToeicMultiple(editTargetBand, 990);
                const parsedTarget = Math.max(
                  0,
                  Math.min(990, parseInt(editTargetBand || "0", 10) || 0)
                );
                return (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Điểm mục tiêu (0–990)
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={editTargetBand}
                          onChange={(e) => setEditTargetBand(sanitizeScoreInput(e.target.value, 990))}
                          onKeyDown={(e) => {
                            if (e.key === "ArrowUp") {
                              e.preventDefault();
                              setEditTargetBand((prev) => stepToeicScore(prev, 5, 990));
                            } else if (e.key === "ArrowDown") {
                              e.preventDefault();
                              setEditTargetBand((prev) => stepToeicScore(prev, -5, 990));
                            }
                          }}
                          placeholder="650"
                          className={`w-full rounded-xl border bg-white dark:bg-slate-800 px-3.5 py-2 text-sm font-bold tabular-nums focus:outline-none ${
                            targetInvalid
                              ? "border-rose-400 text-rose-600 focus:border-rose-500"
                              : "border-slate-200 dark:border-slate-700 text-[#1b41ae] dark:text-blue-400 focus:border-[#1b41ae]"
                          }`}
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Ngày thi dự kiến
                        </label>
                        <input
                          type="date"
                          value={editExamDate}
                          onChange={(e) => setEditExamDate(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-100 focus:border-[#1b41ae] focus:outline-none"
                        />
                      </div>
                    </div>

                    {targetInvalid && (
                      <p
                        role="alert"
                        className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 px-3 py-2 text-[11px] font-medium text-rose-700 dark:text-rose-300"
                      >
                        Mục tiêu điểm TOEIC phải kết thúc bằng <strong>0</strong> hoặc{" "}
                        <strong>5</strong> (ví dụ: 550, 655).
                      </p>
                    )}

                    <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">Khoảng cách hiện tại:</span>
                        <div className="mt-0.5 font-bold text-slate-900 dark:text-white tabular-nums">
                          {latestScore
                            ? parsedTarget - latestScore.total <= 0
                              ? "Đã đạt mục tiêu"
                              : `Cần tăng +${parsedTarget - latestScore.total} điểm`
                            : "Chưa nhập điểm gần nhất"}
                        </div>
                      </div>
                      <div className="text-right text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                        Hiện tại:{" "}
                        <strong className="text-slate-900 dark:text-white">{latestScore?.total ?? "—"}</strong>
                      </div>
                    </div>
                  </>
                );
              })()}

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Ghi chú trọng tâm ôn tập
                </label>
                <input
                  type="text"
                  value={editFocusNote}
                  onChange={(e) => setEditFocusNote(e.target.value)}
                  placeholder="Ví dụ: Cải thiện Part 3, 4 và tốc độ đọc Part 7"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-[#1b41ae] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setIsTargetModalOpen(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!isValidToeicMultiple(editTargetBand, 990)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#1b41ae] dark:bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#15348f] dark:hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-45 cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Lưu mục tiêu</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
