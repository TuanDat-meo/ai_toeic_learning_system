"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Brain,
  Milestone,
  RotateCcw,
  AlertTriangle,
  BookMarked,
  Settings,
  Sparkles,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import { GrammarTopicItem } from "@/app/admin/content/grammar/types";
import { LearningQuotaBadge } from "@/components/billing/LearningQuotaBadge";
import {
  getGrammarTopics,
  saveGrammarProgress,
  getDueGrammarReviews,
  getGrammarAnalytics,
} from "@/lib/api/grammar";
import { StudentGrammarGrid } from "@/components/grammar/StudentGrammarGrid";
import { GrammarTodayStrip } from "@/components/grammar/GrammarTodayStrip";
import {
  GrammarTopicDetailModal,
  GrammarQuizModal,
} from "@/components/admin/content/grammar/GrammarModals";

export default function StudentGrammarPage() {
  const [topics, setTopics] = useState<GrammarTopicItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Modal State
  const [theoryTopic, setTheoryTopic] = useState<GrammarTopicItem | null>(null);
  const [quizActive, setQuizActive] = useState<boolean>(false);
  const [activeTopicForQuiz, setActiveTopicForQuiz] = useState<GrammarTopicItem | null>(null);
  const [quizStartIndex, setQuizStartIndex] = useState<number>(0);
  const [isQuizRedoWrong, setIsQuizRedoWrong] = useState<boolean>(false);

  // Live dynamic stats
  const [dueReviewsCount, setDueReviewsCount] = useState<number>(0);
  const [repeatedErrorCount, setRepeatedErrorCount] = useState<number>(0);

  const loadTopics = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const [data, dueList, analytics] = await Promise.all([
        getGrammarTopics(),
        getDueGrammarReviews().catch(() => []),
        getGrammarAnalytics().catch(() => null),
      ]);

      setTopics(data.filter((topic) => topic.status === "PUBLISHED"));
      if (Array.isArray(dueList)) setDueReviewsCount(dueList.length);
      if (analytics?.repeatedErrorCount) setRepeatedErrorCount(analytics.repeatedErrorCount);
    } catch (err) {
      setTopics([]);
      setLoadError(err instanceof Error ? err.message : "Không thể tải dữ liệu ngữ pháp từ máy chủ.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadTopics);
    const handleSync = () => {
      void Promise.resolve().then(loadTopics);
    };
    window.addEventListener("toeic-grammar-topics-updated", handleSync);
    return () => {
      window.removeEventListener("toeic-grammar-topics-updated", handleSync);
    };
  }, [loadTopics]);

  const startTopicQuiz = async (topic: GrammarTopicItem, startIndex = 0, isRedoWrong = false) => {
    setActiveTopicForQuiz(topic);
    setQuizStartIndex(startIndex);
    setIsQuizRedoWrong(isRedoWrong);
    setQuizActive(true);
  };

  const handleRecordResult = async (
    topicId: string,
    questionId: string,
    selectedOption: string,
    isCorrect: boolean,
  ) => {
    try {
      const eventId = crypto.randomUUID();
      await saveGrammarProgress(
        topicId,
        questionId,
        selectedOption,
        "PRACTICE",
        0,
        eventId,
      );
      void isCorrect;
    } catch (err) {
      console.warn("Không thể đồng bộ tiến độ ngữ pháp lên máy chủ:", err);
    }
  };

  // Aggregated system stats for hero banner
  const systemMetrics = useMemo(() => {
    const totalQuestions = topics.reduce(
      (sum, t) => sum + (t.questions?.length || t.totalQuestions || 0),
      0,
    );
    const totalTraps = topics.reduce((sum, t) => sum + (t.traps?.length || 0), 0);
    const completedQuestions = topics.reduce(
      (sum, t) => sum + (t.completedQuestions || 0),
      0,
    );
    return { totalQuestions, totalTraps, completedQuestions };
  }, [topics]);

  const subpageShortcuts = [
    { label: "Chuyên đề", href: "/grammar", icon: Brain, active: true },
    { label: "Lộ trình mục tiêu", href: "/grammar/path", icon: Milestone },
    {
      label: "Ôn tập SRS",
      href: "/grammar/review",
      icon: RotateCcw,
      badge: dueReviewsCount > 0 ? `${dueReviewsCount} câu` : undefined,
      badgeColor: "bg-amber-500 text-white",
    },
    {
      label: "Lỗi của tôi & Bẫy",
      href: "/grammar/mistakes",
      icon: AlertTriangle,
      badge: repeatedErrorCount > 0 ? `${repeatedErrorCount} câu` : undefined,
      badgeColor: "bg-rose-500 text-white",
    },
    { label: "Sổ tay ngữ pháp", href: "/grammar/notebook", icon: BookMarked },
    { label: "Cài đặt học tập", href: "/grammar/settings", icon: Settings },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
          Trang chủ
        </Link>
        <span className="text-slate-300">/</span>
        <span className="font-semibold text-blue-700">Ngữ pháp TOEIC trọng tâm</span>
      </nav>

      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-linear-to-r from-white via-blue-50/30 to-indigo-50/40 p-6 md:p-8 shadow-xs">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/80 px-3 py-1 text-xs font-bold text-blue-800">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              Ngữ pháp TOEIC Part 5 & Part 6
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl lg:text-4xl">
              Chuyên Đề Ngữ Pháp TOEIC Trọng Tâm
            </h1>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              Học lý thuyết và luyện tập theo các chủ điểm ngữ pháp TOEIC đang được xuất bản.
            </p>

            {/* Quick Metrics Pills */}
            {!loading && !loadError && (
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 font-bold shadow-2xs border border-slate-200">
                <Brain className="h-4 w-4 text-blue-600" />
                {topics.length} chuyên đề
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 font-bold shadow-2xs border border-slate-200">
                <HelpCircle className="h-4 w-4 text-indigo-600" />
                {systemMetrics.totalQuestions} câu trắc nghiệm
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 font-bold shadow-2xs border border-slate-200">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                {systemMetrics.totalTraps} bẫy đề thi
              </span>
            </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
            <LearningQuotaBadge featureKey="GRAMMAR" />
            <Link
              href="/grammar/path"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
            >
              <Milestone className="h-4 w-4" />
              Xem bản đồ lộ trình
            </Link>
          </div>
        </div>
      </div>

      {/* Daily Study Widget (Today Strip) */}
      <GrammarTodayStrip />

      {/* Subpage Shortcut Tab Bar */}
      <nav
        aria-label="Lối tắt phân hệ ngữ pháp"
        className="flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-xs scrollbar-none"
      >
        {subpageShortcuts.map((item) => {
          const IconComp = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                item.active
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <IconComp className={`h-4 w-4 ${item.active ? "text-white" : "text-slate-400"}`} />
              <span>{item.label}</span>
              {item.badge && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                    item.badgeColor || "bg-blue-100 text-blue-700"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Loading & Error States */}
      {loadError && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-center justify-between"
        >
          <span>Không thể tải danh sách chuyên đề: {loadError}</span>
          <button
            type="button"
            onClick={() => void loadTopics()}
            className="font-bold underline cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5" />
          ))}
        </div>
      )}

      {!loading && !loadError && topics.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <BookOpen className="h-10 w-10 text-slate-300 mb-3" />
          <h3 className="text-sm font-bold text-slate-800">Chưa có chuyên đề ngữ pháp được phát hành</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Nội dung đang được ban chuyên môn biên soạn và cập nhật. Vui lòng quay lại sau!
          </p>
        </div>
      )}

      {/* Grid chuyên đề cho học viên */}
      {!loading && topics.length > 0 && (
        <StudentGrammarGrid
          topics={topics}
          onOpenTheory={(topic) => setTheoryTopic(topic)}
          onStartQuiz={(topic, sIdx, isRedo) => {
            void startTopicQuiz(topic, sIdx, isRedo);
          }}
        />
      )}

      {/* Modal Xem chi tiết lý thuyết (Công thức, Dấu hiệu, Bẫy, Ví dụ) */}
      <GrammarTopicDetailModal
        topic={theoryTopic}
        topics={topics}
        onClose={() => setTheoryTopic(null)}
        onStartQuiz={(topic) => {
          setTheoryTopic(null);
          void startTopicQuiz(topic);
        }}
      />

      {/* Modal Làm bài tập trắc nghiệm toàn màn hình */}
      {activeTopicForQuiz && (
        <GrammarQuizModal
          isOpen={quizActive}
          title={`Luyện tập: ${activeTopicForQuiz.titleVi || activeTopicForQuiz.title} (${activeTopicForQuiz.code})`}
          questions={activeTopicForQuiz.questions || []}
          activeTopic={activeTopicForQuiz}
          initialIndex={quizStartIndex}
          isRedoWrongOnly={isQuizRedoWrong}
          onClose={() => {
            setQuizActive(false);
            setActiveTopicForQuiz(null);
            void loadTopics(); // Refresh progress after quiz
          }}
          onRecordResult={handleRecordResult}
        />
      )}
    </div>
  );
}
