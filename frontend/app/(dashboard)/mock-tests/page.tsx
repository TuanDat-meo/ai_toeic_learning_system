"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Sparkles } from "lucide-react";
import { MockTest, MockTestQuestion, TestItem, PracticeQuestion, normalizeToeicPart } from "@/app/admin/content/mock-tests/types";
import { fetchMockTests, fetchMockTestQuestions, submitMockTestAttempt } from "@/lib/api/mockTests";
import { SAMPLE_EXAM_QUESTIONS, INITIAL_TESTS_VOL1, INITIAL_TESTS_VOL2, INITIAL_TESTS_VOL3 } from "@/app/admin/content/mock-tests/mockData";
import { StudentMockTestCardGrid } from "@/components/student/mock-tests/StudentMockTestCardGrid";
import { MockTestExamModal } from "@/components/admin/content/mock-tests/MockTestExamModal";
import { MockTestPracticeModal } from "@/components/admin/content/mock-tests/MockTestPracticeModal";
import { MockTestTranscriptModal } from "@/components/admin/content/mock-tests/MockTestTranscriptModal";
import { MockTestVocabModal } from "@/components/admin/content/mock-tests/MockTestVocabModal";
import { LearningQuotaBadge } from "@/components/student/billing/LearningQuotaBadge";
import { consumeLearningFeature } from "@/lib/api/billing";
import { MockTestHistoryModal } from "@/components/admin/content/mock-tests/MockTestHistoryModal";
import { getItemProgress, getRedoWrongQuestions, saveItemProgress } from "@/lib/practiceProgress";
import { logStudySession } from "@/lib/studyTracker";
import { playUnifiedAnswerSound } from "@/lib/sound";

export default function StudentMockTestsPage() {
  const [selectedVol, setSelectedVol] = useState<"vol1" | "vol2" | "vol3">("vol1");
  const [testsVol1, setTestsVol1] = useState<TestItem[]>(INITIAL_TESTS_VOL1);
  const [testsVol2, setTestsVol2] = useState<TestItem[]>(INITIAL_TESTS_VOL2);
  const [testsVol3, setTestsVol3] = useState<TestItem[]>(INITIAL_TESTS_VOL3);
  const [activeExamQuestions, setActiveExamQuestions] = useState<PracticeQuestion[]>(SAMPLE_EXAM_QUESTIONS);
  const [activePracticeQuestions, setActivePracticeQuestions] = useState<PracticeQuestion[]>(SAMPLE_EXAM_QUESTIONS);
  const [activeTranscriptQuestions, setActiveTranscriptQuestions] = useState<PracticeQuestion[]>(SAMPLE_EXAM_QUESTIONS);

  const rawCurrentTests = selectedVol === "vol1" ? testsVol1 : selectedVol === "vol2" ? testsVol2 : testsVol3;
  // CHỈ HIỂN THỊ CÁC ĐỀ THI ĐÃ XUẤT BẢN / PHÁT HÀNH CHO HỌC VIÊN
  const currentTests = useMemo(() => {
    return rawCurrentTests.filter((t) => t.status !== "DRAFT" && t.status !== "Bản nháp");
  }, [rawCurrentTests]);

  const loadTests = useCallback(async () => {
    if (typeof window !== "undefined") {
      try {
        const r1 = localStorage.getItem("toeic_mock_tests_v1");
        const r2 = localStorage.getItem("toeic_mock_tests_v2");
        const r3 = localStorage.getItem("toeic_mock_tests_v3");
        let foundLocal = false;
        if (r1) { const p1 = JSON.parse(r1); if (Array.isArray(p1) && p1.length > 0) { setTestsVol1(p1); foundLocal = true; } }
        if (r2) { const p2 = JSON.parse(r2); if (Array.isArray(p2) && p2.length > 0) { setTestsVol2(p2); foundLocal = true; } }
        if (r3) { const p3 = JSON.parse(r3); if (Array.isArray(p3) && p3.length > 0) { setTestsVol3(p3); foundLocal = true; } }
        if (foundLocal) return;
      } catch {}
    }

    try {
      const data = await fetchMockTests();
      if (data && data.length > 0) {
        const v1 = data.filter((t) => t.volId === "ets2024" || t.volId === "vol1");
        const v2 = data.filter((t) => t.volId === "ets2023" || t.volId === "vol2");
        const v3 = data.filter((t) => t.volId === "ets2022" || t.volId === "vol3");
        if (v1.length > 0) setTestsVol1(v1);
        if (v2.length > 0) setTestsVol2(v2);
        if (v3.length > 0) setTestsVol3(v3);
      }
    } catch (err) {
      console.warn("Could not load mock tests from API:", err);
    }
  }, []);

  useEffect(() => {
    loadTests();
    const handleSync = () => { loadTests(); };
    window.addEventListener("toeic-mock-tests-updated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("toeic-mock-tests-updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [loadTests]);


  // State Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  // Sound Effects Synthesizer
  const playSfx = (_type?: string) => {
    playUnifiedAnswerSound();
  };

  const playPracticeSfx = (_type?: string) => {
    playUnifiedAnswerSound();
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
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

  useEffect(() => {
    const isTaking = Boolean(examModalTest && examStarted && !examSubmitted);
    window.dispatchEvent(new CustomEvent('toeic:mock-exam-state', { detail: { isTaking } }));
    return () => {
      window.dispatchEvent(new CustomEvent('toeic:mock-exam-state', { detail: { isTaking: false } }));
    };
  }, [examModalTest, examStarted, examSubmitted]);

  // State Luyện tập từng phần (Practice Mode)
  const [practiceModalTest, setPracticeModalTest] = useState<TestItem | null>(null);
  const [practiceCurrentQIndex, setPracticeCurrentQIndex] = useState(0);
  const [practiceAnswers, setPracticeAnswers] = useState<{ [qId: number]: string }>({});
  const [practiceChecked, setPracticeChecked] = useState<{ [qId: number]: boolean }>({});
  const [showBilingualPassage, setShowBilingualPassage] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [practiceUserNotes, setPracticeUserNotes] = useState<{ [qId: number]: string }>({});
  const [isAnnotatorActive, setIsAnnotatorActive] = useState(false);
  const [annotatorColor, setAnnotatorColor] = useState<"yellow" | "green" | "pink" | "blue">("yellow");
  const [isDictationMode, setIsDictationMode] = useState(false);
  const [isFlipCardMode, setIsFlipCardMode] = useState(false);
  const [isAutoPlayNext, setIsAutoPlayNext] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [practiceTimerSeconds, setPracticeTimerSeconds] = useState(0);
  const [isQuestionGridOpen, setIsQuestionGridOpen] = useState(false);
  const [showDetailedExplanation, setShowDetailedExplanation] = useState(false);
  const [showVocabSection, setShowVocabSection] = useState(false);
  const [isVocabExpanded, setIsVocabExpanded] = useState(false);

  // Modals Transcript & Từ vựng & Lịch sử
  const [transcriptModalTest, setTranscriptModalTest] = useState<TestItem | null>(null);
  const [vocabModalTest, setVocabModalTest] = useState<TestItem | null>(null);
  const [historyModalTest, setHistoryModalTest] = useState<TestItem | null>(null);
  const [savedVocabBag, setSavedVocabBag] = useState<string[]>([]);

  // Audio state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isSfxEnabled, setIsSfxEnabled] = useState(true);

  // Timer đồng hồ đếm ngược khi thi thử
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (examStarted && !examSubmitted && examTimeRemaining > 0) {
      timer = setInterval(() => {
        setExamTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examStarted, examSubmitted, examTimeRemaining]);

  // ✅ FIX 3: Timer đếm giờ cho Practice Mode — đồng hồ chạy đúng
  React.useEffect(() => {
    let practiceTimer: NodeJS.Timeout;
    if (practiceModalTest && !isTimerPaused) {
      practiceTimer = setInterval(() => {
        setPracticeTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(practiceTimer);
  }, [practiceModalTest, isTimerPaused]);

  const handleStartExamNow = async (_customParts?: string[], customMinutes?: number) => {
    const mins = customMinutes ?? parseInt(examDurationType, 10);
    try {
      await consumeLearningFeature("MOCK_TEST_EXAM");
      setExamTimeRemaining(mins * 60);
      setExamStarted(true);
      setExamSubmitted(false);
      setExamAnswers({});
      setExamCurrentQIndex(0);
      setExamResultScore(null);
    } catch (error) {
      triggerToast(error instanceof Error ? error.message : "Không thể bắt đầu thi thử.");
    }
  };

  const handleOpenPractice = async (test: TestItem) => {
    try {
      await consumeLearningFeature("MOCK_TEST_PRACTICE");
      setPracticeModalTest(test);
      setPracticeCurrentQIndex(0);
      setPracticeAnswers({});
      setPracticeChecked({});
      setPracticeTimerSeconds(0);
    } catch (error) {
      triggerToast(error instanceof Error ? error.message : "Không thể bắt đầu luyện tập.");
    }
  };

  const handleSubmitExam = async (effectiveQuestions?: PracticeQuestion[]) => {
    setExamSubmitted(true);
    const questionsToGrade = effectiveQuestions && effectiveQuestions.length > 0 ? effectiveQuestions : SAMPLE_EXAM_QUESTIONS;
    let correct = 0;
    let correctLC = 0;
    let correctRC = 0;
    const wrongQuestionIds: (string | number)[] = [];
    const answeredQuestionIds: (string | number)[] = [];
    questionsToGrade.forEach((q) => {
      const userAns = examAnswers[q.id];
      if (userAns !== undefined && userAns !== null && userAns !== "") {
        answeredQuestionIds.push(q.id);
        if (userAns === q.correctAnswer) {
          correct += 1;
          const isListening = ["Part 1", "Part 2", "Part 3", "Part 4"].includes(normalizeToeicPart(q.part));
          if (isListening) correctLC++;
          else correctRC++;
        } else {
          wrongQuestionIds.push(q.id);
        }
      }
    });

    // Mỗi câu làm đúng là 5 điểm
    const estLC = correctLC * 5;
    const estRC = correctRC * 5;
    const estTotal = correct * 5;

    const wrongCount = wrongQuestionIds.length;
    const answeredCount = answeredQuestionIds.length;
    const totalCount = questionsToGrade.length || 200;

    setExamResultScore({
      total: estTotal,
      listening: estLC,
      reading: estRC,
      correctCount: correct,
    });

    if (examModalTest) {
      saveItemProgress(
        `mock-test-${examModalTest.id}`,
        answeredCount,
        totalCount,
        estTotal,
        correct,
        wrongCount,
        wrongQuestionIds,
        undefined,
        answeredQuestionIds
      );
      const durationSec = examDurationType === "120"
        ? Math.max(1, 120 * 60 - examTimeRemaining)
        : examDurationType === "60"
        ? Math.max(1, 60 * 60 - examTimeRemaining)
        : Math.max(1, 30 * 60 - examTimeRemaining);

      const durationMin = Math.max(1, Math.round(durationSec / 60));
      try {
        logStudySession(durationMin, 1);
      } catch {}

      void submitMockTestAttempt({
        testId: examModalTest.id,
        testTitle: examModalTest.title,
        volId: examModalTest.volId,
        score: estTotal,
        listeningScore: estLC,
        readingScore: estRC,
        correctCount: correct,
        totalCount: questionsToGrade.length,
        durationSeconds: durationSec,
      });
    }

    triggerToast(`Đã nộp bài! Bạn đạt ${estTotal}/${questionsToGrade.length * 5} điểm (${correct}/${questionsToGrade.length} câu đúng - 5 điểm/câu). Kết quả đã gửi qua Admin!`);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Toast thông báo */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900/95 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-3">
          {toastMessage}
        </div>
      )}

      {/* Header chuẩn phong cách tối giản, sạch sẽ như Admin */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
        <div>
          <p className="text-xs font-medium text-slate-400">
            Trang chủ <span className="px-1.5">/</span> Lộ trình TOEIC <span className="px-1.5">/</span>{" "}
            <span className="font-semibold text-blue-700">Thi thử trực tuyến</span>
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 md:text-[28px]">
            Phòng Thi Thử TOEIC Trực Tuyến
          </h1>
          <p className="mt-1.5 text-xs text-slate-500 md:text-sm">
            Trải nghiệm thi thử 200 câu với đồng hồ đếm ngược hoặc luyện tập linh hoạt từng phần theo tiến độ của bạn.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <LearningQuotaBadge featureKey="MOCK_TEST" />
        </div>
      </header>

      {/* Grid danh sách các đề thi thử */}
      <StudentMockTestCardGrid
        tests={currentTests}
        selectedVol={selectedVol}
        setSelectedVol={setSelectedVol}
        onOpenExam={async (test) => {
          setExamModalTest(test);
          setExamStarted(false);
          setExamSubmitted(false);
          try {
            const qs = await fetchMockTestQuestions(test.id);
            if (qs && qs.length > 0) setActiveExamQuestions(qs);
            else setActiveExamQuestions(SAMPLE_EXAM_QUESTIONS);
          } catch {
            setActiveExamQuestions(SAMPLE_EXAM_QUESTIONS);
          }
        }}
        onOpenPractice={async (test, isRedo = false) => {
          try {
            const qs = await fetchMockTestQuestions(test.id);
            let questionsToUse = qs && qs.length > 0 ? qs : SAMPLE_EXAM_QUESTIONS;
            if (isRedo) {
              const filtered = getRedoWrongQuestions(questionsToUse, `mock-test-${test.id}`, 200);
              if (filtered.length > 0) questionsToUse = filtered;
            }
            setActivePracticeQuestions(questionsToUse);
          } catch {
            setActivePracticeQuestions(SAMPLE_EXAM_QUESTIONS);
          }
          void handleOpenPractice(test);
        }}
        onOpenTranscript={async (test) => {
          try {
            const qs = await fetchMockTestQuestions(test.id);
            if (qs && qs.length > 0) setActiveTranscriptQuestions(qs);
            else setActiveTranscriptQuestions(SAMPLE_EXAM_QUESTIONS);
          } catch {
            setActiveTranscriptQuestions(SAMPLE_EXAM_QUESTIONS);
          }
          setTranscriptModalTest(test);
        }}
        onOpenVocab={(test) => setVocabModalTest(test)}
        onOpenHistory={(test) => setHistoryModalTest(test)}
      />

      {/* MODAL 1: CHẾ ĐỘ THI THỬ (EXAM MODE) */}
      {examModalTest && (
        <MockTestExamModal
          test={examModalTest}
          activeExamQuestions={activeExamQuestions}
          activeExamParts={["Part 1", "Part 2", "Part 3", "Part 4", "Part 5", "Part 6", "Part 7"]}
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

      {/* MODAL 2: CHẾ ĐỘ LUYỆN TẬP TỪNG PHẦN (PRACTICE MODE) */}
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
          playSfx={playPracticeSfx}
          triggerToast={triggerToast}
          onClose={() => setPracticeModalTest(null)}
        />
      )}

      {/* MODAL 3: TRANSCRIPT & AUDIO */}
      {transcriptModalTest && (
        <MockTestTranscriptModal
          test={transcriptModalTest}
          questions={activeTranscriptQuestions}
          onClose={() => setTranscriptModalTest(null)}
        />
      )}

      {/* MODAL 4: TÚI TỪ VỰNG TRỌNG TÂM */}
      {vocabModalTest && (
        <MockTestVocabModal
          test={vocabModalTest}
          savedVocabBag={savedVocabBag}
          onToggleSaveVocab={(word) => {
            setSavedVocabBag((prev) =>
              prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word]
            );
          }}
          onClose={() => setVocabModalTest(null)}
        />
      )}

      {/* MODAL 5: LỊCH SỬ LÀM BÀI */}
      {historyModalTest && (
        <MockTestHistoryModal
          test={historyModalTest}
          onClose={() => setHistoryModalTest(null)}
          onClearHistory={(testId) => {
            const clearAttempts = (list: TestItem[]) =>
              list.map((t) => (t.id === testId ? { ...t, historyAttempts: [] } : t));
            if (selectedVol === "vol1") {
              setTestsVol1(clearAttempts);
            } else {
              setTestsVol2(clearAttempts);
            }
            setHistoryModalTest((prev) => (prev && prev.id === testId ? { ...prev, historyAttempts: [] } : prev));
            triggerToast("Đã làm mới lịch sử thi thử!");
          }}
        />
      )}
    </div>
  );
}
