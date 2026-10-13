"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LearningOnboardingPrompt } from "@/components/learning/LearningOnboardingPrompt";
import {
  BookOpen,
  Brain,
  ClipboardCheck,
  Headphones,
  ListChecks,
  Sparkles,
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
  Zap,
  Info,
} from "lucide-react";
import {
  getStudyTrackerData,
  saveStudyTrackerData,
  getCurrentWeekDaysStatus,
  getTodayDateString,
  StudyTrackerData,
} from "@/lib/studyTracker";

interface LatestScoreData {
  lc: number;
  rc: number;
  total: number;
  testName: string;
}

interface TargetGoalData {
  targetBand: number;
  focusNote: string;
}

const DEFAULT_LATEST_SCORE: LatestScoreData = {
  lc: 360,
  rc: 325,
  total: 685,
  testName: "ETS Crack Vol 1 • Test 1",
};

const DEFAULT_TARGET_GOAL: TargetGoalData = {
  targetBand: 800,
  focusNote: "Tập trung cải thiện Part 3, 4 & Part 7",
};

export default function Home() {
  // Study Tracker & Streak Data
  const [trackerData, setTrackerData] = useState<StudyTrackerData>(getStudyTrackerData);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const [editDailyMinutes, setEditDailyMinutes] = useState(() => getStudyTrackerData().dailyTargetMinutes);

  // Latest Score & Target Goal State
  const [latestScore, setLatestScore] = useState<LatestScoreData>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedScore = localStorage.getItem("toeic_dashboard_latest_score");
        if (savedScore) return JSON.parse(savedScore);
      } catch {
        // fallback
      }
    }
    return DEFAULT_LATEST_SCORE;
  });

  const [targetGoal, setTargetGoal] = useState<TargetGoalData>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedTarget = localStorage.getItem("toeic_dashboard_target_goal");
        if (savedTarget) return JSON.parse(savedTarget);
      } catch {
        // fallback
      }
    }
    return DEFAULT_TARGET_GOAL;
  });

  // Modal open states for Score & Target
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);

  // Form states for Score editing
  const [editLc, setEditLc] = useState<number>(DEFAULT_LATEST_SCORE.lc);
  const [editRc, setEditRc] = useState<number>(DEFAULT_LATEST_SCORE.rc);
  const [editTestName, setEditTestName] = useState<string>(DEFAULT_LATEST_SCORE.testName);

  // Form states for Target editing
  const [editTargetBand, setEditTargetBand] = useState<number>(DEFAULT_TARGET_GOAL.targetBand);
  const [editFocusNote, setEditFocusNote] = useState<string>(DEFAULT_TARGET_GOAL.focusNote);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };


  // Handlers to open modals with current values
  const handleOpenScoreModal = () => {
    setEditLc(latestScore.lc);
    setEditRc(latestScore.rc);
    setEditTestName(latestScore.testName);
    setIsScoreModalOpen(true);
  };

  const handleOpenTargetModal = () => {
    setEditTargetBand(targetGoal.targetBand);
    setEditFocusNote(targetGoal.focusNote);
    setIsTargetModalOpen(true);
  };

  // Save Score
  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    const clampedLc = Math.max(0, Math.min(495, Number(editLc) || 0));
    const clampedRc = Math.max(0, Math.min(495, Number(editRc) || 0));
    const updated: LatestScoreData = {
      lc: clampedLc,
      rc: clampedRc,
      total: clampedLc + clampedRc,
      testName: editTestName.trim() || "ETS Crack Vol 1 • Test 1",
    };
    setLatestScore(updated);
    try {
      localStorage.setItem("toeic_dashboard_latest_score", JSON.stringify(updated));
    } catch {
      // LocalStorage error handled
    }
    setIsScoreModalOpen(false);
    showToast("Đã lưu điểm thi gần nhất thành công! 🎉");
  };

  // Save Target
  const handleSaveTarget = (e: React.FormEvent) => {
    e.preventDefault();
    const clampedTarget = Math.max(0, Math.min(990, Number(editTargetBand) || 0));
    const updated: TargetGoalData = {
      targetBand: clampedTarget,
      focusNote: editFocusNote.trim() || "Tập trung cải thiện Part 3, 4 & Part 7",
    };
    setTargetGoal(updated);
    try {
      localStorage.setItem("toeic_dashboard_target_goal", JSON.stringify(updated));
    } catch {
      // LocalStorage error handled
    }
    setIsTargetModalOpen(false);
    showToast("Đã cập nhật mục tiêu Band điểm thành công! 🎯");
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
    showToast(`Đã đổi mục tiêu học mỗi ngày thành ${minutes} phút! ⏱️`);
  };

  // Calculations for dynamic cards
  const scoreGap = targetGoal.targetBand - latestScore.total;
  const todayStr = getTodayDateString();
  const todayRecord = trackerData.history[todayStr] || { minutesSpent: 0, completedLessons: 0 };
  const todayMinutes = todayRecord.minutesSpent;
  const progressPercent = Math.min(
    100,
    Math.round((trackerData.totalCompletedLessons / trackerData.totalAvailableLessons) * 100)
  );
  const weekDays = getCurrentWeekDaysStatus(trackerData);

  const modules = [
    {
      title: "Từ vựng",
      detail: "Học từ vựng ETS 2024 theo Test, lật Flashcard ghi nhớ và Mini-game phản xạ.",
      icon: BookOpen,
      href: "/vocabulary",
      stats: "30 bộ từ • ~548 từ vựng",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      accentColor: "from-blue-500 to-indigo-600",
      iconBg: "bg-blue-50 text-blue-600",
    },
    {
      title: "Ngữ pháp",
      detail: "Nắm vững công thức, bẫy đề thi Part 5 & 6 kèm bài tập trắc nghiệm giải thích chi tiết.",
      icon: Brain,
      href: "/grammar",
      stats: "12 chuyên đề • 36 câu hỏi",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      accentColor: "from-emerald-500 to-teal-600",
      iconBg: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Listening",
      detail: "Luyện nghe tranh Part 1, phản xạ Part 2, hội thoại Part 3-4 & Chép chính tả Studio.",
      icon: Headphones,
      href: "/listening",
      stats: "Full Part 1-4 • Chép chính tả",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      accentColor: "from-purple-500 to-pink-600",
      iconBg: "bg-purple-50 text-purple-600",
    },
    {
      title: "Reading",
      detail: "Luyện bài đọc ETS 2024 Part 5, 6, 7 tích hợp bôi đen tra từ điển trực tiếp trên bài.",
      icon: ListChecks,
      href: "/reading",
      stats: "ETS 2024 • 1.340+ câu đọc",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      accentColor: "from-amber-500 to-orange-600",
      iconBg: "bg-amber-50 text-amber-600",
    },
    {
      title: "Thi thử",
      detail: "Thi thử 200 câu với đồng hồ đếm ngược 120 phút hoặc luyện tập từng phần linh hoạt.",
      icon: ClipboardCheck,
      href: "/mock-tests",
      stats: "20 đề thi • Crack Vol 1 & 2",
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
      accentColor: "from-rose-500 to-red-600",
      iconBg: "bg-rose-600/10 text-rose-600",
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-7 pb-12 animate-in fade-in duration-150">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header tinh giản, thanh lịch như phong cách Admin */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
        <div>
          <p className="text-xs font-medium text-slate-400">
            Trang chủ <span className="px-1.5">/</span> Cá nhân <span className="px-1.5">/</span>{" "}
            <span className="font-semibold text-blue-700">Tổng quan học tập</span>
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 md:text-[28px]">
            Bảng Điều Khiển Học Viên
          </h1>
          <p className="mt-1.5 text-xs text-slate-500 md:text-sm">
            Theo dõi thời gian học thực tế, duy trì chuỗi ngày liên tục và hoàn thành mục tiêu điểm thi TOEIC.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3.5 py-2 text-xs font-bold text-emerald-800 shadow-2xs">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Hệ thống TOEIC AI sẵn sàng
          </span>
        </div>
      </header>

      {/* Onboarding Goal Banner if not yet completed */}
      <LearningOnboardingPrompt />

      {/* 1. KHUNG CHỈ SỐ CÁ NHÂN (METRICS CARDS) */}
      <section aria-labelledby="metrics-title">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Tiến độ bài học & Thời gian học (DỰA VÀO THỜI GIAN & BÀI LÀM) */}
          <div className="group relative rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between hover:border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Tiến độ bài học</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsProgressModalOpen(true)}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200"
                  title="Xem chi tiết thời gian & tiến độ học"
                >
                  <Clock className="w-3 h-3" />
                  <span>Chi tiết</span>
                </button>
                <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Target className="w-4 h-4" />
                </span>
              </div>
            </div>
            <div className="mt-4 cursor-pointer" onClick={() => setIsProgressModalOpen(true)} title="Bấm để xem chi tiết thời gian học">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 font-mono group-hover:text-blue-600 transition-colors">
                  {progressPercent}%
                </span>
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-600" />
                  {todayMinutes}p / {trackerData.dailyTargetMinutes}p hôm nay
                </span>
              </div>
              <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                Đã hoàn thành {trackerData.totalCompletedLessons} / {trackerData.totalAvailableLessons} bài rèn luyện
              </p>
            </div>
          </div>

          {/* Card 2: Chuỗi ngày học (DỰA VÀO HỌC LIÊN TỤC TRONG MẤY NGÀY) */}
          <div className="group relative rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between hover:border-amber-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Chuỗi ngày học</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsStreakModalOpen(true)}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors border border-transparent hover:border-amber-200"
                  title="Xem lịch sử chuỗi ngày học"
                >
                  <Zap className="w-3 h-3" />
                  <span>Chi tiết</span>
                </button>
                <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                </span>
              </div>
            </div>
            <div className="mt-4 cursor-pointer" onClick={() => setIsStreakModalOpen(true)} title="Bấm để xem lịch chuỗi ngày học">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 font-mono group-hover:text-amber-600 transition-colors">
                  {trackerData.currentStreak} Ngày
                </span>
                <span className="text-xs text-amber-600 font-bold">Liên tục 🔥</span>
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                {weekDays.map((day) => (
                  <span
                    key={day.dayName}
                    className={`flex-1 text-center py-0.5 rounded text-[10px] font-bold transition-all ${
                      day.isCompleted
                        ? "bg-amber-100 text-amber-800 border border-amber-300/80 shadow-2xs"
                        : day.isToday
                        ? "bg-slate-50 text-slate-700 border-2 border-dashed border-amber-400"
                        : "bg-slate-100 text-slate-400"
                    }`}
                    title={`${day.dayName}: ${day.isCompleted ? "Đã đạt mục tiêu học" : day.isToday ? "Hôm nay" : "Chưa học"}`}
                  >
                    {day.dayName}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                Duy trì học mỗi ngày tối thiểu {trackerData.dailyTargetMinutes} phút
              </p>
            </div>
          </div>

          {/* Card 3: Điểm TOEIC ước tính gần nhất (CÓ THỂ CHỈNH SỬA) */}
          <div className="group relative rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between hover:border-emerald-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Điểm thi gần nhất</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleOpenScoreModal}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors border border-transparent hover:border-emerald-200"
                  title="Chỉnh sửa điểm thi gần nhất"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Sửa</span>
                </button>
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <Award className="w-4 h-4" />
                </span>
              </div>
            </div>
            <div className="mt-4 cursor-pointer" onClick={handleOpenScoreModal} title="Bấm để chỉnh sửa">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 font-mono group-hover:text-emerald-600 transition-colors">
                  {latestScore.total}
                </span>
                <span className="text-xs text-slate-400 font-mono">/ 990</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100 font-mono">
                <span>LC: <strong className="text-blue-600">{latestScore.lc}</strong></span>
                <span>RC: <strong className="text-emerald-600">{latestScore.rc}</strong></span>
              </div>
              <p className="mt-2 text-[11px] text-slate-400 truncate" title={latestScore.testName}>
                {latestScore.testName}
              </p>
            </div>
          </div>

          {/* Card 4: Mục tiêu Band điểm (CÓ THỂ CHỈNH SỬA) */}
          <div className="group relative rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between hover:border-purple-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Mục tiêu Band điểm</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleOpenTargetModal}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition-colors border border-transparent hover:border-purple-200"
                  title="Chỉnh sửa mục tiêu Band điểm"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Sửa</span>
                </button>
                <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
            </div>
            <div className="mt-4 cursor-pointer" onClick={handleOpenTargetModal} title="Bấm để chỉnh sửa">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-purple-700 font-mono group-hover:text-purple-800 transition-colors">
                  {targetGoal.targetBand}+
                </span>
                <span className="text-xs text-purple-600 font-bold">Mục tiêu</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                <span>Khoảng cách:</span>
                <span className={`font-bold font-mono ${scoreGap <= 0 ? "text-emerald-600" : "text-slate-800"}`}>
                  {scoreGap <= 0 ? "Đã đạt mục tiêu! 🎯" : `+${scoreGap} điểm nữa`}
                </span>
              </div>
              <p className="mt-2 text-[11px] text-slate-400 truncate" title={targetGoal.focusNote}>
                {targetGoal.focusNote}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. KHU VỰC HỌC TẬP (LỘ TRÌNH 5 PHÂN HỆ TOEIC) */}
      <section aria-labelledby="modules-title" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="modules-title" className="text-lg font-bold text-slate-900">
              Khu Vực Học Tập &amp; Luyện Thi
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Toàn bộ 5 phân hệ luyện tập cốt lõi đã được kích hoạt. Hãy chọn một phần để bắt đầu học ngay.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map(({ title, detail, icon: Icon, href, stats, iconBg }) => (
            <Link
              key={title}
              href={href}
              className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg} transition-transform group-hover:scale-105`}>
                      <Icon size={22} aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                        {title}
                      </h3>
                      <span className="text-[11px] text-slate-400">{stats}</span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Sẵn sàng
                  </span>
                </div>

                <p className="mt-3.5 text-xs text-slate-600 leading-relaxed">
                  {detail}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
                <span>Vào học ngay</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. LỜI KHUYÊN & MẸO HỌC TẬP HÔM NAY */}
      <section className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/70 via-sky-50/50 to-indigo-50/40 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-800">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Gợi ý học tập hôm nay
            </span>
            <h4 className="text-sm font-bold text-slate-900">
              Luyện nghe 1 bài Chép chính tả Part 2 và tra 10 từ vựng ETS 2024 Test 1
            </h4>
            <p className="text-xs text-slate-600">
              Phương pháp nghe chép chính tả kết hợp tra nghĩa tại chỗ giúp não bộ ghi nhớ phát âm và cấu trúc câu tự nhiên hơn gấp 3 lần.
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
      </section>

      {/* ========================================================================= */}
      {/* MODAL 1: CHI TIẾT TIẾN ĐỘ & THỜI GIAN HỌC */}
      {/* ========================================================================= */}
      {isProgressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <Clock className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Chi tiết Tiến độ &amp; Thời gian học</h3>
                  <p className="text-[11px] text-slate-500">Dựa trên thời gian bạn luyện tập thực tế trên hệ thống</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProgressModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Thống kê 3 chỉ số */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3 text-center">
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Hôm nay</span>
                  <div className="text-lg font-black text-slate-900 font-mono mt-1">{todayMinutes} phút</div>
                  <span className="text-[10px] text-slate-400">Mục tiêu: {trackerData.dailyTargetMinutes}p</span>
                </div>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 text-center">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Tổng thời gian</span>
                  <div className="text-lg font-black text-slate-900 font-mono mt-1">
                    {Math.floor(trackerData.totalMinutesOverall / 60)}h {trackerData.totalMinutesOverall % 60}p
                  </div>
                  <span className="text-[10px] text-slate-400">Tích lũy toàn khóa</span>
                </div>
                <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-3 text-center">
                  <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Bài hoàn thành</span>
                  <div className="text-lg font-black text-slate-900 font-mono mt-1">
                    {trackerData.totalCompletedLessons} / {trackerData.totalAvailableLessons}
                  </div>
                  <span className="text-[10px] text-slate-400">Đạt {progressPercent}%</span>
                </div>
              </div>

              {/* Tùy chỉnh mục tiêu học mỗi ngày */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-blue-600" />
                    Mục tiêu thời gian mỗi ngày:
                  </label>
                  <span className="text-xs font-bold font-mono text-blue-600">{editDailyMinutes} phút / ngày</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => handleSaveDailyMinutes(mins)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition text-center ${
                        editDailyMinutes === mins
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                      }`}
                    >
                      {mins} phút
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                  <Info className="w-3 h-3 text-blue-500" />
                  Mỗi ngày khi bạn luyện tập đạt đủ số phút này, hệ thống sẽ tự động thắp sáng chuỗi ngày học 🔥!
                </p>
              </div>

              {/* Tiến độ phân chia theo phân hệ */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-2.5">Phân bổ bài tập qua 5 phân hệ:</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-medium text-slate-700">📖 Từ vựng (Vocabulary):</span>
                    <span className="font-bold font-mono text-blue-600">12 / 30 bộ từ</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-medium text-slate-700">🧠 Ngữ pháp (Grammar):</span>
                    <span className="font-bold font-mono text-emerald-600">6 / 12 chuyên đề</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-medium text-slate-700">🎧 Listening &amp; Chép chính tả:</span>
                    <span className="font-bold font-mono text-purple-600">8 bài nghe</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-medium text-slate-700">📋 Reading (Part 5, 6, 7):</span>
                    <span className="font-bold font-mono text-amber-600">7 bài đọc</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-medium text-slate-700">📝 Thi thử (Full Mock Tests):</span>
                    <span className="font-bold font-mono text-rose-600">3 / 20 đề thi</span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProgressModalOpen(false)}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: HỒ SƠ CHUỖI NGÀY HỌC (STREAK TRACKER) */}
      {/* ========================================================================= */}
      {isStreakModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-amber-100 text-amber-700">
                  <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Hồ sơ Chuỗi Ngày Học (Streak)</h3>
                  <p className="text-[11px] text-slate-500">Dựa vào tính liên tục và chuyên cần mỗi ngày của bạn</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsStreakModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Banner Chuỗi Lửa */}
              <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100/40 p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-800">Chuỗi hiện tại của bạn:</span>
                  <div className="text-3xl font-black text-amber-900 font-mono mt-0.5 flex items-center gap-2">
                    <span>{trackerData.currentStreak} Ngày</span>
                    <span className="text-2xl">🔥</span>
                  </div>
                  <p className="text-[11px] text-amber-700 mt-1">
                    Kỷ lục chuỗi cao nhất: <strong>{trackerData.bestStreak} Ngày liên tục 🏆</strong>
                  </p>
                </div>
                <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-300 flex items-center justify-center text-3xl">
                  🔥
                </div>
              </div>

              {/* Lịch tuần chi tiết */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
                  <span>Lịch học tuần này:</span>
                  <span className="text-[11px] text-slate-400">T2 - Chủ Nhật</span>
                </h4>
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day) => (
                    <div
                      key={day.dayName}
                      className={`rounded-xl p-2.5 text-center border transition-all ${
                        day.isCompleted
                          ? "bg-amber-100 border-amber-300 text-amber-900 shadow-2xs"
                          : day.isToday
                          ? "bg-white border-2 border-dashed border-amber-400 text-slate-800"
                          : "bg-slate-50 border-slate-200 text-slate-400"
                      }`}
                    >
                      <span className="text-[11px] font-bold block">{day.dayName}</span>
                      <div className="text-base my-1">
                        {day.isCompleted ? "🔥" : day.isToday ? "⏱️" : "—"}
                      </div>
                      <span className="text-[9px] font-mono block">
                        {trackerData.history[day.dateStr]?.minutesSpent || 0}p
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quy tắc tính chuỗi */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2 text-xs text-slate-600">
                <span className="font-bold text-slate-800 block flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-500" />
                  Quy tắc tính Chuỗi ngày học (Streak):
                </span>
                <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed text-slate-600">
                  <li>
                    <strong>Mỗi ngày:</strong> Bạn học từ <strong>{trackerData.dailyTargetMinutes} phút</strong> trở lên hoặc hoàn thành ít nhất 1 bài tập bất kỳ.
                  </li>
                  <li>
                    <strong>Tính liên tục:</strong> Học đều đặn mỗi ngày liên tiếp sẽ giúp ngọn lửa streak tăng thêm 1 ngày.
                  </li>
                  <li>
                    <strong>Không gián đoạn:</strong> Nếu một ngày bạn không học, chuỗi ngày liên tục sẽ được làm mới lại.
                  </li>
                </ul>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsStreakModalOpen(false)}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CHỈNH SỬA ĐIỂM THI GẦN NHẤT */}
      {/* ========================================================================= */}
      {isScoreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <Award className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Chỉnh sửa điểm thi gần nhất</h3>
                  <p className="text-[11px] text-slate-500">Cập nhật kết quả thi thử TOEIC thực tế của bạn</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsScoreModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveScore} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Listening Score */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Điểm Listening (LC)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={495}
                      step={5}
                      value={editLc}
                      onChange={(e) => setEditLc(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-mono font-bold text-blue-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      required
                    />
                    <span className="absolute right-3 top-2 text-[11px] font-bold text-slate-400">/ 495</span>
                  </div>
                  <span className="mt-1 block text-[10px] text-slate-400">Tối đa 495 điểm</span>
                </div>

                {/* Reading Score */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Điểm Reading (RC)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={495}
                      step={5}
                      value={editRc}
                      onChange={(e) => setEditRc(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-mono font-bold text-emerald-600 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      required
                    />
                    <span className="absolute right-3 top-2 text-[11px] font-bold text-slate-400">/ 495</span>
                  </div>
                  <span className="mt-1 block text-[10px] text-slate-400">Tối đa 495 điểm</span>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-emerald-800">Tổng điểm dự tính:</span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-xl font-black text-emerald-700 font-mono">
                      {(Math.max(0, Math.min(495, Number(editLc) || 0)) + Math.max(0, Math.min(495, Number(editRc) || 0)))}
                    </span>
                    <span className="text-xs text-emerald-600 font-mono">/ 990</span>
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-500 font-mono">
                  <div>LC: <span className="font-bold text-blue-600">{editLc || 0}</span></div>
                  <div>RC: <span className="font-bold text-emerald-600">{editRc || 0}</span></div>
                </div>
              </div>

              {/* Test Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tên bài thi / Đề thi gần nhất
                </label>
                <input
                  type="text"
                  value={editTestName}
                  onChange={(e) => setEditTestName(e.target.value)}
                  placeholder="Ví dụ: ETS Crack Vol 1 • Test 1, ETS 2024 Test 2..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsScoreModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: CHỈNH SỬA MỤC TIÊU BAND ĐIỂM */}
      {/* ========================================================================= */}
      {isTargetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <TrendingUp className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Chỉnh sửa mục tiêu Band điểm</h3>
                  <p className="text-[11px] text-slate-500">Đặt mục tiêu và định hướng ôn luyện cá nhân</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTargetModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTarget} className="p-6 space-y-4">
              {/* Quick Select Buttons */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Chọn nhanh mục tiêu phổ biến
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[500, 600, 650, 750, 800, 850, 900, 950].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setEditTargetBand(score)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition font-mono ${
                        editTargetBand === score
                          ? "bg-purple-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-700"
                      }`}
                    >
                      {score}+
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Target Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Hoặc nhập điểm mục tiêu tùy chỉnh (0 - 990)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={990}
                    step={10}
                    value={editTargetBand}
                    onChange={(e) => setEditTargetBand(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-mono font-bold text-purple-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    required
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-purple-500">Mục tiêu</span>
                </div>
              </div>

              {/* Dynamic Gap Preview */}
              <div className="rounded-xl border border-purple-200/80 bg-purple-50/50 p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-purple-800">Khoảng cách cần phấn đấu:</span>
                  <div className="text-base font-bold text-purple-900 font-mono mt-0.5">
                    {editTargetBand - latestScore.total <= 0
                      ? "Đã đạt mục tiêu! 🎯"
                      : `+${editTargetBand - latestScore.total} điểm nữa`}
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  <span>Điểm hiện tại: </span>
                  <strong className="text-slate-800 font-mono">{latestScore.total}</strong>
                </div>
              </div>

              {/* Focus Note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Định hướng / Kế hoạch trọng tâm
                </label>
                <input
                  type="text"
                  value={editFocusNote}
                  onChange={(e) => setEditFocusNote(e.target.value)}
                  placeholder="Ví dụ: Tập trung cải thiện Part 3, 4 & Part 7..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTargetModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 shadow-xs transition"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
