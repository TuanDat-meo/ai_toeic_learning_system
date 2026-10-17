"use client";

import React, { useState } from "react";
import { Brain, Sparkles, Layers } from "lucide-react";
import { GrammarTopicItem } from "@/app/admin/content/grammar/types";
import { INITIAL_GRAMMAR_TOPICS } from "@/app/admin/content/grammar/mockData";
import { StudentGrammarGrid } from "@/components/student/grammar/StudentGrammarGrid";
import {
  GrammarTopicDetailModal,
  GrammarQuizModal,
} from "@/components/admin/content/grammar/GrammarModals";
import { LearningQuotaBadge } from "@/components/student/billing/LearningQuotaBadge";
import { consumeLearningFeature } from "@/lib/api/billing";

export default function StudentGrammarPage() {
  const [topics, setTopics] = useState<GrammarTopicItem[]>(INITIAL_GRAMMAR_TOPICS);

  // Modal State
  const [theoryTopic, setTheoryTopic] = useState<GrammarTopicItem | null>(null);
  const [quizActive, setQuizActive] = useState<boolean>(false);
  const [activeTopicForQuiz, setActiveTopicForQuiz] = useState<GrammarTopicItem | null>(null);
  const [quotaMessage, setQuotaMessage] = useState<string | null>(null);

  const startTopicQuiz = async (topic: GrammarTopicItem) => {
    if (topic.questions.length === 0) return;
    try {
      await consumeLearningFeature("GRAMMAR_QUIZ");
      setActiveTopicForQuiz(topic);
      setQuizActive(true);
    } catch (error) {
      setQuotaMessage(error instanceof Error ? error.message : "Không thể bắt đầu bài quiz ngữ pháp.");
    }
  };

  const handleRecordResult = (topicId: string, isCorrect: boolean) => {
    setTopics((prev) =>
      prev.map((t) => {
        if (t.id === topicId) {
          return {
            ...t,
            studiedCount: (t.studiedCount || 0) + 1,
            correctCount: isCorrect ? (t.correctCount || 0) + 1 : t.correctCount || 0,
          };
        }
        return t;
      })
    );
  };

  const totalQuestionsCount = React.useMemo(() => {
    return topics.reduce((acc, t) => acc + t.questions.length, 0);
  }, [topics]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {quotaMessage ? <div role="alert" className="fixed right-5 top-5 z-[70] max-w-sm rounded-xl bg-red-700 px-4 py-3 text-xs font-semibold text-white shadow-xl">{quotaMessage}</div> : null}
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

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/80 px-3.5 py-2 text-xs font-bold text-blue-700 shadow-2xs">
            <Brain className="w-4 h-4 text-blue-600" />
            {topics.length} chuyên đề ({totalQuestionsCount} câu bài tập)
          </span>
          <LearningQuotaBadge featureKey="GRAMMAR" />
        </div>
      </header>

      {/* Grid chuyên đề cho học viên */}
      <StudentGrammarGrid
        topics={topics}
        onOpenTheory={(topic) => setTheoryTopic(topic)}
        onStartQuiz={(topic) => { void startTopicQuiz(topic); }}
      />

      {/* Modal Xem chi tiết lý thuyết (Công thức, Dấu hiệu, Bẫy, Ví dụ) */}
      <GrammarTopicDetailModal
        topic={theoryTopic}
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
          title={`Luyện tập: ${activeTopicForQuiz.title} (${activeTopicForQuiz.code})`}
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
