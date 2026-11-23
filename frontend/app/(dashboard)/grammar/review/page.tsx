"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  RotateCcw,
  Clock3,
  Flame,
  Play,
} from "lucide-react";
import { GrammarSubpageShell } from "@/components/grammar/GrammarSubpageShell";
import {
  getDueGrammarReviews,
  getGrammarTopics,
  saveGrammarProgress,
} from "@/lib/api/grammar";
import type {
  GrammarTopicItem,
  GrammarQuestionItem,
} from "@/app/admin/content/grammar/types";
import { GrammarQuizModal } from "@/components/admin/content/grammar/GrammarModals";

interface DueReviewItem {
  questionId: string;
  topicId: string;
  dueAt: string;
  intervalDays: number;
  ease: number;
  streak: number;
}

export default function GrammarReviewPage() {
  const [dueItems, setDueItems] = useState<DueReviewItem[]>([]);
  const [topics, setTopics] = useState<GrammarTopicItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Review Quiz State
  const [quizActive, setQuizActive] = useState<boolean>(false);
  const [reviewQuestions, setReviewQuestions] = useState<GrammarQuestionItem[]>([]);
  const [reviewTitle, setReviewTitle] = useState<string>("");
  const [activeTopicForQuiz, setActiveTopicForQuiz] = useState<GrammarTopicItem | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [dueList, topicList] = await Promise.all([
        getDueGrammarReviews(),
        getGrammarTopics(),
      ]);
      setDueItems(Array.isArray(dueList) ? dueList : []);
      setTopics(Array.isArray(topicList) ? topicList : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách ôn tập.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Map questions from all topics for fast lookup
  const questionMap = useMemo(() => {
    const map = new Map<string, { question: GrammarQuestionItem; topic: GrammarTopicItem }>();
    topics.forEach((t) => {
      (t.questions || []).forEach((q) => {
        map.set(String(q.id), { question: q, topic: t });
      });
    });
    return map;
  }, [topics]);

  // Group due items by topic
  const groupedByTopic = useMemo(() => {
    const groups = new Map<string, { topic: GrammarTopicItem | null; items: DueReviewItem[] }>();
    dueItems.forEach((item) => {
      const match = questionMap.get(item.questionId);
      const t = match ? match.topic : topics.find((top) => top.id === item.topicId) || null;
      const key = item.topicId || (t ? t.id : "other");
      if (!groups.has(key)) {
        groups.set(key, { topic: t, items: [] });
      }
      groups.get(key)!.items.push(item);
    });
    return Array.from(groups.entries()).map(([topicId, group]) => ({
      topicId,
      topic: group.topic,
      items: group.items,
    }));
  }, [dueItems, questionMap, topics]);

  // Start full review session
  const startFullReview = () => {
    const questionsToReview: GrammarQuestionItem[] = [];
    dueItems.forEach((d) => {
      const match = questionMap.get(d.questionId);
      if (match) {
        questionsToReview.push(match.question);
      }
    });

    if (questionsToReview.length === 0) {
      alert("Không tìm thấy nội dung câu hỏi cho các mục ôn tập này.");
      return;
    }

    setReviewQuestions(questionsToReview);
    setReviewTitle(`Ôn tập định kỳ SRS (${questionsToReview.length} câu)`);
    setActiveTopicForQuiz(topics[0] || null);
    setQuizActive(true);
  };

  // Start review for a specific topic
  const startTopicReview = (topic: GrammarTopicItem | null, items: DueReviewItem[]) => {
    const questionsToReview: GrammarQuestionItem[] = [];
    items.forEach((d) => {
      const match = questionMap.get(d.questionId);
      if (match) {
        questionsToReview.push(match.question);
      }
    });

    if (questionsToReview.length === 0) {
      alert("Không tìm thấy nội dung câu hỏi cho chủ điểm này.");
      return;
    }

    setReviewQuestions(questionsToReview);
    setReviewTitle(
      `Ôn tập SRS: ${topic?.titleVi || topic?.title || "Chuyên đề"} (${questionsToReview.length} câu)`,
    );
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
        "REVIEW",
        0,
        eventId,
      );
      void isCorrect;
    } catch (err) {
      console.warn("Không thể lưu tiến độ ôn tập:", err);
    }
  };

  return (
    <GrammarSubpageShell
      title="Ôn Tập Hôm Nay (SRS)"
      description="Hệ thống Spaced Repetition (Lặp lại ngắt quãng) tự động tính toán thời điểm tối ưu để ôn lại từng câu hỏi, giúp bạn ghi nhớ kiến thức ngữ pháp vĩnh viễn vào trí nhớ dài hạn."
      icon={<RotateCcw className="h-6 w-6" />}
      action={
        dueItems.length > 0 ? (
          <button
            type="button"
            onClick={startFullReview}
            className="inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-5 py-3 text-xs font-black text-white shadow-md shadow-amber-600/20 hover:bg-amber-700 transition cursor-pointer"
          >
            <Play className="h-4 w-4 fill-white" />
            Bắt đầu ôn tập tất cả ({dueItems.length} câu)
          </button>
        ) : undefined
      }
    >
      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-center justify-between"
        >
          <span>Lỗi tải câu ôn tập: {error}</span>
          <button type="button" onClick={() => void loadData()} className="font-bold underline">
            Thử lại
          </button>
        </div>
      )}

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4" />
          ))}
        </div>
      )}

      {/* No due questions state */}
      {!loading && !error && dueItems.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-emerald-200/80 bg-linear-to-b from-white to-emerald-50/30 p-12 text-center shadow-xs">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 mb-4">
            <Clock3 className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-black text-slate-900">Hiện không có câu hỏi nào đến hạn.</h3>
          <p className="mt-1.5 max-w-md text-xs sm:text-sm text-slate-600 leading-relaxed">
            Danh sách sẽ hiển thị câu hỏi khi đến lịch ôn tập.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/grammar"
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
            >
              Học chuyên đề mới
            </Link>
            <Link
              href="/grammar/path"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Xem lộ trình học
            </Link>
          </div>
        </div>
      )}

      {/* Due reviews list grouped by Topic */}
      {!loading && dueItems.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Danh sách chuyên đề cần ôn tập ({groupedByTopic.length} chuyên đề · {dueItems.length} câu hỏi)
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groupedByTopic.map(({ topicId, topic, items }) => (
              <div
                key={topicId}
                className="flex flex-col justify-between rounded-2xl border border-amber-200/80 bg-white p-5 shadow-xs hover:shadow-md transition"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      {topic?.code || "TOPIC"}
                    </span>
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-black text-amber-800">
                      {items.length} câu đến hạn
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                      {topic?.titleVi || topic?.title || "Chủ điểm ngữ pháp"}
                    </h3>
                    <p className="text-xs text-slate-400 italic mt-0.5 line-clamp-1">
                      {topic?.titleEn || topic?.englishTitle || "Grammar Topic"}
                    </p>
                  </div>

                  <div className="text-xs text-slate-500 space-y-1 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Clock3 className="h-3.5 w-3.5 text-amber-600" />
                      <span>Chu kỳ ôn: ~{items[0]?.intervalDays || 1} ngày/lần</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Flame className="h-3.5 w-3.5 text-orange-500" />
                      <span>Chuỗi nhớ: {items[0]?.streak || 0} lần liên tiếp</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => startTopicReview(topic, items)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-amber-50 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 transition cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5 fill-amber-700" />
                    Ôn chuyên đề này ({items.length} câu)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Quiz Modal */}
      {quizActive && (
        <GrammarQuizModal
          isOpen={quizActive}
          title={reviewTitle}
          questions={reviewQuestions}
          activeTopic={activeTopicForQuiz}
          initialIndex={0}
          onClose={() => {
            setQuizActive(false);
            void loadData(); // Reload due reviews when done
          }}
          onRecordResult={handleRecordResult}
        />
      )}
    </GrammarSubpageShell>
  );
}
