"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Sparkles } from "lucide-react";
import { MockTest, MockTestQuestion, TestItem, PracticeQuestion, normalizeToeicPart } from "@/app/admin/content/mock-tests/types";
import { fetchMockTests, fetchMockTestQuestions, submitMockTestAttempt } from "@/lib/api/mockTests";
import { recordListeningAttempt } from "@/lib/api/listening";
import { StudentMockTestCardGrid } from "@/components/mock-tests/StudentMockTestCardGrid";
import { MockTestExamModal } from "@/components/admin/content/mock-tests/MockTestExamModal";
import { MockTestPracticeModal } from "@/components/admin/content/mock-tests/MockTestPracticeModal";
import { MockTestTranscriptModal } from "@/components/admin/content/mock-tests/MockTestTranscriptModal";
import { MockTestVocabModal } from "@/components/admin/content/mock-tests/MockTestVocabModal";
import { LearningQuotaBadge } from "@/components/billing/LearningQuotaBadge";
import { consumeLearningFeature } from "@/lib/api/billing";
import { MockTestHistoryModal } from "@/components/admin/content/mock-tests/MockTestHistoryModal";
import { getItemProgress, getRedoWrongQuestions, saveItemProgress } from "@/lib/practiceProgress";
import { logStudySession } from "@/lib/studyTracker";
import { playUnifiedAnswerSound } from "@/lib/sound";

export default function StudentMockTestsPage() {
  const [selectedVol, setSelectedVol] = useState<"vol1" | "vol2" | "vol3">("vol1");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [testsVol1, setTestsVol1] = useState<TestItem[]>([]);
  const [testsVol2, setTestsVol2] = useState<TestItem[]>([]);
  const [testsVol3, setTestsVol3] = useState<TestItem[]>([]);
  const [activeExamQuestions, setActiveExamQuestions] = useState<PracticeQuestion[]>([]);
  const [activePracticeQuestions, setActivePracticeQuestions] = useState<PracticeQuestion[]>([]);
  const [activeTranscriptQuestions, setActiveTranscriptQuestions] = useState<PracticeQuestion[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const rawCurrentTests = selectedVol === "vol1" ? testsVol1 : selectedVol === "vol2" ? testsVol2 : testsVol3;
  const currentTests = useMemo(() => {
    return rawCurrentTests.filter((test) =>
      test.status === "PUBLISHED" || test.status === "Đã phát hành"
    );
  }, [rawCurrentTests]);

  const loadTests = useCallback(async () => {
    try {
      const data = await fetchMockTests();
      const normalizeVol = (volId?: string) =>
        volId === "ets2024" ? "vol1" : volId === "ets2023" ? "vol2" : volId === "ets2022" ? "vol3" : volId;
      setTestsVol1(data.filter((test) => normalizeVol(test.volId) === "vol1"));
      setTestsVol2(data.filter((test) => normalizeVol(test.volId) === "vol2"));
      setTestsVol3(data.filter((test) => normalizeVol(test.volId) === "vol3"));
      setCatalogError(null);
    } catch (err) {
      console.warn("Could not load mock tests from API:", err);
      setCatalogError(err instanceof Error ? err.message : "Không thể tải danh sách đề thi.");
    }
  }, []);

  useEffect(() => {
    document.title = "Phòng Thi Thử TOEIC Trực Tuyến - TOEIC AI";
    loadTests();
  }, [loadTests]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("toeic_system_extended_settings");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed?.maintenanceMode === "boolean") {
          setMaintenanceMode(parsed.maintenanceMode);
        }
      }
    } catch {}

    const handleSettingsChange = (event: Event) => {
      const custom = event as CustomEvent<{ maintenanceMode?: boolean }>;
      if (custom.detail && typeof custom.detail.maintenanceMode === "boolean") {
        setMaintenanceMode(custom.detail.maintenanceMode);
      }
    };
    window.addEventListener("toeic:system-settings-changed", handleSettingsChange);
    return () => window.removeEventListener("toeic:system-settings-changed", handleSettingsChange);
  }, []);


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

  // Quy đổi điểm TOEIC chuẩn ETS (5 - 495 điểm, bước nhảy 5 điểm)
  const convertEtsToeicScore = (correctCount: number, totalSectionQuestions: number, isListening: boolean): number => {
    if (totalSectionQuestions <= 0 || correctCount <= 0) return 5;
    // Quy đổi tương đương ra thang 100 câu của ETS
    const equivalentCorrect100 = Math.round((correctCount / totalSectionQuestions) * 100);
    if (isListening) {
      if (equivalentCorrect100 >= 93) return 495;
      if (equivalentCorrect100 <= 6) return 5;
      const raw = 5 + ((equivalentCorrect100 - 6) / (93 - 6)) * 490;
      return Math.min(495, Math.max(5, Math.round(raw / 5) * 5));
    } else {
      if (equivalentCorrect100 >= 97) return 495;
      if (equivalentCorrect100 <= 9) return 5;
      const raw = 5 + ((equivalentCorrect100 - 9) / (97 - 9)) * 490;
      return Math.min(495, Math.max(5, Math.round(raw / 5) * 5));
    }
  };

  const handleSubmitExam = async (effectiveQuestions?: PracticeQuestion[]) => {
    const questionsToGrade = effectiveQuestions ?? activeExamQuestions;
    if (questionsToGrade.length === 0) {
      triggerToast("Đề thi chưa có câu hỏi để chấm.");
      return;
    }
    setExamSubmitted(true);
    let correct = 0;
    let correctLC = 0;
    let correctRC = 0;
    let totalLC = 0;
    let totalRC = 0;
    const partStats: Record<string, { total: number; answered: number; correct: number; wrong: number }> = {};
    const wrongQuestionIds: (string | number)[] = [];
    const answeredQuestionIds: (string | number)[] = [];
    questionsToGrade.forEach((q) => {
      const normPart = normalizeToeicPart(q.part);
      const isListening = ["Part 1", "Part 2", "Part 3", "Part 4"].includes(normPart);
      if (isListening) {
        totalLC += 1;
        if (!partStats[normPart]) {
          partStats[normPart] = { total: 0, answered: 0, correct: 0, wrong: 0 };
        }
        partStats[normPart].total += 1;
      } else {
        totalRC += 1;
      }

      const userAns = examAnswers[q.id];
      if (userAns !== undefined && userAns !== null && userAns !== "") {
        answeredQuestionIds.push(q.id);
        if (isListening && partStats[normPart]) {
          partStats[normPart].answered += 1;
        }
        if (userAns === q.correctAnswer) {
          correct += 1;
          if (isListening) {
            correctLC++;
            if (partStats[normPart]) partStats[normPart].correct += 1;
          } else {
            correctRC++;
          }
        } else {
          wrongQuestionIds.push(q.id);
          if (isListening && partStats[normPart]) {
            partStats[normPart].wrong += 1;
          }
        }
      } else if (isListening && partStats[normPart]) {
        partStats[normPart].wrong += 1;
      }
    });

    // Quy đổi điểm TOEIC theo đường cong chuẩn ETS (5..495 mỗi kỹ năng, tổng tối đa 990)
    const estLC = totalLC > 0 ? convertEtsToeicScore(correctLC, totalLC, true) : 0;
    const estRC = totalRC > 0 ? convertEtsToeicScore(correctRC, totalRC, false) : 0;
    const estTotal = estLC + estRC;
    const maxPossibleScore = (totalLC > 0 ? 495 : 0) + (totalRC > 0 ? 495 : 0);

    const wrongCount = wrongQuestionIds.length;
    const answeredCount = answeredQuestionIds.length;
    const totalCount = questionsToGrade.length;

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

      // Đồng bộ kết quả từng Part Listening sang BKT Analytics & Recommendation Engine
      const activeListeningParts = Object.entries(partStats);
      if (activeListeningParts.length > 0) {
        const perPartDuration = Math.max(1, Math.round(durationSec / activeListeningParts.length));
        activeListeningParts.forEach(([partName, st]) => {
          void recordListeningAttempt({
            targetType: "UNIT",
            targetId: `mock-test-${examModalTest.id}-${partName.toLowerCase().replace(/\s+/g, "")}`,
            targetTitle: `${examModalTest.title} · ${partName} (Thi thử)`,
            part: partName,
            mode: "REAL_EXAM",
            totalQuestions: st.total,
            completedQuestions: st.answered,
            correctCount: st.correct,
            wrongCount: st.wrong,
            durationSeconds: perPartDuration,
            xpEarned: st.correct * 15,
            details: {
              source: "MOCK_TEST_EXAM",
              testId: examModalTest.id,
              scaledListeningScore: estLC,
            },
          });
        });
      }

      try {
        await submitMockTestAttempt({
          testId: examModalTest.id,
          score: estTotal,
          listeningScore: estLC,
          readingScore: estRC,
          correctCount: correct,
          totalCount: questionsToGrade.length,
          durationSeconds: durationSec,
        });
        triggerToast(`Đã lưu kết quả thi thật và cập nhật chỉ số BKT Listening!`);
      } catch (error) {
        triggerToast(error instanceof Error
          ? `Kết quả chưa được lưu trên máy chủ: ${error.message}`
          : "Kết quả chưa được lưu trên máy chủ.");
      }
    }

    triggerToast(`Bạn đạt ${estTotal}/${maxPossibleScore} điểm chuẩn ETS (${correct}/${questionsToGrade.length} câu đúng).`);
  };

  // Tự động thu bài và chấm điểm khi đồng hồ thi thử đếm ngược về 0
  React.useEffect(() => {
    if (examStarted && !examSubmitted && examTimeRemaining === 0 && activeExamQuestions.length > 0) {
      triggerToast("⏰ Đã hết thời gian làm bài! Hệ thống tự động thu bài và chấm điểm.");
      void handleSubmitExam();
    }
  }, [examStarted, examSubmitted, examTimeRemaining, activeExamQuestions.length]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Toast thông báo */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900/95 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-3">
          {toastMessage}
        </div>
      )}

      {/* Header chuẩn phong cách tối giản, sạch sẽ như Admin */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-400">
            Trang chủ <span className="px-1.5">/</span> Lộ trình TOEIC <span className="px-1.5">/</span>{" "}
            <span className="font-semibold text-blue-700 dark:text-blue-400">Thi thử trực tuyến</span>
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white md:text-[28px]">
            Phòng Thi Thử TOEIC Trực Tuyến
          </h1>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 md:text-sm">
            Làm các đề thi đã được phát hành, với đồng hồ đếm ngược hoặc luyện tập linh hoạt theo tiến độ của bạn.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <LearningQuotaBadge featureKey="MOCK_TEST" />
        </div>
      </header>

      {/* Banner thông báo bảo trì hệ thống */}
      {maintenanceMode && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-sm animate-in fade-in">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="font-bold text-sm">Hệ thống đang trong chế độ bảo trì &amp; cập nhật dữ liệu</p>
            <p className="mt-0.5 text-xs text-amber-800">
              Quản trị viên đang cập nhật và tối ưu hóa ngân hàng đề thi. Các kết quả làm bài vẫn được ghi nhận, vui lòng lưu ý thời gian hoàn thành bài thi.
            </p>
          </div>
        </div>
      )}

      {/* Grid danh sách các đề thi thử */}
      {catalogError && (
        <div role="alert" className="flex items-center justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <span>{catalogError}</span>
          <button type="button" onClick={() => void loadTests()} className="font-bold underline">Thử lại</button>
        </div>
      )}
      <StudentMockTestCardGrid
        tests={currentTests}
        selectedVol={selectedVol}
        setSelectedVol={setSelectedVol}
        onOpenExam={async (test) => {
          try {
            const qs = await fetchMockTestQuestions(test.id);
            if (qs.length === 0) {
              triggerToast("Đề thi này hiện chưa có câu hỏi.");
              return;
            }
            setActiveExamQuestions(qs);
            setExamModalTest(test);
            setExamStarted(false);
            setExamSubmitted(false);
          } catch (error) {
            triggerToast(error instanceof Error ? error.message : "Không thể tải câu hỏi.");
          }
        }}
        onOpenPractice={async (test, isRedo = false) => {
          try {
            const qs = await fetchMockTestQuestions(test.id);
            if (qs.length === 0) {
              triggerToast("Đề thi này hiện chưa có câu hỏi.");
              return;
            }
            let questionsToUse = qs;
            if (isRedo) {
              const filtered = getRedoWrongQuestions(questionsToUse, `mock-test-${test.id}`, questionsToUse.length);
              if (filtered.length > 0) questionsToUse = filtered;
            }
            setActivePracticeQuestions(questionsToUse);
            void handleOpenPractice(test);
          } catch (error) {
            triggerToast(error instanceof Error ? error.message : "Không thể tải câu hỏi.");
          }
        }}
        onOpenTranscript={async (test) => {
          try {
            const qs = await fetchMockTestQuestions(test.id);
            if (qs.length === 0) {
              triggerToast("Đề thi này hiện chưa có câu hỏi.");
              return;
            }
            setActiveTranscriptQuestions(qs);
          } catch (error) {
            triggerToast(error instanceof Error ? error.message : "Không thể tải câu hỏi.");
            return;
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
