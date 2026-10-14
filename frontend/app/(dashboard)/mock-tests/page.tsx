"use client";

import React, { useState, useMemo } from "react";
import { ClipboardCheck, Sparkles } from "lucide-react";
import { TestItem, PracticeQuestion } from "@/app/admin/content/mock-tests/types";
import { SAMPLE_EXAM_QUESTIONS, INITIAL_TESTS_VOL1, INITIAL_TESTS_VOL2 } from "@/app/admin/content/mock-tests/mockData";
import { StudentMockTestCardGrid } from "@/components/student/mock-tests/StudentMockTestCardGrid";
import { MockTestExamModal } from "@/components/admin/content/mock-tests/MockTestExamModal";
import { MockTestPracticeModal } from "@/components/admin/content/mock-tests/MockTestPracticeModal";
import { MockTestTranscriptModal } from "@/components/admin/content/mock-tests/MockTestTranscriptModal";
import { MockTestVocabModal } from "@/components/admin/content/mock-tests/MockTestVocabModal";

export default function StudentMockTestsPage() {
  const [selectedVol, setSelectedVol] = useState<"vol1" | "vol2">("vol1");
  const [testsVol1] = useState<TestItem[]>(INITIAL_TESTS_VOL1);
  const [testsVol2] = useState<TestItem[]>(INITIAL_TESTS_VOL2);

  const currentTests = selectedVol === "vol1" ? testsVol1 : testsVol2;

  // State Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  // Sound Effects Synthesizer
  const playSfx = (type: "correct" | "wrong" | "incorrect" | "click") => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
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
      } else if (type === "wrong" || type === "incorrect") {
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
    } catch {}
  };

  const playPracticeSfx = (type: "correct" | "wrong" | "click") => {
    playSfx(type);
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

  // Modals Transcript & Từ vựng
  const [transcriptModalTest, setTranscriptModalTest] = useState<TestItem | null>(null);
  const [vocabModalTest, setVocabModalTest] = useState<TestItem | null>(null);
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

  const handleStartExamNow = (_customParts?: string[], customMinutes?: number) => {
    const mins = customMinutes ?? parseInt(examDurationType, 10);
    setExamTimeRemaining(mins * 60);
    setExamStarted(true);
    setExamSubmitted(false);
    setExamAnswers({});
    setExamCurrentQIndex(0);
    setExamResultScore(null);
  };

  const handleSubmitExam = (effectiveQuestions?: PracticeQuestion[]) => {
    setExamSubmitted(true);
    const questionsToGrade = effectiveQuestions && effectiveQuestions.length > 0 ? effectiveQuestions : SAMPLE_EXAM_QUESTIONS;
    let correct = 0;
    let correctLC = 0;
    let correctRC = 0;
    questionsToGrade.forEach((q) => {
      if (examAnswers[q.id] === q.correctAnswer) {
        correct += 1;
        const isListening = ["Part 1", "Part 2", "Part 3", "Part 4"].includes(q.part);
        if (isListening) correctLC++;
        else correctRC++;
      }
    });

    const isFullScale = questionsToGrade.length >= 200;
    const estLC = isFullScale ? Math.min(495, correctLC * 5) : correctLC * 5;
    const estRC = isFullScale ? Math.min(495, correctRC * 5) : correctRC * 5;
    const estTotal = isFullScale ? Math.min(990, estLC + estRC) : correct * 5;

    setExamResultScore({
      total: estTotal,
      listening: estLC,
      reading: estRC,
      correctCount: correct,
    });
    triggerToast("Đã nộp bài thi thành công!");
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

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/80 px-3.5 py-2 text-xs font-bold text-blue-700 shadow-2xs">
            <ClipboardCheck className="w-4 h-4 text-blue-600" />
            {testsVol1.length + testsVol2.length} Đề thi TOEIC Full 7 Parts
          </span>
        </div>
      </header>

      {/* Grid danh sách các đề thi thử */}
      <StudentMockTestCardGrid
        tests={currentTests}
        selectedVol={selectedVol}
        setSelectedVol={setSelectedVol}
        onOpenExam={(test) => {
          setExamModalTest(test);
          setExamStarted(false);
          setExamSubmitted(false);
        }}
        onOpenPractice={(test) => {
          setPracticeModalTest(test);
          setPracticeCurrentQIndex(0);
          setPracticeAnswers({});
          setPracticeChecked({});
        }}
        onOpenTranscript={(test) => setTranscriptModalTest(test)}
        onOpenVocab={(test) => setVocabModalTest(test)}
      />

      {/* MODAL 1: CHẾ ĐỘ THI THỬ (EXAM MODE) */}
      {examModalTest && (
        <MockTestExamModal
          test={examModalTest}
          activeExamQuestions={SAMPLE_EXAM_QUESTIONS}
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
          onOpenQuestionGrid={() => {}}
        />
      )}

      {/* MODAL 2: CHẾ ĐỘ LUYỆN TẬP TỪNG PHẦN (PRACTICE MODE) */}
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
          playSfx={playPracticeSfx}
          triggerToast={triggerToast}
          onClose={() => setPracticeModalTest(null)}
        />
      )}

      {/* MODAL 3: TRANSCRIPT & AUDIO */}
      {transcriptModalTest && (
        <MockTestTranscriptModal
          test={transcriptModalTest}
          questions={SAMPLE_EXAM_QUESTIONS}
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
    </div>
  );
}
