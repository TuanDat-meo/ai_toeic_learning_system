"use client";

import React, { useState, useMemo } from "react";
import { GrammarTopicItem, GrammarQuestionItem } from "./types";
import { INITIAL_GRAMMAR_TOPICS } from "./mockData";
import { GrammarFilterBar } from "./components/GrammarFilterBar";
import { GrammarTopicList } from "./components/GrammarTopicList";
import { GrammarTopicDetailModal } from "./components/GrammarTopicDetailModal";
import { GrammarTopicEditModal } from "./components/GrammarTopicEditModal";
import { GrammarDeleteModal } from "./components/GrammarDeleteModal";
import { GrammarQuizModal } from "./components/GrammarQuizModal";
import { GrammarAddQuestionModal } from "./components/GrammarAddQuestionModal";

export default function AdminGrammarPage() {
  const [topics, setTopics] = useState<GrammarTopicItem[]>(INITIAL_GRAMMAR_TOPICS);
  const [activeMainTab, setActiveMainTab] = useState<"topics" | "progress" | "starred" | "rules">("topics");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPart, setFilterPart] = useState<string>("ALL");
  const [filterScore, setFilterScore] = useState<string>("ALL");
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);

  // Modals state
  const [theoryTopic, setTheoryTopic] = useState<GrammarTopicItem | null>(null);
  const [quizActive, setQuizActive] = useState<boolean>(false);
  const [quizTitle, setQuizTitle] = useState<string>("");
  const [quizQuestions, setQuizQuestions] = useState<GrammarQuestionItem[]>([]);
  const [activeTopicForQuiz, setActiveTopicForQuiz] = useState<GrammarTopicItem | null>(null);

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [editTopicItem, setEditTopicItem] = useState<GrammarTopicItem | null>(null);
  const [addQuestionTopic, setAddQuestionTopic] = useState<GrammarTopicItem | null>(null);
  const [deleteConfirmTopic, setDeleteConfirmTopic] = useState<GrammarTopicItem | null>(null);

  // Filter Logic
  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      const matchSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.englishTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.formula.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.summary.toLowerCase().includes(searchQuery.toLowerCase());

      const matchPart =
        filterPart === "ALL" ||
        (filterPart === "Part 5" && (t.part === "Part 5" || t.part === "Part 5 & 6")) ||
        (filterPart === "Part 6" && (t.part === "Part 6" || t.part === "Part 5 & 6"));

      const matchScore = filterScore === "ALL" || t.targetScore === filterScore;

      const matchTab =
        activeMainTab === "topics"
          ? true
          : activeMainTab === "starred"
          ? t.bookmarked
          : activeMainTab === "progress"
          ? t.studiedCount > 0
          : true;

      return matchSearch && matchPart && matchScore && matchTab;
    });
  }, [topics, searchQuery, filterPart, filterScore, activeMainTab]);

  // Statistics
  const totalTopicsCount = topics.length;
  const studiedTopicsCount = topics.filter((t) => t.studiedCount > 0).length;
  const starredTopicsCount = topics.filter((t) => t.bookmarked).length;

  // Actions
  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTopics((prev) =>
      prev.map((t) => (t.id === id ? { ...t, bookmarked: !t.bookmarked } : t))
    );
  };

  const startTopicQuiz = (topic: GrammarTopicItem) => {
    if (topic.questions.length === 0) return;
    setActiveTopicForQuiz(topic);
    setQuizTitle(`Luyện Tập: ${topic.title} (${topic.code})`);
    setQuizQuestions(topic.questions);
    setQuizActive(true);
  };

  const startMasterQuiz = () => {
    const allQuestions: GrammarQuestionItem[] = [];
    topics.forEach((t) => allQuestions.push(...t.questions));
    if (allQuestions.length === 0) return;

    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random()).slice(0, 10);
    setActiveTopicForQuiz(null);
    setQuizTitle("Luyện Tập Ngẫu Nhiên (10 câu)");
    setQuizQuestions(shuffled);
    setQuizActive(true);
  };

  const startSelectedTopicsQuiz = () => {
    const selectedQuestions: GrammarQuestionItem[] = [];
    topics
      .filter((t) => selectedTopicIds.includes(t.id))
      .forEach((t) => selectedQuestions.push(...t.questions));
    if (selectedQuestions.length === 0) return;

    const shuffled = [...selectedQuestions].sort(() => 0.5 - Math.random());
    setActiveTopicForQuiz(null);
    setQuizTitle(`Ôn Tập ${selectedTopicIds.length} Chủ Điểm Đã Chọn (${shuffled.length} câu)`);
    setQuizQuestions(shuffled);
    setQuizActive(true);
  };

  const handleRecordResult = (topicId: string, isCorrect: boolean) => {
    setTopics((prev) =>
      prev.map((t) => {
        if (t.id === topicId) {
          return {
            ...t,
            studiedCount: t.studiedCount + 1,
            correctCount: isCorrect ? t.correctCount + 1 : t.correctCount,
            wrongCount: isCorrect ? t.wrongCount : t.wrongCount + 1,
          };
        }
        return t;
      })
    );
  };

  const handleSaveTopic = (topicData: Partial<GrammarTopicItem>) => {
    if (editTopicItem) {
      setTopics((prev) =>
        prev.map((t) => (t.id === editTopicItem.id ? { ...t, ...topicData } : t))
      );
      setEditTopicItem(null);
    } else {
      const newTopic: GrammarTopicItem = {
        id: `g-${Date.now()}`,
        code: topicData.code || `TOPIC-${Math.floor(10 + Math.random() * 90)}`,
        title: topicData.title || "",
        englishTitle: topicData.englishTitle || "",
        part: topicData.part || "Part 5",
        targetScore: topicData.targetScore || "500-750",
        status: "PUBLISHED",
        summary: topicData.summary || "",
        formula: topicData.formula || "",
        signalWords: topicData.signalWords || [],
        traps: topicData.traps || [],
        examples: topicData.examples || [],
        questions: [],
        studiedCount: 0,
        correctCount: 0,
        wrongCount: 0,
      };
      setTopics((prev) => [newTopic, ...prev]);
      setShowCreateModal(false);
    }
  };

  const handleAddQuestion = (topicId: string, question: GrammarQuestionItem) => {
    setTopics((prev) =>
      prev.map((t) => (t.id === topicId ? { ...t, questions: [...t.questions, question] } : t))
    );
  };

  const confirmDeleteTopic = () => {
    if (!deleteConfirmTopic) return;
    setTopics((prev) => prev.filter((t) => t.id !== deleteConfirmTopic.id));
    setSelectedTopicIds((prev) => prev.filter((id) => id !== deleteConfirmTopic.id));
    setDeleteConfirmTopic(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <GrammarFilterBar
        activeMainTab={activeMainTab}
        setActiveMainTab={setActiveMainTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterPart={filterPart}
        setFilterPart={setFilterPart}
        filterScore={filterScore}
        setFilterScore={setFilterScore}
        totalTopicsCount={totalTopicsCount}
        studiedTopicsCount={studiedTopicsCount}
        starredTopicsCount={starredTopicsCount}
        selectedTopicIds={selectedTopicIds}
        onOpenCreateModal={() => setShowCreateModal(true)}
        onStartMasterQuiz={startMasterQuiz}
        onStartSelectedTopicsQuiz={startSelectedTopicsQuiz}
        onBulkStar={() => {
          setTopics((prev) =>
            prev.map((t) => (selectedTopicIds.includes(t.id) ? { ...t, bookmarked: true } : t))
          );
          setSelectedTopicIds([]);
        }}
        onBulkResetProgress={() => {
          setTopics((prev) =>
            prev.map((t) =>
              selectedTopicIds.includes(t.id)
                ? { ...t, studiedCount: 0, correctCount: 0, wrongCount: 0 }
                : t
            )
          );
          setSelectedTopicIds([]);
        }}
      />

      <GrammarTopicList
        topics={filteredTopics}
        selectedTopicIds={selectedTopicIds}
        onToggleSelectTopic={(id) =>
          setSelectedTopicIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
        }
        onSelectAllTopics={() =>
          setSelectedTopicIds(
            selectedTopicIds.length === filteredTopics.length ? [] : filteredTopics.map((t) => t.id)
          )
        }
        onToggleBookmark={toggleBookmark}
        onOpenTheoryModal={setTheoryTopic}
        onStartQuiz={startTopicQuiz}
        onOpenEditTopic={setEditTopicItem}
        onOpenAddQuestion={setAddQuestionTopic}
        onOpenDeleteTopic={setDeleteConfirmTopic}
      />

      {/* Modals */}
      <GrammarTopicDetailModal
        topic={theoryTopic}
        onClose={() => setTheoryTopic(null)}
        onStartQuiz={startTopicQuiz}
      />

      <GrammarTopicEditModal
        isOpen={showCreateModal || !!editTopicItem}
        editTopic={editTopicItem}
        onClose={() => {
          setShowCreateModal(false);
          setEditTopicItem(null);
        }}
        onSave={handleSaveTopic}
      />

      <GrammarAddQuestionModal
        isOpen={!!addQuestionTopic}
        topic={addQuestionTopic}
        onClose={() => setAddQuestionTopic(null)}
        onAddQuestion={handleAddQuestion}
      />

      <GrammarDeleteModal
        deleteConfirmTopic={deleteConfirmTopic}
        onClose={() => setDeleteConfirmTopic(null)}
        onConfirm={confirmDeleteTopic}
      />

      <GrammarQuizModal
        isOpen={quizActive}
        title={quizTitle}
        questions={quizQuestions}
        onClose={() => setQuizActive(false)}
        activeTopic={activeTopicForQuiz}
        onRecordResult={handleRecordResult}
      />
    </div>
  );
}
