"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Milestone,
  CheckCircle2,
  Clock3,
  BookOpen,
  Trophy,
} from "lucide-react";
import { GrammarSubpageShell } from "@/components/grammar/GrammarSubpageShell";
import {
  getGrammarPathSummary,
  getGrammarTopics,
  saveGrammarProgress,
} from "@/lib/api/grammar";
import type { GrammarTopicItem } from "@/app/admin/content/grammar/types";
import {
  GrammarTopicDetailModal,
  GrammarQuizModal,
} from "@/components/admin/content/grammar/GrammarModals";

interface PathSummary {
  publishedCount: number;
  masteredCount: number;
  inProgressCount: number;
}

export default function GrammarPathPage() {
  const [summary, setSummary] = useState<PathSummary | null>(null);
  const [topics, setTopics] = useState<GrammarTopicItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [theoryTopic, setTheoryTopic] = useState<GrammarTopicItem | null>(null);
  const [quizActive, setQuizActive] = useState<boolean>(false);
  const [activeTopicForQuiz, setActiveTopicForQuiz] = useState<GrammarTopicItem | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [pathSummary, allTopics] = await Promise.all([
        getGrammarPathSummary(),
        getGrammarTopics(),
      ]);
      setSummary(pathSummary);
      setTopics(allTopics.filter((t) => t.status === "PUBLISHED"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải bản đồ lộ trình.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const scoreGroups = useMemo(() => {
    const groups = new Map<string, GrammarTopicItem[]>();
    const unassigned: GrammarTopicItem[] = [];

    for (const topic of topics) {
      const targetScore = String(topic.targetScore || "").trim();
      if (!targetScore) {
        unassigned.push(topic);
        continue;
      }
      const group = groups.get(targetScore) ?? [];
      group.push(topic);
      groups.set(targetScore, group);
    }

    return {
      groups: Array.from(groups, ([targetScore, groupTopics]) => ({
        targetScore,
        topics: groupTopics,
      })),
      unassigned,
    };
  }, [topics]);

  const handleStartQuiz = (topic: GrammarTopicItem) => {
    setActiveTopicForQuiz(topic);
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
      await saveGrammarProgress(topicId, questionId, selectedOption, "PRACTICE", 0, eventId);
      void isCorrect;
    } catch (err) {
      console.warn("Không thể lưu tiến độ làm bài:", err);
    }
  };

  const masteredCount = summary?.masteredCount || 0;
  const inProgressCount = summary?.inProgressCount || 0;
  const publishedCount = summary?.publishedCount || topics.length || 0;
  const completionPercent = publishedCount
    ? Math.min(100, Math.round((masteredCount / publishedCount) * 100))
    : 0;

  return (
    <GrammarSubpageShell
      title="Bản Đồ Lộ Trình Ngữ Pháp"
      description="Các chủ điểm được nhóm theo mục tiêu điểm đã cấu hình trong dữ liệu ngữ pháp."
      icon={<Milestone className="h-6 w-6" />}
      action={
        !loading && !error && summary ? (
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-2xs">
          <Trophy className="h-5 w-5 text-amber-500" />
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400">Tiến độ lộ trình</p>
            <p className="text-xs font-black text-slate-900">{completionPercent}% hoàn thành</p>
          </div>
        </div>
        ) : undefined
      }
    >
      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-center justify-between"
        >
          <span>Lỗi tải lộ trình: {error}</span>
          <button type="button" onClick={() => void loadData()} className="font-bold underline">
            Thử lại
          </button>
        </div>
      )}

      {/* 3 Overview Stat Cards */}
      {!loading && !error && (
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-blue-200/90 bg-linear-to-br from-blue-50/70 to-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-800">Tổng chuyên đề</span>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{publishedCount}</p>
          <p className="mt-1 text-[11px] text-slate-500">Đã sẵn sàng trong hệ thống</p>
        </div>

        <div className="rounded-2xl border border-amber-200/90 bg-linear-to-br from-amber-50/70 to-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800">Đang học dở dang</span>
            <Clock3 className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{inProgressCount}</p>
          <p className="mt-1 text-[11px] text-slate-500">Cần tiếp tục luyện tập</p>
        </div>

        <div className="rounded-2xl border border-emerald-200/90 bg-linear-to-br from-emerald-50/70 to-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800">Đã làm chủ (Mastered)</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{masteredCount}</p>
          <p className="mt-1 text-[11px] text-slate-500">Đạt độ chính xác cao & ổn định</p>
        </div>
      </div>
      )}

      {loading && (
        <div className="space-y-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-3xl border border-slate-200/80 bg-slate-50/60 p-6" />
          ))}
        </div>
      )}

      {/* Score groups from topic data */}
      {!loading && !error && topics.length > 0 && (
        <div className="space-y-8 pt-2">
          {scoreGroups.groups.map(({ targetScore, topics: groupTopics }) => {
            const masteredCount = groupTopics.filter(
              (t) => t.learningStatus === "ĐÃ ĐẠT" || t.learningStatus === "ĐÃ GHI NHỚ",
            ).length;
            const groupPercent = groupTopics.length
              ? Math.round((masteredCount / groupTopics.length) * 100)
              : 0;

            return (
              <div
                key={targetScore}
                className="relative rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200/80">
                  <h2 className="text-lg font-black text-slate-900">{targetScore}</h2>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-700">
                        {masteredCount}/{groupTopics.length} chuyên đề
                      </span>
                      <div className="mt-1 h-2 w-28 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all duration-500"
                          style={{ width: `${groupPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 pt-4 sm:grid-cols-2 lg:grid-cols-3">
                    {groupTopics.map((topic) => {
                      const totalQ = topic.questions?.length || topic.totalQuestions || 0;
                      const completedQ = topic.completedQuestions || 0;
                      const isMastered =
                        topic.learningStatus === "ĐÃ ĐẠT" || topic.learningStatus === "ĐÃ GHI NHỚ";

                      return (
                        <div
                          key={topic.id}
                          className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs hover:shadow-xs hover:border-blue-300 transition"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                {topic.code}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                                  isMastered
                                    ? "bg-emerald-100 text-emerald-800"
                                    : completedQ > 0
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {isMastered
                                  ? "Đã đạt"
                                  : completedQ > 0
                                  ? "Đang học"
                                  : "Chưa học"}
                              </span>
                            </div>

                            <div>
                              <h3
                                onClick={() => setTheoryTopic(topic)}
                                className="text-xs font-bold text-slate-900 line-clamp-1 hover:text-blue-600 transition cursor-pointer"
                              >
                                {topic.titleVi || topic.title}
                              </h3>
                              <p className="text-[11px] text-slate-400 italic line-clamp-1">
                                {topic.titleEn || topic.englishTitle}
                              </p>
                            </div>

                            <div className="text-[11px] text-slate-500 flex items-center justify-between">
                              <span>Tiến độ</span>
                              <span>
                                {completedQ}/{totalQ} câu
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => setTheoryTopic(topic)}
                              className="flex-1 rounded-xl border border-slate-200 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                            >
                              Lý thuyết
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStartQuiz(topic)}
                              className="flex-1 rounded-xl bg-blue-600 py-1.5 text-[11px] font-bold text-white shadow-2xs hover:bg-blue-700 transition cursor-pointer"
                            >
                              Luyện tập
                            </button>
                          </div>
                        </div>
                      );
                    })}

                </div>
              </div>
            );
          })}
          {scoreGroups.unassigned.length > 0 && (
            <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-6">
              <h2 className="text-base font-bold text-slate-900">Chủ điểm chưa có mục tiêu điểm</h2>
              <p className="mt-1 text-xs text-slate-600">
                Chưa có mục tiêu điểm trong dữ liệu cho các chủ điểm này.
              </p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {scoreGroups.unassigned.map((topic) => (
                  <li key={topic.id} className="rounded-xl border border-slate-200 p-3 text-xs">
                    <span className="font-mono font-bold text-slate-500">{topic.code}</span>
                    <span className="ml-2 font-semibold text-slate-800">{topic.titleVi || topic.title}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {!loading && !error && topics.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
          Chưa có chủ điểm ngữ pháp được xuất bản để hiển thị lộ trình.
        </div>
      )}

      {/* Theory Modal */}
      <GrammarTopicDetailModal
        topic={theoryTopic}
        topics={topics}
        onClose={() => setTheoryTopic(null)}
        onStartQuiz={(topic) => {
          setTheoryTopic(null);
          handleStartQuiz(topic);
        }}
      />

      {/* Quiz Modal */}
      {activeTopicForQuiz && (
        <GrammarQuizModal
          isOpen={quizActive}
          title={`Luyện tập: ${activeTopicForQuiz.titleVi || activeTopicForQuiz.title}`}
          questions={activeTopicForQuiz.questions || []}
          activeTopic={activeTopicForQuiz}
          initialIndex={0}
          onClose={() => {
            setQuizActive(false);
            setActiveTopicForQuiz(null);
            void loadData(); // Reload path stats
          }}
          onRecordResult={handleRecordResult}
        />
      )}
    </GrammarSubpageShell>
  );
}
