"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Sparkles } from "lucide-react";

import { TestItem, PracticeQuestion } from "./types";
import { SAMPLE_EXAM_QUESTIONS, INITIAL_TESTS_VOL1, INITIAL_TESTS_VOL2 } from "./mockData";

import { MockTestHeader } from "@/components/admin/content/mock-tests/MockTestHeader";
import { MockTestCardGrid } from "@/components/admin/content/mock-tests/MockTestCardGrid";
import { MockTestProgressView } from "@/components/admin/content/mock-tests/MockTestProgressView";
import { MockTestModeModal } from "@/components/admin/content/mock-tests/MockTestModeModal";
import { MockTestExamModal } from "@/components/admin/content/mock-tests/MockTestExamModal";
import { MockTestPracticeModal } from "@/components/admin/content/mock-tests/MockTestPracticeModal";
import { MockTestHistoryModal } from "@/components/admin/content/mock-tests/MockTestHistoryModal";
import { MockTestTranscriptModal } from "@/components/admin/content/mock-tests/MockTestTranscriptModal";
import { MockTestVocabModal } from "@/components/admin/content/mock-tests/MockTestVocabModal";
import { MockTestDeleteModal } from "@/components/admin/content/mock-tests/MockTestDeleteModal";
import { MockTestCreateModal } from "@/components/admin/content/mock-tests/MockTestCreateModal";

export default function AdminMockTestsPage() {
  // State quản lý tab & danh sách đề thi
  const [activeMainTab, setActiveMainTab] = useState<"study" | "progress">("study");
  const [selectedVol, setSelectedVol] = useState<"vol1" | "vol2">("vol1");
  const [testsVol1, setTestsVol1] = useState<TestItem[]>(INITIAL_TESTS_VOL1);
  const [testsVol2, setTestsVol2] = useState<TestItem[]>(INITIAL_TESTS_VOL2);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Audio helper SFX
  const playSfx = (type: "correct" | "wrong" | "incorrect" | "click") => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
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

  // State Modal chọn chế độ
  const [modeSelectionTest, setModeSelectionTest] = useState<TestItem | null>(null);
  const [selectedModeTab, setSelectedModeTab] = useState<"exam" | "practice">("practice");
  const [selectedParts, setSelectedParts] = useState<string[]>(["Part 1"]);
  const [activeExamParts, setActiveExamParts] = useState<string[]>([]);

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

  // Active Questions for Exam & Practice
  const activeExamQuestions = useMemo(() => {
    if (activeExamParts.length === 0) return SAMPLE_EXAM_QUESTIONS;
    return SAMPLE_EXAM_QUESTIONS.filter((q) => activeExamParts.includes(q.part));
  }, [activeExamParts]);

  const filteredPracticeQuestions = useMemo(() => {
    if (practicePartFilter === "ALL") return SAMPLE_EXAM_QUESTIONS;
    if (Array.isArray(practicePartFilter)) {
      return SAMPLE_EXAM_QUESTIONS.filter((q) => (practicePartFilter as string[]).includes(q.part));
    }
    return SAMPLE_EXAM_QUESTIONS.filter((q) => q.part === practicePartFilter);
  }, [practicePartFilter]);

  // Timers
  useEffect(() => {
    let timer: any;
    if (examStarted && !examSubmitted && examTimeRemaining > 0) {
      timer = setInterval(() => {
        setExamTimeRemaining((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examStarted, examSubmitted, examTimeRemaining]);

  useEffect(() => {
    let interval: any;
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
        list.map((t) => (t.id === editingTest.id ? { ...t, title: testFormTitle.trim(), volId: testFormVolId, difficulty: testFormDifficulty } : t));
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
        status: "Chưa luyện tập",
        completedAt: null,
        historyAttempts: [],
        keyVocab: [
          { word: "commence", ipa: "/kəˈmens/", pos: "v", meaning: "Bắt đầu, khởi động chương trình", example: "The test will commence at 9:00 AM sharp." },
          { word: "adhere", ipa: "/ədˈhɪr/", pos: "v", meaning: "Tuân thủ chặt chẽ theo quy định", example: "All test-takers must adhere to the examination rules." },
        ],
      };
      if (testFormVolId === "vol1") setTestsVol1((prev) => [...prev, newTest]);
      else setTestsVol2((prev) => [...prev, newTest]);
      triggerToast(`Đã thêm đề thi "${newTest.title}" thành công! 🎉`);
    }
    setShowCreateTestModal(false);
  };

  const handleConfirmDeleteTest = () => {
    if (!deleteConfirmTest) return;
    if (deleteConfirmTest.volId === "vol1") {
      setTestsVol1((prev) => prev.filter((t) => t.id !== deleteConfirmTest.id));
    } else {
      setTestsVol2((prev) => prev.filter((t) => t.id !== deleteConfirmTest.id));
    }
    triggerToast(`Đã xóa đề thi "${deleteConfirmTest.title}"! 🗑`);
    setDeleteConfirmTest(null);
  };

  const handleStartExamNow = () => {
    setExamStarted(true);
    setExamSubmitted(false);
    setExamAnswers({});
    setExamCurrentQIndex(0);
    setExamTimeRemaining(parseInt(examDurationType, 10) * 60);
    triggerToast("Bắt đầu tính giờ thi thử TOEIC! Chúc bạn làm bài tốt 🍀");
  };

  const handleSubmitExam = () => {
    let correctCount = 0;
    activeExamQuestions.forEach((q) => {
      if (examAnswers[q.id] === q.correctAnswer) correctCount++;
    });

    const totalQ = activeExamQuestions.length;
    const ratio = totalQ > 0 ? correctCount / totalQ : 0;
    const totalScore = Math.round(ratio * 990);
    const listeningScore = Math.round(totalScore * 0.52);
    const readingScore = totalScore - listeningScore;

    const result = { total: totalScore, listening: listeningScore, reading: readingScore, correctCount };
    setExamResultScore(result);
    setExamSubmitted(true);

    if (examModalTest) {
      const nowStr = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
      const newAttempt = {
        id: Date.now().toString(),
        date: `Hôm nay, ${nowStr}`,
        duration: `${Math.floor((parseInt(examDurationType, 10) * 60 - examTimeRemaining) / 60)} phút`,
        score: totalScore,
        listening: listeningScore,
        reading: readingScore,
        correctCount,
        totalCount: totalQ,
      };

      const updateList = (prevList: TestItem[]) =>
        prevList.map((t) =>
          t.id === examModalTest.id
            ? {
                ...t,
                score: totalScore,
                listeningScore,
                readingScore,
                status: `Đã làm hôm nay (${totalScore}/990)`,
                completedAt: `Hôm nay, ${nowStr}`,
                historyAttempts: [newAttempt, ...t.historyAttempts],
              }
            : t
        );

      if (examModalTest.volId === "vol1") setTestsVol1(updateList);
      else setTestsVol2(updateList);
    }

    if (isSfxEnabled) playSfx("correct");
    triggerToast(`Đã nộp bài! Bạn đạt ${totalScore}/990 điểm TOEIC 🏆`);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]/90 p-4 sm:p-6 lg:p-8 space-y-7 max-w-7xl mx-auto font-sans text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-blue-400 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span className="font-semibold text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner & Main Mode Switchers */}
      <MockTestHeader
        activeMainTab={activeMainTab}
        setActiveMainTab={setActiveMainTab}
        selectedVol={selectedVol}
        setSelectedVol={setSelectedVol}
        vol1Count={testsVol1.length}
        vol2Count={testsVol2.length}
        onOpenCreateTest={handleOpenCreateTest}
      />

      {/* Study Tab */}
      {activeMainTab === "study" && (
        <MockTestCardGrid
          tests={currentTests}
          onEditTest={handleOpenEditTest}
          onConfirmDeleteTest={setDeleteConfirmTest}
          onOpenHistory={(test) => setHistoryModalTest(test)}
          onOpenRedo={(test) => {
            setExamModalTest(test);
            handleStartExamNow();
          }}
          onOpenTranscript={(test) => setTranscriptModalTest(test)}
          onOpenVocab={(test) => setVocabModalTest(test)}
          onSelectMode={(test, mode) => {
            setModeSelectionTest(test);
            setSelectedModeTab(mode);
          }}
        />
      )}

      {/* Progress Tab */}
      {activeMainTab === "progress" && (
        <MockTestProgressView
          currentTests={currentTests}
          savedVocabBagCount={savedVocabBag.length}
          onGoToStudyTab={() => setActiveMainTab("study")}
        />
      )}

      {/* Modals */}
      {modeSelectionTest && (
        <MockTestModeModal
          test={modeSelectionTest}
          selectedModeTab={selectedModeTab}
          setSelectedModeTab={setSelectedModeTab}
          selectedParts={selectedParts}
          setSelectedParts={setSelectedParts}
          onClose={() => setModeSelectionTest(null)}
          onStartFullTest={() => {
            const target = modeSelectionTest;
            setModeSelectionTest(null);
            setActiveExamParts([]);
            setExamDurationType("120");
            setExamModalTest(target);
            handleStartExamNow();
          }}
          onStartListeningTest={() => {
            const target = modeSelectionTest;
            setModeSelectionTest(null);
            setActiveExamParts(["Part 1", "Part 2", "Part 3", "Part 4"]);
            setExamDurationType("60");
            setExamModalTest(target);
            handleStartExamNow();
          }}
          onStartReadingTest={() => {
            const target = modeSelectionTest;
            setModeSelectionTest(null);
            setActiveExamParts(["Part 5", "Part 6", "Part 7"]);
            setExamDurationType("60");
            setExamModalTest(target);
            handleStartExamNow();
          }}
          onStartPartTest={(parts) => {
            const target = modeSelectionTest;
            setModeSelectionTest(null);
            setActiveExamParts(parts);
            setExamModalTest(target);
            handleStartExamNow();
          }}
          onStartPractice={(part) => {
            const target = modeSelectionTest;
            setModeSelectionTest(null);
            setPracticePartFilter(part);
            setPracticeCurrentQIndex(0);
            setPracticeAnswers({});
            setPracticeChecked({});
            setPracticeTimerSeconds(0);
            setPracticeModalTest(target);
          }}
        />
      )}

      {examModalTest && (
        <MockTestExamModal
          test={examModalTest}
          activeExamQuestions={activeExamQuestions}
          activeExamParts={activeExamParts}
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
          filteredPracticeQuestions={filteredPracticeQuestions}
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
                t.id === testId ? { ...t, score: null, listeningScore: null, readingScore: null, status: "Chưa luyện tập", completedAt: null, historyAttempts: [] } : t
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
