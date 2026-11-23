"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  RotateCcw,
  Target,
  Clock,
  TrendingDown,
  CheckCircle2,
  Lightbulb,
  ShieldAlert,
} from "lucide-react";
import { GrammarSubpageShell } from "@/components/grammar/GrammarSubpageShell";
import {
  getGrammarAnalytics,
  getGrammarTrapAnalysis,
  getGrammarTopics,
  saveGrammarProgress,
  type GrammarTrapQuestion,
} from "@/lib/api/grammar";
import type {
  GrammarTopicItem,
  GrammarQuestionItem,
} from "@/app/admin/content/grammar/types";
import { GrammarQuizModal } from "@/components/admin/content/grammar/GrammarModals";

interface AnalyticsData {
  attempts: number;
  firstAttempts: number;
  firstAttemptAccuracy: number;
  retentionRate: number;
  repeatedErrorCount: number;
  interleavedAccuracy: number;
  averageResponseTimeMs: number;
}

export default function GrammarMistakesPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [traps, setTraps] = useState<GrammarTrapQuestion[]>([]);
  const [topics, setTopics] = useState<GrammarTopicItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Redo Quiz State
  const [quizActive, setQuizActive] = useState<boolean>(false);
  const [redoQuestions, setRedoQuestions] = useState<GrammarQuestionItem[]>([]);
  const [quizTitle, setQuizTitle] = useState<string>("");
  const [activeTopicForQuiz, setActiveTopicForQuiz] = useState<GrammarTopicItem | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [analyticsData, trapData, topicList] = await Promise.all([
        getGrammarAnalytics(),
        getGrammarTrapAnalysis(),
        getGrammarTopics(),
      ]);

      setAnalytics(analyticsData);
      setTraps(trapData.questions);
      setTopics(Array.isArray(topicList) ? topicList : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải dữ liệu lỗi và phân tích bẫy.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Map questionId -> question & topic
  const questionMap = useMemo(() => {
    const map = new Map<string, { question: GrammarQuestionItem; topic: GrammarTopicItem }>();
    topics.forEach((t) => {
      (t.questions || []).forEach((q) => {
        map.set(String(q.id), { question: q, topic: t });
      });
    });
    return map;
  }, [topics]);

  // Match trap questions to full details
  const matchedMistakeQuestions = useMemo(() => {
    return traps
      .filter((row) => (row.wrong_attempts || 0) > 0)
      .map((row) => {
        const found = questionMap.get(row.question_id);
        return {
          ...row,
          question: found?.question || null,
          topic: found?.topic || null,
        };
      })
      .filter((item) => item.question !== null);
  }, [traps, questionMap]);

  // Start redo for all mistake questions
  const startRedoAll = () => {
    const questions = matchedMistakeQuestions
      .map((item) => item.question)
      .filter((q): q is GrammarQuestionItem => q !== null);

    if (questions.length === 0) {
      alert("Chưa có danh sách câu sai để luyện tập.");
      return;
    }

    setRedoQuestions(questions);
    setQuizTitle(`Luyện lại các câu từng làm sai (${questions.length} câu)`);
    setActiveTopicForQuiz(matchedMistakeQuestions[0]?.topic || topics[0] || null);
    setQuizActive(true);
  };

  // Start redo for a single question
  const startRedoSingle = (question: GrammarQuestionItem, topic: GrammarTopicItem | null) => {
    setRedoQuestions([question]);
    setQuizTitle(`Luyện lại: ${question.questionText.slice(0, 40)}...`);
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
      await saveGrammarProgress(
        topicId,
        questionId,
        selectedOption,
        "RETRY_WRONG",
        0,
        eventId,
      );
      void isCorrect;
    } catch (err) {
      console.warn("Không thể lưu kết quả luyện câu sai:", err);
    }
  };

  const accuracyPercent = analytics
    ? Math.round((analytics.firstAttemptAccuracy || 0) * 100)
    : 0;
  const retentionPercent = analytics
    ? Math.round((analytics.retentionRate || 0) * 100)
    : 0;
  const avgTimeSeconds = analytics
    ? (analytics.averageResponseTimeMs / 1000).toFixed(1)
    : "0";

  return (
    <GrammarSubpageShell
      title="Lỗi Của Tôi & Bẫy Đề Thi"
      description="Tổng hợp các câu hỏi bạn từng làm sai hoặc gặp bẫy ngữ pháp. Phân tích bẫy kinh điển trong bài thi TOEIC Part 5 & 6 và làm lại để khắc phục triệt để lỗ hổng."
      icon={<AlertTriangle className="h-6 w-6" />}
      action={
        matchedMistakeQuestions.length > 0 ? (
          <button
            type="button"
            onClick={startRedoAll}
            className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-xs font-black text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 transition cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            Luyện lại toàn bộ câu sai ({matchedMistakeQuestions.length} câu)
          </button>
        ) : undefined
      }
    >
      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-center justify-between"
        >
          <span>Lỗi tải dữ liệu: {error}</span>
          <button type="button" onClick={() => void loadData()} className="font-bold underline">
            Thử lại
          </button>
        </div>
      )}

      {/* 4 Analytics Metrics Cards */}
      {!loading && !error && analytics && (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Số câu sai lặp lại */}
        <div className="rounded-2xl border border-rose-200/90 bg-linear-to-br from-rose-50/70 to-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800">Sai lặp lại</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900">
            {analytics?.repeatedErrorCount ?? 0}{" "}
            <span className="text-xs font-normal text-slate-500">câu/quy tắc</span>
          </p>
          <p className="mt-1 text-[11px] text-slate-500">Các lỗi đã sai từ 2 lần trở lên</p>
        </div>

        {/* Metric 2: Độ chính xác lần đầu */}
        <div className="rounded-2xl border border-blue-200/90 bg-linear-to-br from-blue-50/70 to-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-800">Chính xác lần đầu</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900">{accuracyPercent}%</p>
          <p className="mt-1 text-[11px] text-slate-500">Tỉ lệ đúng ở lần thử đầu tiên</p>
        </div>

        {/* Metric 3: Tỉ lệ ghi nhớ dài hạn */}
        <div className="rounded-2xl border border-emerald-200/90 bg-linear-to-br from-emerald-50/70 to-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800">Tỉ lệ duy trì (7 ngày)</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900">{retentionPercent}%</p>
          <p className="mt-1 text-[11px] text-slate-500">Ghi nhớ sau các chu kỳ ôn tập</p>
        </div>

        {/* Metric 4: Thời gian phản hồi trung bình */}
        <div className="rounded-2xl border border-amber-200/90 bg-linear-to-br from-amber-50/70 to-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800">Tốc độ làm bài</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900">
            {avgTimeSeconds} <span className="text-xs font-normal text-slate-500">giây/câu</span>
          </p>
          <p className="mt-1 text-[11px] text-slate-500">Chuẩn Part 5: ~30 giây/câu</p>
        </div>
      </div>
      )}

      {loading && (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5" />
          ))}
        </div>
      )}

      {/* No mistakes state */}
      {!loading && !error && matchedMistakeQuestions.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-emerald-200/80 bg-linear-to-b from-white to-emerald-50/30 p-12 text-center shadow-xs">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 mb-4">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-black text-slate-900">Không có câu hỏi nào bị sai cần khắc phục!</h3>
          <p className="mt-1.5 max-w-md text-xs sm:text-sm text-slate-600 leading-relaxed">
            Bạn đã làm bài với độ chính xác rất cao hoặc đã hoàn thành sửa toàn bộ lỗi sai trước đó. Hãy tiếp tục duy trì phong độ!
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/grammar"
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
            >
              Luyện chuyên đề tiếp theo
            </Link>
          </div>
        </div>
      )}

      {/* List of Mistake & Trap Questions */}
      {!loading && matchedMistakeQuestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Danh sách các câu hỏi hay mắc lỗi ({matchedMistakeQuestions.length} câu)
            </h2>
          </div>

          <div className="space-y-4">
            {matchedMistakeQuestions.map((item, idx) => {
              const q = item.question;
              if (!q) return null;
              const options = Object.entries(q.options || {});

              return (
                <div
                  key={item.question_id || idx}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-rose-300 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-2 flex-1">
                      {/* Topic & Trap Rate Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          {item.topic?.code || "Q"}
                        </span>
                        <span className="text-xs font-bold text-slate-600">
                          {item.topic?.titleVi || item.topic?.title}
                        </span>
                        <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-black text-rose-800">
                          Sai {item.wrong_attempts} / {item.attempts} lần ({Math.round(item.wrong_rate * 100)}%)
                        </span>
                      </div>

                      {/* Question Text */}
                      <p className="text-sm font-bold text-slate-900 leading-relaxed pt-1">
                        {idx + 1}. {q.questionText}
                      </p>

                      {/* Options Grid */}
                      <div className="grid gap-2 sm:grid-cols-2 pt-1 text-xs">
                        {options.map(([key, val]) => {
                          const isCorrect = key.toUpperCase() === q.correctAnswer?.toUpperCase();
                          return (
                            <div
                              key={key}
                              className={`flex items-center gap-2 rounded-xl p-2.5 border transition ${
                                isCorrect
                                  ? "border-emerald-300 bg-emerald-50/80 font-bold text-emerald-900"
                                  : "border-slate-200 bg-slate-50 text-slate-700"
                              }`}
                            >
                              <span
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                                  isCorrect ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"
                                }`}
                              >
                                {key}
                              </span>
                              <span>{String(val)}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Trap Analysis & Explanation Box */}
                      <div className="mt-3 space-y-2 rounded-xl bg-amber-50/70 p-3.5 border border-amber-200 text-xs">
                        {q.trapNote && (
                          <div className="flex items-start gap-2 text-amber-900">
                            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                            <div>
                              <strong className="font-bold">Bẫy đề thi TOEIC:</strong> {q.trapNote}
                            </div>
                          </div>
                        )}
                        {q.explanation && (
                          <div className="flex items-start gap-2 text-slate-700">
                            <Lightbulb className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
                            <div>
                              <strong className="font-bold text-slate-900">Giải thích:</strong> {q.explanation}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 self-start sm:self-center">
                      <button
                        type="button"
                        onClick={() => startRedoSingle(q, item.topic)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Làm lại câu này
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Redo Quiz Modal */}
      {quizActive && (
        <GrammarQuizModal
          isOpen={quizActive}
          title={quizTitle}
          questions={redoQuestions}
          activeTopic={activeTopicForQuiz}
          initialIndex={0}
          isRedoWrongOnly={true}
          onClose={() => {
            setQuizActive(false);
            void loadData(); // Reload mistakes analytics
          }}
          onRecordResult={handleRecordResult}
        />
      )}
    </GrammarSubpageShell>
  );
}
