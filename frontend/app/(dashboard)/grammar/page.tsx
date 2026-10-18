"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Brain, Sparkles, Layers } from "lucide-react";
import { GrammarTopicItem } from "@/app/admin/content/grammar/types";
import { INITIAL_GRAMMAR_TOPICS } from "@/app/admin/content/grammar/mockData";
import { getGrammarTopics, saveGrammarProgress } from "@/lib/api/grammar";
import { StudentGrammarGrid } from "@/components/student/grammar/StudentGrammarGrid";
import {
  GrammarTopicDetailModal,
  GrammarQuizModal,
} from "@/components/admin/content/grammar/GrammarModals";

export default function StudentGrammarPage() {
  const [topics, setTopics] = useState<GrammarTopicItem[]>(INITIAL_GRAMMAR_TOPICS);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal State
  const [theoryTopic, setTheoryTopic] = useState<GrammarTopicItem | null>(null);
  const [quizActive, setQuizActive] = useState<boolean>(false);
  const [activeTopicForQuiz, setActiveTopicForQuiz] = useState<GrammarTopicItem | null>(null);

  const loadTopics = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getGrammarTopics();
      if (data && data.length > 0) {
        setTopics(data);
      } else {
        setTopics(INITIAL_GRAMMAR_TOPICS);
      }
    } catch (err) {
      console.warn("Could not load topics from server, using fallback data:", err);
      setTopics(INITIAL_GRAMMAR_TOPICS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTopics();
  }, [loadTopics]);

  const startTopicQuiz = (topic: GrammarTopicItem) => {
    if (!topic.questions || topic.questions.length === 0) return;
    setActiveTopicForQuiz(topic);
    setQuizActive(true);
  };

  const handleRecordResult = async (topicId: string, isCorrect: boolean) => {
    try {
      const topic = topics.find((t) => t.id === topicId);
      const total = topic?.questions?.length || 1;
      const completed = Math.min(total, (topic?.completedQuestions || 0) + 1);
      const status = completed >= total ? "Đã hoàn thành" : "Đang học";
      await saveGrammarProgress(topicId, completed, total, status);
    } catch (err) {
      console.error("Lỗi lưu tiến độ ngữ pháp:", err);
    }
  };

  const totalQuestionsCount = React.useMemo(() => {
    return topics.reduce((acc, t) => acc + (t.questions ? t.questions.length : 0), 0);
  }, [topics]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header chuẩn tối giản, thanh lịch như Admin */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
        <div>
          <p className="text-xs font-medium text-slate-400">
            Trang chủ <span className="px-1.5">/</span> Lộ trình TOEIC <span className="px-1.5">/</span>{" "}
            <span className="font-semibold text-blue-700">Ngữ pháp trọng tâm</span>
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 md:text-[28px]">
            Chuyên Đề Ngữ Pháp TOEIC Trọng Tâm
          </h1>
          <p className="mt-1.5 text-xs text-slate-500 md:text-sm">
            Nắm vững công thức, dấu hiệu nhận biết Part 5, 6 &amp; 7 (ETS 2024), bẫy thường gặp và luyện trắc nghiệm giải thích chi tiết.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/80 px-3.5 py-2 text-xs font-bold text-blue-700 shadow-2xs">
            <Brain className="w-4 h-4 text-blue-600" />
            {topics.length} chuyên đề ({totalQuestionsCount} câu bài tập)
          </span>
        </div>
      </header>

      {/* Grid chuyên đề cho học viên */}
      <StudentGrammarGrid
        topics={topics}
        onOpenTheory={(topic) => setTheoryTopic(topic)}
        onStartQuiz={(topic) => startTopicQuiz(topic)}
      />

      {/* Modal Xem chi tiết lý thuyết (Công thức, Dấu hiệu, Bẫy, Ví dụ) */}
      <GrammarTopicDetailModal
        topic={theoryTopic}
        onClose={() => setTheoryTopic(null)}
        onStartQuiz={(topic) => {
          setTheoryTopic(null);
          startTopicQuiz(topic);
        }}
      />

      {/* Modal Làm bài tập trắc nghiệm toàn màn hình */}
      {activeTopicForQuiz && (
        <GrammarQuizModal
          isOpen={quizActive}
          title={`Luyện tập: ${activeTopicForQuiz.titleVi || activeTopicForQuiz.title} (${activeTopicForQuiz.code})`}
          questions={activeTopicForQuiz.questions}
          activeTopic={activeTopicForQuiz}
          onClose={() => {
            setQuizActive(false);
            setActiveTopicForQuiz(null);
          }}
          onRecordResult={handleRecordResult}
        />
      )}
    </div>
  );
}
