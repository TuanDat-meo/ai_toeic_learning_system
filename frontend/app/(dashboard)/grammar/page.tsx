"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  const [quizStartIndex, setQuizStartIndex] = useState<number>(0);
  const [isQuizRedoWrong, setIsQuizRedoWrong] = useState<boolean>(false);
  const [quotaMessage, setQuotaMessage] = useState<string | null>(null);

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

  const startTopicQuiz = async (topic: GrammarTopicItem, startIndex = 0, isRedoWrong = false) => {
    setActiveTopicForQuiz(topic);
    setQuizStartIndex(startIndex);
    setIsQuizRedoWrong(isRedoWrong);
    setQuizActive(true);
  };

  const handleRecordResult = async (topicId: string, isCorrect: boolean) => {
    try {
      const topic = topics.find((t) => t.id === topicId);
      const total = topic?.questions?.length || 1;
      const completed = Math.min(total, (topic?.completedQuestions || 0) + 1);
      const status = completed >= total ? "COMPLETED" : "IN_PROGRESS";
      await saveGrammarProgress(topicId, completed, total, status);
    } catch (err) {
      console.warn("Không thể đồng bộ tiến độ ngữ pháp lên máy chủ:", err);
    }
  };

  const totalQuestionsCount = React.useMemo(() => {
    return topics.reduce((acc, t) => acc + (t.questions ? t.questions.length : 0), 0);
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
            Hệ thống 25 chuyên đề ngữ pháp TOEIC trọng tâm từ cơ bản đến nâng cao (phát âm, từ loại, các thì, mệnh đề quan hệ, câu bị động, đảo ngữ...) kèm giải thích chi tiết.
          </p>
        </div>

        
      </header>

      {/* Grid chuyên đề cho học viên */}
      <StudentGrammarGrid
        topics={topics}
        onOpenTheory={(topic) => setTheoryTopic(topic)}
        onStartQuiz={(topic, sIdx, isRedo) => { void startTopicQuiz(topic, sIdx, isRedo); }}
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
          title={`Luyện tập: ${activeTopicForQuiz.titleVi || activeTopicForQuiz.title} (${activeTopicForQuiz.code})`}
          questions={activeTopicForQuiz.questions}
          activeTopic={activeTopicForQuiz}
          initialIndex={quizStartIndex}
          isRedoWrongOnly={isQuizRedoWrong}
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
