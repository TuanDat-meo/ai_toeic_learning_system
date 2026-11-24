"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  BookMarked,
  Search,
  Trash2,
  BookOpen,
  Play,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Lightbulb,
  AlertTriangle,
  ArrowRight,
  Bookmark,
  CheckCircle2,
} from "lucide-react";
import { GrammarSubpageShell } from "@/components/grammar/GrammarSubpageShell";
import {
  getGrammarBookmarks,
  removeGrammarBookmark,
  getGrammarTopics,
  saveGrammarProgress,
} from "@/lib/api/grammar";
import type {
  GrammarTopicItem,
  GrammarQuestionItem,
} from "@/app/admin/content/grammar/types";
import {
  GrammarTopicDetailModal,
  GrammarQuizModal,
} from "@/components/admin/content/grammar/GrammarModals";

interface BookmarkItem {
  targetType: string;
  targetId: string;
  note: string;
  createdAt: string;
}

export default function GrammarNotebookPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [topics, setTopics] = useState<GrammarTopicItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [activeTab, setActiveTab] = useState<"ALL" | "TOPIC" | "QUESTION">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [theoryTopic, setTheoryTopic] = useState<GrammarTopicItem | null>(null);
  const [quizActive, setQuizActive] = useState<boolean>(false);
  const [activeTopicForQuiz, setActiveTopicForQuiz] = useState<GrammarTopicItem | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<GrammarQuestionItem[]>([]);
  const [quizTitle, setQuizTitle] = useState<string>("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [bookmarkedList, topicList] = await Promise.all([
        getGrammarBookmarks(),
        getGrammarTopics(),
      ]);
      setBookmarks(Array.isArray(bookmarkedList) ? bookmarkedList : []);
      setTopics(Array.isArray(topicList) ? topicList : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải Sổ tay ngữ pháp.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Map topicId -> Topic
  const topicMap = useMemo(() => {
    const map = new Map<string, GrammarTopicItem>();
    topics.forEach((t) => map.set(t.id, t));
    return map;
  }, [topics]);

  // Map questionId -> { question, topic }
  const questionMap = useMemo(() => {
    const map = new Map<string, { question: GrammarQuestionItem; topic: GrammarTopicItem }>();
    topics.forEach((t) => {
      (t.questions || []).forEach((q) => {
        map.set(String(q.id), { question: q, topic: t });
      });
    });
    return map;
  }, [topics]);

  // Remove bookmark
  const handleRemove = async (item: BookmarkItem) => {
    try {
      await removeGrammarBookmark(item.targetType as "QUESTION" | "TOPIC", item.targetId);
      setBookmarks((prev) =>
        prev.filter((b) => !(b.targetType === item.targetType && b.targetId === item.targetId)),
      );
    } catch (err) {
      console.warn("Không thể xóa mục khỏi sổ tay:", err);
    }
  };

  // Start single question practice
  const handlePracticeQuestion = (question: GrammarQuestionItem, topic: GrammarTopicItem | null) => {
    setQuizQuestions([question]);
    setQuizTitle(`Luyện lại câu hỏi: ${question.questionText.slice(0, 45)}...`);
    setActiveTopicForQuiz(topic);
    setQuizActive(true);
  };

  // Start full topic practice
  const handlePracticeTopic = (topic: GrammarTopicItem) => {
    setQuizQuestions(topic.questions || []);
    setQuizTitle(`Luyện tập: ${topic.titleVi || topic.title}`);
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

  // Filtered bookmark list
  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((item) => {
      if (activeTab !== "ALL" && item.targetType !== activeTab) return false;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      if (item.targetType === "TOPIC") {
        const topic = topicMap.get(item.targetId);
        const title = (topic?.titleVi || topic?.title || "").toLowerCase();
        const code = (topic?.code || "").toLowerCase();
        const note = (item.note || "").toLowerCase();
        return title.includes(q) || code.includes(q) || note.includes(q);
      } else {
        const match = questionMap.get(item.targetId);
        const text = (match?.question.questionText || "").toLowerCase();
        const note = (item.note || "").toLowerCase();
        return text.includes(q) || note.includes(q);
      }
    });
  }, [bookmarks, activeTab, searchQuery, topicMap, questionMap]);

  const topicCount = bookmarks.filter((b) => b.targetType === "TOPIC").length;
  const questionCount = bookmarks.filter((b) => b.targetType === "QUESTION").length;

  return (
    <GrammarSubpageShell
      title="Sổ Tay Ngữ Pháp Cá Nhân"
      description="Nơi lưu giữ các chuyên đề trọng điểm và câu hỏi ngữ pháp mà bạn đã đánh dấu trong quá trình học tập. Ghi chú cá nhân giúp bạn xem lại bất cứ lúc nào."
      icon={<BookMarked className="h-6 w-6" />}
    >
      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-center justify-between"
        >
          <span>Lỗi tải sổ tay: {error}</span>
          <button type="button" onClick={() => void loadData()} className="font-bold underline">
            Thử lại
          </button>
        </div>
      )}

      {/* Toolbar: Search & Type Tabs */}
      {!loading && !error && (
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative flex-1 sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm trong sổ tay theo tên, nội dung, ghi chú..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
              activeTab === "ALL"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Tất cả ({bookmarks.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("TOPIC")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
              activeTab === "TOPIC"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Chuyên đề ({topicCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("QUESTION")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
              activeTab === "QUESTION"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Câu hỏi ({questionCount})
          </button>
        </div>
      </div>
      )}

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredBookmarks.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-3">
            <Bookmark className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Sổ tay hiện đang trống</h3>
          <p className="mt-1 max-w-sm text-xs text-slate-500 leading-relaxed">
            Trong quá trình làm bài hoặc học lý thuyết, hãy bấm biểu tượng dấu trang (Bookmark) để lưu lại các chuyên đề và câu hỏi bạn quan tâm.
          </p>
          <Link
            href="/grammar"
            className="mt-5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
          >
            Khám phá danh sách chuyên đề
          </Link>
        </div>
      )}

      {/* Bookmarks List */}
      {!loading && filteredBookmarks.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredBookmarks.map((item) => {
            const isTopic = item.targetType === "TOPIC";

            if (isTopic) {
              const topic = topicMap.get(item.targetId);
              return (
                <div
                  key={`topic-${item.targetId}`}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                          {topic?.code || "TOPIC"}
                        </span>
                        <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold text-blue-700 border border-blue-100">
                          Chuyên đề
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleRemove(item)}
                        title="Xóa khỏi sổ tay"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div>
                      <h3
                        onClick={() => topic && setTheoryTopic(topic)}
                        className="text-base font-bold text-slate-900 hover:text-blue-600 transition cursor-pointer line-clamp-1"
                      >
                        {topic?.titleVi || topic?.title || item.targetId}
                      </h3>
                      <p className="text-xs text-slate-400 italic mt-0.5 line-clamp-1">
                        {topic?.titleEn || topic?.englishTitle || "Chủ điểm ngữ pháp TOEIC"}
                      </p>
                    </div>

                    {topic?.formula && (
                      <div className="rounded-xl bg-slate-50 p-2.5 font-mono text-[11px] text-slate-700 border border-slate-200/60 line-clamp-2">
                        {topic.formula}
                      </div>
                    )}

                    {item.note && (
                      <p className="text-xs text-amber-800 bg-amber-50 rounded-lg p-2 border border-amber-200">
                        <strong>Ghi chú:</strong> {item.note}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-2 pt-3 border-t border-slate-100">
                    {topic && (
                      <button
                        type="button"
                        onClick={() => setTheoryTopic(topic)}
                        className="flex-1 rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                      >
                        Xem lý thuyết
                      </button>
                    )}
                    {topic && (
                      <button
                        type="button"
                        onClick={() => handlePracticeTopic(topic)}
                        className="flex-1 rounded-xl bg-blue-600 py-2 text-xs font-bold text-white shadow-2xs hover:bg-blue-700 transition cursor-pointer"
                      >
                        Luyện tập
                      </button>
                    )}
                  </div>
                </div>
              );
            }

            // Question Bookmark
            const match = questionMap.get(item.targetId);
            const question = match?.question;
            const topic = match?.topic;

            return (
              <div
                key={`q-${item.targetId}`}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-amber-300 hover:shadow-md transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                        {topic?.code || "Q"}
                      </span>
                      <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold text-amber-700 border border-amber-100">
                        Câu hỏi
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleRemove(item)}
                      title="Xóa khỏi sổ tay"
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-500">
                      Chuyên đề: {topic?.titleVi || topic?.title || "Ngữ pháp"}
                    </p>
                    <p className="text-sm font-bold text-slate-900 mt-1 line-clamp-3 leading-relaxed">
                      {question?.questionText || item.targetId}
                    </p>
                  </div>

                  {question?.correctAnswer && (
                    <div className="text-xs text-emerald-800 bg-emerald-50 rounded-xl p-2.5 border border-emerald-200 font-medium">
                      <strong>Đáp án đúng:</strong> {question.correctAnswer} -{" "}
                      {question.options?.[question.correctAnswer as "A" | "B" | "C" | "D"]}
                    </div>
                  )}

                  {item.note && (
                    <p className="text-xs text-amber-800 bg-amber-50 rounded-lg p-2 border border-amber-200">
                      <strong>Ghi chú:</strong> {item.note}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  {question && (
                    <button
                      type="button"
                      onClick={() => handlePracticeQuestion(question, topic || null)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 py-2 text-xs font-bold text-white shadow-2xs hover:bg-amber-700 transition cursor-pointer"
                    >
                      <Play className="h-3.5 w-3.5 fill-white" />
                      Làm lại câu này
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Theory Modal */}
      <GrammarTopicDetailModal
        topic={theoryTopic}
        topics={topics}
        onClose={() => setTheoryTopic(null)}
        onStartQuiz={(topic) => {
          setTheoryTopic(null);
          handlePracticeTopic(topic);
        }}
      />

      {/* Quiz Modal */}
      {quizActive && (
        <GrammarQuizModal
          isOpen={quizActive}
          title={quizTitle}
          questions={quizQuestions}
          activeTopic={activeTopicForQuiz}
          initialIndex={0}
          onClose={() => {
            setQuizActive(false);
            setActiveTopicForQuiz(null);
          }}
          onRecordResult={handleRecordResult}
        />
      )}
    </GrammarSubpageShell>
  );
}
