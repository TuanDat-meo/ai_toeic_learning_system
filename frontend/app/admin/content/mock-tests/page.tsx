"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { playUnifiedAnswerSound } from "@/lib/sound";
import { TestItem, PracticeQuestion, normalizeToeicPart } from "./types";
import {
  createMockTest,
  deleteMockTest,
  fetchMockTests,
  fetchMockTestQuestions,
  MockTestInput,
  updateMockTest,
} from "@/lib/api/mockTests";

import {
  MockTestHeader,
  MockTestAdminTab,
} from "@/components/admin/content/mock-tests/MockTestHeader";
import { MockTestCardGrid } from "@/components/admin/content/mock-tests/MockTestCardGrid";
import {
  MockTestSubmissionsView,
  MockTestScoreConversionView,
  MockTestCollectionsView,
} from "@/components/admin/content/mock-tests/MockTestViews";
import { MockTestExamModal } from "@/components/admin/content/mock-tests/MockTestExamModal";
import { MockTestPracticeModal } from "@/components/admin/content/mock-tests/MockTestPracticeModal";
import { MockTestHistoryModal } from "@/components/admin/content/mock-tests/MockTestHistoryModal";
import { MockTestTranscriptModal } from "@/components/admin/content/mock-tests/MockTestTranscriptModal";
import { MockTestVocabModal } from "@/components/admin/content/mock-tests/MockTestVocabModal";
import { MockTestDeleteModal } from "@/components/admin/content/mock-tests/MockTestDeleteModal";
import { MockTestCreateModal } from "@/components/admin/content/mock-tests/MockTestCreateModal";

function normalizeVolumeId(volId?: string): "vol1" | "vol2" | "vol3" {
  if (volId === "vol2" || volId === "ets2023") return "vol2";
  if (volId === "vol3" || volId === "ets2022") return "vol3";
  return "vol1";
}

export default function AdminMockTestsPage() {
  // State quản lý tab & danh sách đề thi
  const [activeMainTab, setActiveMainTab] = useState<MockTestAdminTab>("tests");
  const [selectedVol, setSelectedVol] = useState<"all" | "vol1" | "vol2" | "vol3">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("ALL");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const [testsVol1, setTestsVol1] = useState<TestItem[]>([]);
  const [testsVol2, setTestsVol2] = useState<TestItem[]>([]);
  const [testsVol3, setTestsVol3] = useState<TestItem[]>([]);
  const [activeExamQuestions, setActiveExamQuestions] = useState<PracticeQuestion[]>([]);
  const [activePracticeQuestions, setActivePracticeQuestions] = useState<PracticeQuestion[]>([]);
  const [activeTranscriptQuestions, setActiveTranscriptQuestions] = useState<PracticeQuestion[]>([]);
  const [isLoadingTests, setIsLoadingTests] = useState(true);
  const [testLoadError, setTestLoadError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const refreshTests = useCallback(async () => {
    setIsLoadingTests(true);
    try {
      const data = await fetchMockTests();
      setTestsVol1(data.filter((test) => normalizeVolumeId(test.volId) === "vol1"));
      setTestsVol2(data.filter((test) => normalizeVolumeId(test.volId) === "vol2"));
      setTestsVol3(data.filter((test) => normalizeVolumeId(test.volId) === "vol3"));
      setTestLoadError(null);
    } catch (error) {
      setTestLoadError(error instanceof Error ? error.message : "Không thể tải danh sách đề thi.");
    } finally {
      setIsLoadingTests(false);
    }
  }, []);

  const loadQuestionsForTest = async (testId: number): Promise<PracticeQuestion[]> => {
    try {
      return await fetchMockTestQuestions(testId);
    } catch (err) {
      console.warn("Could not load questions for test:", testId, err);
      triggerToast("Không thể tải câu hỏi từ máy chủ.");
      return [];
    }
  };

  useEffect(() => {
    void refreshTests();
  }, [refreshTests]);


  // Toast notification
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(null), 2800);
  };

  // Audio helper SFX
  const playSfx = (_type?: string) => {
    playUnifiedAnswerSound();
  };

  // State Thi thử (Exam Mode)
  const [examModalTest, setExamModalTest] = useState<TestItem | null>(null);
  const [examDurationType, setExamDurationType] = useState<"120" | "60" | "30">("120");
  const [examStarted, setExamStarted] = useState(false);
  const [examTimeRemaining, setExamTimeRemaining] = useState(120 * 60);
  const [examAnswers, setExamAnswers] = useState<{ [qId: number]: string }>({});
  const [examCurrentQIndex, setExamCurrentQIndex] = useState(0);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examResultScore, setExamResultScore] = useState<{
    total: number;
    listening: number;
    reading: number;
    correctCount: number;
  } | null>(null);

  // State Luyện tập (Practice Mode)
  const [practiceModalTest, setPracticeModalTest] = useState<TestItem | null>(null);
  const [practiceCurrentQIndex, setPracticeCurrentQIndex] = useState(0);
  const [practiceAnswers, setPracticeAnswers] = useState<{ [qId: number]: string }>({});
  const [practiceChecked, setPracticeChecked] = useState<{ [qId: number]: boolean }>({});
  const [isSfxEnabled, setIsSfxEnabled] = useState(true);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isDictationMode, setIsDictationMode] = useState(false);
  const [isFlipCardMode, setIsFlipCardMode] = useState(false);
  const [isAutoPlayNext, setIsAutoPlayNext] = useState(true);
  const [practiceUserNotes, setPracticeUserNotes] = useState<{ [qId: number]: string }>({});
  const [isAnnotatorActive, setIsAnnotatorActive] = useState(false);
  const [annotatorColor, setAnnotatorColor] = useState<"yellow" | "green" | "pink" | "blue">("yellow");
  const [practiceTimerSeconds, setPracticeTimerSeconds] = useState(0);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [isQuestionGridOpen, setIsQuestionGridOpen] = useState(false);
  const [showDetailedExplanation, setShowDetailedExplanation] = useState(true);
  const [showVocabSection, setShowVocabSection] = useState(true);
  const [isVocabExpanded, setIsVocabExpanded] = useState(false);
  const [showBilingualPassage, setShowBilingualPassage] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);

  // Modals khác
  const [historyModalTest, setHistoryModalTest] = useState<TestItem | null>(null);
  const [transcriptModalTest, setTranscriptModalTest] = useState<TestItem | null>(null);
  const [vocabModalTest, setVocabModalTest] = useState<TestItem | null>(null);
  const [savedVocabBag, setSavedVocabBag] = useState<string[]>([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showCreateTestModal, setShowCreateTestModal] = useState(false);
  const [editingTest, setEditingTest] = useState<TestItem | null>(null);
  const [testFormTitle, setTestFormTitle] = useState("");
  const [testFormVolId, setTestFormVolId] = useState<"vol1" | "vol2" | "vol3">("vol1");
  const [testFormDifficulty, setTestFormDifficulty] = useState<"Dễ" | "Khó" | "Trung bình" | "Vừa sức">("Trung bình");
  const [testFormDescription, setTestFormDescription] = useState("");
  const [testFormDuration, setTestFormDuration] = useState<number>(120);
  const [testFormStatus, setTestFormStatus] = useState<string>("PUBLISHED");
  const [deleteConfirmTest, setDeleteConfirmTest] = useState<TestItem | null>(null);

  // Filtered Tests (hỗ trợ "all" hiển thị toàn bộ cả 3 bộ đề 2024, 2023, 2022)
  const currentTests = useMemo(() => {
    if (selectedVol === "vol1") return testsVol1;
    if (selectedVol === "vol2") return testsVol2;
    if (selectedVol === "vol3") return testsVol3;
    return [...testsVol1, ...testsVol2, ...testsVol3];
  }, [selectedVol, testsVol1, testsVol2, testsVol3]);

  const filteredCurrentTests = useMemo(() => {
    return currentTests.filter((t) => {
      const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDiff = filterDifficulty === "ALL" || t.difficulty === filterDifficulty;
      return matchSearch && matchDiff;
    });
  }, [currentTests, searchQuery, filterDifficulty]);

  // Timers
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (examStarted && !examSubmitted && examTimeRemaining > 0) {
      timer = setInterval(() => {
        setExamTimeRemaining((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examStarted, examSubmitted, examTimeRemaining]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (practiceModalTest && !isTimerPaused) {
      interval = setInterval(() => {
        setPracticeTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [practiceModalTest, isTimerPaused]);

  // Handlers
  const handleOpenCreateTest = () => {
    setEditingTest(null);
    setTestFormTitle("");
    setTestFormVolId(selectedVol === "all" ? "vol1" : selectedVol);
    setTestFormDifficulty("Trung bình");
    setTestFormDescription("");
    setTestFormDuration(120);
    setTestFormStatus("PUBLISHED");
    setShowCreateTestModal(true);
  };

  const handleOpenEditTest = (test: TestItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingTest(test);
    setTestFormTitle(test.title);
    setTestFormVolId(normalizeVolumeId(test.volId));
    setTestFormDifficulty((test.difficulty as "Dễ" | "Khó" | "Trung bình" | "Vừa sức") || "Trung bình");
    setTestFormDescription(test.description || "");
    setTestFormDuration(test.durationMinutes || 120);
    setTestFormStatus(test.status === "DRAFT" || test.status === "Bản nháp" ? "DRAFT" : "PUBLISHED");
    setShowCreateTestModal(true);
  };

  const toTestInput = (): MockTestInput => ({
    volId: testFormVolId,
    title: testFormTitle.trim(),
    difficulty: testFormDifficulty,
    description: testFormDescription.trim(),
    durationMinutes: testFormDuration,
    status: testFormStatus === "DRAFT" ? "DRAFT" : "PUBLISHED",
  });

  const handleToggleTestStatus = async (test: TestItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isCurrentlyDraft = test.status === "DRAFT" || test.status === "Bản nháp";
    const newStatus = isCurrentlyDraft ? "PUBLISHED" : "DRAFT";
    try {
      await updateMockTest(test.id, {
        volId: normalizeVolumeId(test.volId),
        title: test.title,
        difficulty: test.difficulty || "Trung bình",
        description: test.description || "",
        durationMinutes: test.durationMinutes || 120,
        status: newStatus,
        keyVocab: test.keyVocab || [],
      });
      await refreshTests();
      triggerToast(newStatus === "PUBLISHED"
        ? `Đã xuất bản đề "${test.title}" cho học viên.`
        : `Đã chuyển đề "${test.title}" về bản nháp.`);
    } catch (error) {
      triggerToast(error instanceof Error ? error.message : "Không thể cập nhật trạng thái đề thi.");
    }
  };

  const handleSaveTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testFormTitle.trim()) {
      triggerToast("Vui lòng nhập tên đề thi thử.");
      return;
    }
    if (!testFormDescription.trim()) {
      triggerToast("Vui lòng nhập mô tả / hướng dẫn cho đề thi.");
      return;
    }
    try {
      const input = toTestInput();
      if (editingTest) await updateMockTest(editingTest.id, input);
      else await createMockTest(input);
      await refreshTests();
      triggerToast(editingTest ? "Đã cập nhật đề thi." : "Đã tạo đề thi.");
      setShowCreateTestModal(false);
    } catch (error) {
      triggerToast(error instanceof Error ? error.message : "Không thể lưu đề thi.");
    }
  };

  const handleConfirmDeleteTest = async () => {
    if (!deleteConfirmTest) return;
    try {
      await deleteMockTest(deleteConfirmTest.id);
      await refreshTests();
      triggerToast(`Đã xóa đề thi "${deleteConfirmTest.title}".`);
      setDeleteConfirmTest(null);
    } catch (error) {
      triggerToast(error instanceof Error ? error.message : "Không thể xóa đề thi.");
    }
  };

  const handleSelectMode = async (test: TestItem, mode: "exam" | "practice") => {
    triggerToast(`Đang tải câu hỏi đề ${test.title}...`);
    const qs = await loadQuestionsForTest(test.id);
    if (qs.length === 0) {
      triggerToast("Đề thi này hiện chưa có câu hỏi.");
      return;
    }
    if (mode === "exam") {
      setActiveExamQuestions(qs);
      setExamModalTest(test);
      setExamStarted(false);
      setExamSubmitted(false);
      setExamAnswers({});
      setExamCurrentQIndex(0);
      setExamResultScore(null);
      setExamTimeRemaining(120 * 60);
    } else {
      setActivePracticeQuestions(qs);
      setPracticeModalTest(test);
      setPracticeCurrentQIndex(0);
      setPracticeAnswers({});
      setPracticeChecked({});
      setPracticeTimerSeconds(0);
      setIsTimerPaused(false);
    }
  };

  const handleOpenTranscript = async (test: TestItem) => {
    triggerToast(`Đang tải lời giải chi tiết đề ${test.title}...`);
    const qs = await loadQuestionsForTest(test.id);
    if (qs.length === 0) {
      triggerToast("Đề thi này hiện chưa có câu hỏi.");
      return;
    }
    setActiveTranscriptQuestions(qs);
    setTranscriptModalTest(test);
  };

  const handleStartExamNow = (_customParts?: string[], customMinutes?: number) => {
    setExamStarted(true);
    const secs = customMinutes
      ? customMinutes * 60
      : examDurationType === "120"
        ? 120 * 60
        : examDurationType === "60"
          ? 60 * 60
          : 30 * 60;
    setExamTimeRemaining(secs);
    setExamSubmitted(false);
    setExamAnswers({});
    setExamCurrentQIndex(0);
    setExamResultScore(null);
    triggerToast("Bắt đầu tính giờ thi thử!");
  };

  const handleSubmitExam = (effectiveQuestions?: PracticeQuestion[]) => {
    const questionsToGrade = effectiveQuestions ?? activeExamQuestions;
    if (questionsToGrade.length === 0) {
      triggerToast("Đề thi chưa có câu hỏi để chấm.");
      return;
    }
    setExamSubmitted(true);
    let correct = 0;
    let correctLC = 0;
    let correctRC = 0;
    questionsToGrade.forEach((q) => {
      if (examAnswers[q.id] === q.correctAnswer) {
        correct++;
        const isListening = ["Part 1", "Part 2", "Part 3", "Part 4"].includes(normalizeToeicPart(q.part));
        if (isListening) correctLC++;
        else correctRC++;
      }
    });

    // Mỗi câu làm đúng là 5 điểm
    const scaledListening = correctLC * 5;
    const scaledReading = correctRC * 5;
    const totalScore = correct * 5;

    const result = {
      total: totalScore,
      listening: scaledListening,
      reading: scaledReading,
      correctCount: correct,
    };
    setExamResultScore(result);
    playSfx("correct");

    triggerToast("Đã nộp bài và hoàn thành chấm điểm! 🎉");
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleExportCsv = () => {
    const headers = ["ID", "Tên đề thi", "Bộ sưu tập", "Độ khó", "Điểm TB", "Trạng thái"];
    const rows = [...testsVol1, ...testsVol2, ...testsVol3].map((t) => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.volId}"`,
      `"${t.difficulty}"`,
      t.avgScore ? Math.round(t.avgScore) : (t.score || 0),
      `"PUBLISHED"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `toeic_mock_tests_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {toastMessage && <div role="status" className="fixed right-6 top-6 z-[100] rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg">{toastMessage}</div>}
      {/* Header and Filter Toolbar */}
      <MockTestHeader
        activeMainTab={activeMainTab}
        setActiveMainTab={setActiveMainTab}
        selectedVol={selectedVol}
        setSelectedVol={setSelectedVol}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterDifficulty={filterDifficulty}
        setFilterDifficulty={setFilterDifficulty}
        viewMode={viewMode}
        setViewMode={setViewMode}
        vol1Count={testsVol1.length}
        vol2Count={testsVol2.length}
        vol3Count={testsVol3.length}
        onOpenCreateTest={handleOpenCreateTest}
        onExportCsv={handleExportCsv}
      />

      {/* Main Tab Content Switching */}
      {activeMainTab === "tests" && (
        <>
          {testLoadError && (
            <div role="alert" className="flex items-center justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <span>{testLoadError}</span>
              <button type="button" onClick={() => void refreshTests()} className="font-bold underline">Thử lại</button>
            </div>
          )}
          {isLoadingTests && currentTests.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">Đang tải danh sách đề thi...</div>
          ) : (
            <MockTestCardGrid
              tests={filteredCurrentTests}
              viewMode={viewMode}
              onEditTest={handleOpenEditTest}
              onConfirmDeleteTest={setDeleteConfirmTest}
              onOpenTranscript={handleOpenTranscript}
              onOpenVocab={setVocabModalTest}
              onSelectMode={handleSelectMode}
              onToggleStatus={handleToggleTestStatus}
            />
          )}
        </>
      )}

      {activeMainTab === "submissions" && (
        <MockTestSubmissionsView tests={[...testsVol1, ...testsVol2, ...testsVol3]} />
      )}

      {activeMainTab === "score_conversion" && (
        <MockTestScoreConversionView />
      )}

      {activeMainTab === "collections" && (
        <MockTestCollectionsView
          vol1Count={testsVol1.length}
          vol2Count={testsVol2.length}
          vol3Count={testsVol3.length}
          onNavigateToTests={(volId) => {
            setSelectedVol(volId);
            setActiveMainTab("tests");
          }}
        />
      )}

      {/* Modals */}
      {examModalTest && (
        <MockTestExamModal
          test={examModalTest}
          activeExamQuestions={activeExamQuestions}
          activeExamParts={[]}
          examDurationType={examDurationType}
          setExamDurationType={setExamDurationType}
          examStarted={examStarted}
          examTimeRemaining={examTimeRemaining}
          examAnswers={examAnswers}
          setExamAnswers={setExamAnswers}
          examCurrentQIndex={examCurrentQIndex}
          setExamCurrentQIndex={setExamCurrentQIndex}
          examSubmitted={examSubmitted}
          examResultScore={examResultScore}
          isSfxEnabled={isSfxEnabled}
          setIsSfxEnabled={setIsSfxEnabled}
          isPlayingAudio={isPlayingAudio}
          setIsPlayingAudio={setIsPlayingAudio}
          playSfx={playSfx}
          triggerToast={triggerToast}
          formatTime={formatTime}
          onClose={() => setExamModalTest(null)}
          onStartExamNow={handleStartExamNow}
          onSubmitExam={handleSubmitExam}
          onOpenQuestionGrid={() => setIsQuestionGridOpen(true)}
        />
      )}

      {practiceModalTest && (
        <MockTestPracticeModal
          test={practiceModalTest}
          filteredPracticeQuestions={activePracticeQuestions}
          practiceCurrentQIndex={practiceCurrentQIndex}
          setPracticeCurrentQIndex={setPracticeCurrentQIndex}
          practiceAnswers={practiceAnswers}
          setPracticeAnswers={setPracticeAnswers}
          practiceChecked={practiceChecked}
          setPracticeChecked={setPracticeChecked}
          showBilingualPassage={showBilingualPassage}
          setShowBilingualPassage={setShowBilingualPassage}
          showEvidence={showEvidence}
          setShowEvidence={setShowEvidence}
          isNotesModalOpen={isNotesModalOpen}
          setIsNotesModalOpen={setIsNotesModalOpen}
          practiceUserNotes={practiceUserNotes}
          setPracticeUserNotes={setPracticeUserNotes}
          isAnnotatorActive={isAnnotatorActive}
          setIsAnnotatorActive={setIsAnnotatorActive}
          annotatorColor={annotatorColor}
          setAnnotatorColor={setAnnotatorColor}
          isDictationMode={isDictationMode}
          setIsDictationMode={setIsDictationMode}
          isFlipCardMode={isFlipCardMode}
          setIsFlipCardMode={setIsFlipCardMode}
          isAutoPlayNext={isAutoPlayNext}
          setIsAutoPlayNext={setIsAutoPlayNext}
          isSfxEnabled={isSfxEnabled}
          setIsSfxEnabled={setIsSfxEnabled}
          isTimerPaused={isTimerPaused}
          setIsTimerPaused={setIsTimerPaused}
          practiceTimerSeconds={practiceTimerSeconds}
          isQuestionGridOpen={isQuestionGridOpen}
          setIsQuestionGridOpen={setIsQuestionGridOpen}
          showDetailedExplanation={showDetailedExplanation}
          setShowDetailedExplanation={setShowDetailedExplanation}
          showVocabSection={showVocabSection}
          setShowVocabSection={setShowVocabSection}
          isVocabExpanded={isVocabExpanded}
          setIsVocabExpanded={setIsVocabExpanded}
          isPlayingAudio={isPlayingAudio}
          setIsPlayingAudio={setIsPlayingAudio}
          playSfx={playSfx}
          triggerToast={triggerToast}
          onClose={() => setPracticeModalTest(null)}
        />
      )}

      {historyModalTest && (
        <MockTestHistoryModal
          test={historyModalTest}
          onClose={() => setHistoryModalTest(null)}
          onClearHistory={(testId) => {
            const clearFn = (prev: TestItem[]) =>
              prev.map((t) =>
                t.id === testId
                  ? {
                    ...t,
                    score: null,
                    listeningScore: null,
                    readingScore: null,
                    status: "Chưa luyện tập",
                    completedAt: null,
                    historyAttempts: [],
                  }
                  : t
              );
            if (historyModalTest.volId === "vol1") setTestsVol1(clearFn);
            else setTestsVol2(clearFn);
            triggerToast(`Đã xóa lịch sử làm bài của "${historyModalTest.title}"`);
            setHistoryModalTest(null);
          }}
        />
      )}

      {transcriptModalTest && (
        <MockTestTranscriptModal
          test={transcriptModalTest}
          questions={activeTranscriptQuestions}
          onClose={() => setTranscriptModalTest(null)}
        />
      )}

      {vocabModalTest && (
        <MockTestVocabModal
          test={vocabModalTest}
          savedVocabBag={savedVocabBag}
          onToggleSaveVocab={(word) => {
            if (savedVocabBag.includes(word)) {
              setSavedVocabBag((prev) => prev.filter((w) => w !== word));
              triggerToast(`Đã bỏ từ "${word}" khỏi giỏ từ!`);
            } else {
              setSavedVocabBag((prev) => [...prev, word]);
              triggerToast(`Đã thêm từ "${word}" vào giỏ từ vựng! 🔖`);
            }
          }}
          onClose={() => setVocabModalTest(null)}
        />
      )}

      {deleteConfirmTest && (
        <MockTestDeleteModal
          test={deleteConfirmTest}
          onClose={() => setDeleteConfirmTest(null)}
          onConfirmDelete={handleConfirmDeleteTest}
        />
      )}

      {showCreateTestModal && (
        <MockTestCreateModal
          editingTest={editingTest}
          testFormTitle={testFormTitle}
          setTestFormTitle={setTestFormTitle}
          testFormVolId={testFormVolId}
          setTestFormVolId={setTestFormVolId}
          testFormDifficulty={testFormDifficulty}
          setTestFormDifficulty={setTestFormDifficulty}
          testFormDescription={testFormDescription}
          setTestFormDescription={setTestFormDescription}
          testFormDuration={testFormDuration}
          setTestFormDuration={setTestFormDuration}
          testFormStatus={testFormStatus}
          setTestFormStatus={setTestFormStatus}
          onSaveTest={handleSaveTest}
          onClose={() => setShowCreateTestModal(false)}
        />
      )}
    </div>
  );
}
