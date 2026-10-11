"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  Users,
  Award,
  Clock,
  Sparkles,
  Layers,
  CheckCircle2,
} from "lucide-react";

import { TestItem, PracticeQuestion } from "./types";
import { SAMPLE_EXAM_QUESTIONS, INITIAL_TESTS_VOL1, INITIAL_TESTS_VOL2 } from "./mockData";

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

export default function AdminMockTestsPage() {
  // State quản lý tab & danh sách đề thi
  const [activeMainTab, setActiveMainTab] = useState<MockTestAdminTab>("tests");
  const [selectedVol, setSelectedVol] = useState<"vol1" | "vol2">("vol1");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("ALL");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const [testsVol1, setTestsVol1] = useState<TestItem[]>(INITIAL_TESTS_VOL1);
  const [testsVol2, setTestsVol2] = useState<TestItem[]>(INITIAL_TESTS_VOL2);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null), 2800;
    });
  };

  // Audio helper SFX
  const playSfx = (type: "correct" | "wrong" | "incorrect" | "click") => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "correct") {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === "wrong") {
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(160, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else {
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch {
      // AudioContext fallback
    }
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
  const [practicePartFilter, setPracticePartFilter] = useState<string>("ALL");
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
  const [testFormVolId, setTestFormVolId] = useState<"vol1" | "vol2">("vol1");
  const [testFormDifficulty, setTestFormDifficulty] = useState<"Khó" | "Trung bình" | "Vừa sức">("Trung bình");
  const [deleteConfirmTest, setDeleteConfirmTest] = useState<TestItem | null>(null);

  // Filtered Tests
  const currentTests = selectedVol === "vol1" ? testsVol1 : testsVol2;

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
    setTestFormTitle(`Test ${(selectedVol === "vol1" ? testsVol1.length : testsVol2.length) + 1}`);
    setTestFormVolId(selectedVol);
    setTestFormDifficulty("Trung bình");
    setShowCreateTestModal(true);
  };

  const handleOpenEditTest = (test: TestItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingTest(test);
    setTestFormTitle(test.title);
    setTestFormVolId(test.volId as "vol1" | "vol2");
    setTestFormDifficulty(test.difficulty);
    setShowCreateTestModal(true);
  };

  const handleSaveTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testFormTitle.trim()) return;

    if (editingTest) {
      const updateFn = (list: TestItem[]) =>
        list.map((t) =>
          t.id === editingTest.id
            ? {
                ...t,
                title: testFormTitle.trim(),
                volId: testFormVolId,
                difficulty: testFormDifficulty,
              }
            : t
        );
      if (editingTest.volId === "vol1") setTestsVol1(updateFn);
      else setTestsVol2(updateFn);
      triggerToast(`Đã cập nhật thông tin đề thi "${testFormTitle}"! 💾`);
    } else {
      const targetList = testFormVolId === "vol1" ? testsVol1 : testsVol2;
      const nextId = targetList.reduce((max, t) => Math.max(max, t.id), 0) + 1;
      const newTest: TestItem = {
        id: nextId,
        volId: testFormVolId,
        title: testFormTitle.trim(),
        difficulty: testFormDifficulty,
        score: null,
        listeningScore: null,
        readingScore: null,
        status: "Mới tạo - Chưa thi",
        completedAt: null,
        historyAttempts: [],
        keyVocab: [],
      };
      if (testFormVolId === "vol1") setTestsVol1((prev) => [...prev, newTest]);
      else setTestsVol2((prev) => [...prev, newTest]);
      triggerToast(`Đã thêm mới đề "${testFormTitle}" thành công! ✨`);
    }
    setShowCreateTestModal(false);
  };

  const handleConfirmDeleteTest = () => {
    if (!deleteConfirmTest) return;
    const deleteFn = (list: TestItem[]) => list.filter((t) => t.id !== deleteConfirmTest.id);
    if (deleteConfirmTest.volId === "vol1") setTestsVol1(deleteFn);
    else setTestsVol2(deleteFn);
    triggerToast(`Đã xóa đề thi "${deleteConfirmTest.title}"`);
    setDeleteConfirmTest(null);
  };

  const handleSelectMode = (test: TestItem, mode: "exam" | "practice") => {
    if (mode === "exam") {
      setExamModalTest(test);
      setExamStarted(false);
      setExamSubmitted(false);
      setExamAnswers({});
      setExamCurrentQIndex(0);
      setExamResultScore(null);
      setExamTimeRemaining(120 * 60);
    } else {
      setPracticeModalTest(test);
      setPracticeCurrentQIndex(0);
      setPracticeAnswers({});
      setPracticeChecked({});
      setPracticeTimerSeconds(0);
      setIsTimerPaused(false);
    }
  };

  const handleStartExamNow = () => {
    setExamStarted(true);
    const secs =
      examDurationType === "120" ? 120 * 60 : examDurationType === "60" ? 60 * 60 : 30 * 60;
    setExamTimeRemaining(secs);
    triggerToast("Bắt đầu tính giờ thi thử!");
  };

  const handleSubmitExam = () => {
    setExamSubmitted(true);
    let correct = 0;
    SAMPLE_EXAM_QUESTIONS.forEach((q) => {
      if (examAnswers[q.id] === q.correctAnswer) correct++;
    });

    const scaledListening = Math.min(495, Math.round((correct / SAMPLE_EXAM_QUESTIONS.length) * 490) + 10);
    const scaledReading = Math.min(495, Math.round((correct / SAMPLE_EXAM_QUESTIONS.length) * 480) + 15);
    const totalScore = scaledListening + scaledReading;

    const result = {
      total: totalScore,
      listening: scaledListening,
      reading: scaledReading,
      correctCount: correct,
    };
    setExamResultScore(result);
    playSfx("correct");

    if (examModalTest) {
      const updateFn = (list: TestItem[]) =>
        list.map((t) =>
          t.id === examModalTest.id
            ? {
                ...t,
                score: totalScore,
                listeningScore: scaledListening,
                readingScore: scaledReading,
                status: `Đã hoàn thành (${totalScore}/990)`,
                completedAt: "Vừa xong",
              }
            : t
        );
      if (examModalTest.volId === "vol1") setTestsVol1(updateFn);
      else setTestsVol2(updateFn);
    }
    triggerToast("Đã nộp bài và hoàn thành chấm điểm! 🎉");
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleExportCsv = () => {
    const headers = ["ID", "Tên đề thi", "Bộ sưu tập", "Độ khó", "Điểm TB", "Trạng thái"];
    const rows = [...testsVol1, ...testsVol2].map((t) => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.volId}"`,
      `"${t.difficulty}"`,
      t.score || 650,
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
        onOpenCreateTest={handleOpenCreateTest}
        onExportCsv={handleExportCsv}
      />

      {/* Main Tab Content Switching */}
      {activeMainTab === "tests" && (
        <MockTestCardGrid
          tests={filteredCurrentTests}
          viewMode={viewMode}
          onEditTest={handleOpenEditTest}
          onConfirmDeleteTest={setDeleteConfirmTest}
          onOpenTranscript={setTranscriptModalTest}
          onOpenVocab={setVocabModalTest}
          onSelectMode={handleSelectMode}
        />
      )}

      {activeMainTab === "submissions" && (
        <MockTestSubmissionsView tests={[...testsVol1, ...testsVol2]} />
      )}

      {activeMainTab === "score_conversion" && (
        <MockTestScoreConversionView />
      )}

      {activeMainTab === "collections" && (
        <MockTestCollectionsView
          vol1Count={testsVol1.length}
          vol2Count={testsVol2.length}
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
          activeExamQuestions={SAMPLE_EXAM_QUESTIONS}
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
          filteredPracticeQuestions={SAMPLE_EXAM_QUESTIONS}
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
          questions={SAMPLE_EXAM_QUESTIONS}
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
          onSaveTest={handleSaveTest}
          onClose={() => setShowCreateTestModal(false)}
        />
      )}
    </div>
  );
}
